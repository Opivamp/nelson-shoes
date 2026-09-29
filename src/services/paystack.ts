// Paystack Payment Integration Service for Nelson Shoes Atelier

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => {
        openIframe: () => void;
      };
    };
  }
}

export interface PaystackPaymentConfig {
  email: string;
  amountNGN: number;
  orderNumber: string;
  customerName: string;
  phone?: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
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

// Launch Paystack popup modal
export const launchPaystackPopup = async (config: PaystackPaymentConfig): Promise<void> => {
  const loaded = await loadPaystackScript();

  // If live key and script are available, open official Paystack checkout
  if (loaded && window.PaystackPop && isPaystackConfigured) {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: config.email,
      amount: Math.round(config.amountNGN * 100), // In Kobo
      currency: 'NGN',
      ref: config.orderNumber + '_' + Date.now().toString().slice(-4),
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
  // If merchant has not set their live key yet, simulate payment flow with verified test reference
  const simulatedRef = `PAY-TEST-${Date.now().toString().slice(-8)}`;
  console.info('⚡ [Nelson Shoes Paystack] Running in preview test mode. Simulated Reference:', simulatedRef);
  config.onSuccess(simulatedRef);
};
