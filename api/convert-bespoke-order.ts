import type { IncomingMessage, ServerResponse } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'node:crypto';

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
    console.error('[Convert Bespoke Order] Failed to initialize Firebase Admin SDK:', err?.message || err);
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
  } catch {
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
      if (rawBody.length > 32 * 1024) {
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

  const { inquiryId } = body;
  if (!inquiryId || typeof inquiryId !== 'string') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'inquiryId is required.' }));
    return;
  }

  // Atomic transaction to ensure idempotency and prevent duplicate order creation
  try {
    const result = await db.runTransaction(async (t) => {
      const inquiryRef = db.collection('bespoke_inquiries').doc(inquiryId);
      const doc = await t.get(inquiryRef);

      if (!doc.exists) {
        return { error: 'Bespoke inquiry not found.', statusCode: 404 };
      }

      const inquiry = doc.data() || {};

      // Check if already converted
      if (inquiry.convertedOrderId) {
        return {
          error: `Commission already converted to order #${inquiry.convertedOrderId}.`,
          statusCode: 409,
          existingOrderId: inquiry.convertedOrderId
        };
      }

      // Check that quotation exists and commission is approved or deposit confirmed
      const validConversionStatuses = ['approved', 'deposit_pending', 'deposit_confirmed', 'in_production'];
      if (!validConversionStatuses.includes(inquiry.status)) {
        return {
          error: `Cannot convert commission in status '${inquiry.status}'. Commission must be approved by customer.`,
          statusCode: 422
        };
      }

      if (!inquiry.quotation) {
        return {
          error: 'Cannot convert commission to order without an authoritative quotation.',
          statusCode: 422
        };
      }

      const now = new Date().toISOString();
      const orderId = `ord-bespoke-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
      const orderNumber = `NS-BESP-${Math.floor(100000 + Math.random() * 900000)}`;

      const customerNames = (inquiry.customerName || 'Bespoke Customer').trim().split(' ');
      const firstName = customerNames[0] || 'Valued';
      const lastName = customerNames.slice(1).join(' ') || 'Customer';

      const specs = inquiry.specifications || {};
      const subtotalNGN = inquiry.quotation.amountNGN;
      const subtotalUSD = inquiry.quotation.amountUSD;
      const deliveryMethod = body.deliveryMethod === 'atelier-pickup' ? 'atelier-pickup' : 'dhl-express';
      const shippingFeeNGN = deliveryMethod === 'atelier-pickup' ? 0 : 25000;
      const shippingFeeUSD = deliveryMethod === 'atelier-pickup' ? 0 : 50;
      const totalNGN = subtotalNGN + shippingFeeNGN;
      const totalUSD = subtotalUSD + shippingFeeUSD;

      const paymentStatus = inquiry.quotation.depositStatus === 'paid' 
        ? (inquiry.quotation.depositPercentage >= 100 ? 'paid' : 'deposit_paid')
        : 'pending';

      const orderData = {
        id: orderId,
        orderNumber,
        customerUid: inquiry.customerUid || null,
        bespokeInquiryId: inquiryId,
        customer: {
          firstName,
          lastName,
          email: inquiry.customerEmail,
          phoneWhatsApp: inquiry.customerPhone,
          address: body.address || 'Atelier Private Fitting Lounge, Victoria Island',
          city: inquiry.city || 'Lagos',
          state: body.state || 'Lagos State',
          country: inquiry.country || 'Nigeria',
          deliveryMethod,
          fittingNotes: `Bespoke Silhouette: ${specs.silhouette}. Leather: ${specs.leatherType}. Last / Size: ${specs.footSize}. Notes: ${specs.specialRequests || 'Standard bespoke calibrations.'}`
        },
        items: [
          {
            id: `item-bespoke-${inquiryId}`,
            productId: 'bespoke-commission',
            name: `Bespoke Commission: ${specs.silhouette || 'Handcrafted Footwear'}`,
            priceNGN: subtotalNGN,
            priceUSD: subtotalUSD,
            size: specs.footSize || 'Custom Last',
            color: specs.colorPreference || 'Atelier Patina',
            primaryImage: inquiry.referenceImages?.[0]?.url || '/images/hero-bespoke-oxford.jpg',
            quantity: 1,
            isBespokeFitting: true,
            customNotes: `Leather: ${specs.leatherType}. Fitting Mode: ${specs.fittingPreference}. Monogram: ${specs.monogramInitials || 'None'}`
          }
        ],
        subtotalNGN,
        subtotalUSD,
        shippingFeeNGN,
        shippingFeeUSD,
        totalNGN,
        totalUSD,
        currency: inquiry.quotation.currency || 'NGN',
        paymentMethod: body.paymentMethod || 'bank-transfer',
        paymentStatus,
        paymentReference: inquiry.quotation.depositPaymentReference || null,
        status: inquiry.quotation.depositStatus === 'paid' ? 'At Workbench (Lasting)' : 'Pending Confirmation',
        auditTrail: [
          {
            event: 'ORDER_CONVERTED_FROM_BESPOKE',
            previousStatus: 'None',
            newStatus: inquiry.quotation.depositStatus === 'paid' ? 'At Workbench (Lasting)' : 'Pending Confirmation',
            actorUid: adminUid,
            actorRole: adminRole,
            timestamp: now,
            note: `Converted from bespoke commission dossier #${inquiry.inquiryReference}`
          }
        ],
        createdAt: now,
        updatedAt: now
      };

      const newOrderRef = db.collection('orders').doc(orderId);
      t.set(newOrderRef, orderData);

      // Update inquiry with order link
      const auditEntries: any[] = Array.isArray(inquiry.auditTrail) ? [...inquiry.auditTrail] : [];
      auditEntries.push({
        event: 'CONVERTED_TO_ORDER',
        actorUid: adminUid,
        actorRole: adminRole,
        timestamp: now,
        note: `Bespoke commission converted to order #${orderNumber} (${orderId})`
      });

      t.update(inquiryRef, {
        convertedOrderId: orderId,
        convertedOrderNumber: orderNumber,
        status: inquiry.quotation.depositStatus === 'paid' ? 'in_production' : 'deposit_pending',
        productionStartedAt: inquiry.quotation.depositStatus === 'paid' ? now : null,
        auditTrail: auditEntries,
        updatedAt: now
      });

      return {
        success: true,
        orderId,
        orderNumber,
        inquiryId
      };
    });

    if ('error' in result && result.error) {
      res.statusCode = result.statusCode || 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: result.error, existingOrderId: (result as any).existingOrderId }));
      return;
    }

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (err: any) {
    console.error('[Convert Bespoke Order] Transaction error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Failed to convert bespoke commission to order.' }));
  }
}
