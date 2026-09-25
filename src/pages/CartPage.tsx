import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrencyNGN, formatCurrencyUSD } from '../data/config';

export const CartPage: React.FC = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    totalItems, 
    subtotalNGN, 
    subtotalUSD,
    generateWhatsAppOrderUrl 
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-40 pb-24 text-center px-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 border border-[#B89B5E]/40 mx-auto flex items-center justify-center font-serif text-xl text-[#B89B5E]">
            N
          </div>
          <h1 className="font-serif text-3xl">YOUR ATELIER BAG IS EMPTY</h1>
          <p className="text-xs text-[#D8CBB8]/70 font-sans">
            Every creation at Nelson Shoes is an investment in artisanal perfection. Browse our catalog to select your next pair.
          </p>
          <div className="pt-2">
            <Link
              to="/collection"
              className="inline-block px-8 py-3.5 bg-[#B89B5E] text-[#0A0A0A] text-xs uppercase tracking-widest font-semibold hover:bg-[#D4BD86]"
            >
              EXPLORE THE COLLECTION
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D8CBB8]/15 pb-6">
          <div className="space-y-2">
            <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
              COMMISSION INQUIRY BAG
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#F5F1E8]">
              COMMISSION DOSSIER ({totalItems})
            </h1>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-[#D8CBB8]/60 hover:text-red-400 uppercase tracking-widest font-sans"
          >
            CLEAR ALL SELECTIONS
          </button>
        </div>

        {/* Cart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left: Items List */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-[#121212] border border-[#D8CBB8]/10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.product.primaryImage}
                    alt={item.product.name}
                    className="w-24 h-28 object-cover bg-[#161616] border border-[#D8CBB8]/10 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#B89B5E]">
                      {item.product.categoryLabel}
                    </span>
                    <h3 className="font-serif text-xl text-[#F5F1E8]">
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-[#D8CBB8]/70 font-sans space-y-0.5">
                      <p>Size: <strong className="text-[#F5F1E8]">EU {item.size}</strong></p>
                      <p>
                        Fitting: <span className="text-[#B89B5E]">
                          {item.isBespokeFitting ? "Custom Last Fitting" : "Standard Last"}
                        </span>
                      </p>
                      {item.customNotes && (
                        <p className="text-[11px] text-[#D8CBB8]/60 italic">
                          Notes: {item.customNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#D8CBB8]/20 text-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-[#D8CBB8]/60 hover:text-[#F5F1E8]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 font-sans text-xs text-[#F5F1E8]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-[#D8CBB8]/60 hover:text-[#F5F1E8]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="font-serif text-lg text-[#F5F1E8] block">
                      {formatCurrencyNGN(item.product.priceNGN * item.quantity)}
                    </span>
                    <span className="text-[10px] text-[#D8CBB8]/50 font-sans block">
                      ≈ {formatCurrencyUSD(item.product.priceUSD * item.quantity)}
                    </span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-[#D8CBB8]/40 hover:text-red-400 p-1 flex items-center gap-1 font-sans"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase">Remove</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Right: Summary & Order CTAs */}
          <div className="lg:col-span-4 bg-[#121212] border border-[#D8CBB8]/15 p-8 space-y-6">
            <h3 className="font-serif text-xl text-[#F5F1E8] border-b border-[#D8CBB8]/10 pb-4">
              COMMISSION SUMMARY
            </h3>

            <div className="space-y-3 text-xs font-sans text-[#D8CBB8]/75">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="text-[#F5F1E8] font-medium">{totalItems} pair(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Worldwide Express Courier</span>
                <span className="text-[#B89B5E] font-medium">Complimentary</span>
              </div>
              <div className="flex justify-between">
                <span>Bespoke Fitting Evaluation</span>
                <span className="text-[#B89B5E] font-medium">Included</span>
              </div>
              
              <div className="border-t border-[#D8CBB8]/10 pt-4 flex items-baseline justify-between">
                <span className="text-sm text-[#F5F1E8] uppercase tracking-wider font-semibold">
                  ESTIMATED TOTAL
                </span>
                <div className="text-right">
                  <span className="font-serif text-2xl text-[#F5F1E8] block">
                    {formatCurrencyNGN(subtotalNGN)}
                  </span>
                  <span className="text-xs text-[#D8CBB8]/50 block">
                    ≈ {formatCurrencyUSD(subtotalUSD)} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={generateWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>ORDER VIA WHATSAPP</span>
              </a>

              <Link
                to="/checkout"
                className="w-full py-3.5 bg-transparent border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-[#F5F1E8] text-xs tracking-[0.2em] uppercase font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>PROCEED TO ORDER REQUEST</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="pt-2 text-[10px] text-[#D8CBB8]/50 font-sans space-y-1">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B89B5E]" /> Guaranteed artisan leather origin & welt construction
              </p>
              <p>50% Deposit required upon bespoke order confirmation</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
