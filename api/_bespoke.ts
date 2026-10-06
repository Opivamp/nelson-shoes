// ============================================================================
// NELSON SHOES — API INTERNAL BESPOKE LIFECYCLE HELPER (VERCEL COMPATIBLE)
// ============================================================================

export type BespokeLifecycleStatus =
  | 'inquiry_submitted'
  | 'under_review'
  | 'awaiting_customer_details'
  | 'design_review'
  | 'quotation_ready'
  | 'awaiting_customer_approval'
  | 'approved'
  | 'deposit_pending'
  | 'deposit_confirmed'
  | 'in_production'
  | 'quality_inspection'
  | 'ready_for_dispatch'
  | 'completed'
  | 'declined'
  | 'cancelled';

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

  if (current === 'under_review' && target === 'awaiting_customer_details') {
    return { allowed: true };
  }
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
