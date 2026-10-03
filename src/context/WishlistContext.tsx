import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalWishlist: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'nelson_shoes_wishlist_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customerUser, savedItemIds, saveItem, removeItem } = useCustomerAuth();

  const [localWishlistIds, setLocalWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Effective list: if customer is signed in, use Firestore savedItemIds, else local storage
  const wishlistIds = customerUser ? savedItemIds : localWishlistIds;

  // Persist guest wishlist to localStorage
  useEffect(() => {
    if (!customerUser) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localWishlistIds));
      } catch (e) {
        console.error('Failed to save wishlist:', e);
      }
    }
  }, [localWishlistIds, customerUser]);

  const toggleWishlist = (productId: string) => {
    if (customerUser) {
      if (savedItemIds.includes(productId)) {
        removeItem(productId);
      } else {
        saveItem(productId);
      }
    } else {
      setLocalWishlistIds(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        totalWishlist: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
