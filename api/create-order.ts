import type { IncomingMessage, ServerResponse } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'node:crypto';

// In-memory rate limiter per IP for order creation
const attemptsMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const MAX_ATTEMPTS = 15; // Max 15 order creation attempts per 15 min per IP
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

    return {
      db: getFirestore(app),
      auth: getAuth(app)
    };
  } catch (err: any) {
    console.error('[Vercel Serverless] Failed to initialize Firebase Admin SDK for create-order:', err?.message || err);
    return null;
  }
}

// Authoritative Baseline Product Catalog (Major Integer Units)
interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceNGN: number;
  priceUSD: number;
  primaryImage: string;
  sizesAvailable: number[];
  status: string;
}

const AUTHORITATIVE_CATALOG: Record<string, CatalogProduct> = {
  "prod-sovereign-oxford": {
    id: "prod-sovereign-oxford",
    slug: "sovereign-wholecut-oxford",
    name: "The Sovereign Wholecut",
    category: "oxfords",
    priceNGN: 245000,
    priceUSD: 320,
    primaryImage: "/images/hero-bespoke-oxford.jpg",
    sizesAvailable: [39, 40, 41, 42, 43, 44, 45, 46, 47],
    status: "Available to Commission"
  },
  "prod-eko-tassel-loafer": {
    id: "prod-eko-tassel-loafer",
    slug: "eko-belgian-tassel-loafer",
    name: "The Èkó Tassel Loafer",
    category: "loafers",
    priceNGN: 215000,
    priceUSD: 280,
    primaryImage: "/images/product-tassel-loafer.jpg",
    sizesAvailable: [39, 40, 41, 42, 43, 44, 45, 46],
    status: "Available to Commission"
  },
  "prod-ikoyi-monkstrap": {
    id: "prod-ikoyi-monkstrap",
    slug: "ikoyi-double-monkstrap",
    name: "The Ikoyi Double Monk",
    category: "oxfords",
    priceNGN: 250000,
    priceUSD: 330,
    primaryImage: "/images/product-monkstrap-espresso.jpg",
    sizesAvailable: [40, 41, 42, 43, 44, 45, 46],
    status: "Available to Commission"
  },
  "prod-savannah-chelsea": {
    id: "prod-savannah-chelsea",
    slug: "savannah-bespoke-chelsea-boot",
    name: "The Savannah Chelsea",
    category: "boots",
    priceNGN: 265000,
    priceUSD: 350,
    primaryImage: "/images/product-chelsea-boot.jpg",
    sizesAvailable: [40, 41, 42, 43, 44, 45, 46, 47],
    status: "Available to Commission"
  },
  "prod-abike-sandal": {
    id: "prod-abike-sandal",
    slug: "abike-artisan-leather-sandal",
    name: "The Àbíkẹ́ Artisan Sandal",
    category: "sandals",
    priceNGN: 125000,
    priceUSD: 165,
    primaryImage: "/images/product-bespoke-sandal.jpg",
    sizesAvailable: [39, 40, 41, 42, 43, 44, 45, 46],
    status: "Available to Commission"
  },
  "prod-heritage-custom": {
    id: "prod-heritage-custom",
    slug: "heritage-monogram-bespoke-commission",
    name: "The Atelier Bespoke Commission",
    category: "custom",
    priceNGN: 380000,
    priceUSD: 500,
    primaryImage: "/images/craft-workshop-lasts.jpg",
    sizesAvailable: [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
    status: "Available to Commission"
  }
};

// ---------------------------------------------------------------------------
// Centralized Authoritative Shipping Rules
// Nelson Shoes Business Pricing:
// DHL Express International: ₦25,000 NGN / $50 USD
// Atelier Pickup (Lagos): ₦0 NGN / $0 USD
// ---------------------------------------------------------------------------
export interface ShippingRule {
  feeNGN: number;
  feeUSD: number;
  label: string;
}

export const AUTHORITATIVE_SHIPPING_RULES: Record<string, ShippingRule> = {
  'dhl-express': {
    feeNGN: 25000,
    feeUSD: 50,
    label: 'DHL Express International Courier'
  },
  'atelier-pickup': {
    feeNGN: 0,
    feeUSD: 0,
    label: 'Lagos Atelier Fitting & Pickup'
  }
};

export function calculateAuthoritativeShipping(deliveryMethod: string, currency: 'NGN' | 'USD') {
  const normMethod = (deliveryMethod || '').trim().toLowerCase();
  const rule = AUTHORITATIVE_SHIPPING_RULES[normMethod];
  if (!rule) {
    throw new Error(`Invalid or unsupported delivery method: '${deliveryMethod}'. Supported methods are 'dhl-express' and 'atelier-pickup'.`);
  }
  return {
    deliveryMethod: normMethod as 'dhl-express' | 'atelier-pickup',
    shippingFeeNGN: rule.feeNGN,
    shippingFeeUSD: rule.feeUSD,
    authoritativeShippingFee: currency === 'USD' ? rule.feeUSD : rule.feeNGN,
    label: rule.label
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, '');
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // CORS origin handling
  const origin = (req.headers.origin as string) || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Idempotency-Key');
  }

  // Preflight
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

  if (isRateLimited(`create_order:${ip}`)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Too many order requests. Please wait a few moments before trying again.' 
    }));
    return;
  }

  // Enforce payload size limit
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    res.statusCode = 413;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Payload Too Large' }));
    return;
  }

  // Parse JSON Body
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
          res.end(JSON.stringify({ success: false, error: 'Payload Too Large' }));
          return;
        }
        buffers.push(buf);
      }
      const dataStr = Buffer.concat(buffers).toString('utf-8');
      body = dataStr.trim() ? JSON.parse(dataStr) : {};
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Malformed JSON request body.' }));
      return;
    }
  }

  if (!body || typeof body !== 'object') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Invalid request payload.' }));
    return;
  }

  // Initialize Firebase Admin
  const adminServices = getAdminServices();
  if (!adminServices) {
    console.error('[Vercel Serverless] Firebase Admin credentials missing.');
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Server configuration error. Please contact atelier support.' }));
    return;
  }

  const { db, auth } = adminServices;

  // 1. Authenticate Customer Token (if provided)
  let customerUid: string | undefined = undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7).trim();
    if (idToken) {
      try {
        const decodedToken = await auth.verifyIdToken(idToken);
        customerUid = decodedToken.uid;
      } catch (err: any) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired customer authentication session. Please sign in again.' 
        }));
        return;
      }
    }
  }

  // 2. Validate Customer Details
  const customer = body.customer;
  if (!customer || typeof customer !== 'object') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Missing customer contact information.' }));
    return;
  }

  const firstName = typeof customer.firstName === 'string' ? customer.firstName.trim() : '';
  const lastName = typeof customer.lastName === 'string' ? customer.lastName.trim() : '';
  const rawEmail = typeof customer.email === 'string' ? customer.email.trim() : '';
  const rawPhone = typeof customer.phoneWhatsApp === 'string' ? customer.phoneWhatsApp.trim() : '';
  const address = typeof customer.address === 'string' ? customer.address.trim() : '';
  const city = typeof customer.city === 'string' ? customer.city.trim() : '';
  const state = typeof customer.state === 'string' ? customer.state.trim() : '';
  const country = typeof customer.country === 'string' ? customer.country.trim() : 'Nigeria';
  const fittingNotes = typeof customer.fittingNotes === 'string' ? customer.fittingNotes.trim().slice(0, 500) : undefined;
  const rawDeliveryMethod = typeof customer.deliveryMethod === 'string' ? customer.deliveryMethod.trim() : 
                            typeof body.deliveryMethod === 'string' ? body.deliveryMethod.trim() : '';

  if (!firstName || firstName.length > 60 || !lastName || lastName.length > 60) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Valid first and last name are required.' }));
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!rawEmail || !emailRegex.test(rawEmail) || rawEmail.length > 100) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'A valid email address is required.' }));
    return;
  }
  const email = normalizeEmail(rawEmail);

  const normPhone = normalizePhone(rawPhone);
  if (!normPhone || normPhone.length < 7 || normPhone.length > 25) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'A valid phone/WhatsApp number is required.' }));
    return;
  }

  if (!address || address.length > 250 || !city || city.length > 100) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Delivery address and city are required.' }));
    return;
  }

  // Authoritative Delivery Method Validation
  if (!rawDeliveryMethod || !AUTHORITATIVE_SHIPPING_RULES[rawDeliveryMethod.toLowerCase()]) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: `Invalid or unsupported delivery method: '${rawDeliveryMethod}'. Supported methods are 'dhl-express' and 'atelier-pickup'.` 
    }));
    return;
  }

  // 3. Validate Currency & Payment Method
  const rawCurrency = typeof body.currency === 'string' ? body.currency.trim().toUpperCase() : 'NGN';
  if (rawCurrency !== 'NGN' && rawCurrency !== 'USD') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Unsupported currency. Supported currencies are NGN and USD.' }));
    return;
  }
  const currency: 'NGN' | 'USD' = rawCurrency;

  const rawPaymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod.trim() : 'paystack-card';
  const validPaymentMethods = ['paystack-card', 'bank-transfer', 'whatsapp-concierge', 'paystack', 'bank_transfer'];
  if (!validPaymentMethods.includes(rawPaymentMethod)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Invalid or unsupported payment method.' }));
    return;
  }
  // Standardize payment method
  const paymentMethod: 'paystack-card' | 'bank-transfer' | 'whatsapp-concierge' = 
    (rawPaymentMethod === 'paystack' || rawPaymentMethod === 'paystack-card') ? 'paystack-card' :
    (rawPaymentMethod === 'bank_transfer' || rawPaymentMethod === 'bank-transfer') ? 'bank-transfer' :
    'whatsapp-concierge';

  // 4. Validate Items Array
  const rawItems = body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Order must contain at least one item.' }));
    return;
  }

  if (rawItems.length > 20) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Order exceeds maximum allowable items per commission (20).' }));
    return;
  }

  // 5. Authoritative Shipping Fee Calculation (Preserving Nelson Shoes Business Pricing)
  const shippingCalculation = calculateAuthoritativeShipping(rawDeliveryMethod, currency);
  const deliveryMethod = shippingCalculation.deliveryMethod;
  const authoritativeShippingFeeNGN = shippingCalculation.shippingFeeNGN;
  const authoritativeShippingFeeUSD = shippingCalculation.shippingFeeUSD;

  // 6. Look Up Authoritative Product Data & Recompute Prices
  const validatedItems: any[] = [];
  let calculatedSubtotalNGN = 0;
  let calculatedSubtotalUSD = 0;

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    if (!item || typeof item !== 'object') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: `Invalid item at index ${i}.` }));
      return;
    }

    // Support both productId and product.id
    const productId = typeof item.productId === 'string' ? item.productId.trim() :
                      typeof item.product?.id === 'string' ? item.product.id.trim() : '';

    if (!productId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: `Item at index ${i} is missing a productId.` }));
      return;
    }

    // Validate Quantity
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: `Item '${productId}' has invalid quantity. Must be an integer between 1 and 10.` }));
      return;
    }

    // Validate Size
    const rawSize = Number(item.size || item.selectedSize);
    if (!Number.isInteger(rawSize) || rawSize < 35 || rawSize > 50) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: `Item '${productId}' has an invalid shoe size (EU ${item.size}).` }));
      return;
    }

    // Retrieve Authoritative Product: Firestore first, then fallback catalog
    let catalogProduct: CatalogProduct | null = null;

    try {
      const prodDoc = await db.collection('products').doc(productId).get();
      if (prodDoc.exists) {
        const pData = prodDoc.data();
        if (pData && pData.priceNGN && pData.name) {
          catalogProduct = {
            id: prodDoc.id,
            slug: pData.slug || productId,
            name: pData.name,
            category: pData.category || 'bespoke',
            priceNGN: Math.round(Number(pData.priceNGN)),
            priceUSD: Math.round(Number(pData.priceUSD || (pData.priceNGN * 0.0013))),
            primaryImage: pData.primaryImage || '/images/hero-bespoke-oxford.jpg',
            sizesAvailable: Array.isArray(pData.sizesAvailable) ? pData.sizesAvailable : [rawSize],
            status: pData.status || 'Available to Commission'
          };
        }
      }
    } catch (e: any) {
      console.warn(`[Vercel Serverless] Cloud product lookup for '${productId}' failed, falling back to static catalog:`, e?.message || e);
    }

    if (!catalogProduct) {
      catalogProduct = AUTHORITATIVE_CATALOG[productId] || null;
    }

    if (!catalogProduct) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: `Product '${productId}' not found in authoritative catalog.` 
      }));
      return;
    }

    // Add authoritative line calculations
    const lineNGN = catalogProduct.priceNGN * qty;
    const lineUSD = catalogProduct.priceUSD * qty;
    calculatedSubtotalNGN += lineNGN;
    calculatedSubtotalUSD += lineUSD;

    // Build immutable historical item snapshot
    validatedItems.push({
      id: `item_${catalogProduct.id}_${Date.now()}_${i}`,
      product: {
        id: catalogProduct.id,
        slug: catalogProduct.slug,
        name: catalogProduct.name,
        category: catalogProduct.category,
        priceNGN: catalogProduct.priceNGN,
        priceUSD: catalogProduct.priceUSD,
        primaryImage: catalogProduct.primaryImage
      },
      size: rawSize,
      isBespokeFitting: Boolean(item.isBespokeFitting),
      customNotes: typeof item.customNotes === 'string' ? item.customNotes.slice(0, 500) : undefined,
      quantity: qty
    });
  }

  // 7. Authoritative Totals Calculation
  const totalNGN = calculatedSubtotalNGN + authoritativeShippingFeeNGN;
  const totalUSD = calculatedSubtotalUSD + authoritativeShippingFeeUSD;

  // 8. Generate Cryptographically Secure Collision-Resistant Identifiers
  const randomSuffix = crypto.randomInt(100000, 999999);
  const orderNumber = `NS-ORD-${randomSuffix}`;
  const orderDocId = `ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  // 9. Construct Authoritative Order Document
  const authoritativeOrder = {
    id: orderDocId,
    orderNumber,
    customer: {
      firstName,
      lastName,
      email,
      phoneWhatsApp: rawPhone,
      address,
      city,
      state,
      country,
      deliveryMethod,
      fittingNotes
    },
    items: validatedItems,
    subtotalNGN: calculatedSubtotalNGN,
    subtotalUSD: calculatedSubtotalUSD,
    shippingFeeNGN: authoritativeShippingFeeNGN,
    shippingFeeUSD: authoritativeShippingFeeUSD,
    totalNGN,
    totalUSD,
    currency,
    paymentMethod,
    paymentStatus: 'pending' as const, // ALWAYS pending on creation
    status: 'Pending Confirmation' as const, // 1st stage of 7-stage craft lifecycle
    customerUid: customerUid || null,
    artisanNotes: 'Commission received through atelier checkout. Awaiting workbench allocation.',
    createdAt: now,
    updatedAt: now
  };

  // 10. Scoped Idempotency Key Document Reference
  const rawIdempotencyKey = req.headers['x-idempotency-key'] || body.idempotencyKey;
  let idempotencyDocRef: any = null;

  if (rawIdempotencyKey && typeof rawIdempotencyKey === 'string' && rawIdempotencyKey.trim().length > 0) {
    const cleanKey = rawIdempotencyKey.trim().slice(0, 128);
    // Verified UID for authenticated users; server-safe hash for guests
    const scope = customerUid ? `usr_${customerUid}` : `gst_${email}`;
    const hash = crypto.createHash('sha256').update(`${scope}:${cleanKey}`).digest('hex');
    const idempotencyDocId = `idem_${hash}`;
    idempotencyDocRef = db.collection('idempotency_keys').doc(idempotencyDocId);
  }

  // 11. Atomic Execution via Firestore Transaction
  // Guarantees strictly single-order creation even under high concurrency
  let finalOrderData: any = null;
  let isDeduplicatedOrder = false;

  try {
    const transactionResult = await db.runTransaction(async (transaction) => {
      // Step A: If idempotency key is present, read the key document within the transaction
      if (idempotencyDocRef) {
        const existingIdemSnap = await transaction.get(idempotencyDocRef);
        if (existingIdemSnap.exists) {
          const existingIdemData = existingIdemSnap.data();
          if (existingIdemData?.orderId) {
            const existingOrderRef = db.collection('orders').doc(existingIdemData.orderId);
            const existingOrderSnap = await transaction.get(existingOrderRef);
            if (existingOrderSnap.exists) {
              return {
                isDeduplicated: true,
                order: existingOrderSnap.data()
              };
            }
          }
        }
      }

      // Step B: Atomically create the order and record the idempotency key
      const orderRef = db.collection('orders').doc(orderDocId);
      transaction.set(orderRef, authoritativeOrder);

      if (idempotencyDocRef) {
        transaction.set(idempotencyDocRef, {
          orderId: orderDocId,
          orderNumber,
          customerUid: customerUid || null,
          email,
          createdAt: now,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }

      return {
        isDeduplicated: false,
        order: authoritativeOrder
      };
    });

    finalOrderData = transactionResult.order;
    isDeduplicatedOrder = transactionResult.isDeduplicated;
  } catch (err: any) {
    console.error('[Vercel Serverless] Atomic transaction error creating order:', err?.message || err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Failed to record commission dossier. Please try again or contact the concierge.' 
    }));
    return;
  }

  // 12. Sanitized Public Response
  const responseStatusCode = isDeduplicatedOrder ? 200 : 201;
  res.statusCode = responseStatusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: true,
    isDeduplicated: isDeduplicatedOrder,
    orderId: finalOrderData.id,
    orderNumber: finalOrderData.orderNumber,
    paymentStatus: finalOrderData.paymentStatus,
    status: finalOrderData.status,
    currency,
    subtotal: currency === 'USD' ? finalOrderData.subtotalUSD : finalOrderData.subtotalNGN,
    shippingFee: currency === 'USD' ? finalOrderData.shippingFeeUSD : finalOrderData.shippingFeeNGN,
    total: currency === 'USD' ? finalOrderData.totalUSD : finalOrderData.totalNGN,
    customerUid: finalOrderData.customerUid || undefined,
    createdAt: finalOrderData.createdAt
  }));
}
