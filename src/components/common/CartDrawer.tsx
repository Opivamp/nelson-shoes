import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrencyNGN, formatCurrencyUSD } from '../../data/config';

export const CartDrawer: React.FC = () => {
  const { 
    isOpen, 
    closeCart, 
    items, 
    removeItem, 
    updateQuantity, 
    totalItems, 
    subtotalNGN, 
    subtotalUSD,
    generateWhatsAppOrderUrl 
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark backdrop */}
      <div 
        onClick={closeCart}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0E0E0E] border-l border-[#D8CBB8]/15 shadow-2xl flex flex-col justify-between text-[#F5F1E8]">
          
          {/* Header */}
          <div className="p-6 border-b border-[#D8CBB8]/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#B89B5E] font-medium block">
                ATELIER COMMISSION BAG
              </span>
              <h2 className="font-serif text-xl text-[#F5F1E8]">
                YOUR SELECTIONS ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-[#D8CBB8]/60 hover:text-[#F5F1E8] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 border border-[#B89B5E]/30 mx-auto flex items-center justify-center text-[#B89B5E] font-serif text-xl">
                  N
                </div>
                <h3 className="font-serif text-lg text-[#F5F1E8]">
                  YOUR BAG IS CURRENTLY EMPTY
                </h3>
                <p className="text-xs text-[#D8CBB8]/60 font-sans max-w-xs mx-auto">
                  Every pair of Nelson shoes is an investment in timeless cordwaining. Begin exploring our handcrafted catalog.
                </p>
                <div className="pt-2">
                  <button
                    onClick={closeCart}
                    className="inline-block px-5 py-2.5 bg-[#1C1C1C] border border-[#B89B5E]/50 text-[#F5F1E8] text-[10px] tracking-[0.2em] uppercase hover:bg-[#B89B5E] hover:text-[#0A0A0A] transition-colors"
                  >
                    DISCOVER THE COLLECTION
                  </button>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id}
                  className="flex gap-4 pb-6 border-b border-[#D8CBB8]/10 group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.primaryImage}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover object-center bg-[#181818] border border-[#D8CBB8]/10"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-serif text-base text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#D8CBB8]/40 hover:text-red-400 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#D8CBB8]/70 font-sans space-y-0.5 mt-1">
                        <p>Size: <span className="text-[#F5F1E8] font-medium">EU {item.size}</span></p>
                        <p>
                          Fitting: <span className="text-[#B89B5E]">
                            {item.isBespokeFitting ? "Custom Last Fitting" : "Standard Last"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#D8CBB8]/20 text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-[#D8CBB8]/60 hover:text-[#F5F1E8] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 font-sans text-xs text-[#F5F1E8]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-[#D8CBB8]/60 hover:text-[#F5F1E8] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="text-right">
                        <span className="font-serif text-sm text-[#F5F1E8] block">
                          {formatCurrencyNGN(item.product.priceNGN * item.quantity)}
                        </span>
                        <span className="text-[10px] text-[#D8CBB8]/50 font-sans block">
                          {formatCurrencyUSD(item.product.priceUSD * item.quantity)}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotals & Checkout Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#D8CBB8]/15 bg-[#121212]/90 space-y-4">
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#D8CBB8]/70 font-sans">
                  <span>Estimated Total</span>
                  <span className="text-[#B89B5E] text-[10px] uppercase tracking-wider">
                    Handcrafted to order
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-2xl text-[#F5F1E8]">
                    {formatCurrencyNGN(subtotalNGN)}
                  </span>
                  <span className="text-xs text-[#D8CBB8]/60 font-sans">
                    ≈ {formatCurrencyUSD(subtotalUSD)}
                  </span>
                </div>
                <p className="text-[10px] text-[#D8CBB8]/50 italic font-sans pt-1">
                  Complimentary worldwide express shipping on all bespoke orders.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={generateWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>ORDER VIA WHATSAPP</span>
                </a>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-transparent border border-[#D8CBB8]/30 text-[#F5F1E8] text-xs tracking-[0.2em] uppercase hover:border-[#B89B5E] hover:text-[#B89B5E] transition-colors"
                >
                  <span>BESPOKE CHECKOUT REQUEST</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
