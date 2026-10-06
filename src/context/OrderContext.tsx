import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CustomerOrder, OrderStatus, CartItem } from '../types';
import { 
  isFirebaseConfigured, 
  subscribeToOrders, 
  saveOrderToFirestore, 
  updateOrderStatusInFirestore, 
  deleteOrderFromFirestore 
} from '../services/firebase';

interface OrderContextType {
  orders: CustomerOrder[];
  isCloudSyncActive: boolean;
  createOrder: (orderData: {
    customer: CustomerOrder['customer'];
    items: CartItem[];
    subtotalNGN: number;
    subtotalUSD: number;
    shippingFeeNGN?: number;
    shippingFeeUSD?: number;
    totalNGN?: number;
    totalUSD?: number;
    currency?: 'NGN' | 'USD';
    paymentMethod: CustomerOrder['paymentMethod'];
    paymentStatus?: CustomerOrder['paymentStatus'];
    paymentReference?: string;
  }) => CustomerOrder;
  updateOrderStatus: (
    orderId: string, 
    newStatus: OrderStatus, 
    trackingNumber?: string, 
    artisanNotes?: string,
    additionalUpdates?: Partial<CustomerOrder>
  ) => void;
  updateOrder: (
    orderId: string,
    updates: Partial<CustomerOrder>,
    auditNote?: string
  ) => void;
  getOrderByIdOrNumber: (idOrNumber: string) => CustomerOrder | undefined;
  deleteOrder: (orderId: string) => void;
  resetOrders: () => void;
}

import { useAdminAuth } from './AdminAuthContext';
import { useCustomerAuth } from './CustomerAuthContext';

const CLIENT_ORDERS_KEY = 'nelson_client_orders_v1';
const LEGACY_ORDERS_KEY = 'nelson_shoes_orders_v2';

// Seed orders reserved strictly for admin demo/development
export const SEED_ORDERS: CustomerOrder[] = [
  {
    id: "ord-882190",
    orderNumber: "NS-ORD-882190",
    customer: {
      firstName: "Adebayo",
      lastName: "Adeleke",
      email: "adebayo.adeleke@gmail.com",
      phoneWhatsApp: "+234 803 555 0192",
      address: "Plot 14, Admiralty Way, Lekki Phase 1",
      city: "Lagos",
      state: "Lagos State",
      country: "Nigeria",
      deliveryMethod: "dhl-express",
      fittingNotes: "High instep over the left foot. Engrave initials 'A.A.' inside oak waist."
    },
    items: [
      {
        id: "cart-item-1",
        product: {
          id: "prod-sovereign-oxford",
          slug: "sovereign-wholecut-oxford",
          name: "The Sovereign Wholecut",
          tagline: "Single uninterrupted French box calfskin.",
          category: "oxfords",
          categoryLabel: "Oxfords",
          priceNGN: 245000,
          priceUSD: 320,
          status: "Available to Commission",
          primaryImage: "/images/hero-bespoke-oxford.jpg",
          gallery: [],
          description: "",
          story: "",
          materials: { upper: "", lining: "", sole: "", construction: "", finishing: "" },
          features: [],
          sizesAvailable: [42],
          standardLeadTime: "3 to 4 weeks"
        },
        size: 42,
        isBespokeFitting: true,
        customNotes: "A.A. Monogram",
        quantity: 1
      }
    ],
    subtotalNGN: 245000,
    subtotalUSD: 320,
    shippingFeeNGN: 25000,
    shippingFeeUSD: 50,
    totalNGN: 270000,
    totalUSD: 370,
    currency: "NGN",
    paymentMethod: "paystack-card",
    paymentStatus: "paid",
    paidAt: "2026-03-24T14:35:00Z",
    status: "At Workbench (Lasting)",
    carrier: "DHL Express",
    trackingNumber: "DHL-99418290",
    artisanNotes: "French box calfskin rested over beechwood last #NS-LAG-A42W. Preparing for hand welt stitching.",
    createdAt: "2026-03-24T14:30:00Z",
    updatedAt: "2026-03-25T10:15:00Z"
  },
  {
    id: "ord-449120",
    orderNumber: "NS-ORD-449120",
    customer: {
      firstName: "Dr. Femi",
      lastName: "Olatunji",
      email: "femi.olatunji@hospital.ng",
      phoneWhatsApp: "+234 802 111 8839",
      address: "18 Maitama Sule Street, Asokoro District",
      city: "Abuja",
      state: "FCT",
      country: "Nigeria",
      deliveryMethod: "dhl-express",
      fittingNotes: "Standard size 44. Midnight obsidian colorway."
    },
    items: [
      {
        id: "cart-item-2",
        product: {
          id: "prod-eko-tassel-loafer",
          slug: "eko-belgian-tassel-loafer",
          name: "The Èkó Tassel Loafer",
          tagline: "Midnight obsidian calfskin with hand-braided apron.",
          category: "loafers",
          categoryLabel: "Loafers",
          priceNGN: 215000,
          priceUSD: 280,
          status: "Available to Commission",
          primaryImage: "/images/product-tassel-loafer.jpg",
          gallery: [],
          description: "",
          story: "",
          materials: { upper: "", lining: "", sole: "", construction: "", finishing: "" },
          features: [],
          sizesAvailable: [44],
          standardLeadTime: "3 weeks"
        },
        size: 44,
        isBespokeFitting: false,
        quantity: 1
      }
    ],
    subtotalNGN: 215000,
    subtotalUSD: 280,
    shippingFeeNGN: 25000,
    shippingFeeUSD: 50,
    totalNGN: 240000,
    totalUSD: 330,
    currency: "NGN",
    paymentMethod: "bank-transfer",
    paymentStatus: "paid",
    paidAt: "2026-03-10T11:00:00Z",
    status: "Delivered",
    carrier: "DHL Express",
    trackingNumber: "DHL-88129031",
    dispatchedAt: "2026-03-18T10:00:00Z",
    deliveredAt: "2026-03-20T16:00:00Z",
    artisanNotes: "Delivered to client residence in Asokoro. Fitting confirmed exceptional.",
    createdAt: "2026-03-10T09:12:00Z",
    updatedAt: "2026-03-20T16:00:00Z"
  }
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAdminAuth();
  const { customerUser } = useCustomerAuth();

  // Purge legacy leaked order cache from localStorage if present
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_ORDERS_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Client-specific placed orders (Only orders placed in this browser session)
  const [clientOrders, setClientOrders] = useState<CustomerOrder[]>(() => {
    try {
      const stored = localStorage.getItem(CLIENT_ORDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse client orders:', e);
    }
    return [];
  });

  // Administrative orders state (Only loaded when an administrator is authenticated)
  const [adminOrders, setAdminOrders] = useState<CustomerOrder[]>(SEED_ORDERS);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState(false);

  // Synchronize client orders to local storage for their own session
  useEffect(() => {
    try {
      localStorage.setItem(CLIENT_ORDERS_KEY, JSON.stringify(clientOrders));
    } catch (e) {
      console.error('Failed to persist client orders:', e);
    }
  }, [clientOrders]);

  // Firestore Real-Time Orders Synchronization: STRICTLY restricted to authenticated admins
  useEffect(() => {
    if (!isFirebaseConfigured || !isAdmin) {
      setIsCloudSyncActive(false);
      return;
    }

    setIsCloudSyncActive(true);
    const unsubscribe = subscribeToOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setAdminOrders(cloudOrders);
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Context consumers receive adminOrders if authenticated as admin; otherwise only their own clientOrders
  const activeOrders = isAdmin ? adminOrders : clientOrders;

  const createOrder = (orderData: {
    customer: CustomerOrder['customer'];
    items: CartItem[];
    subtotalNGN: number;
    subtotalUSD: number;
    paymentMethod: CustomerOrder['paymentMethod'];
    paymentStatus?: CustomerOrder['paymentStatus'];
    paymentReference?: string;
  }): CustomerOrder => {
    const orderNum = `NS-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const newOrder: CustomerOrder = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      orderNumber: orderNum,
      customer: orderData.customer,
      items: orderData.items,
      subtotalNGN: orderData.subtotalNGN,
      subtotalUSD: orderData.subtotalUSD,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus || 'pending',
      paymentReference: orderData.paymentReference,
      status: 'Pending Confirmation',
      customerUid: customerUser?.uid || undefined,
      artisanNotes: 'Order received through atelier website. Awaiting workbench allocation.',
      createdAt: now,
      updatedAt: now
    };

    // Add to client's personal session orders
    setClientOrders(prev => [newOrder, ...prev]);

    // If an admin is creating the order, also update adminOrders state
    if (isAdmin) {
      setAdminOrders(prev => [newOrder, ...prev]);
    }

    // Only authorized atelier admins can create orders directly via Client SDK
    // Customer storefront commissions are strictly created server-side via /api/create-order
    if (isAdmin && isFirebaseConfigured) {
      saveOrderToFirestore(newOrder).catch(err => {
        console.warn('Could not sync admin-created order to Firestore:', err);
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string, 
    newStatus: OrderStatus, 
    trackingNumber?: string, 
    artisanNotes?: string,
    additionalUpdates?: Partial<CustomerOrder>
  ) => {
    const now = new Date().toISOString();
    const updateFn = (prev: CustomerOrder[]) =>
      prev.map(ord => {
        if (ord.id === orderId || ord.orderNumber === orderId) {
          const auditTrail = ord.auditTrail ? [...ord.auditTrail] : [];
          if (ord.status !== newStatus) {
            auditTrail.push({
              event: 'STATUS_TRANSITION',
              previousStatus: ord.status,
              newStatus,
              actorRole: isAdmin ? 'atelier_admin' : 'system',
              timestamp: now,
              note: artisanNotes || undefined
            });
          }

          return {
            ...ord,
            ...(additionalUpdates || {}),
            status: newStatus,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber,
            artisanNotes: artisanNotes !== undefined ? artisanNotes : ord.artisanNotes,
            auditTrail,
            updatedAt: now
          };
        }
        return ord;
      });

    setAdminOrders(updateFn);
    setClientOrders(updateFn);

    if (isFirebaseConfigured) {
      updateOrderStatusInFirestore(orderId, newStatus, trackingNumber, artisanNotes, additionalUpdates).catch(err => {
        console.warn('Could not update order status in Firestore:', err);
      });
    }
  };

  const updateOrder = (
    orderId: string,
    updates: Partial<CustomerOrder>,
    auditNote?: string
  ) => {
    const now = new Date().toISOString();
    const updateFn = (prev: CustomerOrder[]) =>
      prev.map(ord => {
        if (ord.id === orderId || ord.orderNumber === orderId) {
          const auditTrail = ord.auditTrail ? [...ord.auditTrail] : [];
          if (auditNote || updates.paymentStatus || updates.status) {
            auditTrail.push({
              event: updates.paymentStatus ? 'PAYMENT_UPDATE' : 'ORDER_UPDATE',
              previousStatus: ord.status,
              newStatus: updates.status || ord.status,
              previousPaymentStatus: ord.paymentStatus,
              newPaymentStatus: updates.paymentStatus || ord.paymentStatus,
              actorRole: isAdmin ? 'atelier_admin' : 'system',
              timestamp: now,
              note: auditNote
            });
          }

          return {
            ...ord,
            ...updates,
            auditTrail,
            updatedAt: now
          };
        }
        return ord;
      });

    setAdminOrders(updateFn);
    setClientOrders(updateFn);

    if (isFirebaseConfigured) {
      updateOrderStatusInFirestore(
        orderId, 
        updates.status || 'Pending Confirmation', 
        updates.trackingNumber, 
        updates.artisanNotes, 
        updates
      ).catch(err => {
        console.warn('Could not update order in Firestore:', err);
      });
    }
  };

  const getOrderByIdOrNumber = (idOrNumber: string): CustomerOrder | undefined => {
    const clean = idOrNumber.trim().toUpperCase();
    return activeOrders.find(
      o => o.id.toUpperCase() === clean || o.orderNumber.toUpperCase() === clean
    );
  };

  const deleteOrder = (orderId: string) => {
    setAdminOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));
    setClientOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));

    if (isFirebaseConfigured) {
      deleteOrderFromFirestore(orderId).catch(err => {
        console.warn('Could not delete order from Firestore:', err);
      });
    }
  };

  const resetOrders = () => {
    if (isAdmin) {
      setAdminOrders(SEED_ORDERS);
    } else {
      setClientOrders([]);
      localStorage.removeItem(CLIENT_ORDERS_KEY);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders: activeOrders,
        isCloudSyncActive,
        createOrder,
        updateOrderStatus,
        updateOrder,
        getOrderByIdOrNumber,
        deleteOrder,
        resetOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
