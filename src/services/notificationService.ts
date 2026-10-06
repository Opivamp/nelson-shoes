import type { CustomerOrder, BespokeInquiryDocument } from '../types';
import { BRAND_CONFIG, formatCurrencyNGN, formatCurrencyUSD } from '../data/config';

export type NotificationEvent =
  | 'ORDER_CREATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'ORDER_ENTERED_PRODUCTION'
  | 'QUALITY_INSPECTION_COMPLETE'
  | 'ORDER_DISPATCHED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'BESPOKE_INQUIRY_SUBMITTED'
  | 'BESPOKE_INQUIRY_REVIEWED'
  | 'BESPOKE_DETAILS_REQUESTED'
  | 'BESPOKE_QUOTE_READY'
  | 'BESPOKE_QUOTE_APPROVED'
  | 'BESPOKE_DEPOSIT_CONFIRMED'
  | 'BESPOKE_PRODUCTION_STARTED'
  | 'BESPOKE_COMPLETED'
  | 'BESPOKE_CANCELLED';

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
        if (BRAND_CONFIG.bankTransfer.isLive) {
          msg += `Bank: ${BRAND_CONFIG.bankTransfer.bankName}\n`;
          msg += `Account Name: ${BRAND_CONFIG.bankTransfer.accountName}\n`;
          msg += `Account Number: ${BRAND_CONFIG.bankTransfer.accountNumber}\n`;
        } else {
          msg += `Treasury coordinates currently pending verification.\nPlease contact Concierge via WhatsApp to receive direct settlement coordinates.\n`;
        }
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

    default: {
      return `*NELSON BESPOKE ATELIER UPDATE*\n\nDear ${clientName},\nYour commission dossier ${orderRef} has an atelier status update.\nTrack anytime at: https://nelson-shoes.vercel.app/track?order=${orderRef}\n`;
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

/**
 * Formats bespoke commission notifications for direct WhatsApp dialogues.
 */
export function formatBespokeNotificationMessage(
  event: NotificationEvent,
  inquiry: Partial<BespokeInquiryDocument> & { id: string; customerName: string; specifications?: any; quotation?: any }
): string {
  const patronName = inquiry.customerName || 'Valued Patron';
  const refCode = inquiry.inquiryReference || inquiry.id.slice(0, 8).toUpperCase();
  const silhouette = inquiry.specifications?.silhouette || 'Bespoke Footwear';

  switch (event) {
    case 'BESPOKE_INQUIRY_SUBMITTED':
      return `*NELSON ATELIER — BESPOKE INQUIRY RECEIVED*\n\nDear ${patronName},\nYour bespoke dossier *#${refCode}* (${silhouette}) has been received by our master cordwainers. We will review your anatomical notes and reach out for fitting calibrations.\n\nNelson Atelier Concierge`;

    case 'BESPOKE_QUOTE_READY': {
      const amount = inquiry.quotation?.amountNGN ? formatCurrencyNGN(inquiry.quotation.amountNGN) : 'Quotation Ready';
      return `*NELSON ATELIER — BESPOKE QUOTATION ISSUED*\n\nDear ${patronName},\nYour official commission quotation for *#${refCode}* (${silhouette}) is ready: ${amount}.\nPlease review and approve terms in your Customer Portal: https://nelson-shoes.vercel.app/account/bespoke/${inquiry.id}\n\nNelson Atelier Concierge`;
    }

    case 'BESPOKE_QUOTE_APPROVED':
      return `*NELSON ATELIER — COMMISSION QUOTATION APPROVED*\n\nDear ${patronName},\nThank you for approving the terms for *#${refCode}*. Bench deposit allocation is now active.\n\nNelson Atelier Concierge`;

    case 'BESPOKE_DEPOSIT_CONFIRMED':
      return `*NELSON ATELIER — BENCH DEPOSIT CONFIRMED*\n\nDear ${patronName},\nDeposit for *#${refCode}* has been verified. Beechwood block carving and leather clicking are now commencing.\n\nNelson Atelier Concierge`;

    case 'BESPOKE_PRODUCTION_STARTED':
      return `*NELSON ATELIER — AT WORKBENCH*\n\nDear ${patronName},\nYour commission *#${refCode}* is actively being lasted and hand-welted by our master artisan.\n\nNelson Atelier Concierge`;

    case 'BESPOKE_COMPLETED':
      return `*NELSON ATELIER — COMMISSION COMPLETED*\n\nDear ${patronName},\nYour bespoke pair *#${refCode}* is glazed, inspected, and ready for delivery/fitting lounge collection.\n\nNelson Atelier Concierge`;

    case 'BESPOKE_CANCELLED':
      return `*NELSON ATELIER — COMMISSION NOTICE*\n\nDear ${patronName},\nYour bespoke inquiry *#${refCode}* has been cancelled. Please contact concierge if this was in error.\n\nNelson Atelier Concierge`;

    default:
      return `*NELSON ATELIER — COMMISSION UPDATE*\n\nDear ${patronName},\nUpdate regarding your bespoke inquiry *#${refCode}*.\n\nNelson Atelier Concierge`;
  }
}

export function generateBespokeWhatsAppUrl(
  event: NotificationEvent,
  inquiry: Partial<BespokeInquiryDocument> & { id: string; customerName: string; customerPhone?: string }
): string {
  const message = formatBespokeNotificationMessage(event, inquiry as any);
  const targetPhone = inquiry.customerPhone 
    ? inquiry.customerPhone.replace(/[^0-9]/g, '') 
    : BRAND_CONFIG.contact.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}
