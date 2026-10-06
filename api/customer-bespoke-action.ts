import type { IncomingMessage, ServerResponse } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const MAX_BODY_BYTES = 32 * 1024;

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
    console.error('[Customer Bespoke Action] Failed to initialize Firebase Admin SDK:', err?.message || err);
    return null;
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
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

  // Require Authenticated Customer
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Customer authentication token required.' }));
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  const adminServices = getAdminServices();
  if (!adminServices) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Firebase services temporarily unavailable.' }));
    return;
  }
  const { db, auth } = adminServices;

  let customerUid: string;
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    customerUid = decodedToken.uid;
  } catch {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Invalid or expired customer session.' }));
    return;
  }

  // Read body
  let rawBody = '';
  try {
    for await (const chunk of req) {
      rawBody += chunk;
      if (rawBody.length > MAX_BODY_BYTES) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Payload Too Large' }));
        return;
      }
    }
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Failed to read request body.' }));
    return;
  }

  let body: any;
  try {
    body = JSON.parse(rawBody || '{}');
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload.' }));
    return;
  }

  const { inquiryId, action } = body;
  if (!inquiryId || typeof inquiryId !== 'string') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'inquiryId is required.' }));
    return;
  }

  const inquiryRef = db.collection('bespoke_inquiries').doc(inquiryId);
  const snap = await inquiryRef.get();
  if (!snap.exists) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Bespoke inquiry not found.' }));
    return;
  }

  const data = snap.data() || {};
  // STRICT CUSTOMER OWNERSHIP ENFORCEMENT
  if (data.customerUid !== customerUid) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Forbidden: You do not own this bespoke inquiry.' }));
    return;
  }

  const currentStatus = data.status || 'inquiry_submitted';
  const now = new Date().toISOString();
  const updates: Record<string, any> = { updatedAt: now };
  const auditEntries: any[] = Array.isArray(data.auditTrail) ? [...data.auditTrail] : [];

  if (action === 'approve_quote' || action === 'accept_quote') {
    if (!['quotation_ready', 'awaiting_customer_approval'].includes(currentStatus)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: `Quotation cannot be approved from current state '${currentStatus}'.` }));
      return;
    }

    if (!data.quotation) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'No quotation has been issued for this bespoke inquiry yet.' }));
      return;
    }

    // Check expiry
    if (data.quotation.validUntil && new Date(data.quotation.validUntil) < new Date()) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Quotation has expired. Please contact atelier concierge for a revised quotation.' }));
      return;
    }

    updates.status = data.quotation.depositRequired ? 'deposit_pending' : 'approved';
    updates.approvedAt = now;

    auditEntries.push({
      event: 'CUSTOMER_APPROVED_QUOTATION',
      previousStatus: currentStatus,
      newStatus: updates.status,
      actorUid: customerUid,
      actorRole: 'customer',
      timestamp: now,
      note: 'Customer authorized bespoke quotation and terms of craft.'
    });
    updates.auditTrail = auditEntries;

  } else if (action === 'decline_quote' || action === 'reject_quote') {
    if (!['quotation_ready', 'awaiting_customer_approval'].includes(currentStatus)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'No active quotation available to decline.' }));
      return;
    }

    updates.status = 'declined';
    auditEntries.push({
      event: 'CUSTOMER_DECLINED_QUOTATION',
      previousStatus: currentStatus,
      newStatus: 'declined',
      actorUid: customerUid,
      actorRole: 'customer',
      timestamp: now,
      note: typeof body.reason === 'string' ? body.reason.slice(0, 300) : 'Quotation declined by customer.'
    });
    updates.auditTrail = auditEntries;

  } else if (action === 'send_message') {
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1000) : '';
    if (!message) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Message cannot be empty.' }));
      return;
    }

    const customerNotes = Array.isArray(data.customerVisibleNotes) ? [...data.customerVisibleNotes] : [];
    customerNotes.push({
      id: `msg_${Date.now()}`,
      authorName: data.customerName || 'Customer',
      message,
      createdAt: now
    });
    updates.customerVisibleNotes = customerNotes;

    auditEntries.push({
      event: 'CUSTOMER_MESSAGE_SENT',
      actorUid: customerUid,
      actorRole: 'customer',
      timestamp: now,
      note: 'Customer delivered message to atelier consultation dialogue.'
    });
    updates.auditTrail = auditEntries;

  } else {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: `Invalid customer action: ${action}` }));
    return;
  }

  try {
    await inquiryRef.update(updates);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Bespoke commission updated successfully.',
      status: updates.status || currentStatus
    }));
  } catch (err: any) {
    console.error('[Customer Bespoke Action] Error updating document:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Failed to update bespoke inquiry.' }));
  }
}
