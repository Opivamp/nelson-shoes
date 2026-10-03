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
  CustomerOrder 
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
      return 'This patron account has been deactivated. Please contact the atelier concierge for assistance.';
    case 'auth/too-many-requests':
      return 'Access has been temporarily restricted due to repeated attempts. Please wait a few moments before trying again.';
    case 'auth/network-request-failed':
      return 'Unable to establish a secure connection to the atelier cloud. Please verify your internet connection.';
    case 'auth/expired-action-code':
      return 'This password reset link has expired. Please request a fresh reset link.';
    case 'auth/invalid-action-code':
      return 'This password reset link is invalid or has already been used.';
    default:
      return 'We could not complete your request at this moment. Please try again or contact concierge.';
  }
};

/**
 * Creates a new customer account using Firebase Auth and stores a patron profile document in Firestore.
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
      fullName: user.displayName || 'Patron',
      email: user.email || cleanEmail,
      emailVerified: user.emailVerified,
      createdAt: now,
      updatedAt: now
    };
    try {
      await setDoc(doc(db, 'customers', user.uid), profile);
    } catch (err) {
      console.warn('Could not lazily persist patron profile:', err);
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
