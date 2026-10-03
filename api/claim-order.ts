import type { IncomingMessage, ServerResponse } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Rate limiter for claim attempts (per IP)
const attemptsMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const MAX_ATTEMPTS = 6;
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

    return {
      db: getFirestore(app),
      auth: getAuth(app)
    };
  } catch (err: any) {
    console.error('[Vercel Serverless] Failed to initialize Firebase Admin SDK for claim-order:', err?.message || err);
    return null;
  }
}

export default async function handler(req: IncomingMessage & { body?: any; query?: any }, res: ServerResponse) {
  // CORS Origin handling
  const origin = (req.headers.origin as string) || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Enforce HTTP POST
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

  // Rate Limiting by IP
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
             (req.headers['x-real-ip'] as string) || 
             req.socket.remoteAddress || 
             'unknown';

  if (isRateLimited(`claim:${ip}`)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Too many claim attempts. Please wait 15 minutes before trying again.' 
    }));
    return;
  }

  // Verify Authentication (Bearer Token)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Authentication required. Please sign in to claim this commission.' 
    }));
    return;
  }

  const idToken = authHeader.split('Bearer ')[1].trim();
  if (!idToken) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Authentication token missing.' }));
    return;
  }

  // Read request body with 32KB payload size protection
  let rawBody = '';
  let bodyBytes = 0;

  try {
    for await (const chunk of req) {
      bodyBytes += chunk.length;
      if (bodyBytes > MAX_BODY_BYTES) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Payload size exceeds the 32KB security limit.' }));
        return;
      }
      rawBody += chunk.toString('utf-8');
    }
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Failed to read request payload.' }));
    return;
  }

  let body: { orderReference?: string; email?: string; phone?: string } = {};
  try {
    body = rawBody ? JSON.parse(rawBody) : req.body || {};
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload.' }));
    return;
  }

  const orderReference = (body.orderReference || '').trim();
  const inputEmail = (body.email || '').trim();
  const inputPhone = (body.phone || '').trim();

  if (!orderReference || (!inputEmail && !inputPhone)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Missing order reference or customer contact identifier (email or phone).' 
    }));
    return;
  }

  const adminServices = getAdminServices();
  if (!adminServices) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Atelier cloud verification service unavailable. Please contact atelier concierge.' 
    }));
    return;
  }

  const { db, auth } = adminServices;

  // Verify Firebase ID token
  let authenticatedUid = '';
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    authenticatedUid = decodedToken.uid;
  } catch {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Invalid or expired session. Please sign in again.' 
    }));
    return;
  }

  if (!authenticatedUid) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Customer identity could not be verified.' }));
    return;
  }

  // Find order in Firestore
  try {
    const ordersRef = db.collection('orders');
    const cleanRef = orderReference.replace(/^#/, '').toUpperCase();
    
    // Look up by orderNumber field
    const querySnapshot = await ordersRef.where('orderNumber', '==', cleanRef).limit(1).get();

    if (querySnapshot.empty) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: 'No order matching this reference was found. Please check the reference and try again.' 
      }));
      return;
    }

    const orderDocRef = querySnapshot.docs[0].ref;

    // Run atomic transaction to verify contact and assign ownership
    const transactionResult = await db.runTransaction(async (transaction) => {
      const currentDoc = await transaction.get(orderDocRef);
      if (!currentDoc.exists) {
        throw { statusCode: 404, message: 'Order document was not found.' };
      }

      const orderData = currentDoc.data() || {};
      const storedCustomer = orderData.customer || {};
      const storedEmail = storedCustomer.email || '';
      const storedPhone = storedCustomer.phoneWhatsApp || '';

      // Verify contact match
      let isVerified = false;
      if (inputEmail && storedEmail) {
        isVerified = normalizeEmail(inputEmail) === normalizeEmail(storedEmail);
      }
      if (!isVerified && inputPhone && storedPhone) {
        isVerified = matchesPhone(inputPhone, storedPhone);
      }

      if (!isVerified) {
        throw { 
          statusCode: 403, 
          message: 'The email address or phone number provided does not match the contact details on file for this order.' 
        };
      }

      // Invariant: Ownership Protection
      if (orderData.customerUid) {
        if (orderData.customerUid === authenticatedUid) {
          // Already owned by the requesting customer
          return {
            alreadyClaimed: true,
            orderId: currentDoc.id,
            orderNumber: orderData.orderNumber,
            status: orderData.status,
            createdAt: orderData.createdAt
          };
        } else {
          // Owned by a different customer - Reject strictly!
          throw { 
            statusCode: 403, 
            message: 'This order is already linked to another customer account.' 
          };
        }
      }

      // Associate order with authenticated customer
      const now = new Date().toISOString();
      transaction.update(orderDocRef, {
        customerUid: authenticatedUid,
        claimedAt: now,
        updatedAt: now
      });

      return {
        alreadyClaimed: false,
        orderId: currentDoc.id,
        orderNumber: orderData.orderNumber,
        status: orderData.status,
        createdAt: orderData.createdAt
      };
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: transactionResult.alreadyClaimed 
        ? 'This order is already associated with your account.' 
        : 'Order successfully linked to your customer account.',
      alreadyClaimed: transactionResult.alreadyClaimed,
      order: {
        id: transactionResult.orderId,
        orderNumber: transactionResult.orderNumber,
        status: transactionResult.status,
        createdAt: transactionResult.createdAt
      }
    }));
  } catch (err: any) {
    if (err && typeof err === 'object' && err.statusCode) {
      res.statusCode = err.statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: err.message }));
      return;
    }

    console.error('[claim-order] Server error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'An unexpected error occurred while linking your order. Please try again or contact concierge.' 
    }));
  }
}
