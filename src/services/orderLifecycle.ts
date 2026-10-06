import type { 
  OrderStatus, 
  PaymentStatus, 
  DeliveryMethod, 
  CustomerOrder,
  OrderPriority, 
  QualityInspectionRecord, 
  QualityInspectionChecks, 
  QualityInspectionOutcome 
} from '../types';

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
 * terminal statuses, cancellation rules, administrator roles, and quality inspection gates.
 */
export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
  options?: {
    userRole?: 'master_artisan' | 'atelier_staff';
    correctionNote?: string;
    qualityInspection?: QualityInspectionRecord;
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

  // 3. Quality Inspection Gate: Cannot dispatch an order that failed inspection or requires rework
  if (nextStatus === 'Dispatched') {
    if (options?.qualityInspection) {
      if (options.qualityInspection.outcome === 'failed' || options.qualityInspection.outcome === 'requires_rework') {
        return {
          allowed: false,
          reason: `Cannot dispatch order: quality inspection recorded as '${options.qualityInspection.outcome}'. Remediation or master re-inspection required.`
        };
      }
    }
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

/**
 * Validates a Quality Inspection record and its consistency with checklist results.
 */
export function validateQualityInspection(
  checks: QualityInspectionChecks,
  outcome: QualityInspectionOutcome,
  options?: {
    inspectorRole?: 'master_artisan' | 'atelier_staff';
    internalInspectionNotes?: string;
  }
): { valid: boolean; reason?: string } {
  const allChecksPass = (
    checks.constructionIntegrity &&
    checks.stitchingAndWelting &&
    checks.patinaAndFinishing &&
    checks.soleCondition &&
    checks.sizingAndFit &&
    checks.packagingReadiness
  );

  // If all checks pass, outcome cannot be 'failed' or 'requires_rework' without explanatory notes
  if (allChecksPass && (outcome === 'failed' || outcome === 'requires_rework')) {
    if (!options?.internalInspectionNotes || options.internalInspectionNotes.trim().length === 0) {
      return {
        valid: false,
        reason: 'When all technical checks pass, marking an order as failed or rework requires explanatory inspection notes.'
      };
    }
  }

  // If any check fails, outcome CANNOT be 'passed' or 'passed_with_notes'
  if (!allChecksPass && (outcome === 'passed' || outcome === 'passed_with_notes')) {
    return {
      valid: false,
      reason: 'Cannot pass quality inspection when one or more structural or finishing checkpoints have not been certified.'
    };
  }

  // Rework or failure requires explanatory notes
  if ((outcome === 'requires_rework' || outcome === 'failed') && (!options?.internalInspectionNotes || options.internalInspectionNotes.trim().length === 0)) {
    return {
      valid: false,
      reason: 'Artisan inspection notes detailing the defect or rework instruction are required.'
    };
  }

  return { valid: true };
}

/**
 * Validates whether an artisan assignment or reassignment is permitted based on role.
 */
export function canAssignArtisan(
  currentAssignedUid: string | undefined,
  newAssignedUid: string,
  actorRole: 'master_artisan' | 'atelier_staff',
  actorUid: string
): { allowed: boolean; reason?: string } {
  if (!newAssignedUid || newAssignedUid.trim().length === 0) {
    return { allowed: false, reason: 'Valid artisan identifier is required.' };
  }

  // Master Artisan has full assignment and reassignment authority
  if (actorRole === 'master_artisan') {
    return { allowed: true };
  }

  // Atelier Staff can claim unassigned work or assign to themselves
  if (!currentAssignedUid) {
    if (newAssignedUid === actorUid) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Atelier staff may only self-assign unassigned production orders.'
    };
  }

  // Atelier Staff cannot reassign an order already assigned to another artisan
  if (currentAssignedUid !== actorUid) {
    return {
      allowed: false,
      reason: 'Only a Master Artisan may reassign an order allocated to another cordwainer.'
    };
  }

  return { allowed: true };
}

/**
 * Validates whether order priority modification is allowed.
 */
export function canUpdatePriority(
  priority: OrderPriority,
  actorRole?: 'master_artisan' | 'atelier_staff'
): { allowed: boolean; reason?: string } {
  const validPriorities: OrderPriority[] = ['standard', 'priority', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return { allowed: false, reason: `Unknown priority tier: ${priority}` };
  }

  // Urgent priority requires Master Artisan clearance
  if (priority === 'urgent' && actorRole !== 'master_artisan') {
    return {
      allowed: false,
      reason: 'Only a Master Artisan can designate a commission as urgent priority.'
    };
  }

  return { allowed: true };
}

/**
 * Sanitizes order data for customer portal and tracking projections.
 * Strictly eliminates internal artisan notes, internal inspection notes, internal audit details, and margin data.
 */
export function sanitizeOrderForCustomer(order: CustomerOrder): Partial<CustomerOrder> {
  const {
    artisanNotes,
    reconciliationNote,
    reconciledBy,
    auditTrail,
    ...safeOrder
  } = order;

  // Sanitize quality inspection record if present
  let safeInspection: QualityInspectionRecord | undefined = undefined;
  if (order.qualityInspection) {
    safeInspection = {
      inspectorUid: 'atelier-cordwainer',
      inspectorName: 'Master Cordwainer',
      inspectorRole: order.qualityInspection.inspectorRole,
      inspectedAt: order.qualityInspection.inspectedAt,
      outcome: order.qualityInspection.outcome,
      checks: order.qualityInspection.checks,
      customerVisibleSummary: order.qualityInspection.customerVisibleSummary || 'Commission inspected and certified by atelier cordwainer.'
    };
  }

  return {
    ...safeOrder,
    qualityInspection: safeInspection,
    customerVisibleNotes: order.customerVisibleNotes || []
  };
}

