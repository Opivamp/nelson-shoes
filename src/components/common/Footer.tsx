import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { BRAND_CONFIG, getWhatsAppUrl } from '../../data/config';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#D8CBB8]/10 text-[#F5F1E8] pt-20 pb-12 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#241711]/40 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        
        {/* Top Section: Brand Statement & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-[#D8CBB8]/10">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="w-10 h-10 border border-[#B89B5E]/50 flex items-center justify-center">
              <span className="font-serif text-xl font-light text-[#B89B5E]">N</span>
            </div>
            
            <h2 className="font-display tracking-[0.25em] text-2xl md:text-3xl font-light text-[#F5F1E8]">
              {BRAND_CONFIG.name}
            </h2>

            <p className="font-serif italic text-xl md:text-2xl text-[#B89B5E] max-w-md">
              "{BRAND_CONFIG.headline}"
            </p>

            <p className="text-sm text-[#D8CBB8]/70 max-w-md leading-relaxed font-sans font-light">
              Bespoke footwear shaped by hand, defined by precision. Handcrafted in Lagos, Nigeria for connoisseurs worldwide who believe that shoes are wearable architecture.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-end space-y-6">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#B89B5E] font-medium block mb-2">
                THE ATELIER JOURNAL
              </span>
              <h3 className="font-serif text-2xl text-[#F5F1E8] mb-2">
                JOIN THE JOURNAL
              </h3>
              <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed">
                Receive private invitations to limited hide allocations, new seasonal silhouettes, and cordwaining insights from master artisans.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="relative max-w-md">
              <div className="flex border-b border-[#D8CBB8]/30 focus-within:border-[#B89B5E] transition-colors pb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-transparent text-sm text-[#F5F1E8] placeholder-[#D8CBB8]/40 focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to Journal"
                  className="text-[#B89B5E] hover:text-[#F5F1E8] transition-colors p-1 flex items-center gap-1 text-xs tracking-widest uppercase font-medium"
                >
                  {subscribed ? (
                    <span className="flex items-center text-xs text-[#B89B5E] gap-1">
                      <Check className="w-3.5 h-3.5" /> SUBSCRIBED
                    </span>
                  ) : (
                    <>
                      <span>JOIN</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-[#B89B5E] mt-2">
                  Welcome to the Nelson Atelier Journal circle.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Middle Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16 border-b border-[#D8CBB8]/10 text-xs">
          
          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-[#B89B5E] font-semibold">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 font-sans text-[#D8CBB8]/70">
              <li>
                <Link to="/collection" className="hover:text-[#B89B5E] transition-colors">
                  Collection Catalog
                </Link>
              </li>
              <li>
                <Link to="/bespoke" className="hover:text-[#B89B5E] transition-colors">
                  Bespoke Experience
                </Link>
              </li>
              <li>
                <Link to="/craft" className="hover:text-[#B89B5E] transition-colors">
                  The Craft & Lasts
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#B89B5E] transition-colors">
                  About Nelson
                </Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-[#B89B5E] transition-colors">
                  Editorial Journal
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#B89B5E] transition-colors">
                  Artisan Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-[#B89B5E] font-semibold">
              BESPOKE SERVICES
            </h4>
            <ul className="space-y-2.5 font-sans text-[#D8CBB8]/70">
              <li>
                <Link to="/bespoke" className="hover:text-[#B89B5E] transition-colors">
                  Private Consultation
                </Link>
              </li>
              <li>
                <Link to="/bespoke" className="hover:text-[#B89B5E] transition-colors">
                  Anatomical Foot Mapping
                </Link>
              </li>
              <li>
                <Link to="/collection?category=custom" className="hover:text-[#B89B5E] transition-colors">
                  Patina Formulations
                </Link>
              </li>
              <li>
                <Link to="/craft" className="hover:text-[#B89B5E] transition-colors">
                  Goodyear Welt Inseam
                </Link>
              </li>
              <li>
                <Link to="/bespoke" className="hover:text-[#B89B5E] transition-colors">
                  Wedding & Executive Commissions
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-[#B89B5E] font-semibold">
              COMMUNICATIONS
            </h4>
            <ul className="space-y-2.5 font-sans text-[#D8CBB8]/70">
              <li>
                <a 
                  href={getWhatsAppUrl("Hello Nelson, I would like to inquire about bespoke footwear.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B89B5E] transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-[#B89B5E] rounded-full inline-block"></span>
                  WhatsApp Atelier
                </a>
              </li>
              <li>
                <a 
                  href={BRAND_CONFIG.social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B89B5E] transition-colors"
                >
                  TikTok: {BRAND_CONFIG.social.tiktokHandle}
                </a>
              </li>
              <li>
                <a 
                  href={BRAND_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B89B5E] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#B89B5E] transition-colors">
                  Direct Inquiries
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-[#B89B5E] transition-colors">
                  Track Commission
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-[#B89B5E] hover:underline font-mono">
                  Atelier Admin Console ⚡
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.25em] uppercase text-[#B89B5E] font-semibold">
              ATELIER SANCTUARY
            </h4>
            <p className="text-[#D8CBB8]/70 leading-relaxed font-sans">
              Lagos, Nigeria<br />
              Private Consultations by Appointment<br />
              <span className="text-[#B89B5E]/90 mt-2 block">
                Worldwide Express Courier
              </span>
            </p>
          </div>

        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#D8CBB8]/50 font-sans space-y-4 md:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} {BRAND_CONFIG.name}. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="hover:text-[#F5F1E8] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#D8CBB8]/20">•</span>
            <Link to="/terms" className="hover:text-[#F5F1E8] transition-colors">
              Terms & Bespoke Commission Conditions
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
