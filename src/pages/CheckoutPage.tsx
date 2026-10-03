import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Check, 
  MessageCircle, 
  CreditCard, 
  ShieldCheck, 
  Building2, 
  ArrowLeft,
  Truck,
  Sparkles,
  Loader2,
  Lock,
  Shield
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { formatCurrencyNGN, formatCurrencyUSD, BRAND_CONFIG, getWhatsAppUrl } from '../data/config';
import { launchPaystackPopup, isPaystackConfigured } from '../services/paystack';

export const CheckoutPage: React.FC = () => {
  const { items, totalItems, subtotalNGN, subtotalUSD, clearCart } = useCart();
  const { customerUser, profile } = useCustomerAuth();
  const navigate = useNavigate();

  const [shippingDetails, setShippingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneWhatsApp: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: '',
    deliveryMethod: 'dhl-express', // 'dhl-express' | 'atelier-pickup'
    paymentMethod: 'paystack-card', // 'whatsapp-concierge' | 'bank-transfer' | 'paystack-card'
    fittingNotes: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderReference, setOrderReference] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Prefill contact details from authenticated customer profile
  React.useEffect(() => {
    if (profile) {
      setShippingDetails(prev => ({
        ...prev,
        firstName: prev.firstName || profile.firstName || '',
        lastName: prev.lastName || profile.lastName || '',
        email: prev.email || profile.email || customerUser?.email || '',
        phoneWhatsApp: prev.phoneWhatsApp || profile.phoneWhatsApp || ''
      }));
    } else if (customerUser?.email) {
      setShippingDetails(prev => ({
        ...prev,
        email: prev.email || customerUser.email || ''
      }));
    }
  }, [profile, customerUser]);

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-40 pb-24 text-center px-6">
        <h1 className="font-serif text-3xl">NO ITEMS IN COMMISSION DOSSIER</h1>
        <p className="text-xs text-[#D8CBB8]/70 font-sans mt-2">
          Please add a creation to your bag before proceeding to order request.
        </p>
        <Link
          to="/collection"
          className="inline-block mt-4 px-6 py-3 bg-[#B89B5E] text-[#0A0A0A] text-xs uppercase tracking-widest font-semibold"
        >
          DISCOVER COLLECTION
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      // 1. Obtain verified Firebase ID token if customer is authenticated
      let authToken: string | undefined = undefined;
      if (customerUser) {
        try {
          authToken = await customerUser.getIdToken();
        } catch (tokErr) {
          console.warn('Could not retrieve customer ID token for checkout:', tokErr);
        }
      }

      // 2. Build sanitized order payload without client-authoritative financial values
      const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const orderPayload = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size,
          isBespokeFitting: item.isBespokeFitting,
          customNotes: item.customNotes
        })),
        customer: {
          firstName: shippingDetails.firstName.trim(),
          lastName: shippingDetails.lastName.trim(),
          email: shippingDetails.email.trim(),
          phoneWhatsApp: shippingDetails.phoneWhatsApp.trim(),
          address: shippingDetails.address.trim(),
          city: shippingDetails.city.trim(),
          state: shippingDetails.state.trim(),
          country: shippingDetails.country.trim() || 'Nigeria',
          deliveryMethod: shippingDetails.deliveryMethod,
          fittingNotes: shippingDetails.fittingNotes.trim() || undefined
        },
        currency: 'NGN',
        paymentMethod: shippingDetails.paymentMethod,
        idempotencyKey
      };

      // 3. Submit to server-authoritative order endpoint
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to place commission on atelier server.');
      }

      const authoritativeOrderNumber = result.orderNumber;
      const authoritativeAmountNGN = result.total;

      // 4. Handle Paystack flow (if selected)
      if (shippingDetails.paymentMethod === 'paystack-card') {
        try {
          await launchPaystackPopup({
            email: shippingDetails.email,
            amountNGN: authoritativeAmountNGN,
            orderNumber: authoritativeOrderNumber,
            customerName: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
            phone: shippingDetails.phoneWhatsApp,
            onSuccess: (ref: string) => {
              setPaymentReference(ref);
              setOrderReference(authoritativeOrderNumber);
              clearCart();
              setOrderPlaced(true);
              setIsProcessingPayment(false);
            },
            onClose: () => {
              // Order was created as pending on server
              setPaymentReference('Pending Payment');
              setOrderReference(authoritativeOrderNumber);
              clearCart();
              setOrderPlaced(true);
              setIsProcessingPayment(false);
            }
          });
        } catch (payErr) {
          console.error('Paystack popup error:', payErr);
          setOrderReference(authoritativeOrderNumber);
          clearCart();
          setOrderPlaced(true);
          setIsProcessingPayment(false);
        }
        return;
      }

      // Bank Transfer / WhatsApp Concierge wire
      setOrderReference(authoritativeOrderNumber);
      clearCart();
      setOrderPlaced(true);
      setIsProcessingPayment(false);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setIsProcessingPayment(false);
      setPaymentError(err.message || 'An unexpected error occurred while placing your commission. Please try again.');
    }
  };

  const generateWhatsAppOrderSummary = () => {
    let msg = `*NEW BESPOKE ORDER CONFIRMATION: ${orderReference}*\n`;
    msg += `------------------------------------\n`;
    msg += `*Client:* ${shippingDetails.firstName} ${shippingDetails.lastName}\n`;
    msg += `*WhatsApp:* ${shippingDetails.phoneWhatsApp}\n`;
    msg += `*Email:* ${shippingDetails.email}\n`;
    msg += `*Delivery Destination:* ${shippingDetails.city}, ${shippingDetails.country}\n`;
    msg += `*Delivery Method:* ${shippingDetails.deliveryMethod === 'dhl-express' ? 'Complimentary DHL Express' : 'Lagos Atelier Fitting Pickup'}\n`;
    msg += `*Payment Preference:* ${shippingDetails.paymentMethod === 'paystack-card' ? 'PAYSTACK CARD (PAID)' : shippingDetails.paymentMethod.toUpperCase()}\n`;
    if (paymentReference) {
      msg += `*Paystack Reference:* ${paymentReference}\n`;
    }
    if (shippingDetails.fittingNotes) {
      msg += `*Fit Notes:* ${shippingDetails.fittingNotes}\n`;
    }
    msg += `\n*COMMISSIONED ITEMS:*\n`;
    items.forEach((item, i) => {
      msg += `${i + 1}. ${item.product.name} (EU ${item.size}) x${item.quantity} - ₦${(item.product.priceNGN * item.quantity).toLocaleString('en-NG')}\n`;
    });
    msg += `\n*TOTAL:* ₦${subtotalNGN.toLocaleString('en-NG')} (~$${subtotalUSD.toLocaleString('en-US')})\n`;
    msg += `------------------------------------\n`;
    msg += paymentReference 
      ? `Hello Nelson Atelier, I have completed my order and settled payment via Paystack. Please schedule bench allocation.`
      : `Hello Nelson Atelier, I have initiated this order request on the website. Please confirm bench schedule and deposit details.`;
    return getWhatsAppUrl(msg);
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-6 md:pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-12">
        
        {/* Top Back Link */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#B89B5E] hover:text-[#F5F1E8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO COMMISSION BAG</span>
        </Link>

        {!orderPlaced ? (
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left: Client & Delivery Information */}
            <div className="lg:col-span-7 space-y-10">
              
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-medium block">
                  CLIENT DOSSIER
                </span>
                <h1 className="font-serif text-3xl md:text-4xl text-[#F5F1E8] font-light mt-1">
                  COMMISSION CHECKOUT
                </h1>
                <p className="text-xs text-[#D8CBB8]/70 font-sans mt-1">
                  Each pair is crafted to your individual size specifications and tracked at our Lagos atelier.
                </p>
              </div>

              {/* Error Notice */}
              {paymentError && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-200 text-xs rounded font-sans">
                  {paymentError}
                </div>
              )}

              {/* Personal Details */}
              <div className="space-y-4 font-sans text-xs">
                <h3 className="font-serif text-lg text-[#F5F1E8] border-b border-[#D8CBB8]/10 pb-2">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.firstName}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, firstName: e.target.value })}
                      className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.lastName}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, lastName: e.target.value })}
                      className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={shippingDetails.email}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                      className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 ..."
                      value={shippingDetails.phoneWhatsApp}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, phoneWhatsApp: e.target.value })}
                      className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="space-y-4 font-sans text-xs">
                <h3 className="font-serif text-lg text-[#F5F1E8] border-b border-[#D8CBB8]/10 pb-2">
                  2. Destination & Delivery Logistics
                </h3>
                
                <div>
                  <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Residential or office address"
                    value={shippingDetails.address}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                    className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.city}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                      className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">State / Province</label>
                    <input
                      type="text"
                      value={shippingDetails.state}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                      className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Country *</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.country}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, country: e.target.value })}
                      className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>
                </div>

                {/* Delivery Option Selection */}
                <div className="pt-2 space-y-2">
                  <label className="text-[11px] text-[#D8CBB8]/70 block">Select Delivery Option:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label 
                      onClick={() => setShippingDetails({ ...shippingDetails, deliveryMethod: 'dhl-express' })}
                      className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                        shippingDetails.deliveryMethod === 'dhl-express'
                          ? 'border-[#B89B5E] bg-[#161616]'
                          : 'border-[#D8CBB8]/15 bg-[#101010]'
                      }`}
                    >
                      <Truck className="w-5 h-5 text-[#B89B5E] shrink-0" />
                      <div>
                        <span className="font-semibold text-xs text-[#F5F1E8] block">
                          DHL Express Courier
                        </span>
                        <span className="text-[11px] text-[#B89B5E] block">
                          Complimentary Worldwide
                        </span>
                        <span className="text-[10px] text-[#D8CBB8]/50 block mt-0.5">
                          Door-to-door insured dispatch
                        </span>
                      </div>
                    </label>

                    <label 
                      onClick={() => setShippingDetails({ ...shippingDetails, deliveryMethod: 'atelier-pickup' })}
                      className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                        shippingDetails.deliveryMethod === 'atelier-pickup'
                          ? 'border-[#B89B5E] bg-[#161616]'
                          : 'border-[#D8CBB8]/15 bg-[#101010]'
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-[#B89B5E] shrink-0" />
                      <div>
                        <span className="font-semibold text-xs text-[#F5F1E8] block">
                          Atelier Fitting & Pickup
                        </span>
                        <span className="text-[11px] text-[#B89B5E] block">
                          Lagos Atelier
                        </span>
                        <span className="text-[10px] text-[#D8CBB8]/50 block mt-0.5">
                          Try on piece with the master shoemaker
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment Settlement Methods */}
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-[#D8CBB8]/10 pb-2">
                  <h3 className="font-serif text-lg text-[#F5F1E8]">
                    3. Payment Settlement Preference
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> 256-Bit Encrypted
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Paystack Card & Online Gateway (Featured) */}
                  <label 
                    onClick={() => setShippingDetails({ ...shippingDetails, paymentMethod: 'paystack-card' })}
                    className={`p-4 border cursor-pointer flex items-start gap-3.5 transition-all ${
                      shippingDetails.paymentMethod === 'paystack-card'
                        ? 'border-[#B89B5E] bg-[#161616] ring-1 ring-[#B89B5E]/50'
                        : 'border-[#D8CBB8]/15 bg-[#101010]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-[#B89B5E]/15 border border-[#B89B5E]/30 flex items-center justify-center shrink-0 mt-0.5 text-[#B89B5E]">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#F5F1E8] flex items-center gap-2">
                          <span>Paystack Secure Online Settlement</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#B89B5E]/20 text-[#B89B5E] font-mono border border-[#B89B5E]/30">
                            Instant
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {isPaystackConfigured ? 'Live Gateway' : 'Preview Sandbox'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#D8CBB8]/75 leading-relaxed">
                        Pay with debit/credit card (Mastercard, Visa, Verve), Apple Pay, or direct Nigerian Bank Transfer. Immediate confirmation reserves your bench slot.
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-[#D8CBB8]/50 font-mono">
                        <Lock className="w-3 h-3 text-[#B89B5E]" />
                        <span>Secured by Paystack • PCI-DSS Level 1 Certified</span>
                      </div>
                    </div>
                  </label>

                  {/* WhatsApp Direct Option */}
                  <label 
                    onClick={() => setShippingDetails({ ...shippingDetails, paymentMethod: 'whatsapp-concierge' })}
                    className={`p-4 border cursor-pointer flex items-start gap-3.5 transition-colors ${
                      shippingDetails.paymentMethod === 'whatsapp-concierge'
                        ? 'border-[#B89B5E] bg-[#161616]'
                        : 'border-[#D8CBB8]/15 bg-[#101010]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className="font-semibold text-xs text-[#F5F1E8] block">
                        Direct Atelier Concierge via WhatsApp
                      </span>
                      <p className="text-[11px] text-[#D8CBB8]/70 leading-relaxed">
                        Nelson reviews your fitting requirements directly, sends leather hide photos, and arranges bank wire after mutual consultation.
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer Wire Option */}
                  <label 
                    onClick={() => setShippingDetails({ ...shippingDetails, paymentMethod: 'bank-transfer' })}
                    className={`p-4 border cursor-pointer flex items-start gap-3.5 transition-colors ${
                      shippingDetails.paymentMethod === 'bank-transfer'
                        ? 'border-[#B89B5E] bg-[#161616]'
                        : 'border-[#D8CBB8]/15 bg-[#101010]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-[#181818] border border-[#D8CBB8]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#D8CBB8]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className="font-semibold text-xs text-[#F5F1E8] block">
                        Official Nigerian Corporate Bank Wire Transfer
                      </span>
                      <p className="text-[11px] text-[#D8CBB8]/70 leading-relaxed">
                        Official invoice with GTBank / Zenith Bank atelier coordinates issued upon commission approval.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-2 pt-6 border-t border-[#D8CBB8]/10 font-sans text-xs">
                <label className="text-[11px] text-[#D8CBB8]/70 block">
                  Additional Fitting Instructions / Monogram Requests
                </label>
                <textarea
                  rows={3}
                  value={shippingDetails.fittingNotes}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, fittingNotes: e.target.value })}
                  placeholder="e.g. Please engrave initials 'N.E.' inside oak waist. High instep on right foot."
                  className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.25em] uppercase hover:bg-[#D4BD86] transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
                      <span>INITIALIZING SECURE PAYSTACK GATEWAY...</span>
                    </>
                  ) : shippingDetails.paymentMethod === 'paystack-card' ? (
                    <>
                      <Lock className="w-4 h-4 text-[#0A0A0A]" />
                      <span>PAY ₦{subtotalNGN.toLocaleString('en-NG')} WITH PAYSTACK</span>
                    </>
                  ) : (
                    <span>TRANSMIT COMMISSION DOSSIER</span>
                  )}
                </button>
              </div>

            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5 bg-[#121212] border border-[#B89B5E]/30 p-6 md:p-8 space-y-6 sticky top-36">
              <h2 className="font-serif text-xl text-[#F5F1E8] border-b border-[#D8CBB8]/10 pb-4">
                COMMISSION DOSSIER ({totalItems})
              </h2>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-2 no-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-[#D8CBB8]/10 text-xs font-sans">
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      className="w-14 h-16 object-cover bg-[#181818] border border-[#D8CBB8]/10 shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-serif text-sm text-[#F5F1E8]">{item.product.name}</h4>
                      <p className="text-[#D8CBB8]/60 text-[11px]">Size EU {item.size} • Qty {item.quantity}</p>
                      <p className="text-[#B89B5E] text-[10px]">
                        {item.isBespokeFitting ? "Custom Last Fitting" : "Standard Last"}
                      </p>
                    </div>
                    <span className="font-serif text-sm text-[#F5F1E8]">
                      {formatCurrencyNGN(item.product.priceNGN * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-xs font-sans text-[#D8CBB8]/75 border-t border-[#D8CBB8]/10 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#F5F1E8] font-medium">{formatCurrencyNGN(subtotalNGN)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worldwide Courier</span>
                  <span className="text-[#B89B5E] font-medium">Complimentary</span>
                </div>
                <div className="border-t border-[#D8CBB8]/10 pt-3 flex items-baseline justify-between">
                  <span className="font-semibold text-sm text-[#F5F1E8]">ESTIMATED TOTAL</span>
                  <div className="text-right">
                    <span className="font-serif text-2xl text-[#F5F1E8] block">
                      {formatCurrencyNGN(subtotalNGN)}
                    </span>
                    <span className="text-[10px] text-[#D8CBB8]/50 block">
                      ≈ {formatCurrencyUSD(subtotalUSD)} USD
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-[#D8CBB8]/50 font-sans space-y-1">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B89B5E]" /> Hand-inspected and constructed strictly to order
                </p>
                <p>Private client consultation will follow to confirm bench dates.</p>
              </div>
            </div>

          </form>
        ) : (
          /* Confirmation Screen */
          <div className="max-w-2xl mx-auto bg-[#121212] border border-[#B89B5E]/40 p-8 md:p-14 text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 border-2 border-[#B89B5E] mx-auto flex items-center justify-center bg-[#181818]">
              <Check className="w-8 h-8 text-[#B89B5E]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-medium">
                COMMISSION DOSSIER TRANSMITTED
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F1E8]">
                THANK YOU, {shippingDetails.firstName.toUpperCase()}
              </h2>
              <p className="text-xs text-[#B89B5E] font-mono">
                REFERENCE: {orderReference}
              </p>
            </div>

            {/* Paystack Settlement Badge */}
            {paymentReference && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded text-left space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>PAYMENT SETTLED VIA PAYSTACK GATEWAY</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-[#D8CBB8] pt-1">
                  <div>
                    <span className="text-[#D8CBB8]/50 block">Transaction Reference:</span>
                    <span className="text-[#F5F1E8] font-bold truncate block">{paymentReference}</span>
                  </div>
                  <div>
                    <span className="text-[#D8CBB8]/50 block">Settlement Status:</span>
                    <span className="text-emerald-300 font-bold block">PAID • BENCH SLOT RESERVED</span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-[#D8CBB8]/75 font-sans leading-relaxed">
              Your bespoke commission request has been received by Nelson Atelier. Click below to transmit the order dossier directly to Nelson on WhatsApp for immediate confirmation and bench slot reservation.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={generateWhatsAppOrderSummary()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>CONFIRM ORDER ON WHATSAPP</span>
              </a>

              <Link
                to={`/track?order=${orderReference}`}
                className="w-full sm:w-auto px-6 py-4 bg-[#181818] border border-[#B89B5E]/60 text-[#B89B5E] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#B89B5E] hover:text-[#0A0A0A] transition-colors flex items-center justify-center gap-2"
              >
                <span>TRACK ORDER LIVE</span>
              </Link>

              <button
                onClick={() => {
                  navigate('/collection');
                }}
                className="w-full sm:w-auto px-6 py-4 bg-transparent border border-[#D8CBB8]/20 text-xs tracking-[0.2em] uppercase text-[#D8CBB8] hover:text-[#F5F1E8]"
              >
                RETURN TO COLLECTION
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutPage;
