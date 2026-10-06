import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  ArrowLeft, 
  Clock, 
  Truck, 
  MessageCircle, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Calendar,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { fetchCustomerOrderById } from '../../services/customerAuthService';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';
import { getWhatsAppUrl } from '../../data/config';
import type { CustomerOrder } from '../../types';

const STAGES = [
  { status: 'Pending Confirmation', label: 'Commission Initiated', description: 'Bespoke dossier received and confirmed by atelier concierge.', percent: 15 },
  { status: 'At Workbench (Lasting)', label: 'Last Selected & Leather Cut', description: 'Beechwood anatomical last chosen; box calfskin hand-clicked.', percent: 35 },
  { status: 'Welt Inseam Stitching', label: 'Upper Stitched & Welting', description: 'Goodyear / Hand-welted inseam stitching secured to insole.', percent: 55 },
  { status: 'Patina & Glacage', label: 'Hand-Burnished Patina & Glacage', description: 'Multi-layer artisanal dyeing, beeswax nourishment, and mirror finish.', percent: 75 },
  { status: 'Quality Inspection', label: 'Master Quality Inspection', description: 'Rigorous structural assessment and cordwainer certification.', percent: 90 },
  { status: 'Dispatched', label: 'Dispatched via DHL Express', description: 'Insured international transit with climate-shield packaging.', percent: 98 },
  { status: 'Delivered', label: 'Delivered to Client', description: 'Commission safely received. Lifetime atelier care active.', percent: 100 }
];

export const CustomerOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { customerUser } = useCustomerAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerUser || !orderId) return;
    setIsLoading(true);
    setError(null);

    fetchCustomerOrderById(customerUser.uid, orderId)
      .then((data) => {
        if (!data) {
          setError('Order not found or not associated with your customer account.');
        } else {
          setOrder(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching order detail:', err);
        setError('Unable to load order details at this moment.');
        setIsLoading(false);
      });
  }, [customerUser, orderId]);

  const currentStageIndex = order 
    ? STAGES.findIndex(s => s.status === order.status) 
    : 0;
  const activeIdx = currentStageIndex >= 0 ? currentStageIndex : 0;
  const currentStage = STAGES[activeIdx];

  const getConciergeMessage = () => {
    if (!order) return '';
    const text = `Hello Nelson Shoes Concierge, I am inquiring about my footwear commission (${order.orderNumber}). Current status shows as ${order.status}. Could you provide a workbench update?`;
    return getWhatsAppUrl(text);
  };

  return (
    <CustomerPortalLayout>
      <div className="space-y-8">

        {/* Back Link */}
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#D8CBB8]/70 hover:text-[#B89B5E] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Orders</span>
        </Link>

        {isLoading ? (
          <div className="p-16 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#B89B5E] animate-spin mx-auto" />
            <p className="text-xs text-[#D8CBB8]/60 font-mono">Loading commission dossier...</p>
          </div>
        ) : error || !order ? (
          <div className="p-12 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="font-serif text-xl text-[#F5F1E8]">Order Details Unavailable</h3>
            <p className="text-xs text-[#D8CBB8]/70 font-sans max-w-md mx-auto">
              {error || 'We could not locate this order. It may belong to another account or the reference is incorrect.'}
            </p>
            <div className="pt-2">
              <Link
                to="/account/orders"
                className="px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-colors"
              >
                Return to My Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* ========================================================
                1. ORDER HEADER BANNER
            ======================================================== */}
            <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D8CBB8]/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xl sm:text-2xl font-bold text-[#F5F1E8]">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/40 uppercase font-semibold">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#D8CBB8]/60 font-mono flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-[#B89B5E]" />
                      <span>Commissioned: {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={getConciergeMessage()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#B89B5E]/50 hover:border-[#B89B5E] text-xs font-mono text-[#B89B5E] hover:text-[#D4BD86] rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp Concierge</span>
                  </a>

                  <Link
                    to="/track"
                    className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-colors flex items-center gap-1.5"
                  >
                    <Truck size={14} />
                    <span>Live Tracker</span>
                  </Link>
                </div>
              </div>

              {/* Summary Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Total Value</span>
                  <span className="font-mono text-sm text-[#F5F1E8] font-medium">
                    ₦{(order.totalNGN || order.subtotalNGN)?.toLocaleString() || '0'} / ${(order.totalUSD || order.subtotalUSD)?.toLocaleString() || '0'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Payment Status</span>
                  <span className="font-mono text-sm text-[#B89B5E] capitalize">
                    {order.paymentStatus || 'Pending Confirmation'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Delivery Method</span>
                  <span className="font-mono text-sm text-[#F5F1E8]">
                    {order.customer?.deliveryMethod === 'dhl-express' ? 'DHL Express' : 'Atelier Pickup'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Destination</span>
                  <span className="font-mono text-sm text-[#F5F1E8] truncate block">
                    {order.customer?.city || 'Lagos'}, {order.customer?.country || 'Nigeria'}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================
                2. ARTISANAL WORKBENCH PROGRESS TIMELINE
            ======================================================== */}
            <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#B89B5E] block">
                  CRAFT TIMELINE
                </span>
                <h3 className="font-serif text-lg text-[#F5F1E8]">
                  Workbench Progress
                </h3>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#B89B5E] font-medium">{currentStage.label}</span>
                  <span className="text-[#D8CBB8]/60">{currentStage.percent}% Complete</span>
                </div>
                <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden border border-[#D8CBB8]/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#B89B5E] to-[#D4BD86] transition-all duration-500 rounded-full"
                    style={{ width: `${currentStage.percent}%` }}
                  />
                </div>
              </div>

              {/* 7-Step Lifecycle Visual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 pt-2">
                {STAGES.map((stage, idx) => {
                  const isCompleted = idx <= activeIdx;
                  const isCurrent = idx === activeIdx;
                  return (
                    <div
                      key={stage.status}
                      className={`p-3 rounded-lg border text-left space-y-1 transition-colors ${
                        isCurrent
                          ? 'bg-[#B89B5E]/10 border-[#B89B5E] text-[#F5F1E8]'
                          : isCompleted
                          ? 'bg-[#181818] border-[#D8CBB8]/20 text-[#D8CBB8]'
                          : 'bg-[#141414]/50 border-transparent text-[#D8CBB8]/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold">
                        {isCompleted ? (
                          <CheckCircle2 size={12} className={isCurrent ? 'text-[#B89B5E]' : 'text-emerald-400'} />
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">
                            {idx + 1}
                          </span>
                        )}
                        <span>Stage {idx + 1}</span>
                      </div>
                      <div className="font-serif text-xs font-medium leading-tight">
                        {stage.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Stage Description */}
              <div className="p-4 bg-[#181818] border border-[#B89B5E]/20 rounded-lg text-xs font-sans text-[#D8CBB8]/80 leading-relaxed">
                <span className="text-[#B89B5E] font-medium font-mono mr-2">CURRENT MILESTONE:</span>
                {currentStage.description}
              </div>
            </div>

            {/* ========================================================
                3. COMMISSIONED FOOTWEAR ITEMS
            ======================================================== */}
            <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#B89B5E] block">
                  ORDER SPECIFICATIONS
                </span>
                <h3 className="font-serif text-lg text-[#F5F1E8]">
                  Commissioned Items ({order.items?.length || 1})
                </h3>
              </div>

              <div className="divide-y divide-[#D8CBB8]/10">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1A1A1A] border border-[#D8CBB8]/15 rounded-lg overflow-hidden shrink-0">
                        {item.product?.primaryImage ? (
                          <img
                            src={item.product.primaryImage}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#D8CBB8]/30 font-mono">
                            PHOTO
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="font-serif text-base text-[#F5F1E8] font-medium">
                          {item.product?.name || 'Nelson Shoes Creation'}
                        </div>
                        <div className="text-xs text-[#D8CBB8]/70 font-mono flex items-center gap-3 flex-wrap">
                          <span>Size: EU {item.size}</span>
                          <span>•</span>
                          <span>Quantity: {item.quantity}</span>
                          {item.isBespokeFitting && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/40">
                              Bespoke Fitting Last
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs uppercase font-mono text-[#D8CBB8]/40">Price</div>
                      <div className="font-mono text-sm sm:text-base text-[#F5F1E8] font-medium">
                        ₦{item.product?.priceNGN?.toLocaleString() || '0'} / ${item.product?.priceUSD?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ========================================================
                4. SAFE DELIVERY & TRACKING DETAILS
            ======================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Delivery Information */}
              <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 rounded-xl space-y-4">
                <h4 className="font-serif text-base text-[#F5F1E8] flex items-center gap-2">
                  <MapPin size={16} className="text-[#B89B5E]" />
                  <span>Delivery Destination</span>
                </h4>
                <div className="space-y-2 text-xs font-sans text-[#D8CBB8]/80">
                  <p><strong className="text-[#F5F1E8]">Recipient:</strong> {order.customer?.firstName} {order.customer?.lastName}</p>
                  <p><strong className="text-[#F5F1E8]">Destination City:</strong> {order.customer?.city}, {order.customer?.country}</p>
                  <p><strong className="text-[#F5F1E8]">Method:</strong> {order.customer?.deliveryMethod === 'dhl-express' ? 'DHL Express International' : 'Atelier Pickup (Victoria Island, Lagos)'}</p>
                </div>
              </div>

              {/* Courier & Tracking */}
              <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 rounded-xl space-y-4">
                <h4 className="font-serif text-base text-[#F5F1E8] flex items-center gap-2">
                  <Truck size={16} className="text-[#B89B5E]" />
                  <span>Shipment & Courier</span>
                </h4>
                {order.customer?.deliveryMethod === 'atelier-pickup' ? (
                  <div className="space-y-2 text-xs font-mono">
                    <p className="text-[#D8CBB8]/70">Fulfillment Method:</p>
                    <p className="text-base text-[#B89B5E] font-bold">Lagos Atelier Fitting Pickup</p>
                    <p className="text-[11px] text-[#D8CBB8]/60 font-sans">Complimentary fitting and collection at our private Lagos atelier upon completion.</p>
                  </div>
                ) : order.trackingNumber ? (
                  <div className="space-y-2 text-xs font-mono">
                    <p className="text-[#D8CBB8]/70">Tracking Number:</p>
                    <p className="text-base text-[#B89B5E] font-bold">{order.trackingNumber}</p>
                    <p className="text-[11px] text-[#D8CBB8]/50">Carrier: {order.carrier || 'DHL Express'}</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs text-[#D8CBB8]/60 font-sans">
                    <p>Tracking number will be assigned upon final quality inspection and dispatch from our Lagos atelier.</p>
                    <p className="text-[11px] text-[#B89B5E] font-mono">Status: In Craft Production</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </CustomerPortalLayout>
  );
};
