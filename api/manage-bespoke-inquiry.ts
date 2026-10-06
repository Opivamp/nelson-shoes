import type { IncomingMessage, ServerResponse } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'node:crypto';
import { canTransitionBespokeStatus, validateBespokeQuotation } from '../src/services/bespokeLifecycle';

const MAX_BODY_BYTES = 64 * 1024;

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
    console.error('[Manage Bespoke Inquiry] Failed to initialize Firebase Admin SDK:', err?.message || err);
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

  // Authorize Admin Claims
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Authorization header required.' }));
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  const adminServices = getAdminServices();
  if (!adminServices) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Firebase Admin services unavailable.' }));
    return;
  }
  const { db, auth } = adminServices;

  let adminUid: string;
  let adminRole: 'master_artisan' | 'atelier_staff';
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const hasAdminClaim = decodedToken.admin === true || 
                          decodedToken.role === 'master_artisan' || 
                          decodedToken.role === 'atelier_staff';

    if (!hasAdminClaim) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Access Denied: Requires verified atelier administrator claims.' }));
      return;
    }

    adminUid = decodedToken.uid;
    adminRole = decodedToken.role === 'master_artisan' ? 'master_artisan' : 'atelier_staff';
  } catch (authErr) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Invalid or expired administrative credentials.' }));
    return;
  }

  // Parse Body
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
    res.end(JSON.stringify({ success: false, error: 'Invalid JSON body.' }));
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

  const inquiryData = snap.data() || {};
  const currentStatus = inquiryData.status || 'inquiry_submitted';
  const now = new Date().toISOString();
  const updates: Record<string, any> = { updatedAt: now };
  const auditEntries: any[] = Array.isArray(inquiryData.auditTrail) ? [...inquiryData.auditTrail] : [];

  // =========================================================================
  // ACTION DISPATCHER
  // =========================================================================

  if (action === 'update_status' || action === 'update_stage') {
    const targetStatus = body.targetStatus;
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    const transitionCheck = canTransitionBespokeStatus(currentStatus, targetStatus, adminRole, note);
    if (!transitionCheck.allowed) {
      res.statusCode = 422;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: transitionCheck.reason || 'Illegal stage transition.' }));
      return;
    }

    updates.status = targetStatus;
    if (targetStatus === 'under_review') updates.reviewedAt = now;
    if (targetStatus === 'in_production') updates.productionStartedAt = now;
    if (targetStatus === 'completed') updates.completedAt = now;

    auditEntries.push({
      event: 'STATUS_TRANSITION',
      previousStatus: currentStatus,
      newStatus: targetStatus,
      actorUid: adminUid,
      actorRole: adminRole,
      timestamp: now,
      note: note || `Stage advanced to ${targetStatus}`
    });
    updates.auditTrail = auditEntries;

  } else if (action === 'set_quotation' || action === 'issue_quote') {
    // Only Master Artisan or authorized staff can set quotation
    const quotePayload = body.quotation || {};
    const validation = validateBespokeQuotation(quotePayload);
    if (!validation.valid) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: validation.error }));
      return;
    }

    const depositPercentage = quotePayload.depositPercentage || 50;
    const amountNGN = Math.round(quotePayload.amountNGN);
    const amountUSD = Math.round(quotePayload.amountUSD);
    const depositAmountNGN = Math.round(quotePayload.depositAmountNGN || (amountNGN * depositPercentage) / 100);
    const depositAmountUSD = Math.round(quotePayload.depositAmountUSD || (amountUSD * depositPercentage) / 100);

    const quotation = {
      amountNGN,
      amountUSD,
      currency: quotePayload.currency || 'NGN',
      depositRequired: quotePayload.depositRequired !== false,
      depositPercentage,
      depositAmountNGN,
      depositAmountUSD,
      depositStatus: 'pending',
      estimatedLeadWeeks: quotePayload.estimatedLeadWeeks || 5,
      validUntil: quotePayload.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      terms: quotePayload.terms || '50% non-refundable bench deposit required upon formal authorization to secure bespoke beechwood last carving and premium French box calf allocation.',
      notes: typeof quotePayload.notes === 'string' ? quotePayload.notes.trim() : '',
      createdByUid: adminUid,
      createdByRole: adminRole,
      createdAt: inquiryData.quotation?.createdAt || now,
      updatedAt: now
    };

    updates.quotation = quotation;
    // Advance status to quotation_ready if it is currently in earlier stages
    if (['inquiry_submitted', 'under_review', 'design_review'].includes(currentStatus)) {
      updates.status = 'quotation_ready';
      auditEntries.push({
        event: 'QUOTATION_ISSUED',
        previousStatus: currentStatus,
        newStatus: 'quotation_ready',
        actorUid: adminUid,
        actorRole: adminRole,
        timestamp: now,
        note: `Bespoke quotation generated for ₦${amountNGN.toLocaleString()} / $${amountUSD.toLocaleString()}`
      });
      updates.auditTrail = auditEntries;
    }

  } else if (action === 'add_artisan_note' || action === 'add_internal_note') {
    // INTERNAL ONLY: Never shown to customer
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Note message cannot be empty.' }));
      return;
    }

    const existingArtisanNotes = Array.isArray(inquiryData.artisanNotes) ? [...inquiryData.artisanNotes] : [];
    existingArtisanNotes.push({
      id: `art_note_${crypto.randomBytes(5).toString('hex')}`,
      authorUid: adminUid,
      authorName: adminRole === 'master_artisan' ? 'Master Artisan' : 'Atelier Staff',
      authorRole: adminRole,
      message,
      createdAt: now
    });
    updates.artisanNotes = existingArtisanNotes;

    auditEntries.push({
      event: 'ARTISAN_NOTE_ADDED',
      actorUid: adminUid,
      actorRole: adminRole,
      timestamp: now,
      note: 'Workbench internal observation logged.'
    });
    updates.auditTrail = auditEntries;

  } else if (action === 'add_customer_note') {
    // VISIBLE TO CUSTOMER
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Customer message cannot be empty.' }));
      return;
    }

    const existingCustomerNotes = Array.isArray(inquiryData.customerVisibleNotes) ? [...inquiryData.customerVisibleNotes] : [];
    existingCustomerNotes.push({
      id: `cust_note_${crypto.randomBytes(5).toString('hex')}`,
      authorName: 'Nelson Atelier Concierge',
      message,
      createdAt: now
    });
    updates.customerVisibleNotes = existingCustomerNotes;

    auditEntries.push({
      event: 'CUSTOMER_COMMUNICATION_DISPATCHED',
      actorUid: adminUid,
      actorRole: adminRole,
      timestamp: now,
      note: 'Concierge notice delivered to customer portal.'
    });
    updates.auditTrail = auditEntries;

  } else if (action === 'assign_artisan') {
    const artisanName = typeof body.artisanName === 'string' ? body.artisanName.trim() : null;
    updates.assignedArtisan = artisanName;
    auditEntries.push({
      event: 'ARTISAN_ASSIGNED',
      actorUid: adminUid,
      actorRole: adminRole,
      timestamp: now,
      note: `Bespoke cordwainer allocation: ${artisanName || 'Unassigned'}`
    });
    updates.auditTrail = auditEntries;

  } else if (action === 'confirm_deposit') {
    // Staff manually confirming deposit payment (e.g. verified bank wire)
    if (inquiryData.quotation) {
      updates['quotation.depositStatus'] = 'paid';
      updates['quotation.depositPaidAt'] = now;
      updates['quotation.depositPaymentReference'] = body.paymentReference || `ATELIER-WIRE-${Date.now()}`;
    }
    updates.status = 'deposit_confirmed';

    auditEntries.push({
      event: 'DEPOSIT_CONFIRMED',
      previousStatus: currentStatus,
      newStatus: 'deposit_confirmed',
      actorUid: adminUid,
      actorRole: adminRole,
      timestamp: now,
      note: `Deposit verified by ${adminRole}. Bench reservation confirmed.`
    });
    updates.auditTrail = auditEntries;

  } else {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: `Unrecognized action: ${action}` }));
    return;
  }

  try {
    await inquiryRef.update(updates);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Bespoke commission dossier updated successfully.',
      updates
    }));
  } catch (err: any) {
    console.error('[Manage Bespoke Inquiry] Update error:', err?.message || err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Failed to update commission record.' }));
  }
}
