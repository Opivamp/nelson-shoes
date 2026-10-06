import type { 
  CustomerOrder, 
  OrderStatus, 
  PublicOrderTracking, 
  PublicOrderTrackingItem, 
  OrderTimelineStep, 
  OrderVerificationRequest, 
  OrderVerificationResult 
} from '../types';

export const GENERIC_VERIFICATION_ERROR = 
  "We couldn't verify those order details. Please check your Order Reference and contact information and try again.";

// ---------------------------------------------------------------------------
// 7-Stage Luxury Order Lifecycle Mapping
// ---------------------------------------------------------------------------
export const ORDER_LIFECYCLE_STAGES: Array<{
  status: OrderStatus;
  label: string;
  description: string;
  percent: number;
}> = [
  {
    status: 'Pending Confirmation',
    label: 'Commission Initiated',
    description: 'Bespoke dossier received and confirmed by atelier concierge.',
    percent: 15
  },
  {
    status: 'At Workbench (Lasting)',
    label: 'Last Selected & Leather Cut',
    description: 'Beechwood anatomical last chosen; box calfskin hand-clicked.',
    percent: 35
  },
  {
    status: 'Welt Inseam Stitching',
    label: 'Upper Stitched & Welting',
    description: 'Goodyear / Hand-welted inseam stitching secured to insole.',
    percent: 55
  },
  {
    status: 'Patina & Glacage',
    label: 'Hand-Burnished Patina & Glacage',
    description: 'Multi-layer artisanal dyeing, beeswax nourishment, and mirror finish.',
    percent: 75
  },
  {
    status: 'Quality Inspection',
    label: 'Master Quality Inspection',
    description: 'Rigorous structural assessment and cordwainer certification.',
    percent: 90
  },
  {
    status: 'Dispatched',
    label: 'Dispatched via DHL Express',
    description: 'Insured international transit with climate-shield packaging.',
    percent: 98
  },
  {
    status: 'Delivered',
    label: 'Delivered to Client',
    description: 'Commission safely received. Lifetime atelier care active.',
    percent: 100
  }
];

// ---------------------------------------------------------------------------
// Input Normalization Utilities
// ---------------------------------------------------------------------------

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  // Strip spaces, hyphens, brackets, dots
  return phone.replace(/[\s\-\(\)\.]/g, '');
}

export function matchesPhone(inputPhone: string, storedPhone: string): boolean {
  const normInput = normalizePhone(inputPhone);
  const normStored = normalizePhone(storedPhone);

  if (!normInput || !normStored) return false;

  // Direct stripped comparison (e.g. "+2348035550192" === "+2348035550192")
  if (normInput === normStored) return true;

  // Strip leading international code '+' or '00'
  const digitsInput = normInput.replace(/^\+/, '').replace(/^00/, '');
  const digitsStored = normStored.replace(/^\+/, '').replace(/^00/, '');

  if (digitsInput === digitsStored) return true;

  // Compare significant national suffix (last 10 digits for Nigerian and standard mobile formats)
  if (digitsInput.length >= 10 && digitsStored.length >= 10) {
    return digitsInput.slice(-10) === digitsStored.slice(-10);
  }

  return false;
}

// ---------------------------------------------------------------------------
// Response Sanitization (Enforces Minimal Response Principle)
// ---------------------------------------------------------------------------

export function sanitizeOrderForTracking(order: CustomerOrder): PublicOrderTracking {
  const currentStageIndex = ORDER_LIFECYCLE_STAGES.findIndex(s => s.status === order.status);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const currentStage = ORDER_LIFECYCLE_STAGES[activeIndex];

  const timeline: OrderTimelineStep[] = ORDER_LIFECYCLE_STAGES.map((stage, idx) => ({
    status: stage.status,
    label: stage.label,
    description: stage.description,
    completed: idx <= activeIndex,
    current: idx === activeIndex
  }));

  // Sanitize items: return only customer-facing attributes
  // Strictly EXCLUDE: costs, supplier margins, internal item IDs, admin notes
  const items: PublicOrderTrackingItem[] = order.items.map(item => ({
    productName: item.product.name,
    primaryImage: item.product.primaryImage,
    size: item.size,
    quantity: item.quantity,
    isBespokeFitting: item.isBespokeFitting
  }));

  return {
    orderReference: order.orderNumber,
    status: order.status,
    statusLabel: currentStage.label,
    timeline,
    progressPercent: currentStage.percent,
    trackingNumber: order.trackingNumber || null,
    carrier: order.carrier || (order.trackingNumber ? 'DHL Express' : (order.customer.deliveryMethod === 'atelier-pickup' ? 'Atelier Pickup' : null)),
    destinationCity: order.customer.city && order.customer.country 
      ? `${order.customer.city}, ${order.customer.country}` 
      : (order.customer.city || null),
    items,
    verifiedAt: new Date().toISOString()
  };
}

// ---------------------------------------------------------------------------
// Client-Side Tracking Service
// ---------------------------------------------------------------------------

export async function verifyOrderOwnership(
  request: OrderVerificationRequest,
  localOrdersFallback: CustomerOrder[] = []
): Promise<OrderVerificationResult> {
  const cleanRef = (request.orderReference || '').trim();
  const cleanEmail = (request.email || '').trim();
  const cleanPhone = (request.phone || '').trim();

  // 1. Strict Input Validation
  if (!cleanRef) {
    return {
      success: false,
      error: 'Please enter your Nelson Shoes Order Reference number.'
    };
  }

  if (!cleanEmail && !cleanPhone) {
    return {
      success: false,
      error: 'Please enter either the email address or phone number used when commissioning this order.'
    };
  }

  // 2. Attempt verification through secure server-side endpoint (/api/verify-order)
  try {
    const res = await fetch('/api/verify-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderReference: cleanRef,
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data
        };
      }
    } else if (res.status === 400 || res.status === 404 || res.status === 403) {
      // Server returned verification denial
      return {
        success: false,
        error: GENERIC_VERIFICATION_ERROR
      };
    }
  } catch (err) {
    // Backend API unreachable; check local orders fallback below
    console.warn('Backend order verification endpoint unreachable, checking local session:', err);
  }

  // 3. Fallback verification against local session orders (e.g. orders placed on Device A in current session)
  const normRefUpper = cleanRef.toUpperCase();
  const localMatch = localOrdersFallback.find(
    o => o.orderNumber.toUpperCase() === normRefUpper || o.id.toUpperCase() === normRefUpper
  );

  if (localMatch) {
    let ownershipVerified = false;

    if (cleanEmail && normalizeEmail(cleanEmail) === normalizeEmail(localMatch.customer.email)) {
      ownershipVerified = true;
    } else if (cleanPhone && matchesPhone(cleanPhone, localMatch.customer.phoneWhatsApp)) {
      ownershipVerified = true;
    }

    if (ownershipVerified) {
      return {
        success: true,
        data: sanitizeOrderForTracking(localMatch)
      };
    }
  }

  // Generic denial: NEVER reveal whether the order exists, whether email exists, or whether phone exists
  return {
    success: false,
    error: GENERIC_VERIFICATION_ERROR
  };
}
