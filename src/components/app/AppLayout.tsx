import React from 'react';
import { useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppLeftSidebar } from './AppLeftSidebar';
import { AppRightSidebar } from './AppRightSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from '../common/Footer';
import { CartDrawer } from '../common/CartDrawer';
import { SearchModal } from '../common/SearchModal';
import { FloatingWhatsApp } from '../common/FloatingWhatsApp';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Certain immersive full-width studio pages (like Checkout) don't need the dense sidebars
  const isDedicatedFlow = 
    location.pathname.startsWith('/checkout') || 
    location.pathname.startsWith('/product/');

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#F5F1E8] antialiased overflow-x-clip w-full">
      
      {/* 1. Persistent Top Application Header (All Screens) */}
      <AppHeader />

      {/* 2. Main Application Body Grid */}
      <div className="flex-1 w-full max-w-[1720px] mx-auto flex items-start min-w-0">
        
        {/* Left Persistent Navigation Hub (Desktop / Tablet) */}
        {!isDedicatedFlow && <AppLeftSidebar />}

        {/* Center Application Stage */}
        <main className={`flex-1 min-w-0 pb-24 md:pb-12 ${!isDedicatedFlow ? 'max-w-5xl xl:max-w-4xl 2xl:max-w-5xl mx-auto w-full' : 'w-full'} overflow-x-hidden`}>
          {children}
        </main>

        {/* Right Persistent Workbench & Concierge Panel (Wide Screens) */}
        {!isDedicatedFlow && <AppRightSidebar />}
      </div>

      {/* 3. Footer (Public Storefront Info) */}
      <Footer />

      {/* 4. Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* 5. Application Overlays & Drawers */}
      <CartDrawer />
      <SearchModal />
      <FloatingWhatsApp />
    </div>
  );
};
