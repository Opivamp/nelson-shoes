import type { CustomerOrder } from '../types';
import { BRAND_CONFIG, formatCurrencyNGN, formatCurrencyUSD } from '../data/config';

export type NotificationEvent =
  | 'ORDER_CREATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'ORDER_ENTERED_PRODUCTION'
  | 'QUALITY_INSPECTION_COMPLETE'
  | 'ORDER_DISPATCHED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED';

export interface NotificationPayload {
  event: NotificationEvent;
  orderNumber: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  subject: string;
  message: string;
  timestamp: string;
}

export interface NotificationDispatchResult {
  success: boolean;
  channel: 'whatsapp' | 'email_queued' | 'log_only';
  actionUrl?: string;
  message: string;
}

/**
 * Builds standard, luxury Nelson Shoes WhatsApp notification messages
 * formatted specifically for client direct communications.
 */
export function formatCustomerNotificationMessage(
  event: NotificationEvent,
  order: CustomerOrder
): string {
  const clientName = `${order.customer.firstName} ${order.customer.lastName}`.trim();
  const orderRef = order.orderNumber;
  const isDHL = order.customer.deliveryMethod === 'dhl-express';

  switch (event) {
    case 'ORDER_CREATED': {
      let msg = `*NELSON BESPOKE ATELIER — COMMISSION DOSSIER RECEIVED*\n\n`;
      msg += `Dear ${clientName},\n`;
      msg += `Thank you for commissioning Nelson Shoes. Your order dossier (*${orderRef}*) has been recorded.\n\n`;
      msg += `*Selected Creation(s):*\n`;
      order.items.forEach((item, idx) => {
        msg += `${idx + 1}. ${item.product.name} (EU ${item.size}) x${item.quantity}\n`;
      });
      msg += `\n*Fulfillment Preference:* ${isDHL ? 'DHL Express Courier' : 'Lagos Atelier Pickup'}\n`;
      msg += `*Payment Method:* ${order.paymentMethod.toUpperCase()}\n`;
      msg += `*Payment Status:* ${order.paymentStatus.toUpperCase()}\n\n`;
      if (order.paymentMethod === 'bank-transfer' && order.paymentStatus === 'pending') {
        msg += `*Bank Transfer Instructions:*\n`;
        msg += `Bank: ${BRAND_CONFIG.bankTransfer.bankName}\n`;
        msg += `Account Name: ${BRAND_CONFIG.bankTransfer.accountName}\n`;
        msg += `Account Number: ${BRAND_CONFIG.bankTransfer.accountNumber}\n`;
        msg += `Reference: ${orderRef}\n\n`;
      }
      msg += `Track progress anytime at: https://nelson-shoes.vercel.app/track?order=${orderRef}\n`;
      return msg;
    }

    case 'PAYMENT_CONFIRMED': {
      let msg = `*NELSON BESPOKE ATELIER — PAYMENT SETTLED*\n\n`;
      msg += `Dear ${clientName},\n`;
      msg += `We have confirmed settlement for commission *${orderRef}*.\n`;
      if (order.paymentReference) {
        msg += `Treasury Reference: ${order.paymentReference}\n`;
      }
      msg += `Your pair has been scheduled for beechwood last calibration and hand-clicking.\n\n`;
      msg += `Track workbench progress at: https://nelson-shoes.vercel.app/track?order=${orderRef}\n`;
      return msg;
    }

    case 'PAYMENT_FAILED': {
      let msg = `*NELSON BESPOKE ATELIER — PAYMENT NOTICE*\n\n`;
      msg += `Dear ${clientName},\n`;
      msg += `We were unable to complete payment verification for commission *${orderRef}*.\n`;
      msg += `Your dossier remains safely preserved in our system. You may retry your payment online or contact our concierge for assistance.\n\n`;
      msg += `Atelier Inquiries: ${BRAND_CONFIG.contact.email}\n`;
      return msg;
    }

    case 'ORDER_ENTERED_PRODUCTION': {
      let msg = `*NELSON BESPOKE ATELIER — WORKBENCH ALLOCATION*\n\n`;
      msg += `Dear ${clientName},\n`;
      msg += `Your commission *${orderRef}* has officially moved to the cordwainer workbench.\n`;
      msg += `Stage: *Last Selected & Leather Cut*\n`;
      if (order.artisanNotes) {
        msg += `Artisan Log: "${order.artisanNotes}"\n`;
      }
      msg += `\nTrack your pair live: https://nelson-shoes.vercel.app/track?order=${orderRef}\n`;
      return msg;
    }

    case 'QUALITY_INSPECTION_COMPLETE': {
      let msg = `*NELSON BESPOKE ATELIER — QUALITY INSPECTION COMPLETE*\n\n`;
      msg += `Dear ${clientName},\n`;
      msg += `Master Cordwainer Nelson has completed the structural assessment and hand-burnished glacage inspection for order *${orderRef}*.\n`;
      msg += `Your pair has passed cordwainer certification and is now staged for dispatch.\n\n`;
      msg += `Track status: https://nelson-shoes.vercel.app/track?order=${orderRef}\n`;
      return msg;
    }

    case 'ORDER_DISPATCHED': {
      let msg = `*NELSON BESPOKE ATELIER — DISPATCH CONFIRMATION*\n\n`;
      msg += `Dear ${clientName},\n`;
      msg += `Your bespoke commission *${orderRef}* has been dispatched.\n\n`;
      if (isDHL) {
        msg += `*Carrier:* DHL Express Worldwide\n`;
        msg += `*Tracking Reference:* ${order.trackingNumber || 'Pending Courier Scan'}\n`;
      } else {
        msg += `*Collection Method:* Lagos Atelier Fitting Pickup\n`;
        msg += `*Address:* ${BRAND_CONFIG.contact.workshopLocation.city}, ${BRAND_CONFIG.contact.workshopLocation.country}\n`;
      }
      msg += `\nView live transit details: https://nelson-shoes.vercel.app/track?order=${orderRef}\n`;
      return msg;
    }

    case 'ORDER_DELIVERED': {
      let msg = `*NELSON BESPOKE ATELIER — COMMISSION DELIVERED*\n\n`;
      msg += `Dear ${clientName},\n`;
      msg += `Your bespoke footwear *${orderRef}* has been safely delivered.\n`;
      msg += `Your lifetime atelier care is now active. May each step reflect distinction.\n\n`;
      msg += `Warm regards,\nNelson Bespoke Atelier\n`;
      return msg;
    }

    case 'ORDER_CANCELLED': {
      let msg = `*NELSON BESPOKE ATELIER — COMMISSION CANCELLED*\n\n`;
      msg += `Dear ${clientName},\n`;
      msg += `Your commission *${orderRef}* has been cancelled.\n`;
      if (order.cancellationReason) {
        msg += `Reason: ${order.cancellationReason}\n`;
      }
      msg += `Please contact our atelier concierge with any questions.\n`;
      return msg;
    }
  }
}

/**
 * Generates an encrypted/clean WhatsApp direct chat URL for the customer
 * using the customer's phone number if international, or atelier concierge.
 */
export function generateWhatsAppNotificationUrl(
  event: NotificationEvent,
  order: CustomerOrder,
  recipient: 'customer' | 'concierge' = 'customer'
): string {
  const message = formatCustomerNotificationMessage(event, order);

  let targetPhone = '';
  if (recipient === 'customer' && order.customer.phoneWhatsApp) {
    targetPhone = order.customer.phoneWhatsApp.replace(/[^0-9]/g, '');
  }

  // Fallback to atelier concierge if customer phone is not available
  if (!targetPhone) {
    targetPhone = BRAND_CONFIG.contact.whatsappNumber.replace(/[^0-9]/g, '');
  }

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Extensible customer notification dispatcher.
 * Prepares the structured message payload and returns a ready-to-use WhatsApp action URL.
 */
export async function dispatchCustomerNotification(
  event: NotificationEvent,
  order: CustomerOrder
): Promise<NotificationDispatchResult> {
  const message = formatCustomerNotificationMessage(event, order);
  const actionUrl = generateWhatsAppNotificationUrl(event, order, 'customer');

  // Log dispatch event for auditing
  console.log(`[Notification Dispatch] Event '${event}' for Order ${order.orderNumber}`);

  return {
    success: true,
    channel: 'whatsapp',
    actionUrl,
    message
  };
}
