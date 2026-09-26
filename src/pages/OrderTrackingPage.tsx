import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  ArrowLeft, 
  MessageCircle, 
  Sparkles,
  Layers,
  MapPin
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { formatCurrencyNGN, formatCurrencyUSD } from '../data/config';
import type { CustomerOrder } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = searchParams.get('order') || '';

  const { getOrderByIdOrNumber, orders } = useOrders();
  const [searchInput, setSearchInput] = useState(initialRef);
  const [foundOrder, setFoundOrder] = useState<CustomerOrder | null>(() => {
    if (initialRef) {
      return getOrderByIdOrNumber(initialRef) || null;
    }
    return orders[0] || null;
  });

  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialRef) {
      const ord = getOrderByIdOrNumber(initialRef);
      if (ord) setFoundOrder(ord);
    }
  }, [initialRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (!searchInput.trim()) return;

    const ord = getOrderByIdOrNumber(searchInput);
    setFoundOrder(ord || null);
    if (ord) {
      setSearchParams({ order: ord.orderNumber });
    }
  };

  const getStagePercent = (status: string) => {
    switch (status) {
      case 'Pending Confirmation': return 15;
      case 'At Workbench (Lasting)': return 35;
      case 'Welt Inseam Stitching': return 55;
      case 'Patina & Glacage': return 75;
      case 'Quality Inspection': return 90;
      case 'Dispatched': return 98;
      case 'Delivered': return 100;
      default: return 20;
    }
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-6 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            to="/collection"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#B89B5E] hover:underline"
          >
            <ArrowLeft size={14} />
            <span>Return to Collection</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
            Client Portal
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F1E8] font-light">
            Live Commission & Workbench Tracker
          </h1>
          <p className="text-xs text-[#D8CBB8]/70 max-w-md mx-auto">
            Input your order reference number to follow your footwear through the lasting, hand-welting, and glacage stages.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. NS-ORD-882190"
              className="w-full bg-[#141414] border border-[#D8CBB8]/20 pl-10 pr-4 py-3 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider hover:bg-[#D4BD86] transition-colors"
          >
            Track
          </button>
        </form>

        {/* Order Details Display */}
        {foundOrder ? (
          <div className="bg-[#121212] border border-[#B89B5E]/30 p-6 md:p-8 rounded-xl space-y-8 shadow-2xl animate-fadeIn">
            {/* Order Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8CBB8]/15">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] font-mono block">
                  Commission Reference
                </span>
                <h2 className="font-mono text-xl sm:text-2xl text-[#F5F1E8] font-bold">
                  {foundOrder.orderNumber}
                </h2>
                <span className="text-xs text-[#D8CBB8]/60 font-sans block mt-0.5">
                  Placed by {foundOrder.customer.firstName} {foundOrder.customer.lastName} • Destination: {foundOrder.customer.city}, {foundOrder.customer.country}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase tracking-widest text-[#D8CBB8]/50 block font-mono">
                  Current Status
                </span>
                <span className="inline-block mt-1 px-3 py-1 bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/30 text-xs font-mono font-semibold uppercase tracking-wider rounded">
                  {foundOrder.status}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#D8CBB8]/60 uppercase">Crafting Progress</span>
                <span className="text-[#B89B5E] font-bold">{getStagePercent(foundOrder.status)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#181818] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#B89B5E] to-[#D4BD86] rounded-full transition-all duration-700"
                  style={{ width: `${getStagePercent(foundOrder.status)}%` }}
                />
              </div>
            </div>

            {/* Artisan Bench Note */}
            {foundOrder.artisanNotes && (
              <div className="p-4 bg-[#181818] border border-[#D8CBB8]/15 rounded flex items-start gap-3">
                <div className="p-1 rounded bg-[#B89B5E]/10 text-[#B89B5E] shrink-0 mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold block">
                    Master Cordwainer Bench Log:
                  </span>
                  <p className="text-xs text-[#D8CBB8]/90 italic font-serif">
                    "{foundOrder.artisanNotes}"
                  </p>
                </div>
              </div>
            )}

            {/* Tracking Code if Dispatched */}
            {foundOrder.trackingNumber && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Truck size={16} />
                  <span>DHL Express Tracking Reference: <strong>{foundOrder.trackingNumber}</strong></span>
                </div>
                <span className="text-[10px] text-emerald-400/70">Insured Dispatch</span>
              </div>
            )}

            {/* Commissioned Items List */}
            <div className="space-y-4 pt-2">
              <h3 className="font-serif text-base text-[#F5F1E8]">
                Commissioned Pieces ({foundOrder.items.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {foundOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-[#161616] border border-[#D8CBB8]/10 rounded">
                    <img
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      className="w-16 h-18 object-cover rounded bg-black"
                    />
                    <div className="min-w-0 flex-1 space-y-1 text-xs">
                      <h4 className="font-serif text-sm text-[#F5F1E8] font-medium truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-[#B89B5E] font-mono">
                        Size EU {item.size} • Qty {item.quantity}
                      </p>
                      {item.isBespokeFitting && (
                        <p className="text-[10px] text-emerald-400 font-mono">
                          ✓ Anatomical Last Fitting
                        </p>
                      )}
                      <p className="text-xs font-mono text-[#F5F1E8]">
                        {formatCurrencyNGN(item.product.priceNGN * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inquiry Assistance */}
            <div className="pt-4 border-t border-[#D8CBB8]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-[#D8CBB8]/60 font-sans">
                Need to discuss adjustments with the master shoemaker?
              </span>
              <a
                href={`https://wa.me/2348000000000?text=${encodeURIComponent(`Hello Nelson Atelier, I am inquiring regarding my order ${foundOrder.orderNumber}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded font-mono hover:bg-emerald-600/30 transition-colors flex items-center gap-1.5"
              >
                <MessageCircle size={14} />
                <span>Message Nelson on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="p-12 text-center bg-[#121212] border border-[#D8CBB8]/15 space-y-3">
            <h3 className="font-serif text-lg text-[#F5F1E8]">Order Reference Not Found</h3>
            <p className="text-xs text-[#D8CBB8]/60 max-w-sm mx-auto">
              We could not locate an order matching "{searchInput}". Please double check your order reference number.
            </p>
          </div>
        ) : null}

      </div>
    </div>
  );
};
