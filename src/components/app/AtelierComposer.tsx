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
  Send,
  HelpCircle
} from 'lucide-react';
import { BRAND_CONFIG, getWhatsAppUrl } from '../../data/config';

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
      {/* App Feed Composer Bar (Social App Inspired for Luxury Atelier) */}
      <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl p-3.5 md:p-4 shadow-lg backdrop-blur-sm">
        
        {/* Top Input Row */}
        <div className="flex items-center gap-3">
          {/* Avatar / Patron Monogram */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1A1A1A] via-[#2A2418] to-[#1A1A1A] border border-[#B89B5E]/50 flex items-center justify-center text-[#B89B5E] font-serif text-sm font-semibold shadow-inner">
              N
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#121212]" title="Atelier Open" />
          </div>

          {/* Fake Input trigger */}
          <button
            onClick={handleOpen}
            className="flex-1 bg-[#1A1A1A] hover:bg-[#222222] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 text-left px-4 py-2.5 rounded-full text-xs md:text-sm text-[#D8CBB8]/60 hover:text-[#F5F1E8] transition-all flex items-center justify-between group cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#B89B5E]"
            aria-label="Commission bespoke footwear"
          >
            <span className="truncate">
              What bespoke footwear would you like to commission today?
            </span>
            <Sparkles size={15} className="text-[#B89B5E] opacity-70 group-hover:opacity-100 group-hover:rotate-12 transition-all shrink-0 ml-2" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#D8CBB8]/10 my-3" />

        {/* Action Pills Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          {/* Action 1: Custom Last */}
          <button
            onClick={handleOpen}
            className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg hover:bg-[#1A1A1A] text-[#D8CBB8]/80 hover:text-[#B89B5E] text-[11px] md:text-xs font-mono font-medium transition-colors group cursor-pointer"
          >
            <Scissors size={14} className="text-[#B89B5E] group-hover:scale-110 transition-transform" />
            <span className="truncate">Bespoke Last</span>
          </button>

          {/* Action 2: Anatomy & Sizing */}
          <Link
            to="/bespoke"
            className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg hover:bg-[#1A1A1A] text-[#D8CBB8]/80 hover:text-[#B89B5E] text-[11px] md:text-xs font-mono font-medium transition-colors group"
          >
            <Ruler size={14} className="text-[#E8D49E] group-hover:scale-110 transition-transform" />
            <span className="truncate">Anatomy Scan</span>
          </Link>

          {/* Action 3: Live Concierge */}
          <a
            href={getWhatsAppUrl("Hello Nelson Atelier, I would like to consult with the Master Cordwainer regarding a new bespoke commission.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg hover:bg-[#1A1A1A] text-[#D8CBB8]/80 hover:text-[#B89B5E] text-[11px] md:text-xs font-mono font-medium transition-colors group"
          >
            <MessageCircle size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Cordwainer Live</span>
          </a>

          {/* Action 4: Track Order */}
          <Link
            to="/track"
            className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg hover:bg-[#1A1A1A] text-[#D8CBB8]/80 hover:text-[#B89B5E] text-[11px] md:text-xs font-mono font-medium transition-colors group"
          >
            <Package size={14} className="text-[#B89B5E] group-hover:scale-110 transition-transform" />
            <span className="truncate">Track Order</span>
          </Link>

        </div>

      </div>

      {/* Modal Dialog for Quick Commission */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121212] border border-[#B89B5E]/40 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D8CBB8]/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B89B5E]/20 text-[#B89B5E] flex items-center justify-center font-serif font-bold text-sm">
                  N
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#F5F1E8]">Commission an Atelier Creation</h3>
                  <p className="text-[11px] font-mono text-[#B89B5E]">Private Bespoke Desk • Lagos Workshop</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#D8CBB8]/60 hover:text-[#F5F1E8] p-1 rounded-lg hover:bg-[#1C1C1C] transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check size={24} />
                </div>
                <h4 className="font-serif text-lg text-[#F5F1E8]">Consultation Routed</h4>
                <p className="text-xs text-[#D8CBB8]/70 font-mono">
                  Opening WhatsApp dialogue with our Master Cordwainer...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                {/* Silhouette selector */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CBB8]/70 mb-1.5">
                    Desired Silhouette
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 rounded-lg px-3.5 py-2.5 text-xs text-[#F5F1E8] focus:border-[#B89B5E] focus:outline-none"
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
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CBB8]/70 mb-1.5">
                    Leather / Tannery Selection
                  </label>
                  <select
                    value={selectedLeather}
                    onChange={(e) => setSelectedLeather(e.target.value)}
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 rounded-lg px-3.5 py-2.5 text-xs text-[#F5F1E8] focus:border-[#B89B5E] focus:outline-none"
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
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#D8CBB8]/70 mb-1.5">
                    Anatomical Notes or Specific Vision
                  </label>
                  <textarea
                    rows={3}
                    value={bespokeIdea}
                    onChange={(e) => setBespokeIdea(e.target.value)}
                    placeholder="e.g. High instep, desire initials hand-punched on heel breast, for a wedding ceremony in November..."
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 rounded-lg px-3.5 py-2.5 text-xs text-[#F5F1E8] placeholder-[#D8CBB8]/30 focus:border-[#B89B5E] focus:outline-none resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#D8CBB8]/60 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#B89B5E]" />
                    Direct dialogue with Nelson
                  </span>
                  
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#B89B5E] to-[#A3874B] text-[#0A0A0A] font-mono text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Send size={13} />
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
