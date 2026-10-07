import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Scissors, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Calendar,
  LayoutDashboard
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { SeoHead } from '../common/SeoHead';

interface CustomerPortalLayoutProps {
  children: React.ReactNode;
}

export const CustomerPortalLayout: React.FC<CustomerPortalLayoutProps> = ({ children }) => {
  const { customerUser, profile, signOut, resendVerification } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isResending, setIsResending] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setVerificationFeedback(null);
    const res = await resendVerification();
    setIsResending(false);
    if (res.success) {
      setVerificationFeedback('A fresh verification link has been dispatched to your email.');
    } else {
      setVerificationFeedback(res.error || 'Failed to dispatch verification email.');
    }
  };

  const memberSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '2026';

  const customerMonogram = (profile?.fullName || customerUser?.displayName || 'C')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NS';

  const navItems = [
    { label: 'Dashboard', path: '/account', icon: LayoutDashboard, exact: true },
    { label: 'My Orders', path: '/account/orders', icon: Package },
    { label: 'Bespoke', path: '/account/bespoke', icon: Scissors },
    { label: 'Saved Items', path: '/account/saved', icon: Heart },
    { label: 'Addresses', path: '/account/addresses', icon: MapPin },
    { label: 'Profile', path: '/account/profile', icon: User },
    { label: 'Security', path: '/account/security', icon: ShieldCheck },
  ];

  const isCurrentActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <SeoHead
        title="Customer Portal | Nelson Shoes"
        noIndex={true}
      />
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ========================================================
            1. CUSTOMER ACCOUNT HEADER
        ======================================================== */}
        <div className="bg-gradient-to-br from-[#141414] via-[#101010] to-[#0D0D0D] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#B89B5E]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Identity & Account Information */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#B89B5E] bg-[#1A1A1A] flex items-center justify-center text-[#B89B5E] font-serif text-2xl sm:text-3xl font-light shadow-xl shrink-0">
                {customerMonogram}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-xl sm:text-2xl text-[#F5F1E8] font-medium truncate">
                    {profile?.fullName || customerUser?.displayName || 'Valued Customer'}
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/40 font-semibold tracking-wider uppercase">
                    ID: #{customerUser?.uid.slice(0, 8).toUpperCase()}
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
                    <span>Customer Since {memberSince}</span>
                  </span>
                </div>

                {/* Email Verification Status */}
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
                        disabled={isResending}
                        className="text-[10px] uppercase font-mono tracking-wider underline text-[#B89B5E] hover:text-[#D4BD86] disabled:opacity-50 cursor-pointer"
                      >
                        {isResending ? 'Sending...' : 'Resend Verification Link'}
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

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#D8CBB8]/10">
              <Link
                to="/track"
                className="px-4 py-2 bg-[#181818] hover:bg-[#202020] border border-[#D8CBB8]/20 hover:border-[#B89B5E]/50 text-xs font-mono text-[#D8CBB8] hover:text-[#B89B5E] rounded-lg transition-colors flex items-center gap-2"
              >
                <Clock size={13} className="text-[#B89B5E]" />
                <span>Track Order</span>
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
            2. CUSTOMER NAVIGATION BAR
        ======================================================== */}
        <nav aria-label="Customer Account Navigation" className="border-b border-[#D8CBB8]/15">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 text-xs tracking-wider uppercase font-mono border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'border-[#B89B5E] text-[#B89B5E] font-semibold bg-[#B89B5E]/5'
                      : 'border-transparent text-[#D8CBB8]/60 hover:text-[#F5F1E8] hover:bg-[#141414]'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-[#B89B5E]' : 'text-[#D8CBB8]/50'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ========================================================
            3. PAGE CONTENT OUTLET
        ======================================================== */}
        <main className="space-y-8 animate-fadeIn">
          {children}
        </main>

      </div>
    </div>
  );
};
