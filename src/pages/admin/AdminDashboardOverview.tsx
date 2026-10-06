import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  AlertTriangle,
  ClipboardCheck,
  Ruler,
  AlertCircle,
  ShieldAlert,
  MapPin,
  Check
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { formatCurrencyNGN, formatCurrencyUSD } from '../../data/config';
import { db, isFirebaseConfigured } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { BespokeInquiryDocument } from '../../types';

export const AdminDashboardOverview: React.FC = () => {
  const { orders, resetOrders } = useOrders();
  const { products, resetToDefaultProducts } = useProducts();
  const [bespokeInquiries, setBespokeInquiries] = useState<BespokeInquiryDocument[]>([]);
  const [isBespokeLoading, setIsBespokeLoading] = useState(true);

  // Real-time listener for bespoke inquiries
  useEffect(() => {
    if (!db || !isFirebaseConfigured) {
      setIsBespokeLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'bespoke_inquiries'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs: BespokeInquiryDocument[] = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...(doc.data() as any) });
        });
        setBespokeInquiries(docs);
        setIsBespokeLoading(false);
      }, (err) => {
        console.warn('Could not subscribe to bespoke inquiries in dashboard:', err);
        setIsBespokeLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Dashboard bespoke listener init error:', e);
      setIsBespokeLoading(false);
    }
  }, []);

  // Financial & Operational Metrics (Derived strictly from real application state)
  const totalRevenueNGN = orders.reduce((sum, ord) => sum + (ord.totalNGN || ord.subtotalNGN || 0), 0);
  const totalRevenueUSD = orders.reduce((sum, ord) => sum + (ord.totalUSD || ord.subtotalUSD || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  // Operational Attention Queues (Strictly evaluated from live state)
  const newInquiriesCount = bespokeInquiries.filter(
    b => b.status === 'inquiry_submitted' || b.status === 'under_review'
  ).length;

  const quotesAwaitingAction = bespokeInquiries.filter(
    b => b.status === 'quotation_ready' || b.status === 'awaiting_customer_approval'
  ).length;

  const depositsPendingCount = bespokeInquiries.filter(
    b => b.status === 'deposit_pending' || (b.quotation && b.quotation.depositStatus === 'pending' && b.status === 'approved')
  ).length;

  const ordersEnteringProduction = orders.filter(
    o => o.status === 'Pending Confirmation'
  ).length;

  const ordersOnWorkbench = orders.filter(
    o => o.status === 'At Workbench (Lasting)' || o.status === 'Welt Inseam Stitching' || o.status === 'Patina & Glacage'
  ).length;

  const qualityInspectionsDue = orders.filter(
    o => o.status === 'Quality Inspection' && (!o.qualityInspection || o.qualityInspection.outcome === 'requires_rework')
  ).length;

  const awaitingDispatchCount = orders.filter(
    o => o.status === 'Quality Inspection' && o.qualityInspection && (o.qualityInspection.outcome === 'passed' || o.qualityInspection.outcome === 'passed_with_notes')
  ).length;

  const missingTrackingCount = orders.filter(
    o => o.customer?.deliveryMethod === 'dhl-express' && o.status !== 'Delivered' && o.status !== 'Cancelled' && (!o.trackingNumber || o.trackingNumber.trim().length === 0)
  ).length;

  const atelierPickupReadyCount = orders.filter(
    o => o.customer?.deliveryMethod === 'atelier-pickup' && o.readyForPickup === true && o.status !== 'Delivered'
  ).length;

  const exceptionsRequiringMaster = orders.filter(
    o => (o.qualityInspection && (o.qualityInspection.outcome === 'failed' || o.qualityInspection.outcome === 'requires_rework')) ||
         o.paymentStatus === 'failed' ||
         o.status === 'Cancelled'
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8CBB8]/15">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
            Atelier Command Center
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#F5F1E8] font-light">
            Production & Operational Overview
          </h1>
          <p className="text-xs text-[#D8CBB8]/60 font-sans mt-0.5">
            Real-time management of bespoke footwear commissions, artisan workbench allocation, and fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products?action=new"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider hover:bg-[#D4BD86] transition-colors"
          >
            <PlusCircle size={15} />
            <span>Upload Creation</span>
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 px-4 py-2 border border-[#D8CBB8]/20 text-[#D8CBB8] text-xs uppercase tracking-wider hover:border-[#B89B5E] hover:text-[#B89B5E] transition-colors"
          >
            <span>View Workbench ({orders.length})</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Primary Atelier Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D8CBB8]/60">
            <span className="text-[10px] uppercase tracking-widest font-mono">Active on Workbench</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-serif text-[#F5F1E8]">
            {activeOrdersCount} Commission{activeOrdersCount === 1 ? '' : 's'}
          </div>
          <div className="text-[11px] text-amber-400/90 font-mono">
            {ordersEnteringProduction} entering production
          </div>
        </div>

        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D8CBB8]/60">
            <span className="text-[10px] uppercase tracking-widest font-mono">Bespoke Inquiries</span>
            <Ruler size={16} className="text-purple-400" />
          </div>
          <div className="text-xl md:text-2xl font-serif text-[#F5F1E8]">
            {bespokeInquiries.length} Dossier{bespokeInquiries.length === 1 ? '' : 's'}
          </div>
          <div className="text-[11px] text-purple-400 font-mono">
            {newInquiriesCount} requiring initial review
          </div>
        </div>

        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#D8CBB8]/60">
            <span className="text-[10px] uppercase tracking-widest font-mono">Fulfillment Status</span>
            <Truck size={16} className="text-[#B89B5E]" />
          </div>
          <div className="text-xl md:text-2xl font-serif text-[#F5F1E8]">
            DHL & Atelier Pickup
          </div>
          <div className="text-[11px] text-[#D8CBB8]/60 font-mono">
            {atelierPickupReadyCount} ready for collection
          </div>
        </div>
      </div>

      {/* ========================================================
          OPERATIONAL QUEUES: WHAT REQUIRES ATTENTION?
      ======================================================== */}
      <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B89B5E] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B89B5E] font-mono font-bold">
                Action Required
              </span>
            </div>
            <h2 className="font-serif text-lg md:text-xl text-[#F5F1E8]">
              Atelier Operational Queues
            </h2>
            <p className="text-xs text-[#D8CBB8]/60 font-sans">
              Immediate operational checkpoints requiring cordwainer review, quality sign-off, or fulfillment action.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          
          {/* Queue 1: New Bespoke Inquiries */}
          <Link
            to="/admin/bespoke?filter=inquiry_submitted"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-[#B89B5E] rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CBB8]/60">Bespoke Inquiries</span>
              <Ruler size={14} className="text-[#B89B5E] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-[#F5F1E8] font-bold">
              {newInquiriesCount}
            </div>
            <span className="text-[11px] text-[#B89B5E] block font-mono">
              Awaiting consultation →
            </span>
          </Link>

          {/* Queue 2: Quotes Awaiting Action */}
          <Link
            to="/admin/bespoke?filter=awaiting_customer_approval"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-[#B89B5E] rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CBB8]/60">Issued Quotes</span>
              <Clock size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-[#F5F1E8] font-bold">
              {quotesAwaitingAction}
            </div>
            <span className="text-[11px] text-amber-400/90 block font-mono">
              Customer review pending →
            </span>
          </Link>

          {/* Queue 3: Deposits Awaiting Confirmation */}
          <Link
            to="/admin/bespoke?filter=deposit_pending"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-[#B89B5E] rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CBB8]/60">50% Bench Deposits</span>
              <CheckCircle2 size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-[#F5F1E8] font-bold">
              {depositsPendingCount}
            </div>
            <span className="text-[11px] text-emerald-400 block font-mono">
              Awaiting treasury clearance →
            </span>
          </Link>

          {/* Queue 4: Orders Entering Production */}
          <Link
            to="/admin/orders?status=Pending+Confirmation"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-[#B89B5E] rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CBB8]/60">Entering Production</span>
              <ShoppingBag size={14} className="text-[#B89B5E] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-[#F5F1E8] font-bold">
              {ordersEnteringProduction}
            </div>
            <span className="text-[11px] text-[#B89B5E] block font-mono">
              Needs lasting allocation →
            </span>
          </Link>

          {/* Queue 5: Orders Currently on Workbench */}
          <Link
            to="/admin/orders?stageGroup=workbench"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-[#B89B5E] rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CBB8]/60">On Craft Workbench</span>
              <Sparkles size={14} className="text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-[#F5F1E8] font-bold">
              {ordersOnWorkbench}
            </div>
            <span className="text-[11px] text-blue-400 block font-mono">
              Lasting, welting & patina →
            </span>
          </Link>

          {/* Queue 6: Quality Inspections Due */}
          <Link
            to="/admin/orders?status=Quality+Inspection"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-[#B89B5E] rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CBB8]/60">Inspections Due</span>
              <ClipboardCheck size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-[#F5F1E8] font-bold">
              {qualityInspectionsDue}
            </div>
            <span className="text-[11px] text-amber-400 block font-mono">
              6-point certification required →
            </span>
          </Link>

          {/* Queue 7: Awaiting Dispatch */}
          <Link
            to="/admin/orders?status=Quality+Inspection&certified=true"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-[#B89B5E] rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CBB8]/60">Awaiting Dispatch</span>
              <Truck size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-[#F5F1E8] font-bold">
              {awaitingDispatchCount}
            </div>
            <span className="text-[11px] text-emerald-400 block font-mono">
              Ready for freight packing →
            </span>
          </Link>

          {/* Queue 8: DHL Tracking Missing */}
          <Link
            to="/admin/orders?missingTracking=true"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-[#B89B5E] rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CBB8]/60">Missing DHL Tracking</span>
              <AlertTriangle size={14} className="text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-[#F5F1E8] font-bold">
              {missingTrackingCount}
            </div>
            <span className="text-[11px] text-orange-400 block font-mono">
              Waybill input required →
            </span>
          </Link>

          {/* Queue 9: Atelier Pickup Ready */}
          <Link
            to="/admin/orders?pickupReady=true"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-[#B89B5E] rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8CBB8]/60">Atelier Pickup Ready</span>
              <MapPin size={14} className="text-[#B89B5E] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-[#F5F1E8] font-bold">
              {atelierPickupReadyCount}
            </div>
            <span className="text-[11px] text-[#B89B5E] block font-mono">
              Awaiting lounge client →
            </span>
          </Link>

          {/* Queue 10: Exceptions Requiring Master Attention */}
          <Link
            to="/admin/orders?exceptions=true"
            className="p-4 bg-[#161616] hover:bg-[#1C1C1C] border border-[#D8CBB8]/15 hover:border-red-500 rounded-lg transition-all group space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400">Master Exceptions</span>
              <ShieldAlert size={14} className="text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-serif text-red-400 font-bold">
              {exceptionsRequiringMaster}
            </div>
            <span className="text-[11px] text-red-400/80 block font-mono">
              Rework or review needed →
            </span>
          </Link>

        </div>
      </div>

      {/* ========================================================
          RECENT COMMISSIONS TABLE
      ======================================================== */}
      <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-[#F5F1E8]">
              Recent Customer Commissions
            </h2>
            <p className="text-xs text-[#D8CBB8]/60 font-sans">
              Orders placed by customers awaiting or actively undergoing handcrafting.
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-mono text-[#B89B5E] hover:underline flex items-center gap-1"
          >
            <span>View All Orders ({orders.length})</span>
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
                <th className="pb-3">Priority</th>
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
                    <span className="text-[10px] text-[#D8CBB8]/50 block font-mono">
                      {order.customer.phoneWhatsApp}
                    </span>
                  </td>
                  <td className="py-3.5 max-w-xs truncate">
                    {order.items.map(i => `${i.product.name} (EU ${i.size})`).join(', ')}
                  </td>
                  <td className="py-3.5 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${
                      order.priority === 'urgent'
                        ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                        : order.priority === 'priority'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        : 'bg-[#181818] text-[#D8CBB8]/60 border border-[#D8CBB8]/15'
                    }`}>
                      {order.priority || 'standard'}
                    </span>
                  </td>
                  <td className="py-3.5 text-[#D8CBB8]/70">
                    {order.customer.city}, {order.customer.country}
                  </td>
                  <td className="py-3.5 font-mono font-medium text-[#F5F1E8]">
                    {formatCurrencyNGN(order.totalNGN || order.subtotalNGN)}
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
                      to={`/admin/orders?search=${order.orderNumber}`}
                      className="px-2.5 py-1 bg-[#181818] hover:bg-[#B89B5E] hover:text-[#0A0A0A] border border-[#D8CBB8]/20 rounded text-[11px] text-[#D8CBB8] transition-colors font-mono"
                    >
                      Inspect
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
              Footwear silhouettes published on storefront.
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
