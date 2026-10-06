import type { 
  BespokeLifecycleStatus, 
  BespokeInquiryDocument, 
  BespokeQuotation,
  PublicBespokeTracking 
} from '../types';

export interface BespokeStageDefinition {
  status: BespokeLifecycleStatus;
  label: string;
  shortLabel: string;
  description: string;
  percent: number;
  customerActionRequired?: boolean;
}

export const BESPOKE_STAGES: BespokeStageDefinition[] = [
  {
    status: 'inquiry_submitted',
    label: 'Commission Inquiry Submitted',
    shortLabel: 'Submitted',
    description: 'Initial aesthetic dossier and anatomical profile received by the Nelson atelier.',
    percent: 10
  },
  {
    status: 'under_review',
    label: 'Atelier Technical Review',
    shortLabel: 'Under Review',
    description: 'Master cordwainers assessing hide availability, anatomical dimensions, and last engineering.',
    percent: 20
  },
  {
    status: 'awaiting_customer_details',
    label: 'Fitting Consultation Required',
    shortLabel: 'Fit Clarification',
    description: 'Atelier concierge awaiting additional anatomical measurements or fit preferences from customer.',
    percent: 25,
    customerActionRequired: true
  },
  {
    status: 'design_review',
    label: 'Bespoke Last & Pattern Design',
    shortLabel: 'Design Review',
    description: 'Drafting upper clicker patterns, bevelled waist contours, and chiseled toe pitch.',
    percent: 35
  },
  {
    status: 'quotation_ready',
    label: 'Atelier Quotation Prepared',
    shortLabel: 'Quotation Ready',
    description: 'Bespoke quotation and deposit terms finalized. Awaiting customer review and approval.',
    percent: 45,
    customerActionRequired: true
  },
  {
    status: 'awaiting_customer_approval',
    label: 'Awaiting Customer Sign-Off',
    shortLabel: 'Awaiting Sign-Off',
    description: 'Formal commission dossier and terms presented for customer authorization.',
    percent: 50,
    customerActionRequired: true
  },
  {
    status: 'approved',
    label: 'Commission Terms Approved',
    shortLabel: 'Approved',
    description: 'Customer approved specification and quotation. Preparing deposit allocation.',
    percent: 55
  },
  {
    status: 'deposit_pending',
    label: 'Deposit Settlement Pending',
    shortLabel: 'Deposit Pending',
    description: 'Awaiting 50% commission deposit to secure workshop bench allocation and select box calf hides.',
    percent: 60,
    customerActionRequired: true
  },
  {
    status: 'deposit_confirmed',
    label: 'Deposit Confirmed & Bench Allocated',
    shortLabel: 'Deposit Confirmed',
    description: 'Deposit verified. Beechwood block earmarked for personalized foot map carving.',
    percent: 65
  },
  {
    status: 'in_production',
    label: 'Hand-Crafting at Workbench',
    shortLabel: 'At Workbench',
    description: 'Clicking the full-grain hides, hand-sewing the Goodyear welt, and carving the bespoke last.',
    percent: 80
  },
  {
    status: 'quality_inspection',
    label: 'Artisan Quality & Glacage Inspection',
    shortLabel: 'Inspection',
    description: 'Multi-layer mirror champagne glacage, sole waist burnishing, and brass toe tap calibration.',
    percent: 90
  },
  {
    status: 'ready_for_dispatch',
    label: 'Ready for Courier or Atelier Fitting',
    shortLabel: 'Ready',
    description: 'Commission boxed with bespoke cedar shoe trees in heirloom velvet dust packaging.',
    percent: 95
  },
  {
    status: 'completed',
    label: 'Commission Completed & Delivered',
    shortLabel: 'Completed',
    description: 'Safely delivered via secure courier or presented in person at our Lagos atelier fitting lounge.',
    percent: 100
  }
];

export const BESPOKE_STAGE_SEQUENCE: BespokeLifecycleStatus[] = [
  'inquiry_submitted',
  'under_review',
  'design_review',
  'quotation_ready',
  'awaiting_customer_approval',
  'approved',
  'deposit_pending',
  'deposit_confirmed',
  'in_production',
  'quality_inspection',
  'ready_for_dispatch',
  'completed'
];

/**
 * Validates whether a bespoke commission can transition between two lifecycle states.
 */
export function canTransitionBespokeStatus(
  current: BespokeLifecycleStatus,
  target: BespokeLifecycleStatus,
  roleOrOptions?: 'master_artisan' | 'atelier_staff' | 'customer' | { role?: string; note?: string; artisanNote?: string },
  note?: string
): { allowed: boolean; reason?: string } {
  let actorRole: 'master_artisan' | 'atelier_staff' | 'customer' = 'atelier_staff';
  let effectiveNote = note;

  if (typeof roleOrOptions === 'object' && roleOrOptions !== null) {
    if (roleOrOptions.role) actorRole = roleOrOptions.role as any;
    effectiveNote = roleOrOptions.artisanNote || roleOrOptions.note || note;
  } else if (typeof roleOrOptions === 'string') {
    actorRole = roleOrOptions;
  }

  // 1. Idempotent self-transition
  if (current === target) {
    return { allowed: true };
  }

  // 2. Terminal state lock
  if (current === 'completed') {
    return { 
      allowed: false, 
      reason: 'A completed bespoke commission is archived permanently and cannot be modified.' 
    };
  }

  // 3. Declined / Cancelled terminal restrictions
  if (current === 'declined' || current === 'cancelled') {
    if (actorRole !== 'master_artisan') {
      return { 
        allowed: false, 
        reason: 'Only a Master Artisan may reactivate a declined or cancelled bespoke commission.' 
      };
    }
  }

  // 4. Cancellation rules
  if (target === 'cancelled') {
    // Cannot cancel if in production or later, unless master_artisan with explicit reason
    if (['in_production', 'quality_inspection', 'ready_for_dispatch', 'completed'].includes(current)) {
      if (actorRole !== 'master_artisan') {
        return {
          allowed: false,
          reason: `Commission cannot be cancelled once it reaches '${current}' because bespoke beechwood lasting and hand-welting have commenced.`
        };
      }
      if (!effectiveNote || effectiveNote.trim().length < 10) {
        return {
          allowed: false,
          reason: 'Master Artisan cancellation during manufacturing requires an authoritative bench note explaining the exception.'
        };
      }
    }
    return { allowed: true };
  }

  // 5. Decline rules
  if (target === 'declined') {
    if (['in_production', 'quality_inspection', 'ready_for_dispatch', 'completed'].includes(current)) {
      return {
        allowed: false,
        reason: 'An active production commission cannot be declined. Use cancellation protocol.'
      };
    }
    return { allowed: true };
  }

  // 6. Customer permissions
  if (actorRole === 'customer') {
    if (['quotation_ready', 'awaiting_customer_approval'].includes(current)) {
      if (target === 'approved') {
        return { allowed: true };
      }
    }
    return {
      allowed: false,
      reason: 'Customers may only authorize or decline quotations during the approval stage.'
    };
  }

  // 7. Master Artisan has full progression override (except completed)
  if (actorRole === 'master_artisan') {
    return { allowed: true };
  }

  // 8. Atelier Staff standard forward progression
  const currIdx = BESPOKE_STAGE_SEQUENCE.indexOf(current);
  const targetIdx = BESPOKE_STAGE_SEQUENCE.indexOf(target);

  // Allow jumping to awaiting_customer_details from under_review
  if (current === 'under_review' && target === 'awaiting_customer_details') {
    return { allowed: true };
  }
  // Allow returning from awaiting_customer_details to under_review or design_review
  if (current === 'awaiting_customer_details' && (target === 'under_review' || target === 'design_review')) {
    return { allowed: true };
  }

  if (currIdx !== -1 && targetIdx !== -1) {
    if (targetIdx === currIdx + 1) {
      return { allowed: true };
    }
    if (targetIdx < currIdx) {
      return {
        allowed: false,
        reason: 'Atelier staff cannot move commissions backward. Master Artisan authorization is required.'
      };
    }
    if (targetIdx > currIdx + 1) {
      return {
        allowed: false,
        reason: `Atelier staff cannot skip stages from '${current}' to '${target}'. Sequential workflow required.`
      };
    }
  }

  return { allowed: true };
}

/**
 * Returns progress percentage (0-100) for UI progress bars.
 */
export function getBespokeProgressPercent(status: BespokeLifecycleStatus): number {
  if (status === 'cancelled' || status === 'declined') return 0;
  const stage = BESPOKE_STAGES.find(s => s.status === status);
  return stage ? stage.percent : 10;
}

/**
 * Sanitizes a bespoke commission document for customer consumption.
 * STRICT PRIVACY GUARANTEE: Never exposes artisan notes, audit trails, margins, or internal costs.
 */
export function sanitizeBespokeForCustomer(inquiry: any): any {
  const {
    artisanNotes,
    internalArtisanNotes,
    auditTrail,
    internalCosts,
    costBreakdown,
    materialsCostBreakdown,
    marginTargetPercent,
    atelierMarginPercent,
    supplierDetails,
    assignedArtisan,
    ...customerSafe
  } = inquiry;

  return customerSafe;
}

/**
 * Validates a quotation before it can be issued.
 * Enforces minimum 50% deposit policy for bespoke commissions.
 */
export function validateBespokeQuotation(quote: any): { valid: boolean; error?: string; reason?: string } {
  const totalNGN = quote.amountNGN ?? quote.totalNGN ?? 0;
  const totalUSD = quote.amountUSD ?? quote.totalUSD ?? 0;

  if (totalNGN <= 0) {
    return { valid: false, error: 'Quotation amount (NGN) must be greater than zero.', reason: 'Quotation amount (NGN) must be greater than zero.' };
  }
  if (totalUSD <= 0) {
    return { valid: false, error: 'Quotation amount (USD) must be greater than zero.', reason: 'Quotation amount (USD) must be greater than zero.' };
  }

  const depositPct = quote.depositPercentage ?? 0;
  if (depositPct < 50 || depositPct > 100) {
    return { valid: false, error: 'Deposit percentage must be at least 50% for bespoke commissions.', reason: 'Deposit percentage must be at least 50% for bespoke commissions.' };
  }

  const depositNGN = quote.depositAmountNGN ?? quote.depositRequiredNGN ?? 0;
  if (depositNGN <= 0) {
    return { valid: false, error: 'Deposit amount (NGN) must be greater than zero.', reason: 'Deposit amount (NGN) must be greater than zero.' };
  }

  if (quote.validUntil) {
    const expiryTime = typeof quote.validUntil === 'string' ? new Date(quote.validUntil).getTime() : Number(quote.validUntil);
    if (isNaN(expiryTime) || expiryTime <= Date.now()) {
      return { valid: false, error: 'Quotation validity date must be in the future.', reason: 'Quotation validity date must be in the future.' };
    }
  }

  if (!quote.terms || quote.terms.trim().length < 5) {
    return { valid: false, error: 'Quotation requires agreed bespoke terms of craft.', reason: 'Quotation requires agreed bespoke terms of craft.' };
  }

  return { valid: true };
}
