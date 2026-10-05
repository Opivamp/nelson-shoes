import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  getAdminServices,
  getPaystackSecretKey,
  verifyWebhookSignature,
  toPaystackSubunit
} from './_paystack';

const MAX_WEBHOOK_BYTES = 64 * 1024; // 64KB max payload

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // Enforce HTTP POST
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // 1. Validate HMAC-SHA512 Webhook Signature Header Presence Early
  const signatureHeader = req.headers['x-paystack-signature'];
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    console.warn('[Paystack Webhook] Missing x-paystack-signature header.');
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing x-paystack-signature header.' }));
    return;
  }

  // 2. Capture Raw Request Body
  let rawBodyBuffer: Buffer;
  try {
    if (Buffer.isBuffer(req.body)) {
      rawBodyBuffer = req.body;
    } else if (typeof req.body === 'string') {
      rawBodyBuffer = Buffer.from(req.body, 'utf-8');
    } else if (req.body && typeof req.body === 'object') {
      rawBodyBuffer = Buffer.from(JSON.stringify(req.body), 'utf-8');
    } else if (typeof (req as any)[Symbol.asyncIterator] === 'function') {
      const buffers: Buffer[] = [];
      let receivedBytes = 0;

      for await (const chunk of req) {
        const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
        receivedBytes += buf.length;
        if (receivedBytes > MAX_WEBHOOK_BYTES) {
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Payload Too Large' }));
          return;
        }
        buffers.push(buf);
      }
      rawBodyBuffer = Buffer.concat(buffers);
    } else {
      rawBodyBuffer = Buffer.alloc(0);
    }
  } catch (readErr: any) {
    console.error('[Paystack Webhook] Error reading request stream:', readErr);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to read request body stream.' }));
    return;
  }

  const paystackSecret = getPaystackSecretKey();
  if (!paystackSecret) {
    console.error('[Paystack Webhook] PAYSTACK_SECRET_KEY is not configured in server environment.');
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Webhook processing secret is not configured.' }));
    return;
  }

  const isValidSignature = verifyWebhookSignature(rawBodyBuffer, signatureHeader, paystackSecret);
  if (!isValidSignature) {
    console.warn('[Paystack Webhook] Invalid webhook signature detected. Dropping payload.');
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid webhook signature.' }));
    return;
  }

  // 3. Parse JSON Event
  let event: any;
  try {
    event = JSON.parse(rawBodyBuffer.toString('utf-8'));
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Malformed JSON payload.' }));
    return;
  }

  const eventType = typeof event?.event === 'string' ? event.event : '';
  const txData = event?.data;

  // 4. Safely Acknowledge Non-Charge Events (Prevents Paystack Retry Cascades)
  if (eventType !== 'charge.success' || !txData || typeof txData !== 'object') {
    // Acknowledge receipt cleanly without modifying orders
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true, ignored: true, event: eventType }));
    return;
  }

  // 5. Initialize Firebase Admin Services
  const adminServices = getAdminServices();
  if (!adminServices) {
    console.error('[Paystack Webhook] Firebase Admin SDK unavailable.');
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Database service unavailable.' }));
    return;
  }

  const { db } = adminServices;

  // 6. Extract & Validate Event Data
  const reference = typeof txData.reference === 'string' ? txData.reference.trim() : '';
  const txStatus = typeof txData.status === 'string' ? txData.status.toLowerCase() : '';
  const txAmountSubunit = Number(txData.amount);
  const txCurrency = typeof txData.currency === 'string' ? txData.currency.trim().toUpperCase() : '';

  if (!reference || txStatus !== 'success') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true, processed: false, reason: 'Transaction status not successful.' }));
    return;
  }

  // 7. Locate Order in Firestore by Transaction Reference
  let orderDoc: any = null;
  let orderData: any = null;

  try {
    const qSnap = await db.collection('orders').where('paymentReference', '==', reference).limit(1).get();
    if (!qSnap.empty) {
      orderDoc = qSnap.docs[0];
      orderData = orderDoc.data();
    }

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
    console.error('[Paystack Webhook] Database query error:', dbErr?.message || dbErr);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Database query error during order reconciliation.' }));
    return;
  }

  if (!orderDoc || !orderData) {
    console.warn(`[Paystack Webhook] No order found for reference: ${reference}`);
    // Acknowledge to prevent Paystack webhook retry loop for orphaned transactions
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true, processed: false, reason: 'Order not found.' }));
    return;
  }

  // 8. Reconciliation: Validate Currency & Amount
  const orderCurrency = (orderData.currency || 'NGN').toUpperCase();
  if (txCurrency !== orderCurrency) {
    console.error(`[Paystack Webhook Security] Currency mismatch for order ${orderData.orderNumber}: expected ${orderCurrency}, received ${txCurrency}`);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true, processed: false, reason: 'Currency mismatch.' }));
    return;
  }

  const orderTotalMajor = orderCurrency === 'USD' ? Number(orderData.totalUSD) : Number(orderData.totalNGN);
  let expectedSubunit = 0;
  try {
    expectedSubunit = toPaystackSubunit(orderTotalMajor, orderCurrency);
  } catch (calcErr) {
    console.error('[Paystack Webhook] Subunit conversion error:', calcErr);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true, processed: false, reason: 'Calculation error.' }));
    return;
  }

  if (txAmountSubunit !== expectedSubunit) {
    console.error(`[Paystack Webhook Security] Amount mismatch for order ${orderData.orderNumber}: expected ${expectedSubunit} subunits, received ${txAmountSubunit}`);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true, processed: false, reason: 'Amount mismatch.' }));
    return;
  }

  // 9. Idempotency: If already paid, acknowledge without duplicating fulfillment
  if (orderData.paymentStatus === 'paid') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: true, processed: true, idempotent: true, orderNumber: orderData.orderNumber }));
    return;
  }

  // 10. Atomic Payment Confirmation
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
    console.error('[Paystack Webhook] Failed to update order status to paid:', updErr?.message || updErr);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to record payment state.' }));
    return;
  }

  console.info(`[Paystack Webhook] Successfully confirmed payment for order ${orderData.orderNumber} (Ref: ${reference})`);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ 
    received: true, 
    processed: true, 
    orderNumber: orderData.orderNumber,
    paymentStatus: 'paid' 
  }));
}
