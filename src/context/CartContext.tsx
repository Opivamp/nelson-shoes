import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/config';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: number, isBespokeFitting?: boolean, customNotes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalNGN: number;
  subtotalUSD: number;
  generateWhatsAppOrderUrl: (customerName?: string, shippingCity?: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'nelson_shoes_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (product: Product, size: number, isBespokeFitting: boolean = false, customNotes?: string) => {
    const itemId = `${product.id}-${size}-${isBespokeFitting ? 'bespoke' : 'standard'}`;
    
    setItems(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item => 
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          size,
          isBespokeFitting,
          customNotes,
          quantity: 1,
        }
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalNGN = items.reduce((sum, item) => sum + (item.product.priceNGN * item.quantity), 0);
  const subtotalUSD = items.reduce((sum, item) => sum + (item.product.priceUSD * item.quantity), 0);

  const generateWhatsAppOrderUrl = (customerName?: string, shippingCity?: string) => {
    if (items.length === 0) return getWhatsAppUrl();

    let message = `*NELSON SHOES — BESPOKE ORDER INQUIRY*\n`;
    message += `------------------------------------\n`;
    if (customerName) message += `*Client:* ${customerName}\n`;
    if (shippingCity) message += `*Delivery Destination:* ${shippingCity}\n`;
    message += `*Date:* ${new Date().toLocaleDateString('en-GB')}\n\n`;
    message += `*COMMISSIONED PIECES:*\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   • Size: EU ${item.size} (${item.isBespokeFitting ? 'Bespoke Last Fitting' : 'Standard Last'})\n`;
      message += `   • Quantity: ${item.quantity}\n`;
      message += `   • Price: ₦${(item.product.priceNGN * item.quantity).toLocaleString('en-NG')} ($${(item.product.priceUSD * item.quantity).toLocaleString('en-US')})\n`;
      if (item.customNotes) message += `   • Custom Notes: ${item.customNotes}\n`;
      message += `\n`;
    });

    message += `------------------------------------\n`;
    message += `*Estimated Subtotal:* ₦${subtotalNGN.toLocaleString('en-NG')} ($${subtotalUSD.toLocaleString('en-US')})\n`;
    message += `\nHello Nelson Atelier, I would like to proceed with this bespoke order and confirm fitting details/production schedule.`;

    return getWhatsAppUrl(message);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalNGN,
        subtotalUSD,
        generateWhatsAppOrderUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
