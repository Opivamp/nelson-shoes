// ============================================================================
// NELSON SHOES — BESPOKE COMMISSION SYSTEM DOMAIN TYPES
// ============================================================================

export type BespokeLifecycleStatus =
  | 'inquiry_submitted'             // Initial dossier submitted by customer/guest
  | 'under_review'                  // Atelier reviewing anatomical specs & viability
  | 'awaiting_customer_details'     // Atelier requested fit clarification / measurements
  | 'design_review'                 // Master artisan drafting pattern & last silhouette
  | 'quotation_ready'               // Quotation created, awaiting customer review
  | 'awaiting_customer_approval'    // Actively sent for customer sign-off
  | 'approved'                      // Customer accepted quote & terms
  | 'deposit_pending'               // Deposit invoice generated, awaiting settlement
  | 'deposit_confirmed'             // Deposit received and verified
  | 'in_production'                 // Beechwood last carved, clicking & hand-welting
  | 'quality_inspection'            // Glacage, balance, and edge inspection complete
  | 'ready_for_dispatch'            // Boxed in bespoke crate / ready for fitting lounge
  | 'completed'                     // Delivered or collected at Lagos atelier
  | 'declined'                      // Atelier unable to accept commission
  | 'cancelled';                    // Commission cancelled by mutual consent

export interface BespokeReferenceAsset {
  id: string;
  name: string;
  url: string;
  storagePath?: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByUid?: string;
}

export interface BespokeFittingSpecification {
  silhouette: string;
  leatherType: string;
  leatherChoice?: string;
  colorPreference: string;
  patinaPreference?: string;
  solePreference?: string;
  constructionPreference?: 'goodyear-welted' | 'hand-welted' | 'norvegese' | 'blake-rapid';
  footSize: string;
  footLengthMm?: number;
  footWidthMm?: number;
  instepCircumferenceMm?: number;
  instepPreference?: string;
  archType?: 'low' | 'standard' | 'high' | string;
  preferredFit?: 'snug' | 'regular' | 'relaxed' | string;
  fittingPreference: 'standard-size' | 'atelier-measurement' | 'virtual-consultation';
  occasion?: string;
  budgetRange?: string;
  monogramInitials?: string;
  monogramText?: string;
  specialRequests?: string;
}

export interface BespokeQuotation {
  quotationNumber?: string;
  amountNGN: number;
  amountUSD: number;
  totalNGN?: number;
  totalUSD?: number;
  currency: 'NGN' | 'USD';
  depositRequired: boolean;
  depositPercentage: number; // e.g. 50%
  depositAmountNGN: number;
  depositAmountUSD: number;
  depositRequiredNGN?: number;
  depositRequiredUSD?: number;
  depositStatus: 'pending' | 'paid';
  depositPaymentReference?: string;
  depositPaidAt?: string;
  estimatedLeadWeeks: number; // e.g. 4 to 6 weeks
  lineItems?: Array<{ description: string; amountNGN: number; amountUSD: number }>;
  validityPeriodDays?: number;
  validUntil: string; // ISO string
  terms: string;
  notes?: string;
  createdByUid: string;
  createdByRole: 'master_artisan' | 'atelier_staff';
  createdAt: string;
  updatedAt: string;
}

export interface BespokeCustomerVisibleNote {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface BespokeInternalArtisanNote {
  id: string;
  authorUid: string;
  authorName: string;
  authorRole: 'master_artisan' | 'atelier_staff';
  message: string;
  createdAt: string;
}

export interface BespokeAuditLog {
  event: string;
  previousStatus?: BespokeLifecycleStatus;
  newStatus?: BespokeLifecycleStatus;
  actorUid: string;
  actorRole: string;
  timestamp: string;
  note?: string;
}

export interface BespokeInquiryDocument {
  id: string; // Document ID / Reference
  inquiryReference: string;
  customerUid?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  country: string;
  city: string;
  status: BespokeLifecycleStatus;
  specifications: BespokeFittingSpecification;
  referenceImages: BespokeReferenceAsset[];
  quotation?: BespokeQuotation | null;
  customerVisibleNotes: BespokeCustomerVisibleNote[];
  // Internal atelier fields (STRICTLY ISOLATED FROM CUSTOMERS)
  artisanNotes?: BespokeInternalArtisanNote[];
  internalArtisanNotes?: BespokeInternalArtisanNote[];
  auditTrail?: BespokeAuditLog[];
  assignedArtisan?: string | null;
  costBreakdown?: {
    estimatedMaterialCostNGN?: number;
    estimatedLaborHours?: number;
    procurementNotes?: string;
  };
  marginTargetPercent?: number;
  supplierDetails?: string;
  internalCosts?: {
    estimatedMaterialCostNGN?: number;
    estimatedLaborHours?: number;
    procurementNotes?: string;
  };
  convertedOrderId?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  productionStartedAt?: string;
  completedAt?: string;
}

export interface PublicBespokeTracking {
  inquiryReference: string;
  customerName: string;
  silhouette: string;
  status: BespokeLifecycleStatus;
  statusLabel: string;
  progressPercent: number;
  estimatedLeadWeeks?: number;
  hasQuotation: boolean;
  quotationApproved: boolean;
  depositStatus?: 'pending' | 'paid';
  convertedOrderId?: string | null;
  createdAt: string;
  updatedAt: string;
}
