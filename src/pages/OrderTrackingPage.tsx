import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  MessageCircle, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  RotateCcw,
  Package
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { verifyOrderOwnership, GENERIC_VERIFICATION_ERROR } from '../services/orderTrackingService';
import type { PublicOrderTracking } from '../types';
import { SeoHead } from '../components/common/SeoHead';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('order') || '';

  const { orders } = useOrders();

  const [orderReference, setOrderReference] = useState(initialRef);
  const [contactIdentifier, setContactIdentifier] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedOrder, setVerifiedOrder] = useState<PublicOrderTracking | null>(null);

  useEffect(() => {
    if (initialRef && !orderReference) {
      setOrderReference(initialRef);
    }
  }, [initialRef]);

  const handleVerifyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    const cleanRef = orderReference.trim();
    const cleanContact = contactIdentifier.trim();

    if (!cleanRef) {
      setVerificationError('Please enter your Nelson Shoes Order Reference.');
      return;
    }

    if (!cleanContact) {
      setVerificationError('Please provide your customer email or phone number to verify order ownership.');
      return;
    }

    setIsVerifying(true);

    try {
      // Determine if contact input looks like an email or a phone number
      const isEmail = cleanContact.includes('@');
      const verificationRequest = {
        orderReference: cleanRef,
        email: isEmail ? cleanContact : undefined,
        phone: !isEmail ? cleanContact : undefined
      };

      const result = await verifyOrderOwnership(verificationRequest, orders);

      if (result.success && result.data) {
        setVerifiedOrder(result.data);
        setSearchParams({ order: result.data.orderReference });
      } else {
        setVerifiedOrder(null);
        setVerificationError(result.error || GENERIC_VERIFICATION_ERROR);
      }
    } catch {
      setVerifiedOrder(null);
      setVerificationError(GENERIC_VERIFICATION_ERROR);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setVerifiedOrder(null);
    setVerificationError(null);
    setOrderReference('');
    setContactIdentifier('');
    setSearchParams({});
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-32 pb-24 font-sans">
      <SeoHead
        title="Track Footwear Commission | Nelson Shoes"
        noIndex={true}
      />
      <div className="max-w-4xl mx-auto px-6 space-y-10">
        
        {/* Header Navigation & Title */}
        <div className="text-center space-y-3">
          <Link
            to="/collection"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#B89B5E] hover:underline"
          >
            <ArrowLeft size={14} />
            <span>Return to Collection</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
            Client Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F1E8] font-light">
            Live Commission & Workbench Tracker
          </h1>
          <p className="text-xs text-[#D8CBB8]/70 max-w-md mx-auto">
            Follow your footwear commission through the lasting, hand-welting, patina, and international dispatch stages.
          </p>
        </div>

        {/* Verification Form (Displayed when no order is verified) */}
        {!verifiedOrder && (
          <div className="max-w-xl mx-auto bg-[#121212] border border-[#D8CBB8]/15 rounded-none p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-[#D8CBB8]/10">
              <div className="p-2 bg-[#B89B5E]/10 rounded-none text-[#B89B5E]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="font-serif text-sm text-[#F5F1E8] font-medium tracking-wide">
                  Order Ownership Verification
                </h2>
                <p className="text-[11px] text-[#D8CBB8]/60">
                  For your privacy, we verify your order details before displaying tracking information.
                </p>
              </div>
            </div>

            {verificationError && (
              <div className="p-3.5 bg-red-950/40 border border-red-500/30 rounded-none text-xs text-red-300 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                <div className="space-y-1">
                  <p>{verificationError}</p>
                  <p className="text-[10px] text-red-300/70">
                    Need assistance? You can reach our atelier concierge directly on WhatsApp.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOrder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 font-mono block">
                  Order Reference
                </label>
                <input
                  type="text"
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                  placeholder="e.g. NS-ORD-882190"
                  className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3.5 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono uppercase rounded-none transition-colors"
                  disabled={isVerifying}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 font-mono block">
                  Customer Email or Phone Number
                </label>
                <input
                  type="text"
                  value={contactIdentifier}
                  onChange={(e) => setContactIdentifier(e.target.value)}
                  placeholder="e.g. adebayo.adeleke@gmail.com or +234 803 555 0192"
                  className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3.5 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded-none transition-colors"
                  disabled={isVerifying}
                />
                <span className="text-[10px] text-[#D8CBB8]/40 block">
                  Must match the contact details provided at checkout.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full min-h-[44px] py-3 bg-[#B89B5E] hover:bg-[#D4BD86] text-[#0A0A0A] font-semibold text-xs uppercase tracking-widest transition-all rounded-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Order...</span>
                    </>
                  ) : (
                    <span>Verify Order</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Verified Order Tracking Result */}
        {verifiedOrder && (
          <div className="bg-[#121212] border border-[#B89B5E]/30 p-6 md:p-8 rounded-none space-y-8 shadow-2xl animate-fadeIn">
            {/* Top Bar: Reference & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8CBB8]/15">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] font-mono block">
                  Verified Commission Reference
                </span>
                <h2 className="font-mono text-xl sm:text-2xl text-[#F5F1E8] font-bold">
                  {verifiedOrder.orderReference}
                </h2>
                {verifiedOrder.destinationCity && (
                  <span className="inline-flex items-center gap-1 text-xs text-[#D8CBB8]/60 font-sans mt-0.5">
                    <MapPin size={12} className="text-[#B89B5E]" />
                    <span>Destination: {verifiedOrder.destinationCity}</span>
                  </span>
                )}
              </div>

              <div className="text-left sm:text-right space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-[#D8CBB8]/50 block font-mono">
                  Current Workbench Phase
                </span>
                <span className="inline-block px-3 py-1 bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/30 text-xs font-mono font-semibold uppercase tracking-wider rounded">
                  {verifiedOrder.status}
                </span>
              </div>
            </div>

            {/* Overall Crafting Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#D8CBB8]/60 uppercase">Crafting Completion</span>
                <span className="text-[#B89B5E] font-bold">{verifiedOrder.progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#181818] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#B89B5E] to-[#D4BD86] rounded-full transition-all duration-700"
                  style={{ width: `${verifiedOrder.progressPercent}%` }}
                />
              </div>
            </div>

            {/* 7-Stage Luxury Craft Lifecycle Timeline */}
            <div className="space-y-4 pt-2">
              <h3 className="font-serif text-sm uppercase tracking-widest text-[#D8CBB8]/80 font-medium">
                Atelier Craftsmanship Timeline
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {verifiedOrder.timeline.map((step, idx) => {
                  const isDone = step.completed && !step.current;
                  const isCurrent = step.current;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded border transition-all flex items-start gap-3.5 ${
                        isCurrent
                          ? 'bg-[#B89B5E]/10 border-[#B89B5E]/40 text-[#F5F1E8]'
                          : isDone
                          ? 'bg-[#161616] border-[#D8CBB8]/15 text-[#D8CBB8]/80'
                          : 'bg-[#101010] border-[#D8CBB8]/5 text-[#D8CBB8]/30'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : isCurrent ? (
                          <Clock size={16} className="text-[#B89B5E] animate-pulse" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#D8CBB8]/20 flex items-center justify-center text-[9px] font-mono">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-mono uppercase tracking-wider ${isCurrent ? 'text-[#B89B5E] font-bold' : ''}`}>
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-[#B89B5E]/20 text-[#B89B5E] rounded">
                              In Progress
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[9px] font-mono text-emerald-400/80">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#D8CBB8]/60 font-sans">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DHL Express Transit Code (Displayed strictly when available) */}
            {verifiedOrder.trackingNumber && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <Truck size={18} />
                  <div>
                    <span className="block text-[10px] text-emerald-400/70 uppercase">Consigned Carrier</span>
                    <span>{verifiedOrder.carrier || 'DHL Express'}: <strong>{verifiedOrder.trackingNumber}</strong></span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400/80 bg-emerald-900/40 px-2.5 py-1 rounded border border-emerald-500/20 self-start sm:self-auto">
                  Climate-Shield Insured Dispatch
                </span>
              </div>
            )}

            {/* Commissioned Footwear Pieces */}
            <div className="space-y-4 pt-2">
              <h3 className="font-serif text-sm uppercase tracking-widest text-[#D8CBB8]/80 font-medium">
                Commissioned Pieces ({verifiedOrder.items.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {verifiedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-[#161616] border border-[#D8CBB8]/10 rounded">
                    {item.primaryImage ? (
                      <img
                        src={item.primaryImage}
                        alt={item.productName}
                        className="w-16 h-18 object-cover rounded bg-black shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-18 bg-[#1f1f1f] rounded flex items-center justify-center text-[#D8CBB8]/40 shrink-0">
                        <Package size={20} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1 text-xs">
                      <h4 className="font-serif text-sm text-[#F5F1E8] font-medium truncate">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-[#B89B5E] font-mono">
                        {item.size ? `Size EU ${item.size}` : 'Custom Size'} • Qty {item.quantity}
                      </p>
                      {item.isBespokeFitting && (
                        <p className="text-[10px] text-emerald-400 font-mono">
                          ✓ Anatomical Last Fitting
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions: Track Another Order & Concierge WhatsApp */}
            <div className="pt-6 border-t border-[#D8CBB8]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-[#D8CBB8] hover:text-[#B89B5E] rounded transition-colors text-xs font-mono uppercase tracking-wider"
              >
                <RotateCcw size={14} />
                <span>Track Another Order</span>
              </button>

              <a
                href={`https://wa.me/2348000000000?text=${encodeURIComponent(`Hello Nelson Atelier, I am inquiring regarding my verified order ${verifiedOrder.orderReference}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded font-mono hover:bg-emerald-600/30 transition-colors flex items-center gap-1.5"
              >
                <MessageCircle size={14} />
                <span>Message Nelson Atelier on WhatsApp</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
