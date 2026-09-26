import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Check, 
  Trash2,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import type { CustomerOrder, OrderStatus } from '../../types';
import { formatCurrencyNGN, formatCurrencyUSD, getWhatsAppUrl } from '../../data/config';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [orderId: string]: string }>({});
  const [editingTracking, setEditingTracking] = useState<{ [orderId: string]: string }>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const allStatuses: OrderStatus[] = [
    'Pending Confirmation',
    'At Workbench (Lasting)',
    'Welt Inseam Stitching',
    'Patina & Glacage',
    'Quality Inspection',
    'Dispatched',
    'Delivered'
  ];

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Order status updated to "${newStatus}"`);
  };

  const handleSaveDetails = (order: CustomerOrder) => {
    const note = editingNotes[order.id] !== undefined ? editingNotes[order.id] : order.artisanNotes;
    const tracking = editingTracking[order.id] !== undefined ? editingTracking[order.id] : order.trackingNumber;
    updateOrderStatus(order.id, order.status, tracking, note);
    showToast(`Saved tracking and workbench notes for order #${order.orderNumber}`);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDelete = (orderId: string, orderNumber: string) => {
    if (window.confirm(`Are you sure you want to delete order #${orderNumber}?`)) {
      deleteOrder(orderId);
      showToast(`Order #${orderNumber} deleted.`);
    }
  };

  const generateWhatsAppUpdateUrl = (order: CustomerOrder) => {
    const phone = order.customer.phoneWhatsApp.replace(/[^0-9]/g, '');
    let msg = `Hello ${order.customer.firstName}, this is Master Cordwainer Nelson from Nelson Shoes Atelier.\n`;
    msg += `Regarding your bespoke order #${order.orderNumber}:\n`;
    msg += `Current Workbench Status: *${order.status.toUpperCase()}*\n`;
    if (order.artisanNotes) {
      msg += `Bench Log: "${order.artisanNotes}"\n`;
    }
    if (order.trackingNumber) {
      msg += `DHL Tracking Reference: *${order.trackingNumber}*\n`;
    }
    msg += `Please let us know if you have any questions as we craft your pair.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Filtered orders
  const filtered = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      o.orderNumber.toLowerCase().includes(query) ||
      o.customer.firstName.toLowerCase().includes(query) ||
      o.customer.lastName.toLowerCase().includes(query) ||
      o.customer.email.toLowerCase().includes(query) ||
      o.customer.phoneWhatsApp.includes(query) ||
      o.items.some(i => i.product.name.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs rounded shadow-2xl flex items-center gap-2 font-mono">
          <Check size={16} strokeWidth={3} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-6 border-b border-[#D8CBB8]/15">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
          Client Fulfillment & Orders
        </span>
        <h1 className="font-serif text-2xl md:text-3xl text-[#F5F1E8] font-light">
          Customer Orders & Workbench Workflow
        </h1>
        <p className="text-xs text-[#D8CBB8]/60 font-sans mt-0.5">
          View incoming bespoke orders from website visitors, advance lasting stages, and notify patrons.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121212] p-4 border border-[#D8CBB8]/15">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, client name, phone..."
            className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-3 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold'
                : 'bg-[#181818] text-[#D8CBB8]/70 border border-[#D8CBB8]/15'
            }`}
          >
            All ({orders.length})
          </button>

          {allStatuses.slice(0, 4).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold'
                  : 'bg-[#181818] text-[#D8CBB8]/70 border border-[#D8CBB8]/15'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#121212] border border-[#D8CBB8]/15 space-y-3">
            <ShoppingBag size={24} className="mx-auto text-[#B89B5E]/50" />
            <h3 className="font-serif text-lg text-[#F5F1E8]">No Orders Found</h3>
            <p className="text-xs text-[#D8CBB8]/60 max-w-sm mx-auto">
              No customer orders match the current filter or search criteria.
            </p>
          </div>
        ) : (
          filtered.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div
                key={order.id}
                className="bg-[#121212] border border-[#D8CBB8]/15 rounded-lg overflow-hidden transition-all shadow-xl"
              >
                {/* Main Order Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Order ID & Client Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded bg-[#181818] border border-[#D8CBB8]/20 flex items-center justify-center shrink-0">
                      <ShoppingBag size={18} className="text-[#B89B5E]" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[#B89B5E] font-bold">
                          {order.orderNumber}
                        </span>
                        <span className="text-[#D8CBB8]/30">•</span>
                        <span className="text-xs text-[#D8CBB8]/60 font-mono">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="text-sm font-medium text-[#F5F1E8]">
                        {order.customer.firstName} {order.customer.lastName}
                      </div>

                      <div className="text-xs text-[#D8CBB8]/60 font-mono">
                        {order.customer.city}, {order.customer.country} • {order.items.length} item(s)
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown & Price */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-semibold text-[#F5F1E8] text-sm">
                        {formatCurrencyNGN(order.subtotalNGN)}
                      </div>
                      <div className="text-[10px] text-[#B89B5E] font-mono">
                        ≈ {formatCurrencyUSD(order.subtotalUSD)} USD
                      </div>
                    </div>

                    {/* Stage Dropdown Selector */}
                    <div>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="bg-[#181818] border border-[#B89B5E]/40 text-xs font-mono text-[#F5F1E8] p-2 rounded focus:outline-none focus:border-[#B89B5E]"
                      >
                        {allStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Expand Toggle */}
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2 text-[#D8CBB8]/60 hover:text-[#B89B5E] hover:bg-[#181818] rounded"
                      title="Toggle Details"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Dossier Details */}
                {isExpanded && (
                  <div className="p-6 bg-[#0E0E0E] border-t border-[#D8CBB8]/15 space-y-6 text-xs font-sans animate-fadeIn">
                    
                    {/* Items Grid */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold">
                        Commissioned Footwear Items
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 p-3 bg-[#141414] border border-[#D8CBB8]/10 rounded">
                            <img
                              src={item.product.primaryImage}
                              alt={item.product.name}
                              className="w-12 h-14 object-cover bg-black rounded"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-serif text-xs text-[#F5F1E8] font-medium block truncate">
                                {item.product.name}
                              </span>
                              <span className="text-[11px] text-[#B89B5E] font-mono block">
                                Size EU {item.size} • Qty {item.quantity}
                              </span>
                              {item.isBespokeFitting && (
                                <span className="text-[10px] text-emerald-400 font-mono block">
                                  ✓ Bespoke Last Calibration Requested
                                </span>
                              )}
                              {item.customNotes && (
                                <span className="text-[10px] text-[#D8CBB8]/60 block italic">
                                  Notes: "{item.customNotes}"
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs text-[#F5F1E8]">
                              {formatCurrencyNGN(item.product.priceNGN * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer & Shipping Coordinates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-[#141414] border border-[#D8CBB8]/10 rounded space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold block">
                          Client Coordinates
                        </span>
                        <div className="space-y-1 text-xs text-[#D8CBB8]/80 font-mono">
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-[#D8CBB8]/40" />
                            <span>{order.customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-[#D8CBB8]/40" />
                            <span>{order.customer.phoneWhatsApp}</span>
                          </div>
                          <div className="flex items-start gap-2 pt-1">
                            <MapPin size={13} className="text-[#D8CBB8]/40 shrink-0 mt-0.5" />
                            <span>
                              {order.customer.address}, {order.customer.city}, {order.customer.state}, {order.customer.country}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment & Delivery */}
                      <div className="p-4 bg-[#141414] border border-[#D8CBB8]/10 rounded space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold block">
                          Fulfillment & Payment
                        </span>
                        <div className="space-y-1 text-xs text-[#D8CBB8]/80 font-mono">
                          <div>
                            <span className="text-[#D8CBB8]/50">Method: </span>
                            <span className="uppercase text-[#F5F1E8]">{order.paymentMethod}</span>
                          </div>
                          <div>
                            <span className="text-[#D8CBB8]/50">Payment Status: </span>
                            <span className="uppercase text-emerald-400">{order.paymentStatus}</span>
                          </div>
                          <div>
                            <span className="text-[#D8CBB8]/50">Freight Method: </span>
                            <span className="text-[#F5F1E8]">{order.customer.deliveryMethod === 'dhl-express' ? 'DHL Express Worldwide' : 'Lagos Atelier Pickup'}</span>
                          </div>
                          {order.customer.fittingNotes && (
                            <div className="pt-1 text-[11px] text-[#D8CBB8]/60">
                              <span className="text-[#B89B5E]">Fitting Notes: </span>
                              "{order.customer.fittingNotes}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Workbench Log & DHL Tracking Number inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                          Cordwainer Bench Log (Visible to Patron)
                        </label>
                        <input
                          type="text"
                          value={
                            editingNotes[order.id] !== undefined
                              ? editingNotes[order.id]
                              : order.artisanNotes || ''
                          }
                          onChange={(e) =>
                            setEditingNotes({ ...editingNotes, [order.id]: e.target.value })
                          }
                          placeholder="e.g. Inseam hand-welted with waxed Irish linen. Resting 10 days."
                          className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                          DHL Courier Tracking Number
                        </label>
                        <input
                          type="text"
                          value={
                            editingTracking[order.id] !== undefined
                              ? editingTracking[order.id]
                              : order.trackingNumber || ''
                          }
                          onChange={(e) =>
                            setEditingTracking({ ...editingTracking, [order.id]: e.target.value })
                          }
                          placeholder="e.g. DHL-99418290"
                          className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono"
                        />
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D8CBB8]/10">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveDetails(order)}
                          className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider hover:bg-[#D4BD86] transition-colors"
                        >
                          Save Log & Tracking
                        </button>

                        <a
                          href={generateWhatsAppUpdateUrl(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-mono hover:bg-emerald-600/30 transition-colors"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp Update to Client</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(order.id, order.orderNumber)}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-mono"
                      >
                        <Trash2 size={13} />
                        <span>Delete Order</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
