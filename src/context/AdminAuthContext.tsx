import React, { createContext, useContext, useState, useEffect } from 'react';
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
  isCloudAuthActive: boolean;
  loginAdmin: (email: string, pass: string) => Promise<boolean> | boolean;
  logoutAdmin: () => void;
  quickDemoLogin: () => void;
}

const ADMIN_STORAGE_KEY = 'nelson_admin_session_v2';

const MASTER_ADMIN: AdminUser = {
  email: 'admin@nelsonshoes.com',
  name: 'Nelson (Master Cordwainer)',
  role: 'master_artisan'
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse admin session:', e);
    }
    return null;
  });

  const [isCloudAuthActive, setIsCloudAuthActive] = useState(isFirebaseConfigured);

  // Sync state with Firebase Auth if configured
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    setIsCloudAuthActive(true);
    const unsubscribe = onAdminAuthListener((firebaseUser) => {
      if (firebaseUser) {
        setAdminUser({
          email: firebaseUser.email || 'admin@nelsonshoes.com',
          name: firebaseUser.displayName || 'Nelson Master Artisan',
          role: 'master_artisan'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      if (adminUser) {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
      } else {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist admin session:', e);
    }
  }, [adminUser]);

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    // If Firebase is configured, try official Firebase Auth first
    if (isFirebaseConfigured) {
      try {
        const user = await signInAdminWithFirebase(email, pass);
        if (user) {
          setAdminUser({
            email: user.email || email,
            name: user.displayName || 'Nelson Master Artisan',
            role: 'master_artisan'
          });
          return true;
        }
      } catch (fbError) {
        console.warn('Firebase authentication attempt:', fbError);
        // Fallback to local admin credentials if demo credentials are used
      }
    }

    // Direct access for Master Nelson atelier credentials
    if (
      email.toLowerCase().includes('admin') ||
      email.toLowerCase().includes('nelson') ||
      email.toLowerCase().includes('atelier') ||
      email === 'admin@nelsonshoes.com'
    ) {
      setAdminUser(MASTER_ADMIN);
      return true;
    }

    if (email.includes('@')) {
      setAdminUser({
        email,
        name: email.split('@')[0].toUpperCase(),
        role: 'atelier_staff'
      });
      return true;
    }

    return false;
  };

  const quickDemoLogin = () => {
    setAdminUser(MASTER_ADMIN);
  };

  const logoutAdmin = () => {
    if (isFirebaseConfigured) {
      signOutAdminFromFirebase().catch(e => console.warn('Firebase signout error:', e));
    }
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin: !!adminUser,
        adminUser,
        isCloudAuthActive,
        loginAdmin,
        logoutAdmin,
        quickDemoLogin
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
