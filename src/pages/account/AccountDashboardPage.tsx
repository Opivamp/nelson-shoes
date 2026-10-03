import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Scissors, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Phone, 
  Calendar, 
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { subscribeToCustomerOrders } from '../../services/customerAuthService';
import type { CustomerOrder } from '../../types';

export const AccountDashboardPage: React.FC = () => {
  const { customerUser, profile, signOut, resendVerification, updateProfile } = useCustomerAuth();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'bespoke' | 'profile'>('overview');
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Verification resend state
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Populate profile fields
  useEffect(() => {
    if (profile) {
      setEditName(profile.fullName || customerUser?.displayName || '');
      setEditPhone(profile.phone || '');
    }
  }, [profile, customerUser]);

  // Subscribe to customer-owned orders from Firestore
  useEffect(() => {
    if (!customerUser) return;
    setIsLoadingOrders(true);

    const unsubscribe = subscribeToCustomerOrders(customerUser.uid, (orders) => {
      setCustomerOrders(orders);
      setIsLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [customerUser]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    setVerificationFeedback(null);
    const res = await resendVerification();
    setIsResendingVerification(false);

    if (res.success) {
      setVerificationFeedback('A fresh verification link has been dispatched to your email.');
    } else {
      setVerificationFeedback(res.error || 'Failed to dispatch verification email.');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    const res = await updateProfile({
      fullName: editName.trim(),
      phone: editPhone.trim()
    });
    setIsUpdatingProfile(false);

    if (res.success) {
      setProfileSuccessMsg('Patron profile successfully updated.');
    } else {
      setProfileErrorMsg(res.error || 'Could not update profile.');
    }
  };

  const memberSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '2026';

  const patronMonogram = (profile?.fullName || customerUser?.displayName || 'N')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ========================================================
            1. PATRON PORTAL HERO & CREDENTIALS BANNER
        ======================================================== */}
        <div className="bg-gradient-to-br from-[#141414] via-[#101010] to-[#0D0D0D] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#B89B5E]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Identity Profile Details */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#B89B5E] bg-[#1A1A1A] flex items-center justify-center text-[#B89B5E] font-serif text-2xl sm:text-3xl font-light shadow-xl shrink-0">
                {patronMonogram}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-xl sm:text-2xl text-[#F5F1E8] font-medium truncate">
                    {profile?.fullName || customerUser?.displayName || 'Atelier Patron'}
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/40 font-semibold tracking-wider uppercase">
                    Patron ID: #{customerUser?.uid.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-[#D8CBB8]/70 font-sans flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Mail size={13} className="text-[#B89B5E]" />
                    <span>{customerUser?.email}</span>
                  </span>
                  <span className="text-[#D8CBB8]/20">•</span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar size={13} className="text-[#B89B5E]" />
                    <span>Patron Since {memberSince}</span>
                  </span>
                </div>

                {/* Email Verification Status Pill */}
                <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                  {customerUser?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      <CheckCircle2 size={13} />
                      <span>Verified Atelier Account</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                        <AlertCircle size={13} />
                        <span>Pending Email Verification</span>
                      </span>
                      <button
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                        className="text-[10px] uppercase font-mono tracking-wider underline text-[#B89B5E] hover:text-[#D4BD86] disabled:opacity-50 cursor-pointer"
                      >
                        {isResendingVerification ? 'Sending...' : 'Resend Verification Link'}
                      </button>
                    </div>
                  )}
                </div>

                {verificationFeedback && (
                  <p className="text-[11px] text-amber-300 font-mono pt-1">
                    {verificationFeedback}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions (Sign Out & Track) */}
            <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#D8CBB8]/10">
              <Link
                to="/track"
                className="px-4 py-2 bg-[#181818] hover:bg-[#202020] border border-[#D8CBB8]/20 hover:border-[#B89B5E]/50 text-xs font-mono text-[#D8CBB8] hover:text-[#B89B5E] rounded-lg transition-colors flex items-center gap-2"
              >
                <Clock size={13} className="text-[#B89B5E]" />
                <span>Track An Order</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-[#181818] hover:bg-red-950/30 border border-[#D8CBB8]/20 hover:border-red-500/30 text-xs font-mono text-red-400 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================
            2. NAVIGATION TABS (Overview, Orders, Bespoke, Profile)
        ======================================================== */}
        <div className="flex border-b border-[#D8CBB8]/15 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Patron Overview', icon: User },
            { id: 'orders', label: `My Orders (${customerOrders.length})`, icon: Package },
            { id: 'bespoke', label: 'Bespoke Atelier', icon: Scissors },
            { id: 'profile', label: 'Profile & Details', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs tracking-wider uppercase font-mono border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-[#B89B5E] text-[#B89B5E] font-semibold bg-[#B89B5E]/5'
                    : 'border-transparent text-[#D8CBB8]/60 hover:text-[#F5F1E8] hover:bg-[#141414]'
                }`}
              >
                <Icon size={14} className={active ? 'text-[#B89B5E]' : 'text-[#D8CBB8]/50'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            3. TAB CONTENT VIEWS
        ======================================================== */}

        {/* 3A. OVERVIEW VIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/50 block">
                  Active Orders
                </span>
                <span className="font-serif text-3xl text-[#F5F1E8] font-bold block">
                  {customerOrders.length}
                </span>
                <span className="text-xs text-[#B89B5E] font-sans block">
                  Tracked securely through Atelier Cloud
                </span>
              </div>

              <div className="p-5 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/50 block">
                  Saved Silhouettes
                </span>
                <span className="font-serif text-3xl text-[#F5F1E8] font-bold block">
                  {wishlistIds.length}
                </span>
                <Link to="/collection?saved=true" className="text-xs text-[#B89B5E] hover:underline font-sans block">
                  View Saved Wishlist →
                </Link>
              </div>

              <div className="p-5 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/50 block">
                  Bespoke Consultation
                </span>
                <span className="font-serif text-3xl text-[#F5F1E8] font-bold block">
                  Available
                </span>
                <Link to="/bespoke" className="text-xs text-[#B89B5E] hover:underline font-sans block">
                  Start New Commission →
                </Link>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-[#F5F1E8]">Recent Footwear Commissions</h3>
                  <p className="text-xs text-[#D8CBB8]/60">Your atelier footwear orders and workbench status</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#B89B5E] hover:underline font-mono uppercase tracking-wider"
                >
                  View All Orders →
                </button>
              </div>

              {isLoadingOrders ? (
                <div className="py-8 text-center text-xs text-[#D8CBB8]/60 font-mono flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#B89B5E]" />
                  <span>Synchronizing your order records...</span>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="py-10 text-center space-y-3 bg-[#161616] rounded-lg border border-[#D8CBB8]/10 p-6">
                  <Package className="w-10 h-10 text-[#D8CBB8]/30 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-serif text-[#F5F1E8]">No Active Orders Associated Yet</p>
                    <p className="text-xs text-[#D8CBB8]/60 max-w-md mx-auto">
                      Orders placed while signed in to this account will appear here automatically. You can also track guest orders anytime using your Order Reference.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <Link
                      to="/collection"
                      className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded hover:bg-[#D4BD86] transition-colors"
                    >
                      Explore Collection
                    </Link>
                    <Link
                      to="/track"
                      className="px-4 py-2 border border-[#D8CBB8]/20 text-[#D8CBB8] text-xs font-mono rounded hover:border-[#B89B5E] transition-colors"
                    >
                      Track Guest Order
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-[#161616] border border-[#D8CBB8]/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#B89B5E]">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#D8CBB8]/15 text-[#D8CBB8]">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#D8CBB8]/80 font-sans">
                          {order.items?.length || 1} Pair(s) • Total: ₦{order.subtotalNGN.toLocaleString()}
                        </p>
                        <span className="text-[10px] text-[#D8CBB8]/40 font-mono block">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/track?ref=${encodeURIComponent(order.orderNumber)}`}
                          className="px-3 py-1.5 bg-[#B89B5E]/15 hover:bg-[#B89B5E]/25 border border-[#B89B5E]/30 text-xs font-mono text-[#B89B5E] rounded transition-colors flex items-center gap-1.5"
                        >
                          <Clock size={12} />
                          <span>Track Live</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3B. MY ORDERS VIEW */}
        {activeTab === 'orders' && (
          <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl p-6 space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-serif text-xl text-[#F5F1E8]">Order History</h3>
              <p className="text-xs text-[#D8CBB8]/60 font-sans">
                Review all footwear pieces commissioned under your atelier patron account.
              </p>
            </div>

            {isLoadingOrders ? (
              <div className="py-12 text-center text-xs text-[#D8CBB8]/60 font-mono flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#B89B5E]" />
                <span>Loading your order records...</span>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-[#161616] rounded-lg border border-[#D8CBB8]/10 p-6">
                <Package className="w-12 h-12 text-[#D8CBB8]/30 mx-auto" />
                <h4 className="font-serif text-base text-[#F5F1E8]">No Registered Orders Yet</h4>
                <p className="text-xs text-[#D8CBB8]/60 max-w-md mx-auto">
                  When you commission footwear while signed in, your orders will appear here with live tracking, courier updates, and receipt details.
                </p>
                <div className="pt-2">
                  <Link
                    to="/collection"
                    className="inline-block px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase rounded hover:bg-[#D4BD86] transition-colors"
                  >
                    Browse Collections
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#161616] border border-[#D8CBB8]/10 rounded-lg p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8CBB8]/10">
                      <div>
                        <span className="font-mono text-sm font-semibold text-[#B89B5E] block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-[#D8CBB8]/50 font-mono">
                          Commissioned on {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-[#1C1C1C] border border-[#D8CBB8]/20 text-[#F5F1E8] font-semibold">
                          {order.status}
                        </span>
                        <Link
                          to={`/track?ref=${encodeURIComponent(order.orderNumber)}`}
                          className="px-3 py-1 bg-[#B89B5E] text-[#0A0A0A] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#D4BD86] transition-colors"
                        >
                          Track
                        </Link>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-sans">
                          <div className="flex items-center gap-3">
                            {item.product?.primaryImage && (
                              <img
                                src={item.product.primaryImage}
                                alt={item.product.name}
                                className="w-10 h-10 object-cover rounded bg-[#1C1C1C] border border-[#D8CBB8]/10"
                              />
                            )}
                            <div>
                              <span className="font-medium text-[#F5F1E8] block">{item.product?.name}</span>
                              <span className="text-[11px] text-[#D8CBB8]/60 font-mono">
                                Size EU {item.size} • Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-[#D8CBB8]">
                            ₦{(item.product?.priceNGN * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#D8CBB8]/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#D8CBB8]/60">Payment: {order.paymentMethod}</span>
                      <span className="text-[#F5F1E8] font-semibold">
                        Total: ₦{order.subtotalNGN.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3C. BESPOKE ATELIER VIEW */}
        {activeTab === 'bespoke' && (
          <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl p-6 space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-serif text-xl text-[#F5F1E8]">Bespoke Commissions</h3>
              <p className="text-xs text-[#D8CBB8]/60 font-sans">
                Hand-sculpted footwear tailored to your unique anatomical measurements.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-[#161616] to-[#121212] border border-[#B89B5E]/30 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-[#B89B5E] font-mono text-xs uppercase font-semibold">
                <Scissors size={15} />
                <span>One-of-One Cordwaining</span>
              </div>
              <p className="text-sm text-[#D8CBB8]/80 leading-relaxed font-serif">
                Every bespoke commission starts with personal anatomical mapping by Master Nelson. Your custom beechwood last is carved by hand and archived permanently in our Lagos atelier.
              </p>
              <div className="pt-2">
                <Link
                  to="/bespoke"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-widest uppercase hover:bg-[#D4BD86] transition-colors rounded shadow-md"
                >
                  <span>SUBMIT BESPOKE DOSSIER</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3D. PROFILE & SECURITY VIEW */}
        {activeTab === 'profile' && (
          <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl p-6 space-y-6 animate-fadeIn max-w-2xl">
            <div>
              <h3 className="font-serif text-xl text-[#F5F1E8]">Patron Profile Details</h3>
              <p className="text-xs text-[#D8CBB8]/60 font-sans">
                Update your contact details for fitting consultations and order updates.
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs rounded font-mono">
                {profileSuccessMsg}
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded font-mono">
                {profileErrorMsg}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                  Email Address (Identity Anchor)
                </label>
                <input
                  type="email"
                  value={customerUser?.email || ''}
                  disabled
                  className="w-full bg-[#141414] border border-[#D8CBB8]/10 px-3 py-2.5 text-xs text-[#D8CBB8]/50 rounded cursor-not-allowed font-mono"
                />
                <span className="text-[10px] text-[#D8CBB8]/40 font-mono mt-1 block">
                  Authoritative Firebase Auth identity.
                </span>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-widest uppercase hover:bg-[#D4BD86] disabled:opacity-50 transition-colors rounded cursor-pointer shadow-md flex items-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>SAVING CHANGES...</span>
                    </>
                  ) : (
                    <span>SAVE PROFILE CHANGES</span>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-6 border-t border-[#D8CBB8]/10 space-y-3">
              <h4 className="font-serif text-base text-[#F5F1E8]">Security & Passphrase</h4>
              <p className="text-xs text-[#D8CBB8]/60">
                To update your master passphrase, request a secure recovery link.
              </p>
              <Link
                to="/account/forgot-password"
                className="inline-block text-xs font-mono text-[#B89B5E] hover:underline uppercase tracking-wider"
              >
                Send Passphrase Reset Link →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
