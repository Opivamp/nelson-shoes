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
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Menu,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSearch } from '../../context/SearchContext';
import { BRAND_CONFIG, formatCurrencyNGN, formatCurrencyUSD } from '../../data/config';
import { NotificationsPanel } from './NotificationsPanel';

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
    <header className="sticky top-0 z-50 w-full bg-[#0E0E0E]/95 backdrop-blur-md border-b border-[#D8CBB8]/15 px-3 sm:px-6 py-2.5">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2 sm:gap-6">
        
        {/* LEFT SECTION: Brand Logo + Persistent Search Bar (App Style) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-9 h-9 rounded-lg border border-[#B89B5E] bg-[#141414] flex items-center justify-center group-hover:border-[#D4BD86] transition-all shadow-md">
              <span className="font-serif text-lg font-light text-[#B89B5E]">N</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display tracking-[0.2em] text-xs md:text-sm font-semibold text-[#F5F1E8] block group-hover:text-[#B89B5E] transition-colors leading-tight">
                NELSON
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#B89B5E] font-mono block -mt-0.5">
                Bespoke Atelier
              </span>
            </div>
          </Link>

          {/* Persistent Search Bar (Facebook/App style) */}
          <button
            onClick={openSearch}
            className="flex items-center gap-2.5 px-3 py-1.5 sm:py-2 bg-[#181818] hover:bg-[#202020] border border-[#D8CBB8]/20 hover:border-[#B89B5E]/50 rounded-full transition-all text-xs text-[#D8CBB8]/70 w-36 sm:w-60 md:w-72 lg:w-80 group text-left focus:outline-none"
            aria-label="Search shoes and bespoke footwear"
          >
            <Search size={15} className="text-[#B89B5E] group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">Search Oxfords, Loafers, Bespoke...</span>
            <span className="hidden lg:inline-block ml-auto px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-mono text-[#D8CBB8]/50">
              ⌘K
            </span>
          </button>
        </div>

        {/* CENTER SECTION: Segmented Application Tabs (Desktop) */}
        <nav className="hidden md:flex items-center justify-center flex-1 max-w-xl mx-auto gap-1">
          {navTabs.map((tab) => {
            const active = isTabActive(tab.path, tab.exact);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans transition-all ${
                  active
                    ? 'text-[#B89B5E] font-semibold bg-[#B89B5E]/10'
                    : 'text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:bg-[#181818]'
                }`}
              >
                <Icon size={16} className={active ? 'text-[#B89B5E]' : 'text-[#D8CBB8]/60'} />
                <span>{tab.label}</span>
                {/* Active Indicator Underline */}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#B89B5E] rounded-full shadow-[0_0_8px_rgba(184,155,94,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SECTION: Quick Actions, Notifications, Wishlist, Cart & Admin */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Wishlist Pill */}
          <Link
            to="/collection"
            className="relative p-2 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 text-[#D8CBB8] hover:text-[#B89B5E] transition-all flex items-center justify-center"
            title="Saved Footwear"
            aria-label="Wishlist"
          >
            <Heart size={16} />
            {totalWishlist > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B89B5E] text-[#0A0A0A] text-[9px] font-mono font-bold flex items-center justify-center">
                {totalWishlist}
              </span>
            )}
          </Link>

          {/* Notifications Bell with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 text-[#D8CBB8] hover:text-[#B89B5E] transition-all flex items-center justify-center focus:outline-none"
              title="Atelier Notifications"
              aria-label="Notifications"
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                2
              </span>
            </button>

            {/* Dropdown Panel */}
            <NotificationsPanel
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          {/* Cart / Commission Dossier Button */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#B89B5E] to-[#D4BD86] hover:from-[#C9AB6E] hover:to-[#E5CE96] text-[#0A0A0A] rounded-full font-semibold text-xs transition-all shadow-md group focus:outline-none"
            aria-label="Commission Bag"
          >
            <ShoppingBag size={15} />
            <span className="hidden sm:inline font-mono font-bold">
              {totalItems > 0 ? `${totalItems} Items` : 'Dossier'}
            </span>
            {totalItems > 0 && (
              <span className="hidden lg:inline text-[11px] font-mono border-l border-[#0A0A0A]/20 pl-2">
                ₦{subtotalNGN > 999999 ? `${(subtotalNGN / 1000000).toFixed(1)}M` : `${Math.round(subtotalNGN / 1000)}k`}
              </span>
            )}
            <span className="sm:hidden px-1.5 py-0.2 rounded-full bg-[#0A0A0A] text-[#B89B5E] text-[10px] font-mono">
              {totalItems}
            </span>
          </button>

          {/* Admin Atelier Switch */}
          <Link
            to="/admin"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#B89B5E]/40 text-[#B89B5E] text-[11px] font-mono transition-colors"
            title="Open Master Atelier Control Room"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin</span>
          </Link>
        </div>

      </div>
    </header>
  );
};
