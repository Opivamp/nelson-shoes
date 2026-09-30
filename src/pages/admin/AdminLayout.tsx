import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Ruler, 
  Settings, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  ArrowLeft,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { BRAND_CONFIG } from '../../data/config';
import { isFirebaseConfigured } from '../../services/firebase';

export const AdminLayout: React.FC = () => {
  const { isAdmin, adminUser, isAuthLoading, loginAdmin, logoutAdmin, authError } = useAdminAuth();
  const { orders } = useOrders();
  const { products } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const pendingOrdersCount = orders.filter(
    o => o.status === 'Pending Confirmation' || o.status === 'At Workbench (Lasting)'
  ).length;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim()) {
      setLoginError('Please enter your administrator email address.');
      return;
    }
    if (!loginPass) {
      setLoginError('Please enter your master passkey.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginAdmin(loginEmail, loginPass);
    setIsSubmitting(false);

    if (!res.success) {
      setLoginError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const navLinks = [
    {
      label: 'Atelier Overview',
      path: '/admin',
      icon: LayoutDashboard,
      badge: null
    },
    {
      label: 'Product Catalog',
      path: '/admin/products',
      icon: Package,
      badge: `${products.length} Items`
    },
    {
      label: 'Customer Orders',
      path: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Active` : null,
      badgeColor: 'bg-[#B89B5E] text-[#0A0A0A]'
    },
    {
      label: 'Bespoke Inquiries',
      path: '/admin/bespoke',
      icon: Ruler,
      badge: null
    },
    {
      label: 'Store Settings',
      path: '/admin/settings',
      icon: Settings,
      badge: null
    }
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Auth Loading Screen while Firebase restores persistent session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col justify-center items-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#B89B5E] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-[#B89B5E] font-mono">
          Verifying Atelier Credentials...
        </p>
      </div>
    );
  }

  // If not authenticated as Admin, show luxury Login Screen
  if (!isAdmin) {
    const displayedError = loginError || authError;

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden">
        {/* Subtle background ambient aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#B89B5E]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-8">
          {/* Brand Monogram */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 group mb-2">
              <ArrowLeft className="w-4 h-4 text-[#B89B5E] group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs tracking-widest uppercase text-[#D8CBB8]/60 group-hover:text-[#F5F1E8]">
                Return to Storefront
              </span>
            </Link>

            <div className="w-12 h-12 border border-[#B89B5E] mx-auto flex items-center justify-center bg-[#121212]">
              <span className="font-serif text-2xl text-[#B89B5E]">N</span>
            </div>

            <h1 className="font-display tracking-[0.25em] text-xl font-bold text-[#F5F1E8]">
              NELSON SHOES
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono">
              Atelier Management Console
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#121212] border border-[#D8CBB8]/15 p-8 shadow-2xl space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="font-serif text-xl text-[#F5F1E8]">Atelier Administrator Login</h2>
              <p className="text-xs text-[#D8CBB8]/60 font-sans">
                Sign in to manage the footwear catalog, update live orders, and review bespoke commissions.
              </p>
            </div>

            {displayedError && (
              <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs text-center rounded leading-relaxed">
                {displayedError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1">
                  Atelier Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@nelsonshoes.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1">
                  Master Passkey
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-10 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40 hover:text-[#B89B5E] transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-widest uppercase hover:bg-[#D4BD86] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>ENTER ATELIER CONSOLE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Authenticated Security Perimeter Notice */}
            <div className="pt-4 border-t border-[#D8CBB8]/10 text-center space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-[#D8CBB8]/50 flex items-center justify-center gap-1.5">
                <ShieldCheck size={13} className="text-[#B89B5E]" />
                <span>Authorized Atelier Access Only</span>
              </span>
              <p className="text-[10px] text-[#D8CBB8]/40 font-mono">
                Protected by Cloud Security Rules & Firebase Authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#121212] border-b border-[#D8CBB8]/15 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border border-[#B89B5E] flex items-center justify-center">
            <span className="font-serif text-xs text-[#B89B5E]">N</span>
          </div>
          <span className="font-display tracking-[0.2em] text-xs font-semibold text-[#F5F1E8]">
            NELSON ATELIER
          </span>
          <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#B89B5E]/20 text-[#B89B5E] font-mono border border-[#B89B5E]/30">
            Admin
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-[#D8CBB8] hover:text-[#B89B5E]"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#0E0E0E] border-r border-[#D8CBB8]/15 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:w-64 md:shrink-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#D8CBB8]/10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-[#B89B5E] flex items-center justify-center shrink-0">
              <span className="font-serif text-sm text-[#B89B5E]">N</span>
            </div>
            <div>
              <span className="font-display tracking-[0.2em] text-sm font-semibold text-[#F5F1E8] block">
                NELSON SHOES
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#B89B5E] font-mono block -mt-0.5">
                Admin Control Room
              </span>
            </div>
          </Link>

          {/* Quick Active Operator Pill */}
          <div className="mt-4 p-2.5 bg-[#141414] border border-[#D8CBB8]/10 rounded flex items-center gap-2.5 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="truncate min-w-0">
              <span className="text-[#F5F1E8] block font-medium truncate text-[11px]">{adminUser?.name || 'Nelson Atelier'}</span>
              <span className="text-[10px] text-[#B89B5E] uppercase block font-semibold">
                {adminUser?.role === 'master_artisan' ? 'Master Cordwainer' : 'Atelier Staff'}
              </span>
              {adminUser?.email && (
                <span className="text-[9px] text-[#D8CBB8]/50 truncate block mt-0.5 font-sans">
                  {adminUser.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#D8CBB8]/40 font-mono block px-3 py-1 font-semibold">
            ATELIER OPERATIONS
          </span>
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded text-xs transition-all
                    ${active 
                      ? 'bg-[#B89B5E]/15 text-[#B89B5E] font-medium border border-[#B89B5E]/30' 
                      : 'text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:bg-[#161616]'}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={active ? 'text-[#B89B5E]' : 'text-[#D8CBB8]/50'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${item.badgeColor || 'bg-[#181818] text-[#D8CBB8]/70 border border-[#D8CBB8]/15'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Live Store link & Logout */}
        <div className="p-4 border-t border-[#D8CBB8]/10 bg-[#0A0A0A] space-y-2">
          {/* Firebase Cloud Sync Status */}
          <div className="p-2.5 bg-[#141414] border border-[#D8CBB8]/10 rounded">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-[#F5F1E8]">
                <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isFirebaseConfigured ? 'Firebase Cloud' : 'Atelier Local'}</span>
              </span>
              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${isFirebaseConfigured ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'}`}>
                {isFirebaseConfigured ? 'Live Sync' : 'Ready'}
              </span>
            </div>
            <p className="text-[10px] text-[#D8CBB8]/60 mt-1 leading-tight font-sans">
              {isFirebaseConfigured 
                ? 'Firestore & Storage active' 
                : 'Keys configurable in .env.local'}
            </p>
          </div>

          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#D8CBB8]/70 hover:text-[#B89B5E] hover:bg-[#141414] border border-dashed border-[#D8CBB8]/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink size={13} />
              <span>View Public Store</span>
            </div>
            <span className="text-[10px] font-mono text-[#B89B5E]">Live</span>
          </Link>

          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-400/80 hover:text-red-300 hover:bg-red-950/20 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign Out of Atelier</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Admin Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#0E0E0E] border-b border-[#D8CBB8]/15 sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-[#D8CBB8]/60 uppercase tracking-widest">
              Nelson Shoes Atelier
            </span>
            <span className="text-[#D8CBB8]/20">•</span>
            <span className="text-xs font-mono text-[#B89B5E] uppercase tracking-wider">
              Central Management Console
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/admin/products"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B89B5E] text-[#0A0A0A] text-xs font-semibold tracking-wider uppercase hover:bg-[#D4BD86] transition-colors"
            >
              <PlusCircle size={14} />
              <span>Upload New Product</span>
            </Link>

            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D8CBB8]/20 text-[#D8CBB8] text-xs hover:border-[#B89B5E] hover:text-[#B89B5E] transition-colors"
            >
              <ExternalLink size={13} />
              <span>Storefront</span>
            </Link>
          </div>
        </header>

        {/* Nested Admin Route Content */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
