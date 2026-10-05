import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  getAdminServices,
  getPaystackSecretKey,
  getPaystackCallbackUrl,
  toPaystackSubunit,
  generatePaystackReference,
  isRateLimited,
  ALLOWED_ORIGINS
} from './_paystack';

const MAX_BODY_BYTES = 32 * 1024; // 32KB

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // CORS origin handling
  const origin = (req.headers.origin as string) || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
             req.socket?.remoteAddress || 
             'unknown';

  if (isRateLimited(`init_payment:${ip}`, 20, 15 * 60 * 1000)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Too many payment requests. Please wait a few moments before trying again.' 
    }));
    return;
  }

  // Parse Body
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

  const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
  const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : '';

  if (!orderId && !orderNumber) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Order identifier (orderId or orderNumber) is required.' }));
    return;
  }

  // Initialize Firebase Admin
  const adminServices = getAdminServices();
  if (!adminServices) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Server configuration error. Please contact atelier support.' }));
    return;
  }

  const { db, auth } = adminServices;

  // 1. Authenticate Customer Token (if provided)
  let callerUid: string | undefined = undefined;
  let isAdminCaller = false;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7).trim();
    if (idToken) {
      try {
        const decodedToken = await auth.verifyIdToken(idToken);
        callerUid = decodedToken.uid;
        isAdminCaller = Boolean(
          decodedToken.admin === true || 
          decodedToken.role === 'master_artisan' || 
          decodedToken.role === 'atelier_staff'
        );
      } catch {
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

  // 2. Fetch Stored Order Document
  let orderDoc: any = null;
  let orderData: any = null;

  try {
    if (orderId) {
      const snap = await db.collection('orders').doc(orderId).get();
      if (snap.exists) {
        orderDoc = snap;
        orderData = snap.data();
      }
    }

    if (!orderData && orderNumber) {
      const qSnap = await db.collection('orders').where('orderNumber', '==', orderNumber).limit(1).get();
      if (!qSnap.empty) {
        orderDoc = qSnap.docs[0];
        orderData = orderDoc.data();
      }
    }
  } catch (err: any) {
    console.error('[Initialize Payment] Firestore query error:', err?.message || err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Database service unavailable.' }));
    return;
  }

  if (!orderDoc || !orderData) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Commission dossier not found.' }));
    return;
  }

  // 3. Customer Ownership & Authorization Check
  if (orderData.customerUid) {
    if (!callerUid && !isAdminCaller) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: 'Authentication required. This commission belongs to a registered customer account.' 
      }));
      return;
    }

    if (callerUid !== orderData.customerUid && !isAdminCaller) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: 'You are not authorized to initialize payment for this commission dossier.' 
      }));
      return;
    }
  } else {
    // Guest order: verify orderNumber if both were sent
    if (orderNumber && orderData.orderNumber !== orderNumber) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Order reference mismatch.' }));
      return;
    }
  }

  // 4. Payment Eligibility Checks
  if (orderData.paymentStatus === 'paid') {
    res.statusCode = 409;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      alreadyPaid: true,
      orderNumber: orderData.orderNumber,
      error: 'This commission has already been settled in full.' 
    }));
    return;
  }

  const currency = (orderData.currency || 'NGN').toUpperCase();
  if (currency !== 'NGN' && currency !== 'USD') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: `Unsupported currency '${currency}' for payment initialization.` }));
    return;
  }

  const totalAmountMajor = currency === 'USD' ? Number(orderData.totalUSD) : Number(orderData.totalNGN);
  if (!totalAmountMajor || isNaN(totalAmountMajor) || totalAmountMajor <= 0) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Order total amount is invalid.' }));
    return;
  }

  const customerEmail = (orderData.customer?.email || '').trim().toLowerCase();
  if (!customerEmail || !customerEmail.includes('@')) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Order customer email is invalid or missing.' }));
    return;
  }

  // 5. Check Paystack Secret Key Configuration
  const paystackSecret = getPaystackSecretKey();
  if (!paystackSecret) {
    console.error('[Initialize Payment] PAYSTACK_SECRET_KEY is not configured in server environment.');
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Paystack payment gateway is currently unavailable. Please contact atelier concierge or choose direct bank transfer.' 
    }));
    return;
  }

  // 6. Convert Monetary Amount to Paystack Subunit (Integer Kobo or Cents)
  let subunitAmount: number;
  try {
    subunitAmount = toPaystackSubunit(totalAmountMajor, currency);
  } catch (err: any) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: err.message || 'Amount calculation error.' }));
    return;
  }

  // 7. Generate Server-Authoritative Unique Paystack Reference
  const paymentReference = generatePaystackReference(orderData.orderNumber);
  const callbackUrl = getPaystackCallbackUrl(req);

  // 8. Call Paystack Transaction Initialize API
  try {
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: subunitAmount,
        currency,
        reference: paymentReference,
        callback_url: callbackUrl,
        metadata: {
          orderId: orderDoc.id,
          orderNumber: orderData.orderNumber,
          customerName: `${orderData.customer?.firstName || ''} ${orderData.customer?.lastName || ''}`.trim(),
          customerUid: orderData.customerUid || null,
          custom_fields: [
            {
              display_name: 'Order Reference',
              variable_name: 'order_reference',
              value: orderData.orderNumber
            },
            {
              display_name: 'Client Name',
              variable_name: 'client_name',
              value: `${orderData.customer?.firstName || ''} ${orderData.customer?.lastName || ''}`.trim()
            }
          ]
        }
      })
    });

    const paystackJson = await paystackRes.json();

    if (!paystackRes.ok || !paystackJson.status) {
      console.error('[Initialize Payment] Upstream Paystack error:', paystackJson?.message || paystackRes.statusText);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: paystackJson?.message || 'Failed to initialize payment gateway with Paystack.' 
      }));
      return;
    }

    const paystackData = paystackJson.data;

    // 9. Atomically Record Payment Metadata onto Order Document
    const now = new Date().toISOString();
    await orderDoc.ref.update({
      paymentProvider: 'paystack',
      paymentReference,
      paymentAccessCode: paystackData.access_code || null,
      paymentInitializedAt: now,
      paymentCurrency: currency,
      paymentAmountSubunit: subunitAmount,
      updatedAt: now
    });

    // 10. Return Sanitized Public Response (Never expose secret key)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
      reference: paymentReference,
      orderNumber: orderData.orderNumber,
      amount: totalAmountMajor,
      currency
    }));

  } catch (fetchErr: any) {
    console.error('[Initialize Payment] Network error contacting Paystack API:', fetchErr?.message || fetchErr);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Unable to connect to Paystack payment gateway. Please verify your connection or try again.' 
    }));
  }
}
