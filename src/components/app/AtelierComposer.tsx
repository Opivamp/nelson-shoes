import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors, 
  Ruler, 
  MessageCircle, 
  Package, 
  Sparkles, 
  Check, 
  X, 
  Send
} from 'lucide-react';
import { getWhatsAppUrl } from '../../data/config';

interface AtelierComposerProps {
  onOpenQuickCommission?: () => void;
}

export const AtelierComposer: React.FC<AtelierComposerProps> = ({ onOpenQuickCommission }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bespokeIdea, setBespokeIdea] = useState('');
  const [selectedLeather, setSelectedLeather] = useState('French Box Calf');
  const [selectedStyle, setSelectedStyle] = useState('Wholecut Oxford');
  const [submitted, setSubmitted] = useState(false);

  const handleOpen = () => {
    if (onOpenQuickCommission) {
      onOpenQuickCommission();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Hello Nelson Atelier,\n\nI would like to initiate a bespoke footwear commission:\n- Preferred Style: ${selectedStyle}\n- Leather Choice: ${selectedLeather}\n- Vision / Notes: ${bespokeIdea || 'Classic bespoke fit'}\n\nPlease advise on lasting appointment and timeline.`;
    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setBespokeIdea('');
    }, 1800);
  };

  return (
    <>
      {/* App Feed Composer Bar (Guaranteed Zero Horizontal Overflow on Mobile) */}
      <div className="bg-[#121212] border border-[#D8CBB8]/15 p-3 sm:p-4 shadow-lg backdrop-blur-sm w-full min-w-0 overflow-hidden">
        
        {/* Top Input Row */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full min-w-0">
          
          {/* Avatar / Customer Monogram */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#1A1A1A] via-[#2A2418] to-[#1A1A1A] border border-[#B89B5E]/50 flex items-center justify-center text-[#B89B5E] font-serif text-sm font-semibold shadow-inner shrink-0">
              N
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-[#121212]" title="Atelier Open" />
          </div>

          {/* Fake Input trigger */}
          <button
            onClick={handleOpen}
            className="flex-1 min-w-0 min-h-[44px] bg-[#1A1A1A] hover:bg-[#222222] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 text-left px-3 sm:px-4 py-2.5 text-xs text-[#D8CBB8]/70 hover:text-[#F5F1E8] transition-all flex items-center justify-between gap-1 group cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#B89B5E] overflow-hidden"
            aria-label="Commission bespoke footwear"
          >
            <span className="truncate block min-w-0 text-[11px] sm:text-xs">
              What bespoke footwear would you like to commission today?
            </span>
            <Sparkles size={14} className="text-[#B89B5E] opacity-70 group-hover:opacity-100 group-hover:rotate-12 transition-all shrink-0 ml-1" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#D8CBB8]/10 my-2.5 sm:my-3" />

        {/* Action Pills Row — Strict 44px Touch Targets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full min-w-0">
          
          {/* Action 1: Custom Last */}
          <button
            onClick={handleOpen}
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 bg-[#161616] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/40 text-[#D8CBB8]/80 hover:text-[#B89B5E] text-[11px] sm:text-xs font-mono font-medium transition-colors group cursor-pointer min-w-0 overflow-hidden"
          >
            <Scissors size={13} className="text-[#B89B5E] group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate">Bespoke Last</span>
          </button>

          {/* Action 2: Anatomy & Sizing */}
          <Link
            to="/bespoke"
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 bg-[#161616] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/40 text-[#D8CBB8]/80 hover:text-[#B89B5E] text-[11px] sm:text-xs font-mono font-medium transition-colors group min-w-0 overflow-hidden"
          >
            <Ruler size={13} className="text-[#E8D49E] group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate">Anatomy Scan</span>
          </Link>

          {/* Action 3: Live Concierge */}
          <a
            href={getWhatsAppUrl("Hello Nelson Atelier, I would like to consult with the Master Cordwainer regarding a new bespoke commission.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 bg-[#161616] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/40 text-[#D8CBB8]/80 hover:text-[#B89B5E] text-[11px] sm:text-xs font-mono font-medium transition-colors group min-w-0 overflow-hidden"
          >
            <MessageCircle size={13} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate">Cordwainer Live</span>
          </a>

          {/* Action 4: Track Order */}
          <Link
            to="/track"
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 bg-[#161616] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/40 text-[#D8CBB8]/80 hover:text-[#B89B5E] text-[11px] sm:text-xs font-mono font-medium transition-colors group min-w-0 overflow-hidden"
          >
            <Package size={13} className="text-[#B89B5E] group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate">Track Order</span>
          </Link>

        </div>

      </div>

      {/* Modal Dialog for Quick Commission */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-[#121212] border border-[#B89B5E]/40 w-full max-w-lg p-5 sm:p-6 relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D8CBB8]/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#B89B5E]/20 text-[#B89B5E] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                  N
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg text-[#F5F1E8]">Commission an Atelier Creation</h3>
                  <p className="text-[10px] sm:text-[11px] font-mono text-[#B89B5E]">Private Bespoke Desk • Lagos Workshop</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#D8CBB8]/60 hover:text-[#F5F1E8] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check size={24} />
                </div>
                <h4 className="font-serif text-base sm:text-lg text-[#F5F1E8]">Consultation Routed</h4>
                <p className="text-xs text-[#D8CBB8]/70 font-mono">
                  Opening WhatsApp dialogue with our Master Cordwainer...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3.5">
                {/* Silhouette selector */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#D8CBB8]/70 mb-1">
                    Desired Silhouette
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 rounded-lg px-3 py-2 text-xs text-[#F5F1E8] focus:border-[#B89B5E] focus:outline-none"
                  >
                    <option value="Wholecut Oxford">The Sovereign Wholecut Oxford</option>
                    <option value="Espresso Monkstrap">The Imperial Double Monkstrap</option>
                    <option value="Nocturne Chelsea Boot">The Nocturne Chelsea Boot</option>
                    <option value="Venetian Tassel Loafer">The Venetian Tassel Loafer</option>
                    <option value="Fully Custom Last">Fully Custom Bespoke Last (Original Design)</option>
                  </select>
                </div>

                {/* Leather selector */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#D8CBB8]/70 mb-1">
                    Leather / Tannery Selection
                  </label>
                  <select
                    value={selectedLeather}
                    onChange={(e) => setSelectedLeather(e.target.value)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 rounded-lg px-3 py-2 text-xs text-[#F5F1E8] focus:border-[#B89B5E] focus:outline-none"
                  >
                    <option value="French Box Calf (Black)">Tanneries d'Annonay — French Box Calf (Black)</option>
                    <option value="Espresso Museum Calf">Tuscan Museum Calf (Espresso Burnish)</option>
                    <option value="Cognac Antique Patina">Cognac Full-Grain with Hand-Glacage</option>
                    <option value="Bordeaux Crust Leather">Bordeaux Crust (Custom Hand-Patina)</option>
                    <option value="Genuine Alligator / Exotic">Exotic Alligator / Lizard (Private Commission)</option>
                  </select>
                </div>

                {/* Free text ideas */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#D8CBB8]/70 mb-1">
                    Anatomical Notes or Specific Vision
                  </label>
                  <textarea
                    rows={3}
                    value={bespokeIdea}
                    onChange={(e) => setBespokeIdea(e.target.value)}
                    placeholder="e.g. High instep, desire initials hand-punched on heel breast..."
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 rounded-lg px-3 py-2 text-xs text-[#F5F1E8] placeholder-[#D8CBB8]/30 focus:border-[#B89B5E] focus:outline-none resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#D8CBB8]/60 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#B89B5E]" />
                    Direct with Nelson
                  </span>
                  
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#B89B5E] to-[#A3874B] text-[#0A0A0A] font-mono text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Initiate Commission</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
};
