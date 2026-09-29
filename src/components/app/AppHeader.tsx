import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Bell, 
  Home, 
  Package, 
  Scissors, 
  Truck, 
  BookOpen, 
  Lock,
  ArrowLeft,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSearch } from '../../context/SearchContext';
import { formatCurrencyNGN, getWhatsAppUrl } from '../../data/config';
import { NotificationsPanel } from './NotificationsPanel';
import { ThemeToggle } from '../common/ThemeToggle';

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleMobileMenu }) => {
  const location = useLocation();
  const { totalItems, openCart, subtotalNGN } = useCart();
  const { totalWishlist } = useWishlist();
  const { openSearch } = useSearch();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isCheckout = location.pathname.startsWith('/checkout');

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navTabs = [
    { label: 'Atelier', path: '/', icon: Home, exact: true },
    { label: 'Collection', path: '/collection', icon: Package },
    { label: 'Bespoke', path: '/bespoke', icon: Scissors },
    { label: 'Track Order', path: '/track', icon: Truck },
    { label: 'Journal', path: '/journal', icon: BookOpen }
  ];

  const isTabActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0E0E0E]/95 backdrop-blur-md border-b border-[#D8CBB8]/15 px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 overflow-x-clip">
      <div className="w-full max-w-[1720px] mx-auto flex items-center justify-between gap-1.5 sm:gap-3 lg:gap-4 min-w-0">
        
        {/* ========================================================
            LEFT SECTION: Brand Identity + Adaptive Search Trigger
        ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <Link to="/" className="flex items-center gap-2 group focus:outline-none shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#B89B5E] bg-[#141414] flex items-center justify-center group-hover:border-[#D4BD86] transition-all shadow-md shrink-0">
              <span className="font-serif text-base sm:text-lg font-light text-[#B89B5E]">N</span>
            </div>
            <div className="hidden xs:block sm:block">
              <span className="font-display tracking-[0.2em] text-xs sm:text-sm font-semibold text-[#F5F1E8] block group-hover:text-[#B89B5E] transition-colors leading-tight whitespace-nowrap">
                NELSON
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#B89B5E] font-mono block -mt-0.5 whitespace-nowrap">
                Bespoke Atelier
              </span>
            </div>
          </Link>

          {/* Adaptive Search Bar */}
          {!isCheckout && (
            <>
              {/* Mobile Icon Button (< 640px) */}
              <button
                onClick={openSearch}
                className="sm:hidden p-2 rounded-full bg-[#181818] border border-[#D8CBB8]/15 text-[#B89B5E] hover:bg-[#222222] transition-colors shrink-0"
                aria-label="Search footwear"
              >
                <Search size={15} />
              </button>

              {/* Tablet & Desktop Search Pill */}
              <button
                onClick={openSearch}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#181818] hover:bg-[#202020] border border-[#D8CBB8]/20 hover:border-[#B89B5E]/50 rounded-full transition-all text-xs text-[#D8CBB8]/70 w-32 md:w-40 lg:w-48 xl:w-56 group text-left focus:outline-none shrink-0"
                aria-label="Search shoes and bespoke footwear"
              >
                <Search size={13} className="text-[#B89B5E] group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">Search Atelier...</span>
                <span className="hidden xl:inline-block ml-auto px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-mono text-[#D8CBB8]/50 shrink-0">
                  ⌘K
                </span>
              </button>
            </>
          )}
        </div>

        {/* ========================================================
            CENTER SECTION:
            A. In Checkout Flow: Trust & Security Indicators
            B. In Storefront Flow: Desktop Navigation Tabs (Visible on 2xl screens where wide margin exists)
        ======================================================== */}
        {isCheckout ? (
          /* Focused Checkout Security Badge */
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#B89B5E]/30 text-xs font-mono text-[#D8CBB8] shrink-0">
            <Lock size={13} className="text-[#B89B5E] shrink-0" />
            <span className="font-semibold text-[#F5F1E8] whitespace-nowrap">Secure Atelier Checkout</span>
            <span className="hidden md:inline text-[#D8CBB8]/50 whitespace-nowrap">• 256-Bit Encrypted</span>
          </div>
        ) : (
          /* Segmented Nav Tabs (Cleanly shown on 2xl screens to avoid cluttering laptop viewports where Left Sidebar handles navigation) */
          <nav className="hidden 2xl:flex items-center justify-center flex-1 max-w-lg mx-auto gap-1 px-2 shrink-0">
            {navTabs.map((tab) => {
              const active = isTabActive(tab.path, tab.exact);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans transition-all shrink-0 ${
                    active
                      ? 'text-[#B89B5E] font-semibold bg-[#B89B5E]/10'
                      : 'text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:bg-[#181818]'
                  }`}
                >
                  <Icon size={14} className={`shrink-0 ${active ? 'text-[#B89B5E]' : 'text-[#D8CBB8]/60'}`} />
                  <span className="whitespace-nowrap shrink-0">{tab.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[#B89B5E] rounded-full shadow-[0_0_8px_rgba(184,155,94,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* ========================================================
            RIGHT SECTION: Quick Actions (Safe Spacing, Zero Edge Overflow)
        ======================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0 ml-auto">
          
          {/* Theme Mode Switcher (Dark / Light) */}
          <ThemeToggle />

          {/* Wishlist Pill (Hidden on mobile < md to keep mobile header clean and spacious; accessible via MobileBottomNav) */}
          {!isCheckout && (
            <Link
              to="/collection"
              className="hidden md:flex relative p-2 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 text-[#D8CBB8] hover:text-[#B89B5E] transition-all items-center justify-center shrink-0"
              title="Saved Footwear"
              aria-label="Wishlist"
            >
              <Heart size={15} />
              {totalWishlist > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B89B5E] text-[#0A0A0A] text-[9px] font-mono font-bold flex items-center justify-center">
                  {totalWishlist}
                </span>
              )}
            </Link>
          )}

          {/* Notifications Bell with Dropdown (Hidden in checkout) */}
          {!isCheckout && (
            <div className="relative shrink-0" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 text-[#D8CBB8] hover:text-[#B89B5E] transition-all flex items-center justify-center focus:outline-none cursor-pointer"
                title="Atelier Notifications"
                aria-label="Notifications"
              >
                <Bell size={15} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-mono font-bold flex items-center justify-center animate-pulse">
                  2
                </span>
              </button>

              <NotificationsPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>
          )}

          {/* Cart / Commission Dossier Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-[#B89B5E] to-[#D4BD86] hover:from-[#C9AB6E] hover:to-[#E5CE96] text-[#0A0A0A] rounded-full font-semibold text-xs transition-all shadow-md group focus:outline-none shrink-0 cursor-pointer"
            aria-label="Commission Bag"
          >
            <ShoppingBag size={14} className="shrink-0" />
            <span className="hidden sm:inline font-mono font-bold whitespace-nowrap">
              {totalItems > 0 ? `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}` : 'Dossier'}
            </span>
            {totalItems > 0 && (
              <span className="hidden 2xl:inline text-[11px] font-mono border-l border-[#0A0A0A]/20 pl-2 whitespace-nowrap">
                ₦{subtotalNGN > 999999 ? `${(subtotalNGN / 1000000).toFixed(1)}M` : `${Math.round(subtotalNGN / 1000)}k`}
              </span>
            )}
            <span className="sm:hidden px-1.5 py-0.2 rounded-full bg-[#0A0A0A] text-[#B89B5E] text-[10px] font-mono font-bold shrink-0">
              {totalItems}
            </span>
          </button>

          {/* Admin Atelier Switch (Cleanly visible on screens >= lg where room is guaranteed) */}
          <Link
            to="/admin"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#B89B5E]/40 text-[#B89B5E] text-[11px] font-mono transition-colors shrink-0"
            title="Open Master Atelier Control Room"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="whitespace-nowrap">Admin</span>
          </Link>

        </div>

      </div>
    </header>
  );
};
