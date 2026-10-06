import type { IncomingMessage, ServerResponse } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'node:crypto';

// In-memory rate limiter per IP for inquiry creation
const attemptsMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const MAX_ATTEMPTS = 15; // Max 15 inquiry creations per 15 min per IP
const MAX_BODY_BYTES = 64 * 1024; // 64 Kilobytes max payload

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = attemptsMap.get(key);
  if (!record || now > record.resetAt) {
    attemptsMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) {
    return true;
  }
  record.count += 1;
  return false;
}

const ALLOWED_ORIGINS = [
  'https://nelson-shoes.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173'
];

function cleanPrivateKey(key: string): string {
  let cleaned = key.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  cleaned = cleaned.replace(/\\n/g, '\n');
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const beginMarker = '-----BEGIN PRIVATE KEY-----';
  const endMarker = '-----END PRIVATE KEY-----';
  if (cleaned.includes(beginMarker) && cleaned.includes(endMarker)) {
    const startIdx = cleaned.indexOf(beginMarker) + beginMarker.length;
    const endIdx = cleaned.indexOf(endMarker);
    const base64Body = cleaned.substring(startIdx, endIdx).replace(/\s+/g, '');
    const chunked = base64Body.match(/.{1,64}/g)?.join('\n') || base64Body;
    return `${beginMarker}\n${chunked}\n${endMarker}\n`;
  }

  return cleaned;
}

function getAdminServices() {
  const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'nelson-shoes-62767').trim();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    return null;
  }

  try {
    const privateKey = cleanPrivateKey(rawKey);
    const existingApps = getApps();
    const app = existingApps.length > 0 
      ? existingApps[0] 
      : initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey
          })
        });

    const db = getFirestore(app);
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {}

    const auth = getAuth(app);

    return { db, auth };
  } catch (err: any) {
    console.error('[Create Bespoke Inquiry] Failed to initialize Firebase Admin SDK:', err?.message || err);
    return null;
  }
}

function sanitizeString(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .slice(0, maxLen)
    .replace(/[<>]/g, '');
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS configuration
  const origin = req.headers.origin as string;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

  // Rate Limiting
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
             (req.socket.remoteAddress || 'unknown');
  if (isRateLimited(`bespoke:${ip}`)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Too Many Requests. Please try again later.' }));
    return;
  }

  // Read request body safely
  let rawBody = '';
  let receivedBytes = 0;
  try {
    for await (const chunk of req) {
      receivedBytes += (chunk as Buffer).length;
      if (receivedBytes > MAX_BODY_BYTES) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Payload Too Large. Maximum allowed size is 64KB.' }));
        return;
      }
      rawBody += chunk;
    }
  } catch (streamErr) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Failed to read request body stream.' }));
    return;
  }

  let body: any;
  try {
    body = JSON.parse(rawBody || '{}');
  } catch (jsonErr) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload.' }));
    return;
  }

  // Initialize Admin Services
  const adminServices = getAdminServices();
  if (!adminServices) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Service Unavailable. Firebase Admin configuration missing.' }));
    return;
  }
  const { db, auth } = adminServices;

  // Derive Authenticated Customer UID
  let derivedCustomerUid: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1]?.trim();
    if (idToken) {
      try {
        const decodedToken = await auth.verifyIdToken(idToken);
        derivedCustomerUid = decodedToken.uid;
      } catch (authErr) {
        // Token invalid or expired
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Invalid or expired session token.' }));
        return;
      }
    }
  }

  // Validate Required Customer / Commission fields
  const fullName = sanitizeString(body.fullName || body.customerName, 100);
  const email = sanitizeString(body.email || body.customerEmail, 150).toLowerCase();
  const phone = sanitizeString(body.phoneWhatsApp || body.phoneOrWhatsApp || body.customerPhone, 50);
  const country = sanitizeString(body.country || 'Nigeria', 60);
  const city = sanitizeString(body.city || 'Lagos', 60);

  if (!fullName || fullName.length < 2) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Valid full name (minimum 2 characters) is required.' }));
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'A valid email address is required.' }));
    return;
  }

  if (!phone || phone.length < 7) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'A valid contact telephone/WhatsApp number is required.' }));
    return;
  }

  // Specifications
  const specs = body.specifications || {};
  const silhouette = sanitizeString(specs.silhouette || body.silhouette || body.shoeType, 100) || 'Oxford Wholecut';
  const leatherType = sanitizeString(specs.leatherType || body.leatherType || body.materialPreference, 100) || 'French Full-Grain Box Calf';
  const colorPreference = sanitizeString(specs.colorPreference || body.colorPreference, 100) || 'Signature Atelier Patina';
  const solePreference = sanitizeString(specs.solePreference || body.solePreference, 100) || 'Oak-Bark Vegetable Tanned Sole';
  const footSize = sanitizeString(specs.footSize || body.footSize, 60) || 'Custom Last Calibration';
  const fittingPreference = ['standard-size', 'atelier-measurement', 'virtual-consultation'].includes(specs.fittingPreference || body.fittingPreference)
    ? (specs.fittingPreference || body.fittingPreference)
    : 'atelier-measurement';
  const occasion = sanitizeString(specs.occasion || body.occasion, 150);
  const budgetRange = sanitizeString(specs.budgetRange || body.budgetRange, 100);
  const specialRequests = sanitizeString(specs.specialRequests || body.specialRequests || body.additionalDetails, 1500);
  const monogramInitials = sanitizeString(specs.monogramInitials || body.monogramInitials, 10).toUpperCase();

  // Validate reference images
  const referenceImages: any[] = [];
  if (Array.isArray(body.referenceImages)) {
    for (const img of body.referenceImages.slice(0, 5)) {
      if (img && typeof img.url === 'string' && (img.url.startsWith('https://') || img.url.startsWith('/'))) {
        referenceImages.push({
          id: `ref_${crypto.randomBytes(6).toString('hex')}`,
          name: sanitizeString(img.name || 'Inspiration Reference', 100),
          url: img.url,
          storagePath: sanitizeString(img.storagePath || '', 200),
          contentType: sanitizeString(img.contentType || 'image/jpeg', 50),
          sizeBytes: typeof img.sizeBytes === 'number' ? img.sizeBytes : 0,
          uploadedAt: new Date().toISOString(),
          uploadedByUid: derivedCustomerUid || null
        });
      }
    }
  }

  // Generate Reference Number
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const inquiryReference = `NS-BESPOKE-${year}-${randomSuffix}`;
  const now = new Date().toISOString();

  // Persist inquiry to Firestore
  // Server-authoritative state initialization:
  // Customers/browsers cannot set status, quote, depositStatus, or internal artisan notes!
  const inquiryDoc = {
    inquiryReference,
    customerUid: derivedCustomerUid,
    customerName: fullName,
    customerEmail: email,
    customerPhone: phone,
    country,
    city,
    status: 'inquiry_submitted',
    specifications: {
      silhouette,
      leatherType,
      colorPreference,
      solePreference,
      footSize,
      fittingPreference,
      occasion,
      budgetRange,
      monogramInitials,
      specialRequests
    },
    referenceImages,
    customerVisibleNotes: [],
    artisanNotes: [],
    auditTrail: [
      {
        event: 'INQUIRY_SUBMITTED',
        newStatus: 'inquiry_submitted',
        actorUid: derivedCustomerUid || 'guest_client',
        actorRole: derivedCustomerUid ? 'customer' : 'guest',
        timestamp: now,
        note: 'Bespoke commission inquiry initiated via digital atelier dossier.'
      }
    ],
    quotation: null,
    convertedOrderId: null,
    assignedArtisan: null,
    createdAt: now,
    updatedAt: now
  };

  try {
    const docRef = await db.collection('bespoke_inquiries').add(inquiryDoc);

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      inquiryId: docRef.id,
      inquiryReference,
      status: 'inquiry_submitted',
      message: 'Bespoke commission dossier received by Nelson Atelier.'
    }));
  } catch (dbErr: any) {
    console.error('[Create Bespoke Inquiry] Database error:', dbErr?.message || dbErr);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Failed to record bespoke inquiry in atelier database.' }));
  }
}
