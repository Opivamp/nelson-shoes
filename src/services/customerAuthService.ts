import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
  updateProfile,
  type User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import type { 
  CustomerProfile, 
  CustomerSignUpData, 
  CustomerProfileUpdateData,
  CustomerOrder,
  CustomerAddress,
  CustomerBespokeInquiry,
  ClaimOrderRequest,
  ClaimOrderResponse
} from '../types';

// Helper to translate Firebase Authentication error codes into luxury, customer-friendly notifications
export const formatCustomerAuthError = (code: string): string => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email address or passphrase provided is incorrect.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An atelier account is already registered with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'For the security of your atelier dossier, your passphrase must be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This customer account has been deactivated. Please contact the atelier concierge for assistance.';
    case 'auth/too-many-requests':
      return 'Access has been temporarily restricted due to repeated attempts. Please wait a few moments before trying again.';
    case 'auth/network-request-failed':
      return 'Unable to establish a secure connection to the atelier cloud. Please verify your internet connection.';
    case 'auth/expired-action-code':
      return 'This password reset link has expired. Please request a fresh reset link.';
    case 'auth/invalid-action-code':
      return 'This password reset link is invalid or has already been used.';
    case 'auth/configuration-not-found':
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in the Firebase Console for this project. Please go to Firebase Console > Authentication > Sign-in method and enable the Email/Password provider.';
    default:
      return 'We could not complete your request at this moment. Please try again or contact concierge.';
  }
};

/**
 * Creates a new customer account using Firebase Auth and stores a customer profile document in Firestore.
 * Passwords are NEVER written to Firestore.
 */
export const signUpCustomer = async (data: CustomerSignUpData): Promise<{ user: User; profile: CustomerProfile }> => {
  if (!auth || !db || !isFirebaseConfigured) {
    throw new Error('Firebase cloud services are not initialized.');
  }

  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.fullName.trim();
  const cleanPhone = (data.phoneWhatsApp || '').trim();

  // 1. Create credential identity in Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
  const user = userCredential.user;

  // 2. Set display name on Firebase Auth identity
  try {
    await updateProfile(user, { displayName: cleanName });
  } catch (err) {
    console.warn('Could not update Auth displayName:', err);
  }

  // 3. Dispatch email verification asynchronously
  try {
    await sendEmailVerification(user);
  } catch (err) {
    console.warn('Email verification dispatch error:', err);
  }

  // 4. Create authoritative customer profile document in Firestore
  const now = new Date().toISOString();
  const profile: CustomerProfile = {
    uid: user.uid,
    fullName: cleanName,
    email: user.email || cleanEmail,
    phone: cleanPhone,
    emailVerified: user.emailVerified,
    createdAt: now,
    updatedAt: now
  };

  const customerDocRef = doc(db, 'customers', user.uid);
  await setDoc(customerDocRef, profile);

  return { user, profile };
};

/**
 * Signs in an existing customer with Firebase Authentication and fetches their Firestore profile.
 */
export const signInCustomer = async (email: string, pass: string): Promise<{ user: User; profile: CustomerProfile | null }> => {
  if (!auth || !db || !isFirebaseConfigured) {
    throw new Error('Firebase cloud services are not initialized.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const user = userCredential.user;

  // Fetch or lazily initialize the customer profile document
  let profile = await fetchCustomerProfile(user.uid);
  if (!profile) {
    const now = new Date().toISOString();
    profile = {
      uid: user.uid,
      fullName: user.displayName || 'Customer',
      email: user.email || cleanEmail,
      emailVerified: user.emailVerified,
      createdAt: now,
      updatedAt: now
    };
    try {
      await setDoc(doc(db, 'customers', user.uid), profile);
    } catch (err) {
      console.warn('Could not lazily persist customer profile:', err);
    }
  }

  return { user, profile };
};

/**
 * Signs out the customer from Firebase Authentication.
 */
export const signOutCustomer = async (): Promise<void> => {
  if (!auth || !isFirebaseConfigured) return;
  await fbSignOut(auth);
};

/**
 * Sends a password reset link to the given email address.
 * Employs anti-enumeration: resolves with success regardless of whether the account exists.
 */
export const sendCustomerPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  if (!auth || !isFirebaseConfigured) {
    return { success: false, error: 'Firebase cloud services are not initialized.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true };
  } catch (error: any) {
    // If account doesn't exist, return success anyway to prevent enumeration
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-email') {
      return { success: true };
    }
    return { success: false, error: formatCustomerAuthError(error?.code || '') };
  }
};

/**
 * Confirms a password reset using Firebase's action code (oobCode).
 */
export const confirmCustomerPasswordReset = async (oobCode: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
  if (!auth || !isFirebaseConfigured) {
    return { success: false, error: 'Firebase cloud services are not initialized.' };
  }

  try {
    await confirmPasswordReset(auth, oobCode, newPass);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: formatCustomerAuthError(error?.code || '') };
  }
};

/**
 * Resends an email verification link to the active user.
 */
export const resendCustomerEmailVerification = async (user: User): Promise<{ success: boolean; error?: string }> => {
  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: formatCustomerAuthError(error?.code || '') };
  }
};

/**
 * Fetches the customer profile document from Firestore.
 */
export const fetchCustomerProfile = async (uid: string): Promise<CustomerProfile | null> => {
  if (!db || !isFirebaseConfigured) return null;
  try {
    const docRef = doc(db, 'customers', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CustomerProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching customer profile:', err);
    return null;
  }
};

/**
 * Updates non-secret customer profile fields in Firestore.
 */
export const updateCustomerProfileDoc = async (
  uid: string, 
  updates: CustomerProfileUpdateData
): Promise<void> => {
  if (!db || !isFirebaseConfigured) return;
  const docRef = doc(db, 'customers', uid);
  const payload: Record<string, unknown> = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await setDoc(docRef, payload, { merge: true });

  // Update Firebase Auth displayName if fullName changed
  if (updates.fullName && auth?.currentUser && auth.currentUser.uid === uid) {
    try {
      await updateProfile(auth.currentUser, { displayName: updates.fullName });
    } catch (err) {
      console.warn('Could not update Auth displayName:', err);
    }
  }
};

/**
 * Real-time listener for customer profile changes.
 */
export const subscribeToCustomerProfile = (
  uid: string, 
  callback: (profile: CustomerProfile | null) => void
): (() => void) => {
  if (!db || !isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  const docRef = doc(db, 'customers', uid);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as CustomerProfile);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Error listening to customer profile:', err);
      callback(null);
    }
  );
};

/**
 * Real-time listener for customer-owned orders.
 * Strictly queries `orders` collection filtering by `customerUid == uid`.
 */
export const subscribeToCustomerOrders = (
  uid: string,
  callback: (orders: CustomerOrder[]) => void
): (() => void) => {
  if (!db || !isFirebaseConfigured) {
    callback([]);
    return () => {};
  }

  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('customerUid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CustomerOrder[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<CustomerOrder, 'id'>) });
      });
      // Sort client-side by date descending
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      console.warn('Error listening to customer orders:', err);
      callback([]);
    }
  );
};

/**
 * Fetches a single customer-owned order by document ID or order reference.
 * Strictly verifies that the order belongs to the requesting customer (customerUid == uid).
 */
export const fetchCustomerOrderById = async (
  uid: string, 
  orderIdOrRef: string
): Promise<CustomerOrder | null> => {
  if (!db || !isFirebaseConfigured || !uid) return null;

  try {
    // 1. First try direct document ID lookup
    const docRef = doc(db, 'orders', orderIdOrRef);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CustomerOrder;
      if (data.customerUid === uid) {
        return { ...data, id: snap.id };
      }
    }

    // 2. Fallback to orderNumber query if orderIdOrRef was a reference number (e.g. NS-ORD-123456)
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('customerUid', '==', uid), 
      where('orderNumber', '==', orderIdOrRef.trim().toUpperCase())
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const matched = querySnap.docs[0];
      return { id: matched.id, ...(matched.data() as Omit<CustomerOrder, 'id'>) };
    }

    return null;
  } catch (err) {
    console.error('Error fetching customer order:', err);
    return null;
  }
};

// ---------------------------------------------------------------------------
// CUSTOMER ADDRESS BOOK SERVICES (Subcollection: customers/{uid}/addresses)
// ---------------------------------------------------------------------------

/**
 * Fetches all delivery addresses for a customer.
 */
export const fetchCustomerAddresses = async (uid: string): Promise<CustomerAddress[]> => {
  if (!db || !isFirebaseConfigured || !uid) return [];
  try {
    const addressesRef = collection(db, 'customers', uid, 'addresses');
    const snap = await getDocs(addressesRef);
    const list: CustomerAddress[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<CustomerAddress, 'id'>) });
    });
    return list.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  } catch (err) {
    console.error('Error fetching customer addresses:', err);
    return [];
  }
};

/**
 * Adds a new delivery address for the customer.
 * If set as default, automatically unsets any previous default address.
 */
export const addCustomerAddress = async (
  uid: string, 
  addressData: Omit<CustomerAddress, 'id' | 'createdAt'>
): Promise<string> => {
  if (!db || !isFirebaseConfigured || !uid) {
    throw new Error('Database not initialized or unauthenticated.');
  }

  const addressesRef = collection(db, 'customers', uid, 'addresses');
  const now = new Date().toISOString();

  // If this address is default, unset previous defaults
  if (addressData.isDefault) {
    const existing = await fetchCustomerAddresses(uid);
    for (const item of existing) {
      if (item.isDefault) {
        await updateDoc(doc(db, 'customers', uid, 'addresses', item.id), { isDefault: false });
      }
    }
  }

  const newDocRef = await addDoc(addressesRef, {
    ...addressData,
    createdAt: now
  });

  // If marked as default, sync defaultAddressId in profile document
  if (addressData.isDefault) {
    await updateCustomerProfileDoc(uid, { defaultAddressId: newDocRef.id } as any);
  }

  return newDocRef.id;
};

/**
 * Updates an existing delivery address.
 */
export const updateCustomerAddress = async (
  uid: string, 
  addressId: string, 
  updates: Partial<CustomerAddress>
): Promise<void> => {
  if (!db || !isFirebaseConfigured || !uid) return;

  // If setting this address as default, unset others first
  if (updates.isDefault) {
    const existing = await fetchCustomerAddresses(uid);
    for (const item of existing) {
      if (item.id !== addressId && item.isDefault) {
        await updateDoc(doc(db, 'customers', uid, 'addresses', item.id), { isDefault: false });
      }
    }
    await updateCustomerProfileDoc(uid, { defaultAddressId: addressId } as any);
  }

  const addrRef = doc(db, 'customers', uid, 'addresses', addressId);
  await updateDoc(addrRef, updates);
};

/**
 * Deletes a delivery address.
 */
export const deleteCustomerAddress = async (uid: string, addressId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured || !uid) return;
  const addrRef = doc(db, 'customers', uid, 'addresses', addressId);
  await deleteDoc(addrRef);
};

/**
 * Sets a specific address as the default delivery address.
 */
export const setDefaultCustomerAddress = async (uid: string, addressId: string): Promise<void> => {
  await updateCustomerAddress(uid, addressId, { isDefault: true });
};

/**
 * Real-time listener for customer delivery addresses.
 */
export const subscribeToCustomerAddresses = (
  uid: string,
  callback: (addresses: CustomerAddress[]) => void
): (() => void) => {
  if (!db || !isFirebaseConfigured || !uid) {
    callback([]);
    return () => {};
  }

  const addressesRef = collection(db, 'customers', uid, 'addresses');
  return onSnapshot(
    addressesRef,
    (snapshot) => {
      const items: CustomerAddress[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<CustomerAddress, 'id'>) });
      });
      // Sort default first, then newest
      items.sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      callback(items);
    },
    (err) => {
      console.warn('Error listening to addresses:', err);
      callback([]);
    }
  );
};

// ---------------------------------------------------------------------------
// SAVED ITEMS SERVICES (Subcollection: customers/{uid}/savedItems)
// ---------------------------------------------------------------------------

/**
 * Fetches all saved product IDs for the authenticated customer.
 */
export const fetchCustomerSavedItemIds = async (uid: string): Promise<string[]> => {
  if (!db || !isFirebaseConfigured || !uid) return [];
  try {
    const savedRef = collection(db, 'customers', uid, 'savedItems');
    const snap = await getDocs(savedRef);
    const ids: string[] = [];
    snap.forEach((d) => ids.push(d.id));
    return ids;
  } catch (err) {
    console.error('Error fetching saved items:', err);
    return [];
  }
};

/**
 * Adds a product to customer's saved items.
 */
export const saveCustomerItem = async (uid: string, productId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured || !uid) return;
  const itemRef = doc(db, 'customers', uid, 'savedItems', productId);
  await setDoc(itemRef, {
    productId,
    addedAt: new Date().toISOString()
  });
};

/**
 * Removes a product from customer's saved items.
 */
export const removeCustomerItem = async (uid: string, productId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured || !uid) return;
  const itemRef = doc(db, 'customers', uid, 'savedItems', productId);
  await deleteDoc(itemRef);
};

/**
 * Real-time listener for customer saved items.
 */
export const subscribeToCustomerSavedItems = (
  uid: string,
  callback: (productIds: string[]) => void
): (() => void) => {
  if (!db || !isFirebaseConfigured || !uid) {
    callback([]);
    return () => {};
  }

  const savedRef = collection(db, 'customers', uid, 'savedItems');
  return onSnapshot(
    savedRef,
    (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((d) => ids.push(d.id));
      callback(ids);
    },
    (err) => {
      console.warn('Error listening to saved items:', err);
      callback([]);
    }
  );
};

// ---------------------------------------------------------------------------
// BESPOKE COMMISSIONS SERVICES (Collection: bespoke_inquiries)
// ---------------------------------------------------------------------------

/**
 * Real-time listener for customer-owned bespoke inquiries.
 * Strictly queries `bespoke_inquiries` where `customerUid == uid`.
 */
export const subscribeToCustomerBespokeInquiries = (
  uid: string,
  callback: (inquiries: CustomerBespokeInquiry[]) => void
): (() => void) => {
  if (!db || !isFirebaseConfigured || !uid) {
    callback([]);
    return () => {};
  }

  const inquiriesRef = collection(db, 'bespoke_inquiries');
  const q = query(inquiriesRef, where('customerUid', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CustomerBespokeInquiry[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<CustomerBespokeInquiry, 'id'>) });
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      console.warn('Error listening to bespoke inquiries:', err);
      callback([]);
    }
  );
};

/**
 * Fetches a single bespoke inquiry by ID for the customer.
 */
export const fetchCustomerBespokeInquiryById = async (
  uid: string,
  inquiryId: string
): Promise<CustomerBespokeInquiry | null> => {
  if (!db || !isFirebaseConfigured || !uid) return null;
  try {
    const docRef = doc(db, 'bespoke_inquiries', inquiryId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CustomerBespokeInquiry;
      if (data.customerUid === uid) {
        return { ...data, id: snap.id };
      }
    }
    return null;
  } catch (err) {
    console.error('Error fetching bespoke inquiry:', err);
    return null;
  }
};

// ---------------------------------------------------------------------------
// LEGACY GUEST ORDER CLAIMING SERVICE (Serverless Endpoint: /api/claim-order)
// ---------------------------------------------------------------------------

/**
 * Securely links an eligible historical guest order to the authenticated customer's account.
 * Dispatches request with Firebase ID token for server-side Admin SDK verification.
 */
export const claimHistoricalOrder = async (
  req: ClaimOrderRequest
): Promise<ClaimOrderResponse> => {
  if (!auth?.currentUser) {
    return {
      success: false,
      error: 'You must be signed in to your customer account to claim an order.'
    };
  }

  try {
    const idToken = await auth.currentUser.getIdToken();
    const response = await fetch('/api/claim-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(req)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'We could not link this order. Please verify your order reference and contact details.'
      };
    }

    return {
      success: true,
      message: data.message || 'Order successfully linked to your customer account.',
      alreadyClaimed: data.alreadyClaimed,
      order: data.order
    };
  } catch (err: any) {
    console.error('Error in claimHistoricalOrder:', err);
    return {
      success: false,
      error: 'Unable to reach the verification server. Please check your internet connection and try again.'
    };
  }
};
