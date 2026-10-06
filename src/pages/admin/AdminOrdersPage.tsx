import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  FileText, 
  AlertCircle, 
  Ban, 
  ShieldAlert, 
  Lock, 
  ClipboardCheck, 
  UserCheck, 
  Flag, 
  DollarSign, 
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import type { 
  CustomerOrder, 
  OrderStatus, 
  PaymentStatus, 
  OrderPriority, 
  QualityInspectionOutcome, 
  QualityInspectionChecks 
} from '../../types';
import { formatCurrencyNGN, formatCurrencyUSD, getWhatsAppUrl } from '../../data/config';
import { 
  canTransitionOrderStatus, 
  canTransitionPaymentStatus, 
  validateDispatchRequirements,
  validateQualityInspection,
  canAssignArtisan,
  canUpdatePriority,
  CRAFT_STAGE_ORDER 
} from '../../services/orderLifecycle';

export const AdminOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { 
    orders, 
    updateOrderStatus, 
    updateOrder, 
    deleteOrder,
    assignArtisan,
    updateOrderPriority,
    recordOrderInspection,
    addCustomerVisibleOrderNote,
    reconcileOrderPayment,
    setAtelierPickupReadiness
  } = useOrders();
  const { adminUser, firebaseUser } = useAdminAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>(searchParams.get('priority') || 'all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>(searchParams.get('delivery') || 'all');
  const [artisanFilter, setArtisanFilter] = useState<string>('all');
  const [onlyMissingTracking, setOnlyMissingTracking] = useState(searchParams.get('missingTracking') === 'true');
  const [onlyPickupReady, setOnlyPickupReady] = useState(searchParams.get('pickupReady') === 'true');
  const [onlyExceptions, setOnlyExceptions] = useState(searchParams.get('exceptions') === 'true');

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Per-order edit buffers
  const [editingNotes, setEditingNotes] = useState<{ [orderId: string]: string }>({});
  const [editingTracking, setEditingTracking] = useState<{ [orderId: string]: string }>({});
  const [customerMessageInputs, setCustomerMessageInputs] = useState<{ [orderId: string]: string }>({});

  // Inspection buffers
  const [inspectionChecks, setInspectionChecks] = useState<{ [orderId: string]: QualityInspectionChecks }>({});
  const [inspectionOutcomes, setInspectionOutcomes] = useState<{ [orderId: string]: QualityInspectionOutcome }>({});
  const [inspectionNotes, setInspectionNotes] = useState<{ [orderId: string]: string }>({});
  const [inspectionSummaries, setInspectionSummaries] = useState<{ [orderId: string]: string }>({});

  // Payment reconciliation buffers
  const [reconcileRefs, setReconcileRefs] = useState<{ [orderId: string]: string }>({});
  const [reconcileNotes, setReconcileNotes] = useState<{ [orderId: string]: string }>({});

  // Artisan assignment buffers
  const [assignedUids, setAssignedUids] = useState<{ [orderId: string]: string }>({});
  const [assignedNames, setAssignedNames] = useState<{ [orderId: string]: string }>({});

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Synchronize URL search params on mount
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const urlSearch = searchParams.get('search');
    const urlPriority = searchParams.get('priority');
    if (urlStatus) setStatusFilter(urlStatus);
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlPriority) setPriorityFilter(urlPriority);
  }, [searchParams]);

  // Stage Transitions
  const handleStatusChange = (order: CustomerOrder, newStatus: OrderStatus) => {
    const currentNotes = editingNotes[order.id] !== undefined ? editingNotes[order.id] : (order.artisanNotes || '');
    const currentTracking = editingTracking[order.id] !== undefined ? editingTracking[order.id] : (order.trackingNumber || '');

    // Authoritative transition validation with inspection gates
    const check = canTransitionOrderStatus(order.status, newStatus, {
      userRole: adminUser?.role,
      correctionNote: currentNotes,
      qualityInspection: order.qualityInspection
    });

    if (!check.allowed) {
      showToast(check.reason || 'This status transition is not permitted.', true);
      return;
    }

    const additionalUpdates: Partial<CustomerOrder> = {};
    const now = new Date().toISOString();

    if (newStatus === 'Dispatched') {
      const dispatchCheck = validateDispatchRequirements(order.customer.deliveryMethod, currentTracking);
      if (!dispatchCheck.valid) {
        showToast(dispatchCheck.reason || 'A valid DHL Express tracking number is required to dispatch.', true);
        return;
      }
      additionalUpdates.carrier = dispatchCheck.carrier;
      additionalUpdates.dispatchedAt = now;
      if (dispatchCheck.carrier === 'DHL Express') {
        additionalUpdates.trackingNumber = currentTracking.trim();
      }
    } else if (newStatus === 'Delivered') {
      additionalUpdates.deliveredAt = now;
    } else if (newStatus === 'Cancelled') {
      additionalUpdates.cancelledAt = now;
      additionalUpdates.cancellationReason = currentNotes || 'Cancelled by atelier administration.';
    }

    updateOrderStatus(order.id, newStatus, currentTracking, currentNotes, additionalUpdates);
    showToast(`Order #${order.orderNumber} advanced to "${newStatus}"`);
  };

  // Payment Status Transitions
  const handlePaymentStatusChange = (order: CustomerOrder, newPaymentStatus: PaymentStatus) => {
    const check = canTransitionPaymentStatus(order.paymentStatus, newPaymentStatus, {
      userRole: adminUser?.role
    });

    if (!check.allowed) {
      showToast(check.reason || 'Cannot downgrade a confirmed, paid order.', true);
      return;
    }

    const updates: Partial<CustomerOrder> = {
      paymentStatus: newPaymentStatus
    };

    if (newPaymentStatus === 'paid' && !order.paidAt) {
      updates.paidAt = new Date().toISOString();
    }

    updateOrder(
      order.id, 
      updates, 
      `Payment status updated from ${order.paymentStatus} to ${newPaymentStatus} by ${adminUser?.name || 'staff'}`
    );
    showToast(`Payment status updated to "${newPaymentStatus.toUpperCase()}"`);
  };

  // Save Internal Notes & Tracking Number
  const handleSaveDetails = (order: CustomerOrder) => {
    const note = editingNotes[order.id] !== undefined ? editingNotes[order.id] : order.artisanNotes;
    const tracking = editingTracking[order.id] !== undefined ? editingTracking[order.id] : order.trackingNumber;
    updateOrderStatus(order.id, order.status, tracking, note);
    showToast(`Saved tracking and workbench notes for order #${order.orderNumber}`);
  };

  // Post Customer-Visible Milestone Note
  const handleBroadcastCustomerMilestone = async (orderId: string) => {
    const msg = customerMessageInputs[orderId];
    if (!msg || msg.trim().length === 0) {
      showToast('Please type a milestone message for the customer.', true);
      return;
    }

    const res = await addCustomerVisibleOrderNote(orderId, msg.trim());
    if (res.success) {
      setCustomerMessageInputs(prev => ({ ...prev, [orderId]: '' }));
      showToast('Milestone notice published to customer portal.');
    } else {
      showToast(res.error || 'Failed to publish milestone notice.', true);
    }
  };

  // Artisan Assignment
  const handleAssignArtisan = async (order: CustomerOrder) => {
    const uid = assignedUids[order.id] || order.assignedArtisanUid || (firebaseUser ? firebaseUser.uid : 'staff-uid');
    const name = assignedNames[order.id] || order.assignedArtisanName || (adminUser ? adminUser.name : 'Master Artisan');

    const check = canAssignArtisan(order.assignedArtisanUid, uid, adminUser?.role || 'atelier_staff', firebaseUser?.uid || '');
    if (!check.allowed) {
      showToast(check.reason || 'Permission denied for artisan assignment.', true);
      return;
    }

    const res = await assignArtisan(order.id, uid, name);
    if (res.success) {
      showToast(`Order assigned to ${name}.`);
    } else {
      showToast(res.error || 'Assignment could not be recorded.', true);
    }
  };

  // Priority Update
  const handlePriorityChange = async (order: CustomerOrder, priority: OrderPriority) => {
    const check = canUpdatePriority(priority, adminUser?.role);
    if (!check.allowed) {
      showToast(check.reason || 'Permission denied to set this priority tier.', true);
      return;
    }

    const res = await updateOrderPriority(order.id, priority);
    if (res.success) {
      showToast(`Priority updated to ${priority.toUpperCase()}`);
    } else {
      showToast(res.error || 'Failed to update priority.', true);
    }
  };

  // Record Quality Inspection
  const handleSaveInspection = async (order: CustomerOrder) => {
    const defaultChecks: QualityInspectionChecks = {
      constructionIntegrity: true,
      stitchingAndWelting: true,
      patinaAndFinishing: true,
      soleCondition: true,
      sizingAndFit: true,
      packagingReadiness: true
    };

    const checks = inspectionChecks[order.id] || order.qualityInspection?.checks || defaultChecks;
    const outcome = inspectionOutcomes[order.id] || order.qualityInspection?.outcome || 'passed';
    const notes = inspectionNotes[order.id] || order.qualityInspection?.internalInspectionNotes || '';
    const summary = inspectionSummaries[order.id] || order.qualityInspection?.customerVisibleSummary || 'Commission inspected and certified by Master Cordwainer.';

    const val = validateQualityInspection(checks, outcome, {
      inspectorRole: adminUser?.role,
      internalInspectionNotes: notes
    });

    if (!val.valid) {
      showToast(val.reason || 'Quality inspection validation failed.', true);
      return;
    }

    const res = await recordOrderInspection(order.id, checks, outcome, notes, summary);
    if (res.success) {
      showToast(`Inspection certification recorded as ${outcome.toUpperCase()}`);
    } else {
      showToast(res.error || 'Failed to record inspection.', true);
    }
  };

  // Reconcile Manual Bank Transfer / Cash
  const handleReconcilePayment = async (order: CustomerOrder) => {
    if (adminUser?.role !== 'master_artisan') {
      showToast('Only a Master Artisan may reconcile manual payments.', true);
      return;
    }

    const ref = reconcileRefs[order.id] || order.paymentReference || `TRF-${Date.now().toString().slice(-6)}`;
    const note = reconcileNotes[order.id] || 'Verified wire payment cleared into treasury account.';

    const res = await reconcileOrderPayment(order.id, ref, note);
    if (res.success) {
      showToast(`Payment successfully reconciled as PAID (Ref: ${ref})`);
    } else {
      showToast(res.error || 'Payment reconciliation failed.', true);
    }
  };

  // Atelier Pickup Readiness Toggle
  const handleTogglePickup = async (order: CustomerOrder) => {
    const newReady = !order.readyForPickup;
    const res = await setAtelierPickupReadiness(order.id, newReady);
    if (res.success) {
      showToast(newReady ? 'Marked ready for atelier collection.' : 'Pickup readiness cleared.');
    } else {
      showToast(res.error || 'Could not update pickup readiness.', true);
    }
  };

  // Permanent Delete
  const handleDelete = (orderId: string, orderNumber: string) => {
    if (adminUser?.role !== 'master_artisan') {
      showToast('Only a Master Artisan may delete order records from workbench.', true);
      return;
    }
    if (window.confirm(`Are you sure you want to delete order #${orderNumber}? This action is permanent.`)) {
      deleteOrder(orderId);
      showToast(`Order #${orderNumber} deleted.`);
    }
  };

  // WhatsApp concierge generator
  const generateWhatsAppUpdateUrl = (order: CustomerOrder) => {
    const phone = order.customer.phoneWhatsApp.replace(/[^0-9]/g, '');
    let msg = `Hello ${order.customer.firstName}, this is Master Cordwainer Nelson from Nelson Shoes Atelier.\n`;
    msg += `Regarding your bespoke commission #${order.orderNumber}:\n`;
    msg += `Current Workbench Status: *${order.status.toUpperCase()}*\n`;
    if (order.trackingNumber) {
      msg += `DHL Tracking Reference: *${order.trackingNumber}*\n`;
    }
    msg += `Please let us know if you have any questions as we craft your pair.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Filtering Logic
  const filtered = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || (o.priority || 'standard') === priorityFilter;
    const matchesDelivery = deliveryFilter === 'all' || o.customer?.deliveryMethod === deliveryFilter;
    const matchesArtisan = artisanFilter === 'all' || 
      (artisanFilter === 'unassigned' ? !o.assignedArtisanUid : o.assignedArtisanUid === artisanFilter);

    const matchesMissingTracking = !onlyMissingTracking || 
      (o.customer?.deliveryMethod === 'dhl-express' && o.status !== 'Delivered' && o.status !== 'Cancelled' && (!o.trackingNumber || o.trackingNumber.trim().length === 0));

    const matchesPickupReady = !onlyPickupReady || 
      (o.customer?.deliveryMethod === 'atelier-pickup' && o.readyForPickup === true);

    const matchesExceptions = !onlyExceptions || 
      (o.qualityInspection && (o.qualityInspection.outcome === 'failed' || o.qualityInspection.outcome === 'requires_rework')) ||
      o.paymentStatus === 'failed' ||
      o.status === 'Cancelled';

    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      o.orderNumber.toLowerCase().includes(query) ||
      o.customer.firstName.toLowerCase().includes(query) ||
      o.customer.lastName.toLowerCase().includes(query) ||
      o.customer.email.toLowerCase().includes(query) ||
      o.customer.phoneWhatsApp.includes(query) ||
      o.items.some(i => i.product.name.toLowerCase().includes(query)) ||
      (o.bespokeInquiryId && o.bespokeInquiryId.toLowerCase().includes(query));

    return matchesStatus && 
      matchesPriority && 
      matchesDelivery && 
      matchesArtisan && 
      matchesMissingTracking && 
      matchesPickupReady && 
      matchesExceptions && 
      matchesQuery;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 p-4 font-semibold text-xs rounded-lg shadow-2xl flex items-center gap-2 font-mono ${
          toastMsg.isError ? 'bg-red-950 border border-red-500 text-red-200' : 'bg-[#B89B5E] text-[#0A0A0A]'
        }`}>
          {toastMsg.isError ? <AlertCircle size={16} /> : <Check size={16} strokeWidth={3} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-6 border-b border-[#D8CBB8]/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
            Craft Fulfillment & Bench Control
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#F5F1E8] font-light">
            Artisan Production Workbench
          </h1>
          <p className="text-xs text-[#D8CBB8]/60 font-sans mt-0.5">
            Manage stage progression, quality inspection certification, cordwainer assignment, and customer milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#D8CBB8]/60">
            Role: <strong className="text-[#B89B5E]">{adminUser?.role === 'master_artisan' ? 'Master Artisan' : 'Atelier Staff'}</strong>
          </span>
        </div>
      </div>

      {/* Operational Controls & Filtering Bar */}
      <div className="bg-[#121212] p-4 border border-[#D8CBB8]/15 rounded-xl space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, client name, phone, bespoke ref..."
              className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-3 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded font-mono"
            >
              <option value="all">All Priorities</option>
              <option value="standard">Standard Priority</option>
              <option value="priority">Priority Tier</option>
              <option value="urgent">Urgent / Executive</option>
            </select>
          </div>

          {/* Delivery Method Filter */}
          <div>
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded font-mono"
            >
              <option value="all">All Delivery Methods</option>
              <option value="dhl-express">DHL Express Courier</option>
              <option value="atelier-pickup">Lagos Atelier Pickup</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded text-[11px] whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold'
                : 'bg-[#181818] text-[#D8CBB8]/70 border border-[#D8CBB8]/15 hover:border-[#B89B5E]'
            }`}
          >
            All Stages ({orders.length})
          </button>

          {CRAFT_STAGE_ORDER.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded text-[11px] whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold'
                  : 'bg-[#181818] text-[#D8CBB8]/70 border border-[#D8CBB8]/15 hover:border-[#B89B5E]'
              }`}
            >
              {st} ({orders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#D8CBB8]/70 pt-1 border-t border-[#D8CBB8]/10 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#F5F1E8]">
            <input
              type="checkbox"
              checked={onlyMissingTracking}
              onChange={(e) => setOnlyMissingTracking(e.target.checked)}
              className="accent-[#B89B5E]"
            />
            <span>Missing DHL Tracking ({orders.filter(o => o.customer?.deliveryMethod === 'dhl-express' && !o.trackingNumber && o.status !== 'Delivered' && o.status !== 'Cancelled').length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-[#F5F1E8]">
            <input
              type="checkbox"
              checked={onlyPickupReady}
              onChange={(e) => setOnlyPickupReady(e.target.checked)}
              className="accent-[#B89B5E]"
            />
            <span>Ready for Pickup ({orders.filter(o => o.customer?.deliveryMethod === 'atelier-pickup' && o.readyForPickup).length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:text-red-400">
            <input
              type="checkbox"
              checked={onlyExceptions}
              onChange={(e) => setOnlyExceptions(e.target.checked)}
              className="accent-red-500"
            />
            <span className="text-red-400/90">Master Exceptions / Rework</span>
          </label>

          {(statusFilter !== 'all' || priorityFilter !== 'all' || deliveryFilter !== 'all' || onlyMissingTracking || onlyPickupReady || onlyExceptions || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setDeliveryFilter('all');
                setOnlyMissingTracking(false);
                setOnlyPickupReady(false);
                setOnlyExceptions(false);
                setSearchQuery('');
              }}
              className="text-[#B89B5E] hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-[#121212] border border-[#D8CBB8]/15 rounded-xl space-y-3">
            <ShoppingBag size={24} className="mx-auto text-[#B89B5E]/50" />
            <h3 className="font-serif text-lg text-[#F5F1E8]">No Workbench Orders Found</h3>
            <p className="text-xs text-[#D8CBB8]/60 max-w-sm mx-auto">
              No production items match the selected stage, priority, or search parameters.
            </p>
          </div>
        ) : (
          filtered.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            // Inspection state resolution
            const currentInspection = order.qualityInspection;
            const checksState = inspectionChecks[order.id] || currentInspection?.checks || {
              constructionIntegrity: true,
              stitchingAndWelting: true,
              patinaAndFinishing: true,
              soleCondition: true,
              sizingAndFit: true,
              packagingReadiness: true
            };
            const outcomeState = inspectionOutcomes[order.id] || currentInspection?.outcome || 'passed';

            return (
              <div
                key={order.id}
                className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl overflow-hidden transition-all shadow-xl"
              >
                {/* Main Order Header Bar */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Info: Ref, Client, Badges */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
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

                      {/* Priority Tag */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        order.priority === 'urgent'
                          ? 'bg-red-950 text-red-300 border border-red-500/50'
                          : order.priority === 'priority'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                          : 'bg-[#181818] text-[#D8CBB8]/60 border border-[#D8CBB8]/15'
                      }`}>
                        {order.priority || 'standard'}
                      </span>

                      {/* Bespoke Inquiry Linkage Tag */}
                      {order.bespokeInquiryId && (
                        <Link
                          to={`/admin/bespoke?search=${order.bespokeInquiryId}`}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/70 border border-purple-500/40 text-purple-300 hover:bg-purple-900 transition-colors flex items-center gap-1"
                        >
                          <Sparkles size={11} />
                          <span>Bespoke Dossier: #{order.bespokeInquiryRef || order.bespokeInquiryId.slice(0, 8)}</span>
                        </Link>
                      )}

                      {/* Payment Status Tag */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40'
                          : order.paymentStatus === 'deposit_paid'
                          ? 'bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/40'
                          : 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                      }`}>
                        {order.paymentStatus === 'paid' ? '✓ Paid Settled' : order.paymentStatus.replace('_', ' ')}
                      </span>

                      {/* Delivery Method Tag */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181818] border border-[#D8CBB8]/20 text-[#D8CBB8]">
                        {order.customer.deliveryMethod === 'dhl-express' ? 'DHL Express' : 'Atelier Pickup'}
                      </span>

                      {order.readyForPickup && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-600">
                          ✓ Ready for Lounge Collection
                        </span>
                      )}

                      {/* Quality Inspection Badge */}
                      {order.qualityInspection && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          order.qualityInspection.outcome === 'passed' || order.qualityInspection.outcome === 'passed_with_notes'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                            : 'bg-red-950 text-red-300 border border-red-600'
                        }`}>
                          QC: {order.qualityInspection.outcome.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-medium text-[#F5F1E8]">
                      {order.customer.firstName} {order.customer.lastName}
                      <span className="text-xs text-[#D8CBB8]/60 font-mono ml-2 font-normal">
                        ({order.customer.city}, {order.customer.country})
                      </span>
                    </div>

                    <div className="text-xs text-[#D8CBB8]/60 font-mono flex items-center gap-3">
                      <span>Assigned Artisan: <strong className="text-[#F5F1E8]">{order.assignedArtisanName || 'Unassigned'}</strong></span>
                      <span>•</span>
                      <span>{order.items.length} Commission Item(s)</span>
                    </div>
                  </div>

                  {/* Right Controls: Value, Stage Selector, Expand Button */}
                  <div className="flex flex-wrap items-center gap-4 shrink-0">
                    <div className="text-left lg:text-right">
                      <div className="font-mono font-semibold text-[#F5F1E8] text-sm">
                        {formatCurrencyNGN(order.totalNGN || order.subtotalNGN)}
                      </div>
                      <div className="text-[10px] text-[#B89B5E] font-mono">
                        ≈ {formatCurrencyUSD(order.totalUSD || order.subtotalUSD)} USD
                      </div>
                    </div>

                    {/* Stage Selector */}
                    <div>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        className="bg-[#181818] border border-[#B89B5E]/40 text-xs font-mono text-[#F5F1E8] p-2 rounded focus:outline-none focus:border-[#B89B5E]"
                      >
                        {CRAFT_STAGE_ORDER.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                        <option value="Cancelled">Cancelled (Exception)</option>
                      </select>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2 text-[#D8CBB8]/60 hover:text-[#B89B5E] hover:bg-[#181818] rounded transition-colors"
                      title="Toggle Operational Dossier"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                </div>

                {/* Expanded Operational Workbench Dossier */}
                {isExpanded && (
                  <div className="p-6 bg-[#0E0E0E] border-t border-[#D8CBB8]/15 space-y-6 text-xs font-sans animate-fadeIn">
                    
                    {/* Items Grid */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold">
                        Commissioned Footwear Silhouettes
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 p-3 bg-[#141414] border border-[#D8CBB8]/10 rounded-lg">
                            <img
                              src={item.product.primaryImage}
                              alt={item.product.name}
                              className="w-14 h-16 object-cover bg-black rounded"
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
                                  ✓ Anatomical Last Calibration Requested
                                </span>
                              )}
                              {item.customNotes && (
                                <span className="text-[10px] text-[#D8CBB8]/60 block italic">
                                  Spec: "{item.customNotes}"
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

                    {/* Coordinates & Payment Status Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Client Coordinates */}
                      <div className="p-4 bg-[#141414] border border-[#D8CBB8]/10 rounded-lg space-y-2">
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

                      {/* Artisan Assignment & Priority Controls */}
                      <div className="p-4 bg-[#141414] border border-[#D8CBB8]/10 rounded-lg space-y-3">
                        <span className="text-[10px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold block">
                          Artisan Bench Assignment
                        </span>
                        
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-[#D8CBB8]/60 font-mono block mb-1">
                              Assigned Cordwainer:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={assignedNames[order.id] !== undefined ? assignedNames[order.id] : (order.assignedArtisanName || '')}
                                onChange={(e) => setAssignedNames(prev => ({ ...prev, [order.id]: e.target.value }))}
                                placeholder="Artisan Name"
                                className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-1.5 text-xs text-[#F5F1E8] rounded font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleAssignArtisan(order)}
                                className="px-2.5 py-1.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono rounded hover:bg-[#D4BD86] shrink-0"
                              >
                                Assign
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-[#D8CBB8]/60 font-mono block mb-1">
                              Commission Priority:
                            </label>
                            <div className="flex items-center gap-1.5">
                              {(['standard', 'priority', 'urgent'] as OrderPriority[]).map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => handlePriorityChange(order, p)}
                                  className={`px-2 py-1 rounded text-[10px] font-mono uppercase ${
                                    (order.priority || 'standard') === p
                                      ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold'
                                      : 'bg-[#181818] text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment & Reconciliation */}
                      <div className="p-4 bg-[#141414] border border-[#D8CBB8]/10 rounded-lg space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#B89B5E] font-mono font-semibold block">
                          Payment State
                        </span>
                        <div className="space-y-1 text-xs text-[#D8CBB8]/80 font-mono">
                          <div>Method: <strong className="text-[#F5F1E8]">{order.paymentMethod}</strong></div>
                          <div>Status: <strong className="text-[#B89B5E] capitalize">{order.paymentStatus}</strong></div>
                          {order.paymentReference && (
                            <div className="truncate">Ref: <span className="text-[#B89B5E] select-all font-bold">{order.paymentReference}</span></div>
                          )}
                          {order.reconciledBy && (
                            <div className="text-[10px] text-emerald-400">Reconciled by: {order.reconciledBy}</div>
                          )}

                          {order.paymentStatus !== 'paid' && adminUser?.role === 'master_artisan' && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => handleReconcilePayment(order)}
                                className="w-full py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 text-xs font-mono rounded"
                              >
                                Reconcile Manual Wire as PAID
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* ========================================================
                        QUALITY INSPECTION CONSOLE
                    ======================================================== */}
                    <div className="p-5 bg-[#141414] border border-[#D8CBB8]/15 rounded-xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D8CBB8]/10">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck size={16} className="text-[#B89B5E]" />
                          <h4 className="font-serif text-sm text-[#F5F1E8]">
                            Cordwainer Quality Inspection Certification
                          </h4>
                        </div>
                        <div className="text-xs font-mono text-[#D8CBB8]/60">
                          {currentInspection ? (
                            <span>Certified on {new Date(currentInspection.inspectedAt).toLocaleDateString()} by {currentInspection.inspectorName}</span>
                          ) : (
                            <span className="text-amber-400">Pending Inspection</span>
                          )}
                        </div>
                      </div>

                      {/* 6-Point Technical Checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
                        <label className="flex items-center gap-2 p-2 bg-[#181818] rounded border border-[#D8CBB8]/10 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checksState.constructionIntegrity}
                            onChange={(e) => setInspectionChecks(prev => ({
                              ...prev,
                              [order.id]: { ...checksState, constructionIntegrity: e.target.checked }
                            }))}
                            className="accent-[#B89B5E]"
                          />
                          <span>1. Construction & Counter Integrity</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-[#181818] rounded border border-[#D8CBB8]/10 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checksState.stitchingAndWelting}
                            onChange={(e) => setInspectionChecks(prev => ({
                              ...prev,
                              [order.id]: { ...checksState, stitchingAndWelting: e.target.checked }
                            }))}
                            className="accent-[#B89B5E]"
                          />
                          <span>2. Stitching & Hand-Welting SPI</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-[#181818] rounded border border-[#D8CBB8]/10 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checksState.patinaAndFinishing}
                            onChange={(e) => setInspectionChecks(prev => ({
                              ...prev,
                              [order.id]: { ...checksState, patinaAndFinishing: e.target.checked }
                            }))}
                            className="accent-[#B89B5E]"
                          />
                          <span>3. Patina Dye & Mirror Glacage</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-[#181818] rounded border border-[#D8CBB8]/10 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checksState.soleCondition}
                            onChange={(e) => setInspectionChecks(prev => ({
                              ...prev,
                              [order.id]: { ...checksState, soleCondition: e.target.checked }
                            }))}
                            className="accent-[#B89B5E]"
                          />
                          <span>4. Oak Bark Sole & Fiddleback Waist</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-[#181818] rounded border border-[#D8CBB8]/10 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checksState.sizingAndFit}
                            onChange={(e) => setInspectionChecks(prev => ({
                              ...prev,
                              [order.id]: { ...checksState, sizingAndFit: e.target.checked }
                            }))}
                            className="accent-[#B89B5E]"
                          />
                          <span>5. Anatomical Last Dimensions</span>
                        </label>

                        <label className="flex items-center gap-2 p-2 bg-[#181818] rounded border border-[#D8CBB8]/10 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checksState.packagingReadiness}
                            onChange={(e) => setInspectionChecks(prev => ({
                              ...prev,
                              [order.id]: { ...checksState, packagingReadiness: e.target.checked }
                            }))}
                            className="accent-[#B89B5E]"
                          />
                          <span>6. Velvet Bags & Certificate</span>
                        </label>
                      </div>

                      {/* Outcome & Internal Findings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 font-mono block mb-1">
                            Inspection Outcome Certification:
                          </label>
                          <select
                            value={outcomeState}
                            onChange={(e) => setInspectionOutcomes(prev => ({
                              ...prev,
                              [order.id]: e.target.value as QualityInspectionOutcome
                            }))}
                            className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8] font-mono rounded"
                          >
                            <option value="passed">Passed (Certified for Delivery)</option>
                            <option value="passed_with_notes">Passed with Minor Bench Notes</option>
                            <option value="requires_rework">Requires Rework (Blocks Dispatch)</option>
                            <option value="failed">Failed Structural Check (Blocks Dispatch)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 font-mono block mb-1">
                            Private Cordwainer Findings (Internal & Confidential):
                          </label>
                          <input
                            type="text"
                            value={inspectionNotes[order.id] !== undefined ? inspectionNotes[order.id] : (order.qualityInspection?.internalInspectionNotes || '')}
                            onChange={(e) => setInspectionNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                            placeholder="e.g. Mirror glacage depth 95%; featherline crisp. Approved."
                            className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8] rounded font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-[#D8CBB8]/50 font-mono">
                          Failing checks or rework outcomes will server-authoritatively block courier dispatch.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveInspection(order)}
                          className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold font-mono text-xs uppercase tracking-wider rounded hover:bg-[#D4BD86] transition-colors"
                        >
                          Sign & Certify Inspection
                        </button>
                      </div>
                    </div>

                    {/* ========================================================
                        FULFILLMENT: DHL TRACKING & ATELIER PICKUP
                    ======================================================== */}
                    <div className="p-5 bg-[#141414] border border-[#D8CBB8]/15 rounded-xl space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-[#D8CBB8]/10">
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-[#B89B5E]" />
                          <h4 className="font-serif text-sm text-[#F5F1E8]">
                            Fulfillment & Dispatch Coordination
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-[#D8CBB8]/60">
                          Method: {order.customer.deliveryMethod === 'dhl-express' ? 'DHL Express Insured Transit' : 'Lagos Atelier Fitting Lounge Pickup'}
                        </span>
                      </div>

                      {order.customer.deliveryMethod === 'dhl-express' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-[#D8CBB8]/70 font-mono block mb-1">
                              DHL Express Tracking Number (Waybill) *
                            </label>
                            <input
                              type="text"
                              value={editingTracking[order.id] !== undefined ? editingTracking[order.id] : (order.trackingNumber || '')}
                              onChange={(e) => setEditingTracking(prev => ({ ...prev, [order.id]: e.target.value }))}
                              placeholder="e.g. DHL-99418290"
                              className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8] font-mono rounded"
                            />
                          </div>

                          <div className="flex items-end gap-3">
                            <button
                              type="button"
                              onClick={() => handleSaveDetails(order)}
                              className="px-4 py-2 bg-[#181818] hover:bg-[#202020] border border-[#D8CBB8]/20 text-[#D8CBB8] text-xs font-mono rounded"
                            >
                              Save Waybill
                            </button>
                            
                            {order.status !== 'Dispatched' && order.status !== 'Delivered' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(order, 'Dispatched')}
                                className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded hover:bg-[#D4BD86]"
                              >
                                Dispatch via Courier
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#181818] rounded-lg">
                          <div className="space-y-1">
                            <span className="font-serif text-sm text-[#F5F1E8] block">Atelier Fitting Lounge Collection</span>
                            <p className="text-xs text-[#D8CBB8]/70 font-sans">
                              {order.readyForPickup 
                                ? 'Client has been notified that commission is resting and ready for collection in Victoria Island lounge.'
                                : 'Mark this pair as ready for collection once final quality inspection and mirror glacage are complete.'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleTogglePickup(order)}
                            className={`px-4 py-2 font-mono text-xs font-semibold rounded shrink-0 transition-colors ${
                              order.readyForPickup
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-600'
                                : 'bg-[#B89B5E] text-[#0A0A0A] hover:bg-[#D4BD86]'
                            }`}
                          >
                            {order.readyForPickup ? '✓ Ready for Client Pickup' : 'Mark Ready for Collection'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ========================================================
                        NOTES: PRIVATE BENCH LOG & CUSTOMER MILESTONE BROADCAST
                    ======================================================== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Private Internal Bench Log */}
                      <div className="p-4 bg-[#141414] border border-[#D8CBB8]/15 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[10px] uppercase font-mono tracking-widest text-amber-400 flex items-center gap-1.5">
                            <Lock size={12} />
                            <span>Private Workshop Log (Confidential)</span>
                          </h5>
                          <span className="text-[9px] text-[#D8CBB8]/40 font-mono">Never visible to customer</span>
                        </div>

                        <textarea
                          rows={3}
                          value={editingNotes[order.id] !== undefined ? editingNotes[order.id] : (order.artisanNotes || '')}
                          onChange={(e) => setEditingNotes(prev => ({ ...prev, [order.id]: e.target.value }))}
                          placeholder="Internal cordwainer bench notes, supplier materials, technical calibrations..."
                          className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-xs text-[#F5F1E8] rounded font-mono"
                        />

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleSaveDetails(order)}
                            className="px-3 py-1.5 bg-[#181818] hover:bg-[#202020] border border-[#D8CBB8]/20 text-xs font-mono text-[#D8CBB8] rounded"
                          >
                            Save Bench Log
                          </button>
                        </div>
                      </div>

                      {/* Customer-Visible Milestone Notices */}
                      <div className="p-4 bg-[#141414] border border-[#D8CBB8]/15 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#B89B5E] flex items-center gap-1.5">
                            <Send size={12} />
                            <span>Customer Milestone Broadcast</span>
                          </h5>
                          <span className="text-[9px] text-emerald-400 font-mono">Visible in Customer Portal</span>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            value={customerMessageInputs[order.id] || ''}
                            onChange={(e) => setCustomerMessageInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                            placeholder="e.g. Your commission has completed inseam welting and is entering patina."
                            className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-xs text-[#F5F1E8] rounded"
                          />

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleBroadcastCustomerMilestone(order.id)}
                              className="px-3 py-1.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono rounded hover:bg-[#D4BD86]"
                            >
                              Publish Milestone Notice
                            </button>
                          </div>
                        </div>

                        {/* Recent customer notices */}
                        {order.customerVisibleNotes && order.customerVisibleNotes.length > 0 && (
                          <div className="space-y-1.5 max-h-24 overflow-y-auto pt-2 border-t border-[#D8CBB8]/10">
                            {order.customerVisibleNotes.map((n) => (
                              <div key={n.id} className="text-[11px] font-mono text-[#D8CBB8]/80 bg-[#181818] p-1.5 rounded">
                                <span className="text-[#B89B5E]">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:</span> {n.message}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* ========================================================
                        AUDIT TRAIL & WORKBENCH TIMELINE
                    ======================================================== */}
                    {order.auditTrail && order.auditTrail.length > 0 && (
                      <div className="p-4 bg-[#141414] border border-[#D8CBB8]/10 rounded-xl space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-[#D8CBB8]/50 font-mono block">
                          Atelier Audit Ledger ({order.auditTrail.length} Events Recorded)
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[10px] text-[#D8CBB8]/70">
                          {order.auditTrail.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2 py-0.5 border-b border-[#D8CBB8]/5">
                              <span className="text-[#B89B5E] shrink-0">{new Date(entry.timestamp).toLocaleString()}</span>
                              <span className="text-white shrink-0">[{entry.event}]</span>
                              <span className="text-[#D8CBB8]/50 truncate">{entry.note || entry.reason || (entry.actorRole ? `By ${entry.actorRole}` : '')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D8CBB8]/10">
                      <div className="flex items-center gap-2">
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

                      <div className="flex items-center gap-3">
                        {['Pending Confirmation', 'At Workbench (Lasting)'].includes(order.status) && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order, 'Cancelled')}
                            className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 font-mono px-2.5 py-1.5 bg-amber-950/40 border border-amber-600/30 rounded"
                          >
                            <Ban size={12} />
                            <span>Cancel Commission</span>
                          </button>
                        )}

                        {adminUser?.role === 'master_artisan' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(order.id, order.orderNumber)}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-mono"
                          >
                            <Trash2 size={13} />
                            <span>Delete Order</span>
                          </button>
                        )}
                      </div>
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
