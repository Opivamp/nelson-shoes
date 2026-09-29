import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { formatCurrencyNGN, formatCurrencyUSD, getWhatsAppUrl } from '../../data/config';

export const AppRightSidebar: React.FC = () => {
  const { orders } = useOrders();
  const { products } = useProducts();

  const trendingProduct = products.find(p => p.isFeatured) || products[0];
  const recentOrders = orders.slice(0, 3);

  return (
    <aside className="w-80 shrink-0 hidden 2xl:block sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto no-scrollbar p-4 space-y-5 bg-[#0A0A0A] border-l border-[#D8CBB8]/10 text-xs font-sans">
      
      {/* Master Cordwainer Live Status */}
      <div className="p-4 bg-[#121212] border border-[#B89B5E]/30 rounded-xl space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Atelier Bench Active</span>
          </span>
          <span className="text-[10px] font-mono text-[#D8CBB8]/50">Lagos, NG</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#B89B5E] to-[#E8D49E] p-0.5 shrink-0">
            <div className="w-full h-full rounded-full bg-[#181818] flex items-center justify-center text-[#B89B5E] font-serif text-sm">
              N
            </div>
          </div>
          <div>
            <span className="font-serif text-xs text-[#F5F1E8] font-medium block">
              Nelson (Master Cordwainer)
            </span>
            <span className="text-[10px] text-[#D8CBB8]/70 block font-sans">
              Currently hand-welting bespoke commissions.
            </span>
          </div>
        </div>

        <a
          href={getWhatsAppUrl("Hello Master Nelson, I would like to consult with you on my shoe order.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-[11px] font-mono rounded transition-colors"
        >
          <MessageCircle size={13} />
          <span>Consult With Master Nelson</span>
        </a>
      </div>

      {/* Live Atelier Workbench Ticker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D8CBB8]/50 font-mono font-semibold flex items-center gap-1.5">
            <Clock size={12} className="text-[#B89B5E]" />
            <span>LIVE WORKBENCH PIPELINE</span>
          </span>
          <Link to="/track" className="text-[10px] font-mono text-[#B89B5E] hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-2">
          {recentOrders.map((ord) => (
            <Link
              key={ord.id}
              to={`/track?order=${ord.orderNumber}`}
              className="block p-3 bg-[#121212] hover:bg-[#161616] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/30 rounded-lg transition-all"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#B89B5E] font-bold">{ord.orderNumber}</span>
                <span className="text-emerald-400">● Live</span>
              </div>
              <p className="text-[11px] text-[#F5F1E8] font-medium mt-1 truncate">
                {ord.customer.firstName} {ord.customer.lastName} • {ord.items[0]?.product.name || 'Bespoke Pair'}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-[#D8CBB8]/60 font-mono">
                <Truck size={10} className="text-[#B89B5E]" />
                <span className="truncate">{ord.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Creation Highlight Card */}
      {trendingProduct && (
        <div className="p-3.5 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold flex items-center gap-1">
              <TrendingUp size={12} />
              <span>CREATION SPOTLIGHT</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#B89B5E]/10 text-[#B89B5E]">
              {trendingProduct.category.toUpperCase()}
            </span>
          </div>

          <Link to={`/product/${trendingProduct.slug}`} className="block group">
            <div className="relative h-32 rounded-lg overflow-hidden bg-black mb-2">
              <img
                src={trendingProduct.primaryImage}
                alt={trendingProduct.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono text-[#F5F1E8]">
                {formatCurrencyNGN(trendingProduct.priceNGN)}
              </span>
            </div>
            <h4 className="font-serif text-xs text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors truncate">
              {trendingProduct.name}
            </h4>
            <p className="text-[10px] text-[#D8CBB8]/60 font-sans line-clamp-1">
              {trendingProduct.tagline}
            </p>
          </Link>
        </div>
      )}

      {/* Quality Seal */}
      <div className="p-3 bg-[#101010] border border-[#D8CBB8]/10 rounded-lg space-y-1.5 text-[11px] text-[#D8CBB8]/70 font-sans">
        <div className="flex items-center gap-1.5 text-[#B89B5E] font-mono text-[10px] uppercase font-semibold">
          <ShieldCheck size={13} />
          <span>Atelier Standards</span>
        </div>
        <p className="text-[10px] text-[#D8CBB8]/60 leading-relaxed">
          100% French Calfskin • Hand-Welted Inseam • 14-Month Oak Bark Soles • Complimentary Worldwide Courier.
        </p>
      </div>
    </aside>
  );
};
