import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { getWhatsAppUrl } from '../../data/config';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Subtle Luxury Tooltip / Message Box */}
      {isOpen && (
        <div className="mb-3 p-4 bg-[#141414] border border-[#B89B5E]/30 rounded-none shadow-2xl max-w-xs text-left animate-fade-in text-[#F5F1E8]">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8CBB8]/10 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#B89B5E] font-medium">
              NELSON ATELIER CONCIERGE
            </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[#D8CBB8]/60 hover:text-[#F5F1E8]"
              aria-label="Close message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-[#D8CBB8]/80 font-sans mb-3 leading-relaxed">
            Connect directly with our master shoemaker to discuss foot sizing, custom lasts, or bespoke commissioning.
          </p>
          <a
            href={getWhatsAppUrl("Hello Nelson Atelier, I would like to speak directly with the shoemaker about a bespoke commission.")}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center py-2 bg-[#B89B5E] text-[#0A0A0A] text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-[#D4BD86] transition-colors"
          >
            START WHATSAPP CHAT
          </a>
        </div>
      )}

      {/* Discreet Luxury Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact Nelson Atelier on WhatsApp"
        className="group relative flex items-center gap-2.5 px-3.5 py-2.5 bg-[#121212] border border-[#B89B5E]/40 hover:border-[#B89B5E] text-[#F5F1E8] shadow-2xl transition-all duration-300"
      >
        <MessageCircle className="w-4 h-4 text-[#B89B5E] group-hover:scale-110 transition-transform duration-300" />
        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] font-medium text-[#D8CBB8] group-hover:text-[#F5F1E8]">
          ATELIER CHAT
        </span>
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B89B5E] rounded-full animate-ping opacity-75"></span>
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B89B5E] rounded-full"></span>
      </button>
    </div>
  );
};
