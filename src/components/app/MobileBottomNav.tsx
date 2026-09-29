import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Scissors, Truck, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const tabs = [
    { label: 'Atelier', path: '/', icon: Home, exact: true },
    { label: 'Catalog', path: '/collection', icon: Package },
    { label: 'Bespoke', path: '/bespoke', icon: Scissors },
    { label: 'Tracker', path: '/track', icon: Truck },
    { label: 'Dossier', path: '/cart', icon: ShoppingBag, badge: totalItems }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#D8CBB8]/15 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] pb-safe"
      aria-label="Mobile Application Navigation"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const active = isActive(tab.path, tab.exact);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all relative ${
                active 
                  ? 'text-[#B89B5E] font-semibold scale-105' 
                  : 'text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={active ? 'text-[#B89B5E]' : 'currentColor'} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#B89B5E] text-[#0A0A0A] text-[9px] font-mono font-bold flex items-center justify-center shadow-md">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${active ? 'font-semibold text-[#B89B5E]' : 'font-normal'}`}>
                {tab.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-[#B89B5E] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
