import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  getAdminServices,
  getPaystackSecretKey,
  toPaystackSubunit,
  mapPaystackStatusToNelson,
  isRateLimited,
  ALLOWED_ORIGINS
} from './_paystack';

const MAX_BODY_BYTES = 16 * 1024; // 16KB

export default async function handler(req: IncomingMessage & { body?: any; query?: any }, res: ServerResponse) {
  // CORS origin handling
  const origin = (req.headers.origin as string) || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
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

  if (isRateLimited(`verify_payment:${ip}`, 30, 15 * 60 * 1000)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Too many verification attempts. Please wait a few moments.' 
    }));
    return;
  }

  // Extract reference from query or body
  let reference = '';
  if (req.method === 'GET') {
    const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    reference = urlObj.searchParams.get('reference') || urlObj.searchParams.get('trxref') || '';
  } else {
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
    reference = typeof body?.reference === 'string' ? body.reference.trim() : 
                typeof body?.trxref === 'string' ? body.trxref.trim() : '';
  }

  reference = reference.trim();
  const refRegex = /^[a-zA-Z0-9_\-\.=]{5,128}$/;
  if (!reference || !refRegex.test(reference)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Invalid or missing transaction reference.' }));
    return;
  }

  // Verify Paystack Secret Key
  const paystackSecret = getPaystackSecretKey();
  if (!paystackSecret) {
    console.error('[Verify Payment] PAYSTACK_SECRET_KEY is not configured in server environment.');
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Paystack payment verification service is currently unavailable.' 
    }));
    return;
  }

  // Initialize Firebase Admin
  const adminServices = getAdminServices();
  if (!adminServices) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Database service configuration error.' }));
    return;
  }

  const { db } = adminServices;

  // 1. Query Upstream Paystack Verify Transaction API
  let txData: any = null;
  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      }
    });

    const paystackJson = await paystackRes.json();

    if (!paystackRes.ok || !paystackJson.status) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        success: false, 
        error: paystackJson?.message || 'Transaction could not be verified by Paystack.' 
      }));
      return;
    }

    txData = paystackJson.data;
  } catch (err: any) {
    console.error('[Verify Payment] Network error verifying Paystack transaction:', err?.message || err);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Failed to communicate with Paystack verification gateway.' }));
    return;
  }

  if (!txData || typeof txData !== 'object') {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Malformed verification response from Paystack.' }));
    return;
  }

  // 2. Find Associated Nelson Shoes Order in Firestore
  let orderDoc: any = null;
  let orderData: any = null;

  try {
    const qSnap = await db.collection('orders').where('paymentReference', '==', reference).limit(1).get();
    if (!qSnap.empty) {
      orderDoc = qSnap.docs[0];
      orderData = orderDoc.data();
    }

    // Fallback: check metadata if reference was modified or reissued
    if (!orderDoc && txData.metadata?.orderId) {
      const snap = await db.collection('orders').doc(txData.metadata.orderId).get();
      if (snap.exists) {
        orderDoc = snap;
        orderData = snap.data();
      }
    }

    if (!orderDoc && txData.metadata?.orderNumber) {
      const qSnap2 = await db.collection('orders').where('orderNumber', '==', txData.metadata.orderNumber).limit(1).get();
      if (!qSnap2.empty) {
        orderDoc = qSnap2.docs[0];
        orderData = orderDoc.data();
      }
    }
  } catch (dbErr: any) {
    console.error('[Verify Payment] Database query error:', dbErr?.message || dbErr);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Database error searching order record.' }));
    return;
  }

  if (!orderDoc || !orderData) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'No commission dossier found matching this payment transaction.' }));
    return;
  }

  // 3. Amount & Currency Reconciliation Checks
  const orderCurrency = (orderData.currency || 'NGN').toUpperCase();
  const txCurrency = (txData.currency || '').toUpperCase();
  if (txCurrency !== orderCurrency) {
    console.warn(`[Verify Payment] Currency mismatch: expected ${orderCurrency}, got ${txCurrency}`);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Payment currency does not match commission invoice.' }));
    return;
  }

  const orderTotalMajor = orderCurrency === 'USD' ? Number(orderData.totalUSD) : Number(orderData.totalNGN);
  const expectedSubunit = toPaystackSubunit(orderTotalMajor, orderCurrency);
  const actualSubunit = Number(txData.amount);

  if (actualSubunit !== expectedSubunit) {
    console.warn(`[Verify Payment] Amount mismatch: expected ${expectedSubunit} subunits, received ${actualSubunit} subunits`);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Payment amount mismatch. Transaction amount does not match authoritative commission total.' 
    }));
    return;
  }

  // 4. Idempotency Check: Already Paid
  if (orderData.paymentStatus === 'paid') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      alreadyPaid: true,
      paymentStatus: 'paid',
      orderNumber: orderData.orderNumber,
      orderId: orderDoc.id,
      paidAt: orderData.paidAt || txData.paid_at,
      amount: orderTotalMajor,
      currency: orderCurrency
    }));
    return;
  }

  // 5. Evaluate Transaction Status from Paystack
  const nelsonStatus = mapPaystackStatusToNelson(txData.status);

  if (nelsonStatus === 'paid') {
    const now = new Date().toISOString();
    const paidAt = txData.paid_at || now;

    try {
      await orderDoc.ref.update({
        paymentStatus: 'paid',
        paymentProvider: 'paystack',
        paidAt,
        paymentVerifiedAt: now,
        paymentChannel: txData.channel || 'card',
        paymentGatewayResponse: txData.gateway_response || 'Successful',
        updatedAt: now
      });
    } catch (updErr: any) {
      console.error('[Verify Payment] Error updating order status to paid:', updErr?.message || updErr);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Failed to record payment confirmation in dossier.' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      paymentStatus: 'paid',
      orderNumber: orderData.orderNumber,
      orderId: orderDoc.id,
      paidAt,
      amount: orderTotalMajor,
      currency: orderCurrency
    }));
    return;
  }

  // Non-success outcomes (failed, abandoned, pending)
  if (orderData.paymentStatus === 'pending') {
    try {
      await orderDoc.ref.update({
        paymentStatus: nelsonStatus,
        paymentGatewayResponse: txData.gateway_response || txData.status,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // Non-fatal
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    success: false,
    paymentStatus: nelsonStatus,
    orderNumber: orderData.orderNumber,
    error: `Transaction status is '${txData.status}'. Payment not settled.`
  }));
}
