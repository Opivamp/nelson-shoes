import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CustomerOrder, OrderStatus, CartItem } from '../types';

interface OrderContextType {
  orders: CustomerOrder[];
  createOrder: (orderData: {
    customer: CustomerOrder['customer'];
    items: CartItem[];
    subtotalNGN: number;
    subtotalUSD: number;
    paymentMethod: CustomerOrder['paymentMethod'];
    paymentStatus?: CustomerOrder['paymentStatus'];
  }) => CustomerOrder;
  updateOrderStatus: (
    orderId: string, 
    newStatus: OrderStatus, 
    trackingNumber?: string, 
    artisanNotes?: string
  ) => void;
  getOrderByIdOrNumber: (idOrNumber: string) => CustomerOrder | undefined;
  deleteOrder: (orderId: string) => void;
  resetOrders: () => void;
}

const ORDERS_STORAGE_KEY = 'nelson_shoes_orders_v2';

// Realistic initial seed orders so the admin dashboard is immediately active and impressive
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
    paymentMethod: "paystack-card",
    paymentStatus: "paid",
    status: "At Workbench (Lasting)",
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
    paymentMethod: "bank-transfer",
    paymentStatus: "paid",
    status: "Delivered",
    trackingNumber: "DHL-88129031",
    artisanNotes: "Delivered to client residence in Asokoro. Fitting confirmed exceptional.",
    createdAt: "2026-03-10T09:12:00Z",
    updatedAt: "2026-03-20T16:00:00Z"
  }
];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    try {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse orders:', e);
    }
    return SEED_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to persist orders:', e);
    }
  }, [orders]);

  const createOrder = (orderData: {
    customer: CustomerOrder['customer'];
    items: CartItem[];
    subtotalNGN: number;
    subtotalUSD: number;
    paymentMethod: CustomerOrder['paymentMethod'];
    paymentStatus?: CustomerOrder['paymentStatus'];
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
      status: 'Pending Confirmation',
      artisanNotes: 'Order received through atelier website. Awaiting workbench allocation.',
      createdAt: now,
      updatedAt: now
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string, 
    newStatus: OrderStatus, 
    trackingNumber?: string, 
    artisanNotes?: string
  ) => {
    const now = new Date().toISOString();
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId || ord.orderNumber === orderId) {
          return {
            ...ord,
            status: newStatus,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber,
            artisanNotes: artisanNotes !== undefined ? artisanNotes : ord.artisanNotes,
            updatedAt: now
          };
        }
        return ord;
      })
    );
  };

  const getOrderByIdOrNumber = (idOrNumber: string): CustomerOrder | undefined => {
    const clean = idOrNumber.trim().toUpperCase();
    return orders.find(
      o => o.id.toUpperCase() === clean || o.orderNumber.toUpperCase() === clean
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId && o.orderNumber !== orderId));
  };

  const resetOrders = () => {
    setOrders(SEED_ORDERS);
    localStorage.removeItem(ORDERS_STORAGE_KEY);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
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
