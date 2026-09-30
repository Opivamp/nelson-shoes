import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { AdminUser } from '../types';
import { 
  isFirebaseConfigured, 
  signInAdminWithFirebase, 
  signOutAdminFromFirebase, 
  onAdminAuthListener 
} from '../services/firebase';

interface AdminAuthContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  firebaseUser: User | null;
  isAuthLoading: boolean;
  authError: string | null;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  refreshAdminToken: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Helper to determine administrator role strictly from custom token claims
// An email address or email domain NEVER grants administrative permissions
const resolveAdminRole = (claims: Record<string, unknown>): AdminUser['role'] | null => {
  if (claims.admin === true || claims.role === 'master_artisan') {
    return 'master_artisan';
  }
  if (claims.role === 'atelier_staff') {
    return 'atelier_staff';
  }
  return null;
};

// Helper to translate Firebase Authentication error codes into luxury, human-readable notifications
const formatAuthError = (code: string): string => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The atelier email or master passkey provided is invalid.';
    case 'auth/invalid-email':
      return 'Please enter a valid atelier email address.';
    case 'auth/user-disabled':
      return 'This atelier administrator account has been disabled.';
    case 'auth/too-many-requests':
      return 'Access temporarily restricted due to repeated unsuccessful attempts. Please try again shortly.';
    case 'auth/network-request-failed':
      return 'Network communication failed. Please verify your connection to the atelier cloud.';
    default:
      return 'Authentication could not be completed. Please check your credentials and try again.';
  }
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Clean up any legacy mock sessions from localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('nelson_admin_session_v2');
      localStorage.removeItem('nelson_admin_session');
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Listen to genuine Firebase Authentication state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    const unsubscribe = onAdminAuthListener(async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const tokenResult = await fbUser.getIdTokenResult();
          const role = resolveAdminRole(tokenResult.claims);

          if (role) {
            setAdminUser({
              email: fbUser.email || '',
              name: fbUser.displayName || (role === 'master_artisan' ? 'Master Cordwainer' : 'Atelier Staff'),
              role
            });
          } else {
            // Authenticated Firebase user WITHOUT admin custom claims: STRICTLY DENIED
            setAdminUser(null);
          }
        } catch (err) {
          console.error('Error fetching admin token claims:', err);
          setAdminUser(null);
        }
      } else {
        setFirebaseUser(null);
        setAdminUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !pass) {
      const err = 'Please enter both your atelier email and master passkey.';
      setAuthError(err);
      return { success: false, error: err };
    }

    if (!isFirebaseConfigured) {
      const err = 'Firebase cloud services are not initialized.';
      setAuthError(err);
      return { success: false, error: err };
    }

    try {
      const user = await signInAdminWithFirebase(cleanEmail, pass);
      if (user) {
        // Force fresh token evaluation to inspect server-set custom claims
        const tokenResult = await user.getIdTokenResult(true);
        const role = resolveAdminRole(tokenResult.claims);

        if (!role) {
          const deniedMsg = 'This account is authenticated, but has not been provisioned with administrator claims. Access to the Atelier console is restricted.';
          setAuthError(deniedMsg);
          return { success: false, error: deniedMsg };
        }

        return { success: true };
      }
      const err = 'Authentication failed. Please verify credentials.';
      setAuthError(err);
      return { success: false, error: err };
    } catch (error: any) {
      console.warn('Firebase admin authentication attempt failed:', error);
      const friendlyMessage = formatAuthError(error?.code || '');
      setAuthError(friendlyMessage);
      return { success: false, error: friendlyMessage };
    }
  };

  const logoutAdmin = async () => {
    setAuthError(null);
    if (isFirebaseConfigured) {
      try {
        await signOutAdminFromFirebase();
      } catch (e) {
        console.warn('Firebase signout error:', e);
      }
    }
    setFirebaseUser(null);
    setAdminUser(null);
  };

  const refreshAdminToken = async () => {
    if (firebaseUser) {
      try {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const role = resolveAdminRole(tokenResult.claims);
        if (role) {
          setAdminUser({
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || (role === 'master_artisan' ? 'Master Cordwainer' : 'Atelier Staff'),
            role
          });
        } else {
          setAdminUser(null);
        }
      } catch (err) {
        console.error('Error refreshing admin token claims:', err);
      }
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin: Boolean(adminUser && firebaseUser),
        adminUser,
        firebaseUser,
        isAuthLoading,
        authError,
        loginAdmin,
        logoutAdmin,
        refreshAdminToken
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

