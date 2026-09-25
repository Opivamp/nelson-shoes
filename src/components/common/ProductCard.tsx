import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUpRight, Eye } from 'lucide-react';
import type { Product } from '../../types';
import { formatCurrencyNGN, formatCurrencyUSD } from '../../data/config';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  priority = false,
  onQuickView 
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const isSaved = isInWishlist(product.id);
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      className="group relative flex flex-col justify-between transition-all duration-500"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#121212] border border-[#D8CBB8]/10 group-hover:border-[#B89B5E]/40 transition-colors duration-500">
        
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.primaryImage}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        </Link>

        {/* Status / Category Pill */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
          <span className="px-2.5 py-1 bg-[#0A0A0A]/85 backdrop-blur-md text-[9px] uppercase tracking-[0.2em] font-medium text-[#B89B5E] border border-[#D8CBB8]/10">
            {product.categoryLabel}
          </span>
          {product.isBespokeOnly && (
            <span className="px-2 py-0.5 bg-[#B89B5E] text-[#0A0A0A] text-[8px] uppercase tracking-widest font-bold">
              BESPOKE ONLY
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-4 right-4 z-10 p-2 rounded-none backdrop-blur-md transition-all duration-300 ${
            isSaved 
              ? 'bg-[#B89B5E] text-[#0A0A0A]' 
              : 'bg-[#0A0A0A]/70 text-[#D8CBB8] hover:text-[#B89B5E]'
          }`}
          aria-label={isSaved ? "Remove from saved creations" : "Save creation to wishlist"}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick Actions Overlay */}
        <div 
          className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/60 to-transparent transition-all duration-300 flex items-center justify-between gap-2 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 py-2 bg-[#1A1A1A]/90 hover:bg-[#B89B5E] hover:text-[#0A0A0A] text-[#F5F1E8] text-[10px] tracking-[0.2em] uppercase font-medium transition-colors flex items-center justify-center gap-1.5 border border-[#D8CBB8]/20"
            >
              <Eye className="w-3 h-3" />
              <span>QUICK VIEW</span>
            </button>
          )}

          <Link
            to={`/product/${product.slug}`}
            className="p-2 bg-[#B89B5E] text-[#0A0A0A] hover:bg-[#D4BD86] transition-colors"
            title="View Details"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Editorial Information Block */}
      <div className="pt-5 space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif text-lg md:text-xl text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors duration-300">
              {product.name}
            </h3>
          </Link>
          <div className="text-right">
            <span className="font-serif text-sm md:text-base text-[#F5F1E8] block">
              {formatCurrencyNGN(product.priceNGN)}
            </span>
            <span className="text-[10px] text-[#D8CBB8]/50 font-sans block">
              ≈ {formatCurrencyUSD(product.priceUSD)}
            </span>
          </div>
        </div>

        <p className="text-xs text-[#D8CBB8]/60 line-clamp-1 font-sans font-light">
          {product.tagline}
        </p>

        <div className="pt-1 flex items-center justify-between text-[10px] text-[#D8CBB8]/50 uppercase tracking-widest font-sans border-t border-[#D8CBB8]/10">
          <span>{product.status}</span>
          <span className="text-[#B89B5E] group-hover:translate-x-0.5 transition-transform duration-300">
            EXPLORE →
          </span>
        </div>
      </div>

    </div>
  );
};
