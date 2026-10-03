import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Scissors, 
  Truck, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Image, 
  MessageCircle, 
  Settings, 
  Heart,
  ArrowRight,
  UserCheck,
  User
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { BRAND_CONFIG, getWhatsAppUrl } from '../../data/config';
import { ThemeToggle } from '../common/ThemeToggle';

export const AppLeftSidebar: React.FC = () => {
  const location = useLocation();
  const { totalWishlist } = useWishlist();
  const { totalItems } = useCart();
  const { customerUser, profile } = useCustomerAuth();

  const primaryNav = [
    { label: 'Atelier Feed', path: '/', icon: Home, exact: true },
    { label: 'Footwear Catalog', path: '/collection', icon: Package, badge: 'Collection' },
    { label: 'Bespoke Studio', path: '/bespoke', icon: Scissors, badge: 'Custom Last' },
    { label: 'Workbench Tracker', path: '/track', icon: Truck, badge: 'Live DHL' },
    { label: 'Patron Portal', path: customerUser ? '/account' : '/account/login', icon: User, badge: customerUser ? 'Active' : 'Sign In' },
    { label: 'Artisanal Craft', path: '/craft', icon: Sparkles },
    { label: 'The Journal', path: '/journal', icon: BookOpen },
    { label: 'Visual Gallery', path: '/gallery', icon: Image },
    { label: 'The Cordwainer', path: '/about', icon: Compass }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const patronMonogram = (profile?.fullName || customerUser?.displayName || 'N')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="w-64 xl:w-72 shrink-0 hidden lg:block sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto no-scrollbar p-4 space-y-5 bg-[#0A0A0A] border-r border-[#D8CBB8]/10 text-xs font-sans">
      
      {/* Patron Dossier Card (Facebook profile style) */}
      <div className="p-3.5 bg-[#121212] border border-[#B89B5E]/20 rounded-xl space-y-2.5 shadow-md">
        <Link 
          to={customerUser ? "/account" : "/account/login"} 
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full border border-[#B89B5E] bg-[#1A1A1A] flex items-center justify-center text-[#B89B5E] font-serif text-sm font-light shrink-0 group-hover:border-[#D4BD86] transition-colors">
            {patronMonogram}
          </div>
          <div className="min-w-0">
            <span className="font-serif text-sm text-[#F5F1E8] font-medium block truncate group-hover:text-[#B89B5E] transition-colors">
              {profile?.fullName || customerUser?.displayName || 'Patron Dossier'}
            </span>
            <span className="text-[10px] text-[#B89B5E] font-mono block">
              {customerUser 
                ? `ID: #NS-${customerUser.uid.slice(0, 6).toUpperCase()}` 
                : 'Sign In / Join Atelier'}
            </span>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D8CBB8]/10 text-[10px] font-mono">
          <div className="p-1.5 bg-[#181818] rounded text-center">
            <span className="text-[#D8CBB8]/50 block">Bag Items</span>
            <span className="text-[#B89B5E] font-bold block">{totalItems}</span>
          </div>
          <div className="p-1.5 bg-[#181818] rounded text-center">
            <span className="text-[#D8CBB8]/50 block">Saved</span>
            <span className="text-[#B89B5E] font-bold block">{totalWishlist}</span>
          </div>
        </div>

        {/* Theme Appearance Switcher */}
        <div className="pt-2.5 border-t border-[#D8CBB8]/10 flex items-center justify-between gap-2">
          <span className="text-xs font-sans text-[#D8CBB8]/80 font-medium">Appearance</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Navigation List */}
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8CBB8]/40 font-mono font-semibold block px-3 py-1">
          EXPLORE ATELIER
        </span>
        <nav className="space-y-0.5">
          {primaryNav.map((item) => {
            const active = isActive(item.path, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-[#B89B5E]/15 text-[#B89B5E] font-semibold border border-[#B89B5E]/30'
                    : 'text-[#D8CBB8]/75 hover:text-[#F5F1E8] hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={active ? 'text-[#B89B5E]' : 'text-[#D8CBB8]/60'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#181818] text-[#B89B5E] border border-[#B89B5E]/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Direct Bespoke Action Callout */}
      <div className="p-4 bg-gradient-to-br from-[#161616] to-[#121212] border border-[#B89B5E]/30 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-[#B89B5E] font-mono text-[10px] uppercase font-semibold tracking-wider">
          <Sparkles size={13} />
          <span>Bespoke Lasting</span>
        </div>
        <p className="text-xs text-[#D8CBB8]/80 leading-relaxed font-serif">
          Have Master Nelson hand-craft a one-of-one pair sculpted to your exact feet contours.
        </p>
        <Link
          to="/bespoke"
          className="inline-flex items-center justify-between w-full px-3.5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs rounded hover:bg-[#D4BD86] transition-colors"
        >
          <span>Commission Custom Pair</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Direct Atelier Concierge & Admin Links */}
      <div className="space-y-1 pt-2 border-t border-[#D8CBB8]/10 font-mono text-xs">
        <a
          href={getWhatsAppUrl("Hello Master Nelson, I'm using the Nelson Atelier App and would like a fitting consultation.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-emerald-400 hover:bg-emerald-950/20 transition-colors"
        >
          <MessageCircle size={16} />
          <span>WhatsApp Concierge</span>
        </a>

        <Link
          to="/admin"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#B89B5E] hover:bg-[#B89B5E]/10 transition-colors"
        >
          <Settings size={16} />
          <span>Master Atelier Admin</span>
        </Link>
      </div>

      <div className="text-[10px] text-[#D8CBB8]/40 text-center font-mono pt-4">
        Nelson Shoes App • v2.6 Luxury
      </div>
    </aside>
  );
};
