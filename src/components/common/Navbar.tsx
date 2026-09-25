import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, ArrowUpRight } from 'lucide-react';
import { BRAND_CONFIG } from '../../data/config';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSearch } from '../../context/SearchContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { totalItems, openCart } = useCart();
  const { totalWishlist } = useWishlist();
  const { openSearch } = useSearch();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "COLLECTION", href: "/collection" },
    { label: "BESPOKE", href: "/bespoke" },
    { label: "THE CRAFT", href: "/craft" },
    { label: "ABOUT", href: "/about" },
    { label: "JOURNAL", href: "/journal" },
    { label: "GALLERY", href: "/gallery" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'luxury-glass border-b border-[#D8CBB8]/10 py-3.5 shadow-2xl'
            : 'bg-gradient-to-b from-[#0A0A0A]/90 via-[#0A0A0A]/40 to-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          
          {/* Brand Logo & Monogram */}
          <Link 
            to="/" 
            className="group flex items-center gap-3 text-left focus:outline-none"
            aria-label="Nelson Shoes Home"
          >
            <div className="w-8 h-8 border border-[#B89B5E]/50 flex items-center justify-center transition-colors duration-300 group-hover:border-[#B89B5E]">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-[11px] tracking-[0.22em] font-medium uppercase transition-colors duration-300 relative py-1 ${
                    isActive 
                      ? 'text-[#B89B5E]' 
                      : 'text-[#D8CBB8]/80 hover:text-[#F5F1E8]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#B89B5E] rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Primary CTA */}
          <div className="flex items-center space-x-4 md:space-x-6">
            
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
        <div className="space-y-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#B89B5E] font-medium border-b border-[#D8CBB8]/10 pb-3">
            Menu Navigation
          </p>
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="font-serif text-2xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors flex items-center justify-between group"
              >
                <span>{link.label}</span>
                <span className="text-xs text-[#D8CBB8]/40 group-hover:text-[#B89B5E] font-sans">
                  0{navLinks.indexOf(link) + 1}
                </span>
              </Link>
            ))}
            <Link
              to="/contact"
              className="font-serif text-2xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors flex items-center justify-between group"
            >
              <span>CONTACT & ATELIER</span>
              <span className="text-xs text-[#D8CBB8]/40 group-hover:text-[#B89B5E] font-sans">
                07
              </span>
            </Link>
          </nav>
        </div>

        <div className="space-y-4 pt-8 border-t border-[#D8CBB8]/10">
          <Link
            to="/bespoke"
            className="block w-full text-center py-3.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors"
          >
            START BESPOKE INQUIRY
          </Link>

          <div className="flex items-center justify-between text-[11px] text-[#D8CBB8]/60 pt-2 font-sans tracking-widest">
            <span>LAGOS ATELIER</span>
            <a 
              href={BRAND_CONFIG.social.tiktok} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#B89B5E] hover:underline"
            >
              TIKTOK: @_N_ELSON
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
