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
