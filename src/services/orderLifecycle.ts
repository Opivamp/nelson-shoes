import type { OrderStatus, PaymentStatus, DeliveryMethod } from '../types';

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

export const CRAFT_STAGE_ORDER: OrderStatus[] = [
  'Pending Confirmation',
  'At Workbench (Lasting)',
  'Welt Inseam Stitching',
  'Patina & Glacage',
  'Quality Inspection',
  'Dispatched',
  'Delivered'
];

export interface TransitionValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates whether an order status transition is allowed based on the 7-stage craft model,
 * terminal statuses, cancellation rules, and administrator roles.
 */
export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  options?: {
    userRole?: 'master_artisan' | 'atelier_staff';
    correctionNote?: string;
  }
): TransitionValidationResult {
  // 1. Same status is a no-op
  if (currentStatus === nextStatus) {
    return { allowed: true };
  }

  // 2. Delivered is strictly terminal
  if (currentStatus === 'Delivered') {
    return {
      allowed: false,
      reason: 'Delivered commissions have completed the atelier lifecycle and cannot be modified.'
    };
  }

  // 3. Handling transitions to 'Cancelled'
  if (nextStatus === 'Cancelled') {
    // Only allowed from early stages prior to irreversible leather cutting & welting
    const allowedCancellationStages: OrderStatus[] = [
      'Pending Confirmation',
      'At Workbench (Lasting)'
    ];

    if (!allowedCancellationStages.includes(currentStatus)) {
      return {
        allowed: false,
        reason: `Commission cannot be cancelled once it reaches '${currentStatus}' because bespoke leather cutting and hand-welting are irreversible.`
      };
    }

    return { allowed: true };
  }

  // 4. Reactivation from 'Cancelled'
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

  // 5. Index-based craft progression
  const currentIdx = CRAFT_STAGE_ORDER.indexOf(currentStatus);
  const nextIdx = CRAFT_STAGE_ORDER.indexOf(nextStatus);

  if (currentIdx === -1 || nextIdx === -1) {
    return { allowed: false, reason: `Unknown order status: ${nextStatus}` };
  }

  // Forward transition
  if (nextIdx > currentIdx) {
    // Step-by-step forward progression is always allowed
    if (nextIdx === currentIdx + 1) {
      return { allowed: true };
    }

    // Skipping stages forward is permitted only for Master Artisan
    if (options?.userRole === 'master_artisan') {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Atelier staff must advance commissions sequentially (${CRAFT_STAGE_ORDER[currentIdx + 1]} is next).`
    };
  }

  // Backward transition (Correction)
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

/**
 * Validates payment status transitions to prevent accidental downgrades of settled orders.
 */
export function canTransitionPaymentStatus(
  currentPaymentStatus: PaymentStatus,
  nextPaymentStatus: PaymentStatus,
  options?: {
    userRole?: 'master_artisan' | 'atelier_staff';
    reason?: string;
  }
): TransitionValidationResult {
  if (currentPaymentStatus === nextPaymentStatus) {
    return { allowed: true };
  }

  // Prevent downgrade of paid orders to pending or failed
  if (currentPaymentStatus === 'paid') {
    if (nextPaymentStatus === 'pending' || nextPaymentStatus === 'failed' || nextPaymentStatus === 'abandoned') {
      return {
        allowed: false,
        reason: 'A confirmed, settled payment cannot be downgraded to pending or failed.'
      };
    }

    // Paid can only transition to reversed if Master Artisan provides an audit reason
    if (nextPaymentStatus === 'reversed') {
      if (options?.userRole !== 'master_artisan') {
        return {
          allowed: false,
          reason: 'Only a Master Artisan may record a payment reversal.'
        };
      }
      return { allowed: true };
    }
  }

  return { allowed: true };
}

/**
 * Validates fulfillment requirements before an order is dispatched.
 */
export function validateDispatchRequirements(
  deliveryMethod: DeliveryMethod,
  trackingNumber?: string
): { valid: boolean; reason?: string; carrier: string } {
  if (deliveryMethod === 'dhl-express') {
    const cleanTracking = (trackingNumber || '').trim();
    if (!cleanTracking || cleanTracking.length < 5) {
      return {
        valid: false,
        reason: 'A valid DHL Express tracking number is required to dispatch via courier.',
        carrier: 'DHL Express'
      };
    }
    return {
      valid: true,
      carrier: 'DHL Express'
    };
  }

  // Atelier Pickup does not require a tracking number
  return {
    valid: true,
    carrier: 'Atelier Pickup'
  };
}
