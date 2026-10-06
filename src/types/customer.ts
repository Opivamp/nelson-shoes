export interface CustomerProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddressId?: string;
}

export interface CustomerAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CustomerSavedItem {
  productId: string;
  addedAt: string;
}

export interface CustomerSignUpData {
  fullName: string;
  email: string;
  password: string;
  phoneWhatsApp?: string;
}

export interface CustomerProfileUpdateData {
  fullName?: string;
  phone?: string;
  photoURL?: string;
}

import type { 
  BespokeLifecycleStatus, 
  BespokeFittingSpecification, 
  BespokeQuotation, 
  BespokeReferenceAsset, 
  BespokeCustomerVisibleNote 
} from './bespoke';

export interface CustomerBespokeInquiry {
  id: string;
  inquiryReference?: string;
  customerUid?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  fullName: string;
  email: string;
  phoneOrWhatsApp?: string;
  phoneWhatsApp?: string;
  country?: string;
  city?: string;
  silhouette: string;
  leatherType?: string;
  colorPreference?: string;
  materialPreference?: string;
  footSize?: string;
  occasion?: string;
  budgetRange?: string;
  specialRequests?: string;
  additionalDetails?: string;
  fittingPreference?: string;
  status: BespokeLifecycleStatus | string;
  specifications?: BespokeFittingSpecification;
  referenceImages?: BespokeReferenceAsset[];
  quotation?: BespokeQuotation | null;
  customerVisibleNotes?: BespokeCustomerVisibleNote[];
  convertedOrderId?: string | null;
  convertedOrderNumber?: string | null;
  reviewedAt?: string;
  approvedAt?: string;
  productionStartedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClaimOrderRequest {
  orderReference: string;
  email?: string;
  phone?: string;
}

export interface ClaimOrderResponse {
  success: boolean;
  message?: string;
  error?: string;
  alreadyClaimed?: boolean;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
  };
}
