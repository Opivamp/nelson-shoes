import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Clock, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ExternalLink,
  Plus,
  X
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { subscribeToCustomerOrders } from '../../services/customerAuthService';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';
import type { CustomerOrder } from '../../types';

export const CustomerOrdersPage: React.FC = () => {
  const { customerUser, claimOrder } = useCustomerAuth();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Claim Order State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimReference, setClaimReference] = useState('');
  const [claimContact, setClaimContact] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [claimErrorMsg, setClaimErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!customerUser) return;
    setIsLoading(true);

    const unsub = subscribeToCustomerOrders(customerUser.uid, (data) => {
      setOrders(data);
      setIsLoading(false);
    });

    return () => unsub();
  }, [customerUser]);

  useEffect(() => {
    if (!showClaimModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowClaimModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showClaimModal]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsClaiming(true);
    setClaimSuccessMsg(null);
    setClaimErrorMsg(null);

    const isEmail = claimContact.includes('@');
    const res = await claimOrder({
      orderReference: claimReference.trim(),
      email: isEmail ? claimContact.trim().toLowerCase() : undefined,
      phone: !isEmail ? claimContact.trim() : undefined
    });

    setIsClaiming(false);

    if (res.success) {
      setClaimSuccessMsg(res.message || 'Order successfully linked to your customer account.');
      setClaimReference('');
      setClaimContact('');
    } else {
      setClaimErrorMsg(res.error || 'Could not link this order. Please verify your reference and contact details.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    // Status filter
    if (filter === 'in_progress' && o.status === 'Delivered') return false;
    if (filter === 'delivered' && o.status !== 'Delivered') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchItems = o.items?.some(i => i.product.name.toLowerCase().includes(q));
      return matchNum || matchItems;
    }
    return true;
  });

  return (
    <CustomerPortalLayout>
      <div className="space-y-8">

        {/* Header with Title and Claim Order Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-widest text-[#B89B5E] block">
              COMMISSION DOSSIERS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#F5F1E8]">
              My Orders
            </h2>
            <p className="text-xs text-[#D8CBB8]/70 font-sans">
              Private records of all footwear commissioned under your customer account.
            </p>
          </div>

          <button
            onClick={() => {
              setShowClaimModal(true);
              setClaimSuccessMsg(null);
              setClaimErrorMsg(null);
            }}
            className="px-4 py-2.5 bg-[#181818] hover:bg-[#222222] border border-[#B89B5E]/50 hover:border-[#B89B5E] text-xs font-mono text-[#B89B5E] hover:text-[#D4BD86] rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-lg"
          >
            <Plus size={14} />
            <span>Claim Previous Order</span>
          </button>
        </div>

        {/* ========================================================
            CLAIM ORDER MODAL
        ======================================================== */}
        {showClaimModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={(e) => { if (e.target === e.currentTarget) setShowClaimModal(false); }}
          >
            <div className="bg-[#121212] border border-[#D8CBB8]/20 rounded-xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowClaimModal(false)}
                className="absolute top-4 right-4 text-[#D8CBB8]/50 hover:text-[#F5F1E8] transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#B89B5E] block">
                  HISTORICAL ORDER LINKING
                </span>
                <h3 className="font-serif text-xl text-[#F5F1E8]">
                  Claim a Previous Order
                </h3>
                <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed">
                  Placed an order as a guest? Link it to your authenticated account using your Order Reference and the email or WhatsApp phone number provided at checkout.
                </p>
              </div>

              {claimSuccessMsg ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-lg space-y-3 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs text-emerald-300 font-mono">{claimSuccessMsg}</p>
                  <button
                    onClick={() => setShowClaimModal(false)}
                    className="px-4 py-2 bg-emerald-800 text-white font-mono text-xs rounded hover:bg-emerald-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="space-y-4">
                  {claimErrorMsg && (
                    <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg flex items-start gap-2 text-xs text-red-300 font-mono">
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                      <span>{claimErrorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                      Order Reference *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NS-ORD-123456"
                      value={claimReference}
                      onChange={(e) => setClaimReference(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                      Original Email or Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="email@example.com or +234..."
                      value={claimContact}
                      onChange={(e) => setClaimContact(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none transition-colors"
                    />
                    <span className="text-[10px] text-[#D8CBB8]/40 font-sans block">
                      Must match the contact details provided when the order was created.
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowClaimModal(false)}
                      className="px-4 py-2 border border-[#D8CBB8]/20 text-[#D8CBB8]/70 text-xs font-mono rounded hover:text-[#F5F1E8] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isClaiming}
                      className="px-5 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded hover:bg-[#D4BD86] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {isClaiming && <Loader2 size={13} className="animate-spin" />}
                      <span>{isClaiming ? 'Verifying...' : 'Link Order'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            FILTER & SEARCH BAR
        ======================================================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          
          {/* Status Tabs */}
          <div className="flex bg-[#121212] p-1 border border-[#D8CBB8]/15 rounded-lg self-start">
            {[
              { id: 'all', label: `All (${orders.length})` },
              { id: 'in_progress', label: `In Progress (${orders.filter(o => o.status !== 'Delivered').length})` },
              { id: 'delivered', label: `Delivered (${orders.filter(o => o.status === 'Delivered').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors rounded ${
                  filter === tab.id
                    ? 'bg-[#B89B5E] text-[#0A0A0A] font-semibold'
                    : 'text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
            <input
              type="text"
              placeholder="Search reference or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded-lg outline-none transition-colors"
            />
          </div>

        </div>

        {/* ========================================================
            ORDERS LIST
        ======================================================== */}
        {isLoading ? (
          <div className="p-12 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#B89B5E] animate-spin mx-auto" />
            <p className="text-xs text-[#D8CBB8]/60 font-mono">Retrieving your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-4">
            <Package className="w-10 h-10 text-[#B89B5E]/30 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-[#F5F1E8]">No orders found</h3>
              <p className="text-xs text-[#D8CBB8]/60 font-sans max-w-sm mx-auto">
                {searchQuery ? 'No orders match your search criteria.' : 'You have not commissioned any footwear under this account yet.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/collection"
                className="px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider hover:bg-[#D4BD86] transition-colors rounded-lg font-mono"
              >
                Explore Footwear
              </Link>
              <button
                onClick={() => setShowClaimModal(true)}
                className="px-4 py-2.5 border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-xs font-mono text-[#D8CBB8] rounded-lg transition-colors"
              >
                Claim Prior Order
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 rounded-xl space-y-4 transition-all"
              >
                {/* Top Row: Reference, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8CBB8]/10">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-base font-semibold text-[#F5F1E8]">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B89B5E]/15 text-[#B89B5E] border border-[#B89B5E]/30 uppercase">
                      {order.status}
                    </span>
                    {order.customer?.deliveryMethod === 'dhl-express' && (
                      <span className="text-[10px] font-mono text-[#D8CBB8]/60 flex items-center gap-1">
                        <Truck size={12} className="text-[#B89B5E]" />
                        <span>DHL Express</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#D8CBB8]/60 font-mono">
                    Placed: {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {/* Items Summary & Total */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  
                  {/* Items list */}
                  <div className="md:col-span-2 space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <div className="w-12 h-12 bg-[#1A1A1A] border border-[#D8CBB8]/15 rounded overflow-hidden shrink-0">
                          {item.product?.primaryImage ? (
                            <img
                              src={item.product.primaryImage}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#D8CBB8]/30 font-mono">
                              PHOTO
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-serif text-sm text-[#F5F1E8] font-medium truncate">
                            {item.product?.name || 'Artisanal Footwear'}
                          </div>
                          <div className="text-[11px] text-[#D8CBB8]/60 font-mono flex items-center gap-2">
                            <span>Size: EU {item.size}</span>
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                            {item.isBespokeFitting && (
                              <span className="text-[#B89B5E] text-[10px]">Bespoke Last</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#D8CBB8]/10">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40">
                        Total Amount
                      </div>
                      <div className="font-mono text-sm sm:text-base text-[#F5F1E8] font-medium">
                        ₦{(order.totalNGN || order.subtotalNGN)?.toLocaleString() || '0'} / ${(order.totalUSD || order.subtotalUSD)?.toLocaleString() || '0'}
                      </div>
                    </div>

                    <Link
                      to={`/account/orders/${order.id}`}
                      className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] hover:text-[#B89B5E] rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <span>View Details</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </CustomerPortalLayout>
  );
};
