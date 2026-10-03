import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { 
  CustomerProfile, 
  CustomerSignUpData, 
  CustomerProfileUpdateData 
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
  formatCustomerAuthError 
} from '../services/customerAuthService';

interface CustomerAuthContextType {
  customerUser: User | null;
  profile: CustomerProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  signUp: (data: CustomerSignUpData) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: CustomerProfileUpdateData) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerUser, setCustomerUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Synchronize Firebase Auth state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAdminAuthListener(async (fbUser) => {
      if (fbUser) {
        setCustomerUser(fbUser);

        // Subscribe to customer profile document in Firestore
        unsubscribeProfile = subscribeToCustomerProfile(fbUser.uid, (p) => {
          setProfile(p);
        });

        // If profile hasn't loaded yet via listener, try initial fetch
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
        setCustomerUser(null);
        setProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
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
      return { success: false, error: 'No active patron session.' };
    }
    return await resendCustomerEmailVerification(customerUser);
  };

  const updateProfile = async (updates: CustomerProfileUpdateData): Promise<{ success: boolean; error?: string }> => {
    if (!customerUser) {
      return { success: false, error: 'No active patron session.' };
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

  return (
    <CustomerAuthContext.Provider
      value={{
        customerUser,
        profile,
        isAuthenticated: Boolean(customerUser),
        isAuthLoading,
        authError,
        signUp,
        signIn,
        signOut,
        sendPasswordReset,
        resendVerification,
        updateProfile,
        refreshProfile,
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
