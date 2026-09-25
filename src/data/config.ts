/**
 * NELSON SHOES — Central Atelier Configuration
 * All contact details, social handles, WhatsApp routing, and brand statements
 * are managed here for effortless client customization.
 */

export const BRAND_CONFIG = {
  name: "NELSON SHOES",
  monogram: "N",
  legalName: "Nelson Bespoke Footwear Atelier",
  headline: "CRAFTED BEYOND ORDINARY.",
  tagline: "Bespoke footwear shaped by hand, defined by precision.",
  subtext: "Handcrafted in Nigeria for discerning connoisseurs who understand that true luxury lives in the details.",
  
  // Atelier & Direct Communications
  contact: {
    // Replace with Nelson's verified WhatsApp phone number with country code (e.g. +234XXXXXXXXXX)
    whatsappNumber: "+2348000000000",
    displayPhone: "+234 (0) 800 000 0000",
    email: "atelier@nelsonshoes.com",
    inquiriesEmail: "bespoke@nelsonshoes.com",
    workshopLocation: {
      city: "Lagos",
      country: "Nigeria",
      addressNote: "Private Atelier Consultations by Appointment",
      shippingNote: "Complimentary Worldwide Express Courier on Bespoke Commissions",
    },
    operatingHours: "Monday – Saturday: 09:00 – 18:00 WAT",
  },

  // Social Channels
  social: {
    // Primary verified social media channel
    tiktok: "https://www.tiktok.com/@_n_elson",
    tiktokHandle: "@_n_elson",
    instagram: "https://instagram.com/nelsonshoes",
    instagramHandle: "@nelsonshoes",
    twitter: "https://x.com/nelsonshoes",
  },

  // Navigation Links
  navigation: [
    { label: "COLLECTION", href: "/collection" },
    { label: "BESPOKE", href: "/bespoke" },
    { label: "THE CRAFT", href: "/craft" },
    { label: "ABOUT", href: "/about" },
    { label: "JOURNAL", href: "/journal" },
    { label: "GALLERY", href: "/gallery" },
    { label: "CONTACT", href: "/contact" },
  ],

  // Currency Formatter & Helper
  currency: {
    symbol: "₦",
    code: "NGN",
    usdRate: 0.00067, // Reference conversion
  }
};

/**
 * Generates an encrypted/clean WhatsApp direct chat URL with a contextual message.
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const cleanNumber = BRAND_CONFIG.contact.whatsappNumber.replace(/[^0-9]/g, '');
  const message = customMessage || 
    `Hello Nelson Atelier, I am interested in inquiring about a bespoke footwear commission.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Format Nigerian Naira with luxury styling (e.g., ₦245,000)
 */
export function formatCurrencyNGN(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

/**
 * Format USD equivalent
 */
export function formatCurrencyUSD(amountUSD: number): string {
  return `$${amountUSD.toLocaleString('en-US')}`;
}
