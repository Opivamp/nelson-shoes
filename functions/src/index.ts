import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';

// Initialize Firebase Admin SDK (inherits Cloud Function default service account)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const GENERIC_ERROR_MESSAGE = 
  "We couldn't verify those order details. Please check your Order Reference and contact information and try again.";

// ---------------------------------------------------------------------------
// Rate Limiting (In-Memory IP & Reference Limiting to Prevent Enumeration)
// ---------------------------------------------------------------------------
interface RateRecord {
  count: number;
  resetAt: number;
}
const rateLimitCache = new Map<string, RateRecord>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_VERIFICATION_ATTEMPTS = 8; // Max 8 attempts per window

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(key);

  if (!record || now > record.resetAt) {
    rateLimitCache.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_VERIFICATION_ATTEMPTS) {
    return false;
  }

  record.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Normalization Utilities
// ---------------------------------------------------------------------------
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

function sanitizeOrder(order: any) {
  const currentIdx = STAGES.findIndex(s => s.status === order.status);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;
  const currentStage = STAGES[activeIdx];

  const timeline = STAGES.map((s, idx) => ({
    status: s.status,
    label: s.label,
    description: s.description,
    completed: idx <= activeIdx,
    current: idx === activeIdx
  }));

  const items = Array.isArray(order.items) 
    ? order.items.map((i: any) => ({
        productName: i?.product?.name || 'Handcrafted Footwear',
        primaryImage: i?.product?.primaryImage || '',
        size: i?.size || '',
        quantity: i?.quantity || 1,
        isBespokeFitting: Boolean(i?.isBespokeFitting)
      }))
    : [];

  return {
    orderReference: order.orderNumber,
    status: order.status,
    statusLabel: currentStage.label,
    timeline,
    progressPercent: currentStage.percent,
    trackingNumber: order.trackingNumber || null,
    carrier: order.trackingNumber ? 'DHL Express' : null,
    destinationCity: order.customer?.city && order.customer?.country
      ? `${order.customer.city}, ${order.customer.country}`
      : (order.customer?.city || null),
    items,
    verifiedAt: new Date().toISOString()
  };
}

// ---------------------------------------------------------------------------
// 1. Firebase Callable Function: verifyOrderTracking
// ---------------------------------------------------------------------------
export const verifyOrderTracking = onCall(
  { cors: true },
  async (request) => {
    const { orderReference, email, phone } = request.data || {};

    const cleanRef = typeof orderReference === 'string' ? orderReference.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';

    if (!cleanRef || (!cleanEmail && !cleanPhone)) {
      throw new HttpsError('invalid-argument', 'Missing required order reference or contact identifier.');
    }

    const clientIp = request.rawRequest?.ip || 'anonymous';
    if (!checkRateLimit(`ip_${clientIp}`) || !checkRateLimit(`ref_${cleanRef.toUpperCase()}`)) {
      throw new HttpsError('resource-exhausted', 'Too many verification attempts. Please wait 15 minutes before trying again.');
    }

    try {
      let orderDoc: admin.firestore.DocumentSnapshot | null = null;

      // 1. Query by orderNumber
      const qSnap = await db.collection('orders')
        .where('orderNumber', '==', cleanRef)
        .limit(1)
        .get();

      if (!qSnap.empty) {
        orderDoc = qSnap.docs[0];
      } else {
        // Fallback: check document ID
        const docSnap = await db.collection('orders').doc(cleanRef).get();
        if (docSnap.exists) {
          orderDoc = docSnap;
        }
      }

      if (!orderDoc || !orderDoc.exists) {
        throw new HttpsError('not-found', GENERIC_ERROR_MESSAGE);
      }

      const orderData = orderDoc.data() as any;
      const storedEmail = orderData?.customer?.email || '';
      const storedPhone = orderData?.customer?.phoneWhatsApp || '';

      let isVerified = false;
      if (cleanEmail && normalizeEmail(cleanEmail) === normalizeEmail(storedEmail)) {
        isVerified = true;
      } else if (cleanPhone && matchesPhone(cleanPhone, storedPhone)) {
        isVerified = true;
      }

      if (!isVerified) {
        throw new HttpsError('permission-denied', GENERIC_ERROR_MESSAGE);
      }

      return {
        success: true,
        data: sanitizeOrder(orderData)
      };
    } catch (error: any) {
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', GENERIC_ERROR_MESSAGE);
    }
  }
);

// ---------------------------------------------------------------------------
// 2. Firebase HTTPS REST Endpoint: verifyOrderTrackingHttp
// ---------------------------------------------------------------------------
export const verifyOrderTrackingHttp = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const { orderReference, email, phone } = req.body || {};
    const cleanRef = typeof orderReference === 'string' ? orderReference.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';

    if (!cleanRef || (!cleanEmail && !cleanPhone)) {
      res.status(400).json({ error: 'Missing required order reference or contact identifier.' });
      return;
    }

    const clientIp = req.ip || 'anonymous';
    if (!checkRateLimit(`ip_${clientIp}`) || !checkRateLimit(`ref_${cleanRef.toUpperCase()}`)) {
      res.status(429).json({ error: 'Too many verification attempts. Please wait 15 minutes before trying again.' });
      return;
    }

    try {
      let orderDoc: admin.firestore.DocumentSnapshot | null = null;

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
        res.status(404).json({ error: GENERIC_ERROR_MESSAGE });
        return;
      }

      const orderData = orderDoc.data() as any;
      const storedEmail = orderData?.customer?.email || '';
      const storedPhone = orderData?.customer?.phoneWhatsApp || '';

      let isVerified = false;
      if (cleanEmail && normalizeEmail(cleanEmail) === normalizeEmail(storedEmail)) {
        isVerified = true;
      } else if (cleanPhone && matchesPhone(cleanPhone, storedPhone)) {
        isVerified = true;
      }

      if (!isVerified) {
        res.status(403).json({ error: GENERIC_ERROR_MESSAGE });
        return;
      }

      res.status(200).json({
        success: true,
        data: sanitizeOrder(orderData)
      });
    } catch {
      res.status(500).json({ error: GENERIC_ERROR_MESSAGE });
    }
  }
);
