import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { 
  CustomerProfile, 
  CustomerSignUpData, 
  CustomerProfileUpdateData,
  CustomerAddress,
  ClaimOrderRequest,
  ClaimOrderResponse
} from '../types';
import { 
  isFirebaseConfigured, 
  onAdminAuthListener 
} from '../services/firebase';
import { 
  signUpCustomer, 
  signInCustomer, 
  signOutCustomer, 
  sendCustomerPasswordReset, 
  resendCustomerEmailVerification, 
  fetchCustomerProfile, 
  updateCustomerProfileDoc, 
  subscribeToCustomerProfile,
  subscribeToCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress as serviceUpdateAddress,
  deleteCustomerAddress as serviceDeleteAddress,
  setDefaultCustomerAddress as serviceSetDefaultAddress,
  subscribeToCustomerSavedItems,
  saveCustomerItem,
  removeCustomerItem,
  claimHistoricalOrder,
  formatCustomerAuthError 
} from '../services/customerAuthService';

interface CustomerAuthContextType {
  customerUser: User | null;
  profile: CustomerProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  addresses: CustomerAddress[];
  savedItemIds: string[];
  signUp: (data: CustomerSignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: CustomerProfileUpdateData) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  addAddress: (address: Omit<CustomerAddress, 'id' | 'createdAt'>) => Promise<string>;
  updateAddress: (addressId: string, address: Partial<CustomerAddress>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  saveItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isSaved: (productId: string) => boolean;
  claimOrder: (req: ClaimOrderRequest) => Promise<ClaimOrderResponse>;
  clearError: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerUser, setCustomerUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Synchronize Firebase Auth state, profile, addresses, and saved items
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeAddresses: (() => void) | null = null;
    let unsubscribeSavedItems: (() => void) | null = null;

    const unsubscribeAuth = onAdminAuthListener(async (fbUser) => {
      if (fbUser) {
        setCustomerUser(fbUser);

        // 1. Subscribe to customer profile document in Firestore
        unsubscribeProfile = subscribeToCustomerProfile(fbUser.uid, (p) => {
          setProfile(p);
        });

        // 2. Subscribe to customer addresses subcollection
        unsubscribeAddresses = subscribeToCustomerAddresses(fbUser.uid, (addrs) => {
          setAddresses(addrs);
        });

        // 3. Subscribe to customer saved items subcollection
        unsubscribeSavedItems = subscribeToCustomerSavedItems(fbUser.uid, (items) => {
          setSavedItemIds(items);
        });

        // Initial eager fetch
        try {
          const initialProfile = await fetchCustomerProfile(fbUser.uid);
          if (initialProfile) {
            setProfile(initialProfile);
          }
        } catch {
          // Handled gracefully
        }
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        if (unsubscribeAddresses) {
          unsubscribeAddresses();
          unsubscribeAddresses = null;
        }
        if (unsubscribeSavedItems) {
          unsubscribeSavedItems();
          unsubscribeSavedItems = null;
        }
        setCustomerUser(null);
        setProfile(null);
        setAddresses([]);
        setSavedItemIds([]);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeAddresses) unsubscribeAddresses();
      if (unsubscribeSavedItems) unsubscribeSavedItems();
    };
  }, []);

  const clearError = () => setAuthError(null);

  const signUp = async (data: CustomerSignUpData): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    if (!isFirebaseConfigured) {
      const err = 'Atelier cloud services are currently offline.';
      setAuthError(err);
      return { success: false, error: err };
    }

    try {
      const result = await signUpCustomer(data);
      setCustomerUser(result.user);
      setProfile(result.profile);
      return { success: true };
    } catch (error: any) {
      const msg = formatCustomerAuthError(error?.code || '');
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    if (!isFirebaseConfigured) {
      const err = 'Atelier cloud services are currently offline.';
      setAuthError(err);
      return { success: false, error: err };
    }

    try {
      const result = await signInCustomer(email, pass);
      setCustomerUser(result.user);
      if (result.profile) {
        setProfile(result.profile);
      }
      return { success: true };
    } catch (error: any) {
      const msg = formatCustomerAuthError(error?.code || '');
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const signOut = async (): Promise<void> => {
    setAuthError(null);
    try {
      await signOutCustomer();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setCustomerUser(null);
    setProfile(null);
    setAddresses([]);
    setSavedItemIds([]);
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    const res = await sendCustomerPasswordReset(email);
    if (!res.success && res.error) {
      setAuthError(res.error);
    }
    return res;
  };

  const resendVerification = async (): Promise<{ success: boolean; error?: string }> => {
    if (!customerUser) {
      return { success: false, error: 'No active customer session.' };
    }
    return await resendCustomerEmailVerification(customerUser);
  };

  const updateProfile = async (updates: CustomerProfileUpdateData): Promise<{ success: boolean; error?: string }> => {
    if (!customerUser) {
      return { success: false, error: 'No active customer session.' };
    }
    try {
      await updateCustomerProfileDoc(customerUser.uid, updates);
      await refreshProfile();
      return { success: true };
    } catch (error: any) {
      const msg = formatCustomerAuthError(error?.code || '');
      return { success: false, error: msg };
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (customerUser) {
      const fresh = await fetchCustomerProfile(customerUser.uid);
      if (fresh) {
        setProfile(fresh);
      }
    }
  };

  const addAddress = async (address: Omit<CustomerAddress, 'id' | 'createdAt'>): Promise<string> => {
    if (!customerUser) throw new Error('Unauthenticated');
    return await addCustomerAddress(customerUser.uid, address);
  };

  const updateAddress = async (addressId: string, address: Partial<CustomerAddress>): Promise<void> => {
    if (!customerUser) throw new Error('Unauthenticated');
    await serviceUpdateAddress(customerUser.uid, addressId, address);
  };

  const deleteAddress = async (addressId: string): Promise<void> => {
    if (!customerUser) throw new Error('Unauthenticated');
    await serviceDeleteAddress(customerUser.uid, addressId);
  };

  const setDefaultAddress = async (addressId: string): Promise<void> => {
    if (!customerUser) throw new Error('Unauthenticated');
    await serviceSetDefaultAddress(customerUser.uid, addressId);
    await refreshProfile();
  };

  const saveItem = async (productId: string): Promise<void> => {
    if (!customerUser) return;
    await saveCustomerItem(customerUser.uid, productId);
  };

  const removeItem = async (productId: string): Promise<void> => {
    if (!customerUser) return;
    await removeCustomerItem(customerUser.uid, productId);
  };

  const isSaved = (productId: string): boolean => {
    return savedItemIds.includes(productId);
  };

  const claimOrder = async (req: ClaimOrderRequest): Promise<ClaimOrderResponse> => {
    return await claimHistoricalOrder(req);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customerUser,
        profile,
        isAuthenticated: Boolean(customerUser),
        isAuthLoading,
        authError,
        addresses,
        savedItemIds,
        signUp,
        signIn,
        signOut,
        sendPasswordReset,
        resendVerification,
        updateProfile,
        refreshProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        saveItem,
        removeItem,
        isSaved,
        claimOrder,
        clearError
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
