import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  MessageCircle, 
  ShoppingBag, 
  Eye, 
  Sparkles, 
  Check, 
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import type { Product } from '../../types';
import { formatCurrencyNGN, getWhatsAppUrl } from '../../data/config';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface AtelierFeedCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  benchNote?: string;
  hoursSpent?: number;
  timeAgo?: string;
}

export const AtelierFeedCard: React.FC<AtelierFeedCardProps> = ({
  product,
  onQuickView,
  benchNote = "Over 85 hours of hand-welting, bevelled waist shaping, and multi-layer mirror wax glacage.",
  hoursSpent = 85,
  timeAgo = "Finished today at Bench #1"
}) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = () => {
    // Add default size (e.g. first available or EU 42)
    const defaultSize = product.sizesAvailable && product.sizesAvailable.length > 0 
      ? product.sizesAvailable[0] 
      : 42;
    addItem(product, defaultSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Explore ${product.name} from Nelson Shoes Bespoke Atelier.`,
        url: window.location.origin + `/product/${product.slug}`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/product/${product.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsAppInquiryUrl = getWhatsAppUrl(
    `Hello Nelson Atelier,\n\nI am inquiring about the ${product.name} (${formatCurrencyNGN(product.priceNGN)}).\nCould you provide details on custom sizing and delivery timeline?`
  );

  return (
    <article className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl md:rounded-2xl overflow-hidden shadow-xl hover:border-[#B89B5E]/40 transition-all duration-300">
      
      {/* 1. App Post Header */}
      <div className="p-3.5 md:p-4.5 flex items-center justify-between border-b border-[#D8CBB8]/10">
        
        {/* Creator Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#B89B5E]/60 p-0.5 flex items-center justify-center overflow-hidden">
              <span className="font-serif font-bold text-sm text-[#B89B5E]">N</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#121212]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-sm font-medium text-[#F5F1E8] hover:text-[#B89B5E] transition-colors">
                Nelson Lagos Atelier
              </span>
              <span className="inline-flex items-center text-[10px] text-[#B89B5E] bg-[#B89B5E]/15 px-1.5 py-0.2 rounded-full font-mono">
                Master Bench
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#D8CBB8]/60 flex items-center gap-1">
              <span>{timeAgo}</span>
              <span>•</span>
              <span className="text-[#B89B5E]">{product.categoryLabel || product.category}</span>
            </p>
          </div>
        </div>

        {/* Options / Share dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-2 text-[#D8CBB8]/60 hover:text-[#F5F1E8] rounded-full hover:bg-[#1A1A1A] transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal size={18} />
          </button>

          {showShareMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#181818] border border-[#D8CBB8]/20 rounded-xl shadow-2xl py-1 z-30 animate-fadeIn">
              <button
                onClick={handleShare}
                className="w-full text-left px-3.5 py-2 text-xs font-mono text-[#D8CBB8] hover:bg-[#222222] hover:text-[#F5F1E8] flex items-center gap-2"
              >
                <Share2 size={13} className="text-[#B89B5E]" />
                <span>{copied ? 'Link Copied!' : 'Share Creation'}</span>
              </button>
              <Link
                to={`/product/${product.slug}`}
                className="w-full text-left px-3.5 py-2 text-xs font-mono text-[#D8CBB8] hover:bg-[#222222] hover:text-[#F5F1E8] flex items-center gap-2"
              >
                <ExternalLink size={13} className="text-[#B89B5E]" />
                <span>Full Spec Sheet</span>
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* 2. Post Caption / Editorial Narrative */}
      <div className="px-4 py-3 text-xs md:text-sm text-[#D8CBB8]/85 space-y-1.5 font-sans leading-relaxed">
        <div className="flex items-center justify-between">
          <Link 
            to={`/product/${product.slug}`}
            className="font-serif text-lg md:text-xl font-normal text-[#F5F1E8] hover:text-[#B89B5E] transition-colors"
          >
            {product.name}
          </Link>
          <span className="font-mono text-sm md:text-base font-semibold text-[#B89B5E]">
            {formatCurrencyNGN(product.priceNGN)}
          </span>
        </div>

        <p className="text-xs text-[#D8CBB8]/70 line-clamp-2">
          {product.description || benchNote}
        </p>

        {/* Specs Highlights Badge Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] text-[#B89B5E]/90">
          <span className="bg-[#1A1A1A] border border-[#D8CBB8]/15 px-2 py-0.5 rounded">
            🔨 {hoursSpent}h Benchwork
          </span>
          <span className="bg-[#1A1A1A] border border-[#D8CBB8]/15 px-2 py-0.5 rounded">
            ✨ {product.materials?.upper || 'French Box Calf'}
          </span>
          <span className="bg-[#1A1A1A] border border-[#D8CBB8]/15 px-2 py-0.5 rounded">
            🛡️ {product.materials?.construction || 'Goodyear Welted'}
          </span>
        </div>
      </div>

      {/* 3. Media Presentation (Feed Visual with Quick View Overlay) */}
      <div className="relative group bg-[#0A0A0A] aspect-[4/3] md:aspect-[16/10] overflow-hidden border-y border-[#D8CBB8]/10 cursor-pointer">
        <img
          src={product.primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          onClick={() => onQuickView(product)}
        />

        {/* Gradient vignette */}
        <div 
          onClick={() => onQuickView(product)}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" 
        />

        {/* Quick View Button on Image */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-[#B89B5E]/40 text-[#F5F1E8] hover:text-[#B89B5E] text-[11px] font-mono flex items-center gap-1.5 transition-all opacity-90 group-hover:opacity-100 hover:scale-105"
        >
          <Eye size={13} />
          <span>Inspect Piece</span>
        </button>

        {/* Status Chip */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#D8CBB8]/20 text-[10px] font-mono text-[#D8CBB8] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{product.status || 'Atelier Stock Ready'}</span>
        </div>
      </div>

      {/* 4. App Interactive Feed Action Bar (Like, Quick View, WhatsApp, Cart) */}
      <div className="p-3 md:p-3.5 flex items-center justify-between gap-2 bg-[#0E0E0E]">
        
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-mono transition-colors ${
              isLiked 
                ? 'text-rose-400 bg-rose-500/10' 
                : 'text-[#D8CBB8]/70 hover:text-rose-400 hover:bg-[#181818]'
            }`}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
            <span className="hidden sm:inline">{isLiked ? 'Saved' : 'Save'}</span>
          </button>

          {/* WhatsApp Direct Cordwainer Consultation */}
          <a
            href={whatsAppInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-mono text-[#D8CBB8]/70 hover:text-emerald-400 hover:bg-[#181818] transition-colors"
            title="Discuss with Master Cordwainer"
          >
            <MessageCircle size={15} />
            <span className="hidden sm:inline">Inquire</span>
          </a>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-mono text-[#D8CBB8]/70 hover:text-[#B89B5E] hover:bg-[#181818] transition-colors"
            aria-label="Share"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>

        </div>

        {/* Right Action: Add to Cart / Commission CTA */}
        <button
          onClick={handleAddToCart}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-semibold flex items-center gap-2 transition-all duration-300 shadow-md ${
            addedAnimation
              ? 'bg-emerald-500 text-[#0A0A0A]'
              : 'bg-[#B89B5E] hover:bg-[#C9AD70] text-[#0A0A0A] hover:shadow-[0_0_15px_rgba(184,155,94,0.3)]'
          }`}
        >
          {addedAnimation ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>Added to Trunk</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              <span>Commission Pair</span>
            </>
          )}
        </button>

      </div>

    </article>
  );
};
