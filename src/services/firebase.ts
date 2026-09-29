import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  type Auth, 
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  type Firestore 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  type FirebaseStorage 
} from 'firebase/storage';
import type { Product, CustomerOrder, OrderStatus, BespokeInquiry } from '../types';

// Read config from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Check if valid credentials have been supplied
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('your_api_key_here')
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('✨ [Nelson Shoes] Firebase Cloud successfully initialized for project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('❌ [Nelson Shoes] Error initializing Firebase:', error);
  }
} else {
  console.info('ℹ️ [Nelson Shoes] Firebase credentials not detected. Operating in persistent local storage mode.');
}

export { app, auth, db, storage };

// ---------------------------------------------------------------------------
// FIRESTORE: Products Catalog Service
// ---------------------------------------------------------------------------

export const subscribeToProducts = (onProductsChange: (products: Product[]) => void): (() => void) => {
  if (!db || !isFirebaseConfigured) return () => {};

  const productsRef = collection(db, 'products');
  return onSnapshot(
    productsRef,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
      });
      onProductsChange(items);
    },
    (error) => {
      console.error('Error listening to products in Firestore:', error);
    }
  );
};

export const saveProductToFirestore = async (product: Product): Promise<void> => {
  if (!db || !isFirebaseConfigured) return;
  const docRef = doc(db, 'products', product.id);
  await setDoc(docRef, {
    ...product,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const deleteProductFromFirestore = async (productId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured) return;
  const docRef = doc(db, 'products', productId);
  await deleteDoc(docRef);
};

// ---------------------------------------------------------------------------
// FIRESTORE: Orders Workbench Service
// ---------------------------------------------------------------------------

export const subscribeToOrders = (onOrdersChange: (orders: CustomerOrder[]) => void): (() => void) => {
  if (!db || !isFirebaseConfigured) return () => {};

  const ordersRef = collection(db, 'orders');
  return onSnapshot(
    ordersRef,
    (snapshot) => {
      const items: CustomerOrder[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<CustomerOrder, 'id'>) });
      });
      onOrdersChange(items);
    },
    (error) => {
      console.error('Error listening to orders in Firestore:', error);
    }
  );
};

export const saveOrderToFirestore = async (order: CustomerOrder): Promise<void> => {
  if (!db || !isFirebaseConfigured) return;
  const docRef = doc(db, 'orders', order.id);
  await setDoc(docRef, {
    ...order,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

export const updateOrderStatusInFirestore = async (
  orderId: string, 
  status: OrderStatus, 
  trackingNumber?: string, 
  artisanNotes?: string
): Promise<void> => {
  if (!db || !isFirebaseConfigured) return;
  const docRef = doc(db, 'orders', orderId);
  const payload: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString()
  };
  if (trackingNumber !== undefined) payload.trackingNumber = trackingNumber;
  if (artisanNotes !== undefined) payload.artisanNotes = artisanNotes;
  await setDoc(docRef, payload, { merge: true });
};

export const deleteOrderFromFirestore = async (orderId: string): Promise<void> => {
  if (!db || !isFirebaseConfigured) return;
  const docRef = doc(db, 'orders', orderId);
  await deleteDoc(docRef);
};

// ---------------------------------------------------------------------------
// FIRESTORE: Bespoke Inquiries Service
// ---------------------------------------------------------------------------

export const submitBespokeInquiryToFirestore = async (inquiry: BespokeInquiry): Promise<string | null> => {
  if (!db || !isFirebaseConfigured) return null;
  const inquiriesRef = collection(db, 'bespoke_inquiries');
  const res = await addDoc(inquiriesRef, {
    ...inquiry,
    createdAt: new Date().toISOString(),
    status: 'new'
  });
  return res.id;
};

// ---------------------------------------------------------------------------
// FIREBASE STORAGE: Footwear Photography Upload
// ---------------------------------------------------------------------------

export const uploadProductImageToStorage = async (file: File, slug: string): Promise<string> => {
  if (!storage || !isFirebaseConfigured) {
    throw new Error('Firebase Storage is not initialized or configured.');
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `products/${slug}/${Date.now()}_${cleanFileName}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type,
    customMetadata: {
      uploadedBy: 'Nelson Master Atelier',
      shoeSlug: slug
    }
  });

  return await getDownloadURL(snapshot.ref);
};

// ---------------------------------------------------------------------------
// FIREBASE AUTHENTICATION: Admin Cordwainer Auth
// ---------------------------------------------------------------------------

export const signInAdminWithFirebase = async (email: string, pass: string): Promise<User | null> => {
  if (!auth || !isFirebaseConfigured) return null;
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

export const signOutAdminFromFirebase = async (): Promise<void> => {
  if (!auth || !isFirebaseConfigured) return;
  await fbSignOut(auth);
};

export const onAdminAuthListener = (callback: (user: User | null) => void): (() => void) => {
  if (!auth || !isFirebaseConfigured) return () => {};
  return onAuthStateChanged(auth, callback);
};
