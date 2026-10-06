import type { IncomingMessage, ServerResponse } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// Standalone Order Lifecycle & Capability Engine for Serverless Execution
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'Pending Confirmation'
  | 'At Workbench (Lasting)'
  | 'Welt Inseam Stitching'
  | 'Patina & Glacage'
  | 'Quality Inspection'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 'pending' | 'deposit_paid' | 'paid' | 'failed' | 'abandoned' | 'reversed';
export type DeliveryMethod = 'dhl-express' | 'atelier-pickup';
export type OrderPriority = 'standard' | 'priority' | 'urgent';
export type QualityInspectionOutcome = 'passed' | 'passed_with_notes' | 'requires_rework' | 'failed';

export interface QualityInspectionChecks {
  constructionIntegrity: boolean;
  stitchingAndWelting: boolean;
  patinaAndFinishing: boolean;
  soleCondition: boolean;
  sizingAndFit: boolean;
  packagingReadiness: boolean;
}

const CRAFT_STAGE_ORDER: OrderStatus[] = [
  'Pending Confirmation',
  'At Workbench (Lasting)',
  'Welt Inseam Stitching',
  'Patina & Glacage',
  'Quality Inspection',
  'Dispatched',
  'Delivered'
];

function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  options?: {
    userRole?: 'master_artisan' | 'atelier_staff';
    correctionNote?: string;
    qualityInspection?: { outcome: QualityInspectionOutcome };
  }
): { allowed: boolean; reason?: string } {
  if (currentStatus === nextStatus) return { allowed: true };

  // Delivered is strictly terminal
  if (currentStatus === 'Delivered') {
    return {
      allowed: false,
      reason: 'Delivered commissions have completed the atelier lifecycle and cannot be modified.'
    };
  }

  // Inspection Gate: Cannot dispatch failed / rework orders
  if (nextStatus === 'Dispatched') {
    if (options?.qualityInspection) {
      if (options.qualityInspection.outcome === 'failed' || options.qualityInspection.outcome === 'requires_rework') {
        return {
          allowed: false,
          reason: `Cannot dispatch order: quality inspection recorded as '${options.qualityInspection.outcome}'. Remediation required.`
        };
      }
    }
  }

  // Transitions to Cancelled
  if (nextStatus === 'Cancelled') {
    const allowedCancellationStages: OrderStatus[] = [
      'Pending Confirmation',
      'At Workbench (Lasting)'
    ];
    if (!allowedCancellationStages.includes(currentStatus)) {
      return {
        allowed: false,
        reason: `Commission cannot be cancelled once it reaches '${currentStatus}' because leather cutting and welting are irreversible.`
      };
    }
    return { allowed: true };
  }

  // Reactivation from Cancelled
  if (currentStatus === 'Cancelled') {
    if (options?.userRole !== 'master_artisan') {
      return {
        allowed: false,
        reason: 'Only a Master Artisan may reactivate a cancelled bespoke commission.'
      };
    }
    if (!options?.correctionNote || options.correctionNote.trim().length === 0) {
      return {
        allowed: false,
        reason: 'A workbench log note is required when reactivating a cancelled commission.'
      };
    }
    return { allowed: true };
  }

  const currentIdx = CRAFT_STAGE_ORDER.indexOf(currentStatus);
  const nextIdx = CRAFT_STAGE_ORDER.indexOf(nextStatus);

  if (currentIdx === -1 || nextIdx === -1) {
    return { allowed: false, reason: `Unknown order status: ${nextStatus}` };
  }

  // Forward transition
  if (nextIdx > currentIdx) {
    if (nextIdx === currentIdx + 1) return { allowed: true };
    if (options?.userRole === 'master_artisan') return { allowed: true };
    return {
      allowed: false,
      reason: `Atelier staff must advance commissions sequentially (${CRAFT_STAGE_ORDER[currentIdx + 1]} is next).`
    };
  }

  // Backward correction
  if (nextIdx < currentIdx) {
    if (options?.userRole !== 'master_artisan') {
      return {
        allowed: false,
        reason: 'Only a Master Artisan may perform backward workshop stage corrections.'
      };
    }
    if (!options?.correctionNote || options.correctionNote.trim().length === 0) {
      return {
        allowed: false,
        reason: 'An explanatory bench note is required when moving a commission to an earlier stage.'
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

function validateDispatch(deliveryMethod: DeliveryMethod, trackingNumber?: string): { valid: boolean; reason?: string; carrier: string } {
  if (deliveryMethod === 'dhl-express') {
    const clean = (trackingNumber || '').trim();
    if (!clean || clean.length < 5) {
      return {
        valid: false,
        reason: 'A valid DHL Express tracking number is required to dispatch via courier.',
        carrier: 'DHL Express'
      };
    }
    return { valid: true, carrier: 'DHL Express' };
  }
  return { valid: true, carrier: 'Atelier Pickup' };
}

function validateInspection(
  checks: QualityInspectionChecks,
  outcome: QualityInspectionOutcome,
  notes?: string
): { valid: boolean; reason?: string } {
  const allPass = (
    checks.constructionIntegrity &&
    checks.stitchingAndWelting &&
    checks.patinaAndFinishing &&
    checks.soleCondition &&
    checks.sizingAndFit &&
    checks.packagingReadiness
  );

  if (!allPass && (outcome === 'passed' || outcome === 'passed_with_notes')) {
    return {
      valid: false,
      reason: 'Cannot pass quality inspection when one or more structural or finishing checkpoints are incomplete.'
    };
  }

  if ((outcome === 'requires_rework' || outcome === 'failed') && (!notes || notes.trim().length === 0)) {
    return {
      valid: false,
      reason: 'Artisan inspection notes detailing the defect or rework instruction are required.'
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Rate Limiter & Firebase Admin Setup
// ---------------------------------------------------------------------------

const attemptsMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 60; // 60 actions per 15 min per IP for staff
const MAX_BODY_BYTES = 32 * 1024;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = attemptsMap.get(key);
  if (!record || now > record.resetAt) {
    attemptsMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
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
  cleaned = cleaned.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const begin = '-----BEGIN PRIVATE KEY-----';
  const end = '-----END PRIVATE KEY-----';
  if (cleaned.includes(begin) && cleaned.includes(end)) {
    const s = cleaned.indexOf(begin) + begin.length;
    const e = cleaned.indexOf(end);
    const body = cleaned.substring(s, e).replace(/\s+/g, '');
    const chunked = body.match(/.{1,64}/g)?.join('\n') || body;
    return `${begin}\n${chunked}\n${end}\n`;
  }
  return cleaned;
}

function getAdminServices() {
  const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '').trim();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawKey) return null;

  try {
    const privateKey = cleanPrivateKey(rawKey);
    const existing = getApps();
    const app = existing.length > 0
      ? existing[0]
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey })
        });

    return {
      db: getFirestore(app),
      auth: getAuth(app)
    };
  } catch (err: any) {
    console.error('[manage-order] Firebase Admin SDK initialization failed:', err?.message || err);
    return null;
  }
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  const origin = (req.headers.origin as string) || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

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

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    res.statusCode = 413;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Payload Too Large' }));
    return;
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'ip';
  if (isRateLimited(`order_mgmt_${ip}`)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded. Please wait a moment.' }));
    return;
  }

  // Parse body
  let body = req.body;
  if (!body && typeof (req as any).on === 'function') {
    const buffers: Buffer[] = [];
    let bytes = 0;
    try {
      for await (const chunk of req) {
        const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
        bytes += buf.length;
        if (bytes > MAX_BODY_BYTES) {
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Payload Too Large' }));
          return;
        }
        buffers.push(buf);
      }
      const raw = Buffer.concat(buffers).toString('utf-8');
      body = raw ? JSON.parse(raw) : {};
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      return;
    }
  }

  // Extract Auth Token
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Authorization header with Bearer token is required.' }));
    return;
  }

  const idToken = authHeader.substring(7).trim();
  const services = getAdminServices();

  if (!services) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Atelier cloud backend not configured.' }));
    return;
  }

  const { db, auth } = services;

  // Verify ID Token and Claims
  let decodedToken: any;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (err: any) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Invalid or expired authentication token.' }));
    return;
  }

  let actorRole: 'master_artisan' | 'atelier_staff' | null = null;
  if (decodedToken.admin === true || decodedToken.role === 'master_artisan') {
    actorRole = 'master_artisan';
  } else if (decodedToken.role === 'atelier_staff') {
    actorRole = 'atelier_staff';
  }

  if (!actorRole) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Atelier administrator claims are required to execute this operation.' }));
    return;
  }

  const actorUid = decodedToken.uid;
  const actorEmail = decodedToken.email || 'atelier@nelsonshoes.com';
  const actorName = decodedToken.name || (actorRole === 'master_artisan' ? 'Master Artisan' : 'Atelier Staff');

  const { action, orderId } = body || {};

  if (!action || !orderId) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Parameters "action" and "orderId" are required.' }));
    return;
  }

  try {
    const orderRef = db.collection('orders').doc(orderId);
    const snap = await orderRef.get();

    if (!snap.exists) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: `Order document "${orderId}" not found.` }));
      return;
    }

    const currentOrder = snap.data() as any;
    const now = new Date().toISOString();
    const currentAuditTrail = Array.isArray(currentOrder.auditTrail) ? currentOrder.auditTrail : [];

    switch (action) {
      // -------------------------------------------------------------
      // 1. STAGE TRANSITION
      // -------------------------------------------------------------
      case 'transition_status': {
        const { newStatus, trackingNumber, artisanNotes, reason } = body;
        if (!newStatus) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Target "newStatus" is required.' }));
          return;
        }

        const check = canTransitionOrderStatus(currentOrder.status, newStatus, {
          userRole: actorRole,
          correctionNote: reason || artisanNotes,
          qualityInspection: currentOrder.qualityInspection
        });

        if (!check.allowed) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: check.reason }));
          return;
        }

        const updateData: Record<string, any> = {
          status: newStatus,
          updatedAt: now
        };

        if (newStatus === 'Dispatched') {
          const dispatchCheck = validateDispatch(currentOrder.customer?.deliveryMethod, trackingNumber || currentOrder.trackingNumber);
          if (!dispatchCheck.valid) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: dispatchCheck.reason }));
            return;
          }
          updateData.carrier = dispatchCheck.carrier;
          updateData.dispatchedAt = now;
          if (dispatchCheck.carrier === 'DHL Express') {
            updateData.trackingNumber = (trackingNumber || currentOrder.trackingNumber || '').trim();
          }
        } else if (newStatus === 'Delivered') {
          updateData.deliveredAt = now;
        } else if (newStatus === 'Cancelled') {
          updateData.cancelledAt = now;
          updateData.cancellationReason = reason || artisanNotes || 'Cancelled by atelier administration.';
        }

        if (artisanNotes) {
          updateData.artisanNotes = artisanNotes;
        }

        const auditEntry = {
          event: 'STATUS_TRANSITION',
          previousStatus: currentOrder.status,
          newStatus,
          actorUid,
          actorRole,
          actorEmail,
          timestamp: now,
          note: artisanNotes || undefined,
          reason: reason || undefined
        };

        updateData.auditTrail = [...currentAuditTrail, auditEntry];
        await orderRef.update(updateData);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: `Status updated to ${newStatus}`, data: updateData }));
        return;
      }

      // -------------------------------------------------------------
      // 2. ARTISAN ASSIGNMENT
      // -------------------------------------------------------------
      case 'assign_artisan': {
        const { artisanUid, artisanName } = body;
        if (!artisanUid) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Artisan UID is required for assignment.' }));
          return;
        }

        // Staff can only self-assign unassigned orders
        if (actorRole === 'atelier_staff') {
          if (currentOrder.assignedArtisanUid && currentOrder.assignedArtisanUid !== actorUid) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Only a Master Artisan may reassign an order allocated to another cordwainer.' }));
            return;
          }
          if (!currentOrder.assignedArtisanUid && artisanUid !== actorUid) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Atelier staff may only self-assign unassigned production orders.' }));
            return;
          }
        }

        const updateData: Record<string, any> = {
          assignedArtisanUid: artisanUid,
          assignedArtisanName: artisanName || (artisanUid === actorUid ? actorName : 'Assigned Cordwainer'),
          assignedAt: now,
          assignedBy: actorName,
          updatedAt: now,
          auditTrail: [
            ...currentAuditTrail,
            {
              event: 'ARTISAN_ASSIGNMENT',
              previousAssigned: currentOrder.assignedArtisanUid || null,
              newAssigned: artisanUid,
              actorUid,
              actorRole,
              timestamp: now
            }
          ]
        };

        await orderRef.update(updateData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Artisan assignment saved.', data: updateData }));
        return;
      }

      // -------------------------------------------------------------
      // 3. PRIORITY MANAGEMENT
      // -------------------------------------------------------------
      case 'set_priority': {
        const { priority } = body;
        const valid: OrderPriority[] = ['standard', 'priority', 'urgent'];
        if (!priority || !valid.includes(priority)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: `Invalid priority: ${priority}. Must be standard, priority, or urgent.` }));
          return;
        }

        if (priority === 'urgent' && actorRole !== 'master_artisan') {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Only a Master Artisan can designate a commission as urgent priority.' }));
          return;
        }

        const updateData = {
          priority,
          updatedAt: now,
          auditTrail: [
            ...currentAuditTrail,
            {
              event: 'PRIORITY_UPDATE',
              previousPriority: currentOrder.priority || 'standard',
              newPriority: priority,
              actorUid,
              actorRole,
              timestamp: now
            }
          ]
        };

        await orderRef.update(updateData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: `Priority set to ${priority}`, data: updateData }));
        return;
      }

      // -------------------------------------------------------------
      // 4. QUALITY INSPECTION WORKFLOW
      // -------------------------------------------------------------
      case 'record_inspection': {
        const { checks, outcome, internalInspectionNotes, customerVisibleSummary } = body;
        if (!checks || !outcome) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Inspection "checks" and "outcome" are required.' }));
          return;
        }

        const val = validateInspection(checks, outcome, internalInspectionNotes);
        if (!val.valid) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: val.reason }));
          return;
        }

        const inspectionRecord = {
          inspectorUid: actorUid,
          inspectorName: actorName,
          inspectorRole: actorRole,
          inspectedAt: now,
          outcome,
          checks,
          customerVisibleSummary: customerVisibleSummary || (
            outcome === 'passed' || outcome === 'passed_with_notes'
              ? 'Commission certified by Master Cordwainer inspection.'
              : 'Commission undergoing bench calibration.'
          ),
          internalInspectionNotes: internalInspectionNotes || ''
        };

        const updateData: Record<string, any> = {
          qualityInspection: inspectionRecord,
          updatedAt: now,
          auditTrail: [
            ...currentAuditTrail,
            {
              event: 'QUALITY_INSPECTION_RECORDED',
              outcome,
              actorUid,
              actorRole,
              timestamp: now,
              note: internalInspectionNotes || undefined
            }
          ]
        };

        await orderRef.update(updateData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: `Inspection recorded as ${outcome}.`, data: updateData }));
        return;
      }

      // -------------------------------------------------------------
      // 5. INTERNAL ARTISAN BENCH NOTE
      // -------------------------------------------------------------
      case 'add_internal_note': {
        const { note } = body;
        if (!note || note.trim().length === 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Note content is required.' }));
          return;
        }

        const updatedNotes = currentOrder.artisanNotes 
          ? `${currentOrder.artisanNotes}\n[${now.slice(0, 10)} - ${actorName}]: ${note.trim()}`
          : `[${now.slice(0, 10)} - ${actorName}]: ${note.trim()}`;

        const updateData = {
          artisanNotes: updatedNotes,
          updatedAt: now,
          auditTrail: [
            ...currentAuditTrail,
            {
              event: 'INTERNAL_NOTE_ADDED',
              actorUid,
              actorRole,
              timestamp: now
            }
          ]
        };

        await orderRef.update(updateData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Internal bench note saved.', data: updateData }));
        return;
      }

      // -------------------------------------------------------------
      // 6. CUSTOMER-VISIBLE MILESTONE NOTE
      // -------------------------------------------------------------
      case 'add_customer_note': {
        const { message } = body;
        if (!message || message.trim().length === 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Milestone message is required.' }));
          return;
        }

        const currentNotes = Array.isArray(currentOrder.customerVisibleNotes) ? currentOrder.customerVisibleNotes : [];
        const newNote = {
          id: `cn-${Date.now()}`,
          message: message.trim(),
          timestamp: now,
          authorRole: actorRole === 'master_artisan' ? 'Master Cordwainer' : 'Atelier Concierge'
        };

        const updateData = {
          customerVisibleNotes: [...currentNotes, newNote],
          updatedAt: now,
          auditTrail: [
            ...currentAuditTrail,
            {
              event: 'CUSTOMER_NOTE_PUBLISHED',
              actorUid,
              actorRole,
              timestamp: now
            }
          ]
        };

        await orderRef.update(updateData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: 'Customer milestone published.', data: updateData }));
        return;
      }

      // -------------------------------------------------------------
      // 7. PAYMENT RECONCILIATION (Bank Transfer / Atelier Cash)
      // -------------------------------------------------------------
      case 'reconcile_payment': {
        if (actorRole !== 'master_artisan') {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Only a Master Artisan may reconcile or adjust financial ledger records.' }));
          return;
        }

        const { paymentReference, reconciliationNote, paymentStatus } = body;
        const targetStatus: PaymentStatus = paymentStatus || 'paid';

        // Downgrade protection
        if (currentOrder.paymentStatus === 'paid' && targetStatus !== 'paid' && targetStatus !== 'reversed') {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'A confirmed, settled payment cannot be downgraded to pending or failed.' }));
          return;
        }

        if (targetStatus === 'reversed' && (!reconciliationNote || reconciliationNote.trim().length === 0)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'A reason note is required when recording a payment reversal.' }));
          return;
        }

        const updateData: Record<string, any> = {
          paymentStatus: targetStatus,
          reconciledAt: now,
          reconciledBy: actorName,
          reconciliationNote: reconciliationNote || 'Verified manual bank transfer cleared into treasury.',
          updatedAt: now
        };

        if (paymentReference) {
          updateData.paymentReference = paymentReference;
        }
        if (targetStatus === 'paid' && !currentOrder.paidAt) {
          updateData.paidAt = now;
        }

        updateData.auditTrail = [
          ...currentAuditTrail,
          {
            event: 'PAYMENT_RECONCILIATION',
            previousPaymentStatus: currentOrder.paymentStatus,
            newPaymentStatus: targetStatus,
            actorUid,
            actorRole,
            timestamp: now,
            reason: reconciliationNote || undefined
          }
        ];

        await orderRef.update(updateData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: `Payment reconciled as ${targetStatus}.`, data: updateData }));
        return;
      }

      // -------------------------------------------------------------
      // 8. ATELIER PICKUP READINESS
      // -------------------------------------------------------------
      case 'set_pickup_ready': {
        const { ready, note } = body;
        const isReady = Boolean(ready);

        if (isReady && currentOrder.qualityInspection) {
          if (currentOrder.qualityInspection.outcome === 'failed' || currentOrder.qualityInspection.outcome === 'requires_rework') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Cannot mark order ready for collection: quality inspection incomplete or failed.' }));
            return;
          }
        }

        const updateData: Record<string, any> = {
          readyForPickup: isReady,
          pickupReadyAt: isReady ? now : null,
          updatedAt: now,
          auditTrail: [
            ...currentAuditTrail,
            {
              event: isReady ? 'PICKUP_READY' : 'PICKUP_UNREADY',
              actorUid,
              actorRole,
              timestamp: now,
              note: note || undefined
            }
          ]
        };

        await orderRef.update(updateData);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: isReady ? 'Order marked ready for pickup.' : 'Order pickup readiness cleared.', data: updateData }));
        return;
      }

      default: {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: `Unknown action: "${action}"` }));
        return;
      }
    }
  } catch (err: any) {
    console.error('[manage-order] Error executing order management action:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err?.message || 'Internal atelier server error' }));
  }
}
