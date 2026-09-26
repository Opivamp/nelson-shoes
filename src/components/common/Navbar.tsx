import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  Menu, 
  X, 
  ChevronDown, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  Scissors, 
  Compass, 
  BookOpen, 
  Image, 
  MapPin, 
  UserCheck 
} from 'lucide-react';
import { BRAND_CONFIG } from '../../data/config';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSearch } from '../../context/SearchContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<any>(null);
  const location = useLocation();

  const { totalItems, openCart } = useCart();
  const { totalWishlist } = useWishlist();
  const { openSearch } = useSearch();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 250);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'luxury-glass border-b border-[#D8CBB8]/15 py-3.5 shadow-2xl'
            : 'bg-gradient-to-b from-[#0A0A0A]/95 via-[#0A0A0A]/60 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          
          {/* Brand Logo & Monogram */}
          <Link 
            to="/" 
            className="group flex items-center gap-3 text-left focus:outline-none flex-shrink-0"
            aria-label="Nelson Shoes Home"
          >
            <div className="w-8 h-8 border border-[#B89B5E]/50 flex items-center justify-center transition-colors duration-300 group-hover:border-[#B89B5E] bg-[#0A0A0A]/60">
              <span className="font-serif text-lg font-light text-[#B89B5E]">N</span>
            </div>
            <div>
              <span className="font-display tracking-[0.25em] text-sm md:text-base font-semibold text-[#F5F1E8] block group-hover:text-[#B89B5E] transition-colors duration-300">
                {BRAND_CONFIG.name}
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-[0.3em] text-[#D8CBB8]/60 font-sans -mt-0.5">
                Atelier Lagos
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Streamlined with Elegant Dropdowns */}
          <nav className="hidden lg:flex items-center space-x-7" aria-label="Main Navigation">
            
            {/* 01. COLLECTION (With Category Dropdown) */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('collection')}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to="/collection"
                className={`text-[11px] tracking-[0.22em] font-medium uppercase transition-colors duration-300 py-2 inline-flex items-center gap-1.5 ${
                  location.pathname === '/collection' 
                    ? 'text-[#B89B5E]' 
                    : 'text-[#D8CBB8]/80 hover:text-[#F5F1E8]'
                }`}
              >
                <span>COLLECTION</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'collection' ? 'rotate-180 text-[#B89B5E]' : 'opacity-60'}`} />
              </Link>

              {/* Collection Dropdown Menu */}
              {activeDropdown === 'collection' && (
                <div className="absolute top-full left-0 mt-1 w-64 p-3 bg-[#0C0C0C]/98 border border-[#D8CBB8]/20 backdrop-blur-2xl shadow-2xl animate-fadeIn space-y-1 z-50">
                  <div className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#B89B5E] px-3 py-1 border-b border-[#D8CBB8]/10 mb-1">
                    Footwear Silhouettes
                  </div>
                  
                  <Link
                    to="/collection"
                    className="block px-3 py-2 text-xs font-serif text-[#F5F1E8] hover:text-[#B89B5E] hover:bg-[#B89B5E]/10 transition-colors"
                  >
                    View All Creations
                  </Link>
                  <Link
                    to="/collection?category=oxford"
                    className="block px-3 py-2 text-xs text-[#D8CBB8]/80 hover:text-[#F5F1E8] hover:bg-[#B89B5E]/10 transition-colors flex items-center justify-between"
                  >
                    <span>Wholecut Oxfords</span>
                    <span className="text-[10px] text-[#B89B5E] font-mono">FORMAL</span>
                  </Link>
                  <Link
                    to="/collection?category=monkstrap"
                    className="block px-3 py-2 text-xs text-[#D8CBB8]/80 hover:text-[#F5F1E8] hover:bg-[#B89B5E]/10 transition-colors flex items-center justify-between"
                  >
                    <span>Double Monkstraps</span>
                    <span className="text-[10px] text-[#B89B5E] font-mono">SARTORIAL</span>
                  </Link>
                  <Link
                    to="/collection?category=boot"
                    className="block px-3 py-2 text-xs text-[#D8CBB8]/80 hover:text-[#F5F1E8] hover:bg-[#B89B5E]/10 transition-colors flex items-center justify-between"
                  >
                    <span>Chelsea Boots</span>
                    <span className="text-[10px] text-[#B89B5E] font-mono">ARCHIVE</span>
                  </Link>
                  <Link
                    to="/collection?category=loafer"
                    className="block px-3 py-2 text-xs text-[#D8CBB8]/80 hover:text-[#F5F1E8] hover:bg-[#B89B5E]/10 transition-colors flex items-center justify-between"
                  >
                    <span>Tassel & Venetian Loafers</span>
                    <span className="text-[10px] text-[#B89B5E] font-mono">CASUAL</span>
                  </Link>
                </div>
              )}
            </div>

            {/* 02. BESPOKE (Direct) */}
            <Link
              to="/bespoke"
              className={`text-[11px] tracking-[0.22em] font-medium uppercase transition-colors duration-300 py-2 ${
                location.pathname === '/bespoke' 
                  ? 'text-[#B89B5E]' 
                  : 'text-[#D8CBB8]/80 hover:text-[#F5F1E8]'
              }`}
            >
              BESPOKE
            </Link>

            {/* 03. THE ATELIER (Dropdown grouping Craft, About, Gallery, Journal) */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('atelier')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`text-[11px] tracking-[0.22em] font-medium uppercase transition-colors duration-300 py-2 inline-flex items-center gap-1.5 focus:outline-none ${
                  ['/craft', '/about', '/gallery', '/journal'].includes(location.pathname)
                    ? 'text-[#B89B5E]' 
                    : 'text-[#D8CBB8]/80 hover:text-[#F5F1E8]'
                }`}
              >
                <span>THE ATELIER</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'atelier' ? 'rotate-180 text-[#B89B5E]' : 'opacity-60'}`} />
              </button>

              {/* Atelier Dropdown Menu */}
              {activeDropdown === 'atelier' && (
                <div className="absolute top-full left-0 mt-1 w-64 p-3 bg-[#0C0C0C]/98 border border-[#D8CBB8]/20 backdrop-blur-2xl shadow-2xl animate-fadeIn space-y-1 z-50">
                  <div className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#B89B5E] px-3 py-1 border-b border-[#D8CBB8]/10 mb-1">
                    Heritage & Cordwaining
                  </div>

                  <Link
                    to="/craft"
                    className="px-3 py-2 text-xs text-[#F5F1E8] hover:text-[#B89B5E] hover:bg-[#B89B5E]/10 transition-colors flex items-center gap-2.5"
                  >
                    <Scissors className="w-3.5 h-3.5 text-[#B89B5E]" />
                    <div>
                      <div className="font-serif">The Craft & Welting</div>
                      <div className="text-[10px] text-[#D8CBB8]/60 font-sans">Artisanal 6-stage cordwaining</div>
                    </div>
                  </Link>

                  <Link
                    to="/about"
                    className="px-3 py-2 text-xs text-[#F5F1E8] hover:text-[#B89B5E] hover:bg-[#B89B5E]/10 transition-colors flex items-center gap-2.5"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#B89B5E]" />
                    <div>
                      <div className="font-serif">Our Story & Founder</div>
                      <div className="text-[10px] text-[#D8CBB8]/60 font-sans">Lagos roots & global standard</div>
                    </div>
                  </Link>

                  <Link
                    to="/gallery"
                    className="px-3 py-2 text-xs text-[#F5F1E8] hover:text-[#B89B5E] hover:bg-[#B89B5E]/10 transition-colors flex items-center gap-2.5"
                  >
                    <Image className="w-3.5 h-3.5 text-[#B89B5E]" />
                    <div>
                      <div className="font-serif">Visual Archive</div>
                      <div className="text-[10px] text-[#D8CBB8]/60 font-sans">Lookbook & photography</div>
                    </div>
                  </Link>

                  <Link
                    to="/journal"
                    className="px-3 py-2 text-xs text-[#F5F1E8] hover:text-[#B89B5E] hover:bg-[#B89B5E]/10 transition-colors flex items-center gap-2.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#B89B5E]" />
                    <div>
                      <div className="font-serif">Atelier Journal</div>
                      <div className="text-[10px] text-[#D8CBB8]/60 font-sans">Shoe care & style essays</div>
                    </div>
                  </Link>

                  <Link
                    to="/contact"
                    className="px-3 py-2 text-xs text-[#F5F1E8] hover:text-[#B89B5E] hover:bg-[#B89B5E]/10 transition-colors flex items-center gap-2.5 border-t border-[#D8CBB8]/10 pt-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#B89B5E]" />
                    <div>
                      <div className="font-serif">Lagos Workshop</div>
                      <div className="text-[10px] text-[#D8CBB8]/60 font-sans">Fittings & atelier visits</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 04. SERVICES / CLIENT PORTAL (Dropdown for Tracking & Admin Console) */}
            <div 
              className="relative"
              onMouseEnter={() => handleMouseEnter('portal')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`text-[11px] tracking-[0.22em] font-medium uppercase transition-colors duration-300 py-2 inline-flex items-center gap-1.5 focus:outline-none ${
                  ['/track', '/admin'].includes(location.pathname)
                    ? 'text-[#B89B5E]' 
                    : 'text-[#D8CBB8]/80 hover:text-[#F5F1E8]'
                }`}
              >
                <span>SERVICES</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'portal' ? 'rotate-180 text-[#B89B5E]' : 'opacity-60'}`} />
              </button>

              {/* Portal Dropdown Menu */}
              {activeDropdown === 'portal' && (
                <div className="absolute top-full left-0 mt-1 w-64 p-3 bg-[#0C0C0C]/98 border border-[#D8CBB8]/20 backdrop-blur-2xl shadow-2xl animate-fadeIn space-y-1 z-50">
                  <div className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#B89B5E] px-3 py-1 border-b border-[#D8CBB8]/10 mb-1">
                    Client & Admin Services
                  </div>

                  <Link
                    to="/track"
                    className="px-3 py-2 text-xs text-[#F5F1E8] hover:text-[#B89B5E] hover:bg-[#B89B5E]/10 transition-colors flex items-center gap-2.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#B89B5E]" />
                    <div>
                      <div className="font-serif flex items-center gap-2">
                        <span>Track Commission</span>
                        <span className="text-[9px] font-mono px-1 bg-[#B89B5E]/20 text-[#B89B5E]">LIVE</span>
                      </div>
                      <div className="text-[10px] text-[#D8CBB8]/60 font-sans">Check workbench progress</div>
                    </div>
                  </Link>

                  <Link
                    to="/admin"
                    className="px-3 py-2 text-xs text-[#F5F1E8] hover:text-[#B89B5E] hover:bg-[#B89B5E]/10 transition-colors flex items-center gap-2.5 border-t border-[#D8CBB8]/10 pt-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B89B5E]" />
                    <div>
                      <div className="font-serif flex items-center gap-2">
                        <span>Atelier Admin</span>
                        <span className="text-[9px] font-mono px-1 bg-[#B89B5E] text-[#0A0A0A] font-bold">PORTAL</span>
                      </div>
                      <div className="text-[10px] text-[#D8CBB8]/60 font-sans">Upload products & orders</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

          </nav>

          {/* Right Action Icons & Primary CTA */}
          <div className="flex items-center space-x-3 md:space-x-5">
            
            {/* Search Trigger */}
            <button
              onClick={openSearch}
              className="p-2 text-[#D8CBB8]/80 hover:text-[#B89B5E] transition-colors duration-200"
              aria-label="Search Collection and Stories"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[1.5]" />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/collection?saved=true"
              className="relative p-2 text-[#D8CBB8]/80 hover:text-[#B89B5E] transition-colors duration-200 hidden sm:block"
              aria-label="Saved Pieces"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 stroke-[1.5]" />
              {totalWishlist > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#B89B5E] text-[#0A0A0A] text-[9px] font-bold flex items-center justify-center">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2 text-[#D8CBB8]/80 hover:text-[#B89B5E] transition-colors duration-200"
              aria-label="View Inquiries & Cart"
              title="Cart / Inquiries"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#B89B5E] text-[#0A0A0A] text-[9px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Book Consultation CTA (Desktop) */}
            <Link
              to="/bespoke"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 border border-[#B89B5E]/60 text-[10px] uppercase tracking-[0.2em] font-medium text-[#F5F1E8] hover:bg-[#B89B5E] hover:text-[#0A0A0A] transition-all duration-300"
            >
              <span>CONSULTATION</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#F5F1E8] hover:text-[#B89B5E] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[1.5]" />
              )}
            </button>

          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-[#0A0A0A]/98 backdrop-blur-2xl transition-all duration-500 lg:hidden flex flex-col justify-between pt-24 pb-10 px-8 ${
          mobileMenuOpen 
            ? 'opacity-100 pointer-events-auto translate-y-0' 
            : 'opacity-0 pointer-events-none -translate-y-4'
        }`}
      >
        <div className="space-y-6 overflow-y-auto max-h-[75vh]">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#B89B5E] font-medium border-b border-[#D8CBB8]/10 pb-3">
            Atelier Navigation
          </p>
          <nav className="flex flex-col space-y-4">
            <Link
              to="/collection"
              className="font-serif text-2xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors flex items-center justify-between"
            >
              <span>COLLECTION</span>
              <span className="text-xs text-[#D8CBB8]/40 font-sans">01</span>
            </Link>
            <Link
              to="/bespoke"
              className="font-serif text-2xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors flex items-center justify-between"
            >
              <span>BESPOKE JOURNEY</span>
              <span className="text-xs text-[#D8CBB8]/40 font-sans">02</span>
            </Link>
            <Link
              to="/craft"
              className="font-serif text-2xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors flex items-center justify-between"
            >
              <span>THE CRAFT & WELT</span>
              <span className="text-xs text-[#D8CBB8]/40 font-sans">03</span>
            </Link>
            <Link
              to="/about"
              className="font-serif text-2xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors flex items-center justify-between"
            >
              <span>ABOUT ATELIER</span>
              <span className="text-xs text-[#D8CBB8]/40 font-sans">04</span>
            </Link>
            <Link
              to="/gallery"
              className="font-serif text-2xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors flex items-center justify-between"
            >
              <span>GALLERY</span>
              <span className="text-xs text-[#D8CBB8]/40 font-sans">05</span>
            </Link>
            <Link
              to="/journal"
              className="font-serif text-2xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors flex items-center justify-between"
            >
              <span>JOURNAL</span>
              <span className="text-xs text-[#D8CBB8]/40 font-sans">06</span>
            </Link>
            <Link
              to="/contact"
              className="font-serif text-2xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors flex items-center justify-between"
            >
              <span>CONTACT</span>
              <span className="text-xs text-[#D8CBB8]/40 font-sans">07</span>
            </Link>
            
            <div className="pt-3 border-t border-[#D8CBB8]/15 space-y-2">
              <Link
                to="/track"
                className="font-serif text-xl text-[#B89B5E] hover:text-[#F5F1E8] transition-colors flex items-center justify-between"
              >
                <span>TRACK COMMISSION</span>
                <span className="text-xs font-mono text-[#B89B5E]">LIVE</span>
              </Link>
              <Link
                to="/admin"
                className="font-serif text-xl text-[#B89B5E] hover:text-[#F5F1E8] transition-colors flex items-center justify-between"
              >
                <span>ADMIN CONSOLE</span>
                <span className="text-xs font-mono bg-[#B89B5E] text-[#0A0A0A] px-1.5 py-0.5 font-bold">PORTAL</span>
              </Link>
            </div>
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-[#D8CBB8]/10">
          <Link
            to="/bespoke"
            className="block w-full text-center py-3.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors"
          >
            START BESPOKE INQUIRY
          </Link>
        </div>
      </div>
    </>
  );
};
