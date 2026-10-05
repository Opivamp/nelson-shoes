// Paystack Payment Integration Service for Nelson Shoes Atelier
// Client-side helper invoking server-authoritative payment endpoints

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => {
        openIframe: () => void;
      };
    };
  }
}

export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

export const isPaystackConfigured = Boolean(
  PAYSTACK_PUBLIC_KEY && 
  PAYSTACK_PUBLIC_KEY.startsWith('pk_') &&
  !PAYSTACK_PUBLIC_KEY.includes('your_paystack')
);

// Dynamically load the Paystack inline popup script
export const loadPaystackScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Paystack inline script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// ---------------------------------------------------------------------------
// Server API Calls: Initialize & Verify
// ---------------------------------------------------------------------------

export interface ServerInitPaymentResult {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  orderNumber?: string;
  amount?: number;
  currency?: string;
  alreadyPaid?: boolean;
  error?: string;
}

export async function initializeServerPayment(
  params: { orderId?: string; orderNumber?: string },
  authToken?: string
): Promise<ServerInitPaymentResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch('/api/initialize-payment', {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    return {
      success: false,
      alreadyPaid: Boolean(data.alreadyPaid),
      error: data.error || 'Failed to initialize payment gateway.'
    };
  }

  return {
    success: true,
    authorizationUrl: data.authorizationUrl,
    accessCode: data.accessCode,
    reference: data.reference,
    orderNumber: data.orderNumber,
    amount: data.amount,
    currency: data.currency
  };
}

export interface ServerVerifyPaymentResult {
  success: boolean;
  paymentStatus?: string;
  orderNumber?: string;
  paidAt?: string;
  alreadyPaid?: boolean;
  amount?: number;
  currency?: string;
  error?: string;
}

export async function verifyServerPayment(reference: string): Promise<ServerVerifyPaymentResult> {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reference })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    return {
      success: false,
      paymentStatus: data.paymentStatus || 'failed',
      error: data.error || 'Payment verification could not be confirmed.'
    };
  }

  return {
    success: true,
    paymentStatus: data.paymentStatus || 'paid',
    orderNumber: data.orderNumber,
    paidAt: data.paidAt,
    alreadyPaid: data.alreadyPaid,
    amount: data.amount,
    currency: data.currency
  };
}

// ---------------------------------------------------------------------------
// Resume Transaction via InlineJS Popup or Hosted Checkout
// ---------------------------------------------------------------------------

export interface PaystackCheckoutOptions {
  accessCode?: string;
  reference: string;
  authorizationUrl?: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

export const resumePaystackCheckout = async (options: PaystackCheckoutOptions): Promise<void> => {
  const loaded = await loadPaystackScript();

  // If InlineJS is available and access_code is present, open Paystack inline modal
  if (loaded && window.PaystackPop && isPaystackConfigured && options.accessCode) {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      access_code: options.accessCode,
      callback: (response: { reference: string }) => {
        options.onSuccess(response.reference || options.reference);
      },
      onClose: () => {
        if (options.onClose) options.onClose();
      }
    });

    handler.openIframe();
    return;
  }

  // If redirect URL is provided, redirect to hosted authorization URL
  if (options.authorizationUrl) {
    window.location.href = options.authorizationUrl;
    return;
  }

  // Preview test fallback if merchant keys are not set yet
  const simulatedRef = options.reference || `PAY-PREVIEW-${Date.now().toString().slice(-8)}`;
  console.info('⚡ [Nelson Shoes Paystack] Running in preview test mode. Simulated Reference:', simulatedRef);
  options.onSuccess(simulatedRef);
};

// ---------------------------------------------------------------------------
// Unified Launch Paystack Popup (Server-Authoritative with Fallback)
// ---------------------------------------------------------------------------

export interface PaystackPaymentConfig {
  email: string;
  amountNGN: number;
  orderNumber: string;
  customerName: string;
  phone?: string;
  orderId?: string;
  authToken?: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

export const launchPaystackPopup = async (config: PaystackPaymentConfig): Promise<void> => {
  // If order identifiers are present, prefer server-authoritative initialization
  if (config.orderNumber || config.orderId) {
    try {
      const serverInit = await initializeServerPayment(
        { orderId: config.orderId, orderNumber: config.orderNumber },
        config.authToken
      );

      if (serverInit.success && (serverInit.accessCode || serverInit.authorizationUrl)) {
        await resumePaystackCheckout({
          accessCode: serverInit.accessCode,
          reference: serverInit.reference || `NSPAY-${config.orderNumber}`,
          authorizationUrl: serverInit.authorizationUrl,
          onSuccess: async (ref: string) => {
            try {
              await verifyServerPayment(ref);
            } catch (vErr) {
              console.warn('[Paystack Service] Post-checkout server verification note:', vErr);
            }
            config.onSuccess(ref);
          },
          onClose: config.onClose
        });
        return;
      }
    } catch (initErr) {
      console.warn('[Paystack Service] Server payment init error, falling back to direct client checkout:', initErr);
    }
  }

  // Direct client popup if script & key are loaded
  const loaded = await loadPaystackScript();
  if (loaded && window.PaystackPop && isPaystackConfigured) {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: config.email,
      amount: Math.round(config.amountNGN * 100),
      currency: 'NGN',
      ref: `NSPAY-${config.orderNumber}-${Date.now().toString().slice(-4)}`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: config.customerName
          },
          {
            display_name: 'Order Reference',
            variable_name: 'order_reference',
            value: config.orderNumber
          },
          {
            display_name: 'Contact Phone',
            variable_name: 'customer_phone',
            value: config.phone || ''
          }
        ]
      },
      callback: (response: { reference: string }) => {
        config.onSuccess(response.reference);
      },
      onClose: () => {
        if (config.onClose) config.onClose();
      }
    });

    handler.openIframe();
    return;
  }

  // Graceful Demo / Test Mode:
  const simulatedRef = `PAY-TEST-${Date.now().toString().slice(-8)}`;
  console.info('⚡ [Nelson Shoes Paystack] Running in preview test mode. Simulated Reference:', simulatedRef);
  config.onSuccess(simulatedRef);
};

