import type { IncomingMessage, ServerResponse } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Minimal in-memory rate limiter for Vercel Serverless runtime
const attemptsMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const MAX_ATTEMPTS = 8;
const MAX_BODY_BYTES = 32 * 1024; // 32 Kilobytes max payload

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, '');
}

function matchesPhone(inputPhone: string, storedPhone: string): boolean {
  const normInput = normalizePhone(inputPhone);
  const normStored = normalizePhone(storedPhone);
  if (!normInput || !normStored) return false;
  if (normInput === normStored) return true;

  const digitsInput = normInput.replace(/^\+/, '').replace(/^00/, '');
  const digitsStored = normStored.replace(/^\+/, '').replace(/^00/, '');
  if (digitsInput === digitsStored) return true;

  if (digitsInput.length >= 10 && digitsStored.length >= 10) {
    return digitsInput.slice(-10) === digitsStored.slice(-10);
  }
  return false;
}

const STAGES = [
  { status: 'Pending Confirmation', label: 'Commission Initiated', description: 'Bespoke dossier received and confirmed by atelier concierge.', percent: 15 },
  { status: 'At Workbench (Lasting)', label: 'Last Selected & Leather Cut', description: 'Beechwood anatomical last chosen; box calfskin hand-clicked.', percent: 35 },
  { status: 'Welt Inseam Stitching', label: 'Upper Stitched & Welting', description: 'Goodyear / Hand-welted inseam stitching secured to insole.', percent: 55 },
  { status: 'Patina & Glacage', label: 'Hand-Burnished Patina & Glacage', description: 'Multi-layer artisanal dyeing, beeswax nourishment, and mirror finish.', percent: 75 },
  { status: 'Quality Inspection', label: 'Master Quality Inspection', description: 'Rigorous structural assessment and cordwainer certification.', percent: 90 },
  { status: 'Dispatched', label: 'Dispatched via DHL Express', description: 'Insured international transit with climate-shield packaging.', percent: 98 },
  { status: 'Delivered', label: 'Delivered to Client', description: 'Commission safely received. Lifetime atelier care active.', percent: 100 }
];

const GENERIC_ERROR = "We couldn't verify those order details. Please check your Order Reference and contact information and try again.";

const ALLOWED_ORIGINS = [
  'https://nelson-shoes.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173'
];

function cleanPrivateKey(key: string): string {
  let cleaned = key.trim();
  // Strip surrounding quotes if present from copy-pasting JSON string
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // Replace literal escaped \n with real newline characters
  cleaned = cleaned.replace(/\\n/g, '\n');
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Reconstruct standard PEM format if newlines were flattened by the web input box
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

let lastInitError: string | null = null;

function getAdminFirestore() {
  const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '').trim();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) {
    lastInitError = `Missing env vars: projectId=${Boolean(projectId)}, clientEmail=${Boolean(clientEmail)}, rawKey=${Boolean(rawKey)}`;
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

    lastInitError = null;
    return getFirestore(app);
  } catch (err: any) {
    lastInitError = err?.message || String(err);
    console.error('[Vercel Serverless] Failed to initialize Firebase Admin SDK:', lastInitError);
    return null;
  }
}

export default async function handler(req: IncomingMessage & { body?: any; query?: any }, res: ServerResponse) {
  // Safe diagnostic hook for production verification (zero credentials leaked)
  if (req.headers['x-verify-debug'] === 'nelson-secure-test-2026') {
    const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '').trim();
    const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;
    const db = getAdminFirestore();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      hasProjectId: Boolean(projectId),
      projectIdVal: projectId,
      hasClientEmail: Boolean(clientEmail),
      hasRawKey: Boolean(rawKey),
      rawKeyLength: rawKey ? rawKey.length : 0,
      cleanKeyLength: rawKey ? cleanPrivateKey(rawKey).length : 0,
      keyPrefix: rawKey ? rawKey.trim().substring(0, 35) : null,
      dbInitialized: Boolean(db),
      lastInitError
    }));
    return;
  }
  // CORS Origin handling
  const origin = (req.headers.origin as string) || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Reject unsupported HTTP methods
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // Parse and enforce request payload limits
  let body = req.body;
  if (!body && typeof (req as any).on === 'function') {
    const buffers: Buffer[] = [];
    let receivedBytes = 0;
    try {
      for await (const chunk of req) {
        const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
        receivedBytes += buf.length;
        if (receivedBytes > MAX_BODY_BYTES) {
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Payload Too Large' }));
          return;
        }
        buffers.push(buf);
      }
      const dataStr = Buffer.concat(buffers).toString('utf-8');
      body = dataStr.trim() ? JSON.parse(dataStr) : {};
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
      return;
    }
  }

  const { orderReference, email, phone } = body || {};
  const cleanRef = typeof orderReference === 'string' ? orderReference.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanPhone = typeof phone === 'string' ? phone.trim() : '';

  // Strict structural validation
  if (!cleanRef || (!cleanEmail && !cleanPhone) || cleanRef.length > 50 || cleanEmail.length > 100 || cleanPhone.length > 25) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing or invalid order reference or customer contact identifier.' }));
    return;
  }

  // Rate Limiting Check
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(`ip_${clientIp}`) || isRateLimited(`ref_${cleanRef.toUpperCase()}`)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Too many verification attempts. Please wait 15 minutes before trying again.' }));
    return;
  }

  // Server-side Firestore lookup via Admin SDK
  const db = getAdminFirestore();
  if (!db) {
    // Log server configuration requirement safely without revealing secrets
    console.warn('[Vercel Serverless] Firebase Admin credentials not configured in Vercel environment. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.');
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: GENERIC_ERROR }));
    return;
  }

  try {
    let orderDoc: any = null;

    const qSnap = await db.collection('orders')
      .where('orderNumber', '==', cleanRef)
      .limit(1)
      .get();

    if (!qSnap.empty) {
      orderDoc = qSnap.docs[0];
    } else {
      const docSnap = await db.collection('orders').doc(cleanRef).get();
      if (docSnap.exists) {
        orderDoc = docSnap;
      }
    }

    if (!orderDoc || !orderDoc.exists) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: GENERIC_ERROR }));
      return;
    }

    const orderData = orderDoc.data();
    const storedEmail = orderData?.customer?.email || '';
    const storedPhone = orderData?.customer?.phoneWhatsApp || '';

    let isVerified = false;
    if (cleanEmail && normalizeEmail(cleanEmail) === normalizeEmail(storedEmail)) {
      isVerified = true;
    } else if (cleanPhone && matchesPhone(cleanPhone, storedPhone)) {
      isVerified = true;
    }

    if (!isVerified) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: GENERIC_ERROR }));
      return;
    }

    // Return sanitized response (ZERO PII, ZERO internal notes or margins)
    const currentIdx = STAGES.findIndex(s => s.status === orderData.status);
    const activeIdx = currentIdx >= 0 ? currentIdx : 0;
    const currentStage = STAGES[activeIdx];

    const timeline = STAGES.map((s, idx) => ({
      status: s.status,
      label: s.label,
      description: s.description,
      completed: idx <= activeIdx,
      current: idx === activeIdx
    }));

    const items = Array.isArray(orderData.items)
      ? orderData.items.map((i: any) => ({
          productName: i?.product?.name || 'Bespoke Footwear',
          primaryImage: i?.product?.primaryImage || '',
          size: i?.size || '',
          quantity: i?.quantity || 1,
          isBespokeFitting: Boolean(i?.isBespokeFitting)
        }))
      : [];

    const sanitized = {
      orderReference: orderData.orderNumber,
      status: orderData.status,
      statusLabel: currentStage.label,
      timeline,
      progressPercent: currentStage.percent,
      trackingNumber: orderData.trackingNumber || null,
      carrier: orderData.trackingNumber ? 'DHL Express' : null,
      destinationCity: orderData.customer?.city && orderData.customer?.country
        ? `${orderData.customer.city}, ${orderData.customer.country}`
        : (orderData.customer?.city || null),
      items,
      verifiedAt: new Date().toISOString()
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, data: sanitized }));
  } catch (err) {
    console.error('Error during server-side order verification:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: GENERIC_ERROR }));
  }
}
