import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Clock, 
  ArrowRight, 
  PlusCircle, 
  CheckCircle2, 
  Truck, 
  Sparkles,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { formatCurrencyNGN, formatCurrencyUSD } from '../../data/config';

export const AdminDashboardOverview: React.FC = () => {
  const { orders, resetOrders } = useOrders();
  const { products, resetToDefaultProducts } = useProducts();

  // Metrics calculation
  const totalRevenueNGN = orders.reduce((sum, ord) => sum + ord.subtotalNGN, 0);
  const totalRevenueUSD = orders.reduce((sum, ord) => sum + ord.subtotalUSD, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered').length;
  const pendingCount = orders.filter(o => o.status === 'Pending Confirmation').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8CBB8]/15">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
            Executive Summary
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#F5F1E8] font-light">
            Atelier Command Center
          </h1>
          <p className="text-xs text-[#D8CBB8]/60 font-sans mt-0.5">
            Real-time management of bespoke footwear commissions, catalog assets, and customer fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products?action=new"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider hover:bg-[#D4BD86] transition-colors"
          >
            <PlusCircle size={15} />
            <span>Upload Product</span>
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 px-4 py-2 border border-[#D8CBB8]/20 text-[#D8CBB8] text-xs uppercase tracking-wider hover:border-[#B89B5E] hover:text-[#B89B5E] transition-colors"
          >
            <span>View Orders ({orders.length})</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Revenue */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D8CBB8]/60">
            <span className="text-[10px] uppercase tracking-widest font-mono">Commission Value</span>
            <TrendingUp size={16} className="text-[#B89B5E]" />
          </div>
          <div className="text-xl md:text-2xl font-serif text-[#F5F1E8]">
            {formatCurrencyNGN(totalRevenueNGN)}
          </div>
          <div className="text-[11px] text-[#B89B5E] font-mono">
            ≈ {formatCurrencyUSD(totalRevenueUSD)} USD recorded
          </div>
        </div>

        {/* Metric 2: Active Orders */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D8CBB8]/60">
            <span className="text-[10px] uppercase tracking-widest font-mono">Active on Workbench</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-serif text-[#F5F1E8]">
            {activeOrdersCount} Commission{activeOrdersCount === 1 ? '' : 's'}
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono">
            {pendingCount} requiring confirmation
          </div>
        </div>

        {/* Metric 3: Total Products in Catalog */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D8CBB8]/60">
            <span className="text-[10px] uppercase tracking-widest font-mono">Live Footwear Catalog</span>
            <Package size={16} className="text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-serif text-[#F5F1E8]">
            {products.length} Silhouettes
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Published on public store
          </div>
        </div>

        {/* Metric 4: Fulfillment Rate */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D8CBB8]/60">
            <span className="text-[10px] uppercase tracking-widest font-mono">Artisan Delivery</span>
            <Truck size={16} className="text-[#B89B5E]" />
          </div>
          <div className="text-xl md:text-2xl font-serif text-[#F5F1E8]">
            DHL Express Insured
          </div>
          <div className="text-[11px] text-[#D8CBB8]/60 font-mono">
            Door-to-door worldwide
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-[#F5F1E8]">
              Recent Customer Commissions
            </h2>
            <p className="text-xs text-[#D8CBB8]/60 font-sans">
              Orders placed by website visitors awaiting or undergoing handcrafting.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-mono text-[#B89B5E] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#D8CBB8]/15 text-[#D8CBB8]/50 uppercase tracking-wider text-[10px] font-mono">
                <th className="pb-3">Order Ref</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Commissioned Pieces</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Workbench Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8CBB8]/10 text-xs">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-[#161616] transition-colors">
                  <td className="py-3.5 font-mono text-[#B89B5E] font-semibold">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5">
                    <span className="text-[#F5F1E8] font-medium block">
                      {order.customer.firstName} {order.customer.lastName}
                    </span>
                    <span className="text-[10px] text-[#D8CBB8]/50 block">
                      {order.customer.phoneWhatsApp}
                    </span>
                  </td>
                  <td className="py-3.5 max-w-xs truncate">
                    {order.items.map(i => `${i.product.name} (EU ${i.size})`).join(', ')}
                  </td>
                  <td className="py-3.5 text-[#D8CBB8]/70">
                    {order.customer.city}, {order.customer.country}
                  </td>
                  <td className="py-3.5 font-mono font-medium text-[#F5F1E8]">
                    {formatCurrencyNGN(order.subtotalNGN)}
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                      order.status === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : order.status === 'Pending Confirmation'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/30'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      to="/admin/orders"
                      className="px-2.5 py-1 bg-[#181818] hover:bg-[#B89B5E] hover:text-[#0A0A0A] border border-[#D8CBB8]/20 rounded text-[11px] text-[#D8CBB8] transition-colors"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catalog Grid Preview */}
      <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-[#F5F1E8]">
              Live Product Catalog ({products.length})
            </h2>
            <p className="text-xs text-[#D8CBB8]/60 font-sans">
              Footwear visible to visitors on the website. You can add new products or edit existing specifications.
            </p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-mono text-[#B89B5E] hover:underline flex items-center gap-1"
          >
            <span>Manage All Products</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="bg-[#181818] border border-[#D8CBB8]/10 p-3 rounded group space-y-2"
            >
              <div className="h-28 rounded overflow-hidden bg-black relative">
                <img
                  src={product.primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-mono text-[#B89B5E]">
                  {product.categoryLabel}
                </div>
              </div>
              <h4 className="font-serif text-xs text-[#F5F1E8] truncate font-medium">
                {product.name}
              </h4>
              <p className="text-[11px] font-mono text-[#B89B5E]">
                {formatCurrencyNGN(product.priceNGN)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Demo Data Bar */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#D8CBB8]/50 font-mono">
        <span>Lagos Atelier Central Database • Synchronized</span>
        <button
          onClick={() => {
            if (window.confirm('Reset catalog and orders to original default demo state?')) {
              resetOrders();
              resetToDefaultProducts();
            }
          }}
          className="flex items-center gap-1 hover:text-[#B89B5E] transition-colors"
        >
          <RotateCcw size={12} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
