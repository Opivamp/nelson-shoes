import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, Check, ShieldCheck, Clock } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrencyNGN, formatCurrencyUSD } from '../../data/config';
import { useCart } from '../../context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<number>(42);
  const [isBespokeFitting, setIsBespokeFitting] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, selectedSize, isBespokeFitting);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in text-[#F5F1E8]">
      <div 
        className="relative bg-[#0E0E0E] border border-[#D8CBB8]/20 max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#D8CBB8]/60 hover:text-[#F5F1E8] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Left: Product Image */}
        <div className="relative aspect-square md:aspect-auto bg-[#141414] overflow-hidden">
          <img
            src={product.primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute bottom-4 left-4 bg-[#0A0A0A]/80 backdrop-blur-md px-3 py-1 border border-[#D8CBB8]/10 text-[9px] uppercase tracking-widest text-[#B89B5E]">
            {product.categoryLabel}
          </div>
        </div>

        {/* Right: Details & Action */}
        <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B89B5E] block font-medium">
                {product.status}
              </span>
              <h2 className="font-serif text-2xl text-[#F5F1E8] mt-1">
                {product.name}
              </h2>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-serif text-xl text-[#F5F1E8]">
                {formatCurrencyNGN(product.priceNGN)}
              </span>
              <span className="text-xs text-[#D8CBB8]/50 font-sans">
                ≈ {formatCurrencyUSD(product.priceUSD)}
              </span>
            </div>

            <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Sizing Picker */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs text-[#D8CBB8]/70 mb-2">
                <span>Select EU Size:</span>
                <span className="text-[#B89B5E] text-[10px] uppercase tracking-wider">
                  True to bespoke last
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizesAvailable.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-9 h-8 text-xs font-sans transition-colors border ${
                      selectedSize === size
                        ? 'border-[#B89B5E] bg-[#B89B5E] text-[#0A0A0A] font-semibold'
                        : 'border-[#D8CBB8]/20 bg-[#161616] text-[#D8CBB8] hover:border-[#B89B5E]/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Bespoke Fitting Option Checkbox */}
            <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isBespokeFitting}
                onChange={(e) => setIsBespokeFitting(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#B89B5E] rounded-none bg-black border-[#D8CBB8]/30"
              />
              <span className="text-xs text-[#D8CBB8]/80 font-sans">
                Request custom anatomical last fitting (+ consult)
              </span>
            </label>
          </div>

          {/* Action Row */}
          <div className="space-y-2 pt-2 border-t border-[#D8CBB8]/10">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors flex items-center justify-center gap-2"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>ADDED TO BAG</span>
                </>
              ) : (
                <span>COMMISSION THIS PIECE</span>
              )}
            </button>

            <Link
              to={`/product/${product.slug}`}
              onClick={onClose}
              className="w-full py-2.5 bg-transparent border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-[#F5F1E8] text-[10px] tracking-[0.2em] uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              <span>VIEW FULL SPECIFICATION</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#D8CBB8]/50 pt-1 border-t border-[#D8CBB8]/10">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#B89B5E]" /> 100% Hand-Welted
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#B89B5E]" /> {product.standardLeadTime}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
