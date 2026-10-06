export type ProductCategory = 
  | 'all' 
  | 'oxfords' 
  | 'loafers' 
  | 'boots' 
  | 'sandals' 
  | 'custom' 
  | 'limited';

export interface ProductImage {
  url: string;
  alt: string;
  viewAngle: 'hero' | 'side' | 'overhead' | 'sole' | 'detail' | 'lifestyle';
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  categoryLabel: string;
  priceNGN: number;
  priceUSD: number;
  isBespokeOnly?: boolean;
  isFeatured?: boolean;
  isLimitedEdition?: boolean;
  status: 'Available to Commission' | 'Limited Batch' | 'Archive Piece';
  primaryImage: string;
  gallery: ProductImage[];
  description: string;
  story: string;
  materials: {
    upper: string;
    lining: string;
    sole: string;
    construction: string;
    finishing: string;
  };
  features: string[];
  sizesAvailable: number[]; // EU sizes 39 - 47
  standardLeadTime: string;
}

export interface CartItem {
  id: string;
  product: Product;
  size: number;
  isBespokeFitting: boolean;
  customNotes?: string;
  quantity: number;
}

export interface BespokeInquiry {
  fullName: string;
  email: string;
  phoneOrWhatsApp: string;
  country: string;
  city: string;
  silhouette: string;
  leatherType: string;
  colorPreference: string;
  footSize: string;
  occasion: string;
  budgetRange: string;
  specialRequests: string;
  fittingPreference: 'standard-size' | 'atelier-measurement' | 'virtual-consultation';
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'The Craft' | 'Philosophy' | 'The Process' | 'Style';
  publishedDate: string;
  readTime: string;
  heroImage: string;
  excerpt: string;
  content: {
    heading?: string;
    paragraphs: string[];
    quote?: string;
    subImage?: string;
    subImageCaption?: string;
  }[];
  author: {
    name: string;
    role: string;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'shoes' | 'craft' | 'workshop' | 'details' | 'lifestyle';
  categoryLabel: string;
  imageUrl: string;
  aspectRatio: 'square' | 'portrait' | 'landscape';
  caption: string;
  year: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  titleOrLocation: string;
  shoeCommissioned: string;
  verifiedStatus: string;
}

export type OrderStatus = 
  | 'Pending Confirmation' 
  | 'At Workbench (Lasting)' 
  | 'Welt Inseam Stitching' 
  | 'Patina & Glacage' 
  | 'Quality Inspection' 
  | 'Dispatched' 
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'whatsapp-concierge' | 'bank-transfer' | 'paystack-card';

export type PaymentStatus = 'pending' | 'deposit_paid' | 'paid' | 'failed' | 'abandoned' | 'reversed';

export type DeliveryMethod = 'dhl-express' | 'atelier-pickup';

export type RefundStatus = 'none' | 'pending' | 'refunded' | 'rejected';

export type OrderPriority = 'standard' | 'priority' | 'urgent';

export type QualityInspectionOutcome = 'passed' | 'passed_with_notes' | 'requires_rework' | 'failed';

export interface QualityInspectionChecks {
  constructionIntegrity: boolean;
  stitchingAndWelting: boolean;
  patinaAndFinishing: boolean;
  soleCondition: boolean;
  sizingAndFit: boolean;
  packagingReadiness: boolean;
}

export interface QualityInspectionRecord {
  inspectorUid: string;
  inspectorName?: string;
  inspectorRole: 'master_artisan' | 'atelier_staff';
  inspectedAt: string;
  outcome: QualityInspectionOutcome;
  checks: QualityInspectionChecks;
  customerVisibleSummary?: string;
  internalInspectionNotes?: string;
}

export interface CustomerVisibleOrderNote {
  id: string;
  message: string;
  timestamp: string;
  authorRole?: string;
}

export interface OrderAuditEntry {
  event: string;
  previousStatus?: string;
  newStatus?: string;
  previousPaymentStatus?: string;
  newPaymentStatus?: string;
  actorUid?: string;
  actorRole?: string;
  timestamp: string;
  note?: string;
  reason?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phoneWhatsApp: string;
    address: string;
    city: string;
    state: string;
    country: string;
    deliveryMethod: DeliveryMethod;
    fittingNotes?: string;
  };
  items: CartItem[];
  subtotalNGN: number;
  subtotalUSD: number;
  shippingFeeNGN?: number;
  shippingFeeUSD?: number;
  totalNGN?: number;
  totalUSD?: number;
  currency?: 'NGN' | 'USD';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paidAt?: string;
  status: OrderStatus;
  priority?: OrderPriority;
  customerUid?: string;
  trackingNumber?: string;
  carrier?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundStatus?: RefundStatus;
  refundReference?: string;
  refundedAt?: string;
  artisanNotes?: string;
  customerVisibleNotes?: CustomerVisibleOrderNote[];
  assignedArtisanUid?: string;
  assignedArtisanName?: string;
  assignedAt?: string;
  assignedBy?: string;
  qualityInspection?: QualityInspectionRecord;
  readyForPickup?: boolean;
  pickupReadyAt?: string;
  bespokeInquiryId?: string;
  bespokeInquiryRef?: string;
  reconciledAt?: string;
  reconciledBy?: string;
  reconciliationNote?: string;
  targetCompletionDate?: string;
  auditTrail?: OrderAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export * from './customer';
export * from './bespoke';

export interface AdminUser {
  email: string;
  name: string;
  role: 'master_artisan' | 'atelier_staff';
}

// ---------------------------------------------------------------------------
// Public Customer Order Tracking Types (Sanitized, Privacy-First)
// ---------------------------------------------------------------------------

export interface PublicOrderTrackingItem {
  productName: string;
  primaryImage?: string;
  size?: number | string;
  quantity: number;
  isBespokeFitting?: boolean;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface PublicOrderTracking {
  orderReference: string;
  status: OrderStatus;
  statusLabel: string;
  timeline: OrderTimelineStep[];
  progressPercent: number;
  estimatedDelivery?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  destinationCity?: string | null;
  items: PublicOrderTrackingItem[];
  verifiedAt: string;
}

export interface OrderVerificationRequest {
  orderReference: string;
  email?: string;
  phone?: string;
}

export interface OrderVerificationResult {
  success: boolean;
  data?: PublicOrderTracking;
  error?: string;
}
