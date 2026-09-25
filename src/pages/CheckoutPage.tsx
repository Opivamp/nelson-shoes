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
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrencyNGN, formatCurrencyUSD, BRAND_CONFIG, getWhatsAppUrl } from '../data/config';

export const CheckoutPage: React.FC = () => {
  const { items, totalItems, subtotalNGN, subtotalUSD, clearCart } = useCart();
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
    paymentMethod: 'whatsapp-concierge', // 'whatsapp-concierge' | 'bank-transfer' | 'paystack-card'
    fittingNotes: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderReference, setOrderReference] = useState('');

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

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `NS-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderReference(ref);
    setOrderPlaced(true);
    // Keep items in view or clear after confirmation
  };

  const generateWhatsAppOrderSummary = () => {
    let msg = `*NEW BESPOKE ORDER CONFIRMATION: ${orderReference}*\n`;
    msg += `------------------------------------\n`;
    msg += `*Client:* ${shippingDetails.firstName} ${shippingDetails.lastName}\n`;
    msg += `*WhatsApp:* ${shippingDetails.phoneWhatsApp}\n`;
    msg += `*Email:* ${shippingDetails.email}\n`;
    msg += `*Delivery Destination:* ${shippingDetails.city}, ${shippingDetails.country}\n`;
    msg += `*Delivery Method:* ${shippingDetails.deliveryMethod === 'dhl-express' ? 'Complimentary DHL Express' : 'Lagos Atelier Fitting Pickup'}\n`;
    msg += `*Payment Preference:* ${shippingDetails.paymentMethod.toUpperCase()}\n`;
    if (shippingDetails.fittingNotes) {
      msg += `*Fit Notes:* ${shippingDetails.fittingNotes}\n`;
    }
    msg += `\n*COMMISSIONED ITEMS:*\n`;
    items.forEach((item, i) => {
      msg += `${i + 1}. ${item.product.name} (EU ${item.size}) x${item.quantity} - ₦${(item.product.priceNGN * item.quantity).toLocaleString('en-NG')}\n`;
    });
    msg += `\n*TOTAL:* ₦${subtotalNGN.toLocaleString('en-NG')} (~$${subtotalUSD.toLocaleString('en-US')})\n`;
    msg += `------------------------------------\n`;
    msg += `Hello Nelson Atelier, I have initiated this order request on the website. Please confirm bench schedule and deposit details.`;
    return getWhatsAppUrl(msg);
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
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
              
              <div className="space-y-2 border-b border-[#D8CBB8]/15 pb-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-medium block">
                  BESPOKE CHECKOUT
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F1E8]">
                  ORDER REQUEST & DELIVERY DOSSIER
                </h1>
                <p className="text-xs text-[#D8CBB8]/70 font-sans">
                  Provide your destination and fitting specifications. No immediate card charge is made; Nelson Atelier reviews and confirms each bespoke commission individually.
                </p>
              </div>

              {/* Client Contact */}
              <div className="space-y-4 font-sans text-xs">
                <h2 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold">
                  01. CLIENT CONTACT
                </h2>
                
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
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="text"
                      required
                      value={shippingDetails.phoneWhatsApp}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, phoneWhatsApp: e.target.value })}
                      placeholder="+234 or Country Code"
                      className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="space-y-4 pt-6 border-t border-[#D8CBB8]/10 font-sans text-xs">
                <h2 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold">
                  02. DELIVERY DESTINATION
                </h2>

                <div>
                  <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
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

              {/* Payment Architecture Options */}
              <div className="space-y-4 pt-6 border-t border-[#D8CBB8]/10 font-sans text-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold">
                    03. COMMISSION SETTLEMENT METHOD
                  </h2>
                  <span className="text-[10px] text-[#B89B5E] uppercase tracking-wider">
                    Secure Atelier Process
                  </span>
                </div>

                <div className="space-y-3">
                  {/* WhatsApp Direct Option */}
                  <label 
                    onClick={() => setShippingDetails({ ...shippingDetails, paymentMethod: 'whatsapp-concierge' })}
                    className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                      shippingDetails.paymentMethod === 'whatsapp-concierge'
                        ? 'border-[#B89B5E] bg-[#161616]'
                        : 'border-[#D8CBB8]/15 bg-[#101010]'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5 text-[#B89B5E] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-semibold text-xs text-[#F5F1E8] block">
                        Direct Atelier Concierge via WhatsApp (Recommended)
                      </span>
                      <p className="text-[11px] text-[#D8CBB8]/70 leading-relaxed">
                        Nelson reviews your fitting requirements directly, sends leather hide photos, and arranges bank wire or card link after mutual consultation.
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer Wire Option */}
                  <label 
                    onClick={() => setShippingDetails({ ...shippingDetails, paymentMethod: 'bank-transfer' })}
                    className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                      shippingDetails.paymentMethod === 'bank-transfer'
                        ? 'border-[#B89B5E] bg-[#161616]'
                        : 'border-[#D8CBB8]/15 bg-[#101010]'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#B89B5E] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-semibold text-xs text-[#F5F1E8] block">
                        Official Nigerian Corporate Bank Wire Transfer
                      </span>
                      <p className="text-[11px] text-[#D8CBB8]/70 leading-relaxed">
                        Official invoice with atelier account coordinates issued upon commission approval.
                      </p>
                    </div>
                  </label>

                  {/* Card Gateway Architecture (Paystack/Flutterwave Integration Slot) */}
                  <label 
                    onClick={() => setShippingDetails({ ...shippingDetails, paymentMethod: 'paystack-card' })}
                    className={`p-4 border cursor-pointer flex items-start gap-3 transition-colors ${
                      shippingDetails.paymentMethod === 'paystack-card'
                        ? 'border-[#B89B5E] bg-[#161616]'
                        : 'border-[#D8CBB8]/15 bg-[#101010]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#B89B5E] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-semibold text-xs text-[#F5F1E8] block">
                        Credit / Debit Card Online Settlement
                      </span>
                      <p className="text-[11px] text-[#D8CBB8]/70 leading-relaxed">
                        Integration architecture ready for Paystack / Flutterwave API credentials.
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
                  placeholder="e.g. Please engrave initials 'N.E.' inside waist..."
                  className="w-full bg-[#141414] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.25em] uppercase hover:bg-[#D4BD86] transition-all shadow-xl"
                >
                  TRANSMIT BESPOKE ORDER REQUEST
                </button>
              </div>

            </div>

            {/* Right: Order Summary Dossier */}
            <div className="lg:col-span-5 bg-[#121212] border border-[#D8CBB8]/15 p-8 space-y-6 lg:sticky lg:top-28">
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

              <button
                onClick={() => {
                  clearCart();
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
