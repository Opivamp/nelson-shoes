import type { IncomingMessage } from 'node:http';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// Rate Limiter Helper (per-IP, in-memory)
// ---------------------------------------------------------------------------
const attemptsMap = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, maxAttempts = 15, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = attemptsMap.get(key);
  if (!record || now > record.resetAt) {
    attemptsMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (record.count >= maxAttempts) {
    return true;
  }
  record.count += 1;
  return false;
}

export const ALLOWED_ORIGINS = [
  'https://nelson-shoes.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173'
];

export function cleanPrivateKey(key: string): string {
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

export function getAdminServices() {
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

    return {
      db,
      auth: getAuth(app)
    };
  } catch (err: any) {
    console.error('[Paystack Admin] Failed to initialize Firebase Admin SDK:', err?.message || err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Paystack Environment & Credentials (SERVER ONLY)
// ---------------------------------------------------------------------------
export function getPaystackSecretKey(): string {
  return (process.env.PAYSTACK_SECRET_KEY || '').trim();
}

export function getPaystackPublicKey(): string {
  return (process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY || '').trim();
}

export function getPaystackCallbackUrl(req?: IncomingMessage): string {
  if (process.env.PAYSTACK_CALLBACK_URL && process.env.PAYSTACK_CALLBACK_URL.trim()) {
    return process.env.PAYSTACK_CALLBACK_URL.trim();
  }
  const origin = (req?.headers.origin as string) || 'https://nelson-shoes.vercel.app';
  return `${origin}/payment/callback`;
}

// ---------------------------------------------------------------------------
// Monetary Conversion Layer: Major Integer Units <-> Paystack Subunits
// ---------------------------------------------------------------------------
export function toPaystackSubunit(amount: number, currency: string): number {
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || !isFinite(amount)) {
    throw new Error(`Invalid monetary amount: ${amount}`);
  }
  const normCur = (currency || '').trim().toUpperCase();
  if (normCur !== 'NGN' && normCur !== 'USD') {
    throw new Error(`Unsupported currency for Paystack conversion: '${currency}'. Only NGN and USD supported.`);
  }

  // Major integer units -> subunits (Kobo for NGN, Cents for USD)
  return Math.round(amount * 100);
}

export function fromPaystackSubunit(subunit: number, currency: string): number {
  if (typeof subunit !== 'number' || isNaN(subunit) || subunit < 0) {
    throw new Error(`Invalid subunit amount: ${subunit}`);
  }
  return subunit / 100;
}

// ---------------------------------------------------------------------------
// Transaction Reference Generator
// Complies with Paystack's allowed character set (alphanumeric, '-', '.', '=')
// ---------------------------------------------------------------------------
export function generatePaystackReference(orderNumber: string): string {
  const safeOrderNumber = (orderNumber || 'ORD').replace(/[^a-zA-Z0-9-]/g, '');
  const uniqueHex = crypto.randomBytes(4).toString('hex');
  return `NSPAY-${safeOrderNumber}-${uniqueHex}`;
}

// ---------------------------------------------------------------------------
// HMAC-SHA512 Webhook Signature Verification with Timing-Safe Comparison
// ---------------------------------------------------------------------------
export function verifyWebhookSignature(rawBody: string | Buffer, headerSignature: string, secretKey: string): boolean {
  if (!rawBody || !headerSignature || !secretKey) {
    return false;
  }
  try {
    const computedSignature = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    const sigBuffer = Buffer.from(headerSignature.trim(), 'utf8');
    const computedBuffer = Buffer.from(computedSignature.trim(), 'utf8');

    if (sigBuffer.length !== computedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, computedBuffer);
  } catch (err) {
    console.error('[Paystack Webhook] Signature verification exception:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Payment State Machine & Status Mapping
// ---------------------------------------------------------------------------
export type NelsonPaymentStatus = 'pending' | 'deposit_paid' | 'paid' | 'failed' | 'abandoned' | 'reversed';

export function mapPaystackStatusToNelson(paystackStatus: string): NelsonPaymentStatus {
  const norm = (paystackStatus || '').trim().toLowerCase();
  switch (norm) {
    case 'success':
      return 'paid';
    case 'failed':
      return 'failed';
    case 'abandoned':
      return 'abandoned';
    case 'reversed':
      return 'reversed';
    case 'pending':
    case 'ongoing':
    case 'processing':
    case 'queued':
    default:
      return 'pending';
  }
}

export function canTransitionPaymentStatus(currentStatus: string, nextStatus: NelsonPaymentStatus): boolean {
  // If already paid, NEVER downgrade or mutate through callbacks/webhooks
  if (currentStatus === 'paid') {
    return nextStatus === 'paid'; // Safe idempotent acknowledgement
  }

  // Allowed forward transitions
  if (currentStatus === 'pending') {
    return ['pending', 'paid', 'failed', 'abandoned', 'reversed'].includes(nextStatus);
  }

  if (currentStatus === 'failed' || currentStatus === 'abandoned') {
    // Can succeed if customer retries and succeeds
    return nextStatus === 'paid' || nextStatus === currentStatus;
  }

  return nextStatus === currentStatus;
}
