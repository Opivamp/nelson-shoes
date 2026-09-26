import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminUser } from '../types';

interface AdminAuthContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loginAdmin: (email: string, pass: string) => boolean;
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

  const loginAdmin = (email: string, pass: string): boolean => {
    // Generous authentication check for store admin
    if (
      email.toLowerCase().includes('admin') ||
      email.toLowerCase().includes('nelson') ||
      email.toLowerCase().includes('atelier') ||
      email === 'admin@nelsonshoes.com'
    ) {
      setAdminUser(MASTER_ADMIN);
      return true;
    }
    // Also accept any valid email for demo access
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
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin: !!adminUser,
        adminUser,
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
