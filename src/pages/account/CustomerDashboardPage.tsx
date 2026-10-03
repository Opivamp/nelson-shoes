import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Scissors, 
  Heart, 
  MapPin, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Calendar,
  ExternalLink,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { subscribeToCustomerOrders, subscribeToCustomerBespokeInquiries } from '../../services/customerAuthService';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';
import type { CustomerOrder, CustomerBespokeInquiry } from '../../types';

export const CustomerDashboardPage: React.FC = () => {
  const { customerUser, profile, savedItemIds, addresses } = useCustomerAuth();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [bespokeInquiries, setBespokeInquiries] = useState<CustomerBespokeInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!customerUser) return;
    setIsLoading(true);

    const unsubOrders = subscribeToCustomerOrders(customerUser.uid, (data) => {
      setOrders(data);
      setIsLoading(false);
    });

    const unsubBespoke = subscribeToCustomerBespokeInquiries(customerUser.uid, (data) => {
      setBespokeInquiries(data);
    });

    return () => {
      unsubOrders();
      unsubBespoke();
    };
  }, [customerUser]);

  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const recentOrders = orders.slice(0, 3);
  const recentBespoke = bespokeInquiries.slice(0, 2);

  // Compute customer activity events
  const activityEvents = [
    ...(profile?.createdAt ? [{
      type: 'account',
      title: 'Customer Account Created',
      desc: 'Enrolled in Nelson Shoes bespoke services.',
      date: profile.createdAt
    }] : []),
    ...orders.slice(0, 4).map(o => ({
      type: 'order',
      title: `Order Placed: ${o.orderNumber}`,
      desc: `Status: ${o.status} (${o.items?.length || 1} item${(o.items?.length || 1) > 1 ? 's' : ''})`,
      date: o.createdAt
    })),
    ...bespokeInquiries.slice(0, 2).map(b => ({
      type: 'bespoke',
      title: `Bespoke Inquiry: ${b.silhouette}`,
      desc: `Materials: ${b.leatherType || 'Curated Calf'} • Status: ${b.status}`,
      date: b.createdAt
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const customerName = profile?.fullName || customerUser?.displayName || 'Customer';

  return (
    <CustomerPortalLayout>
      <div className="space-y-10">

        {/* Welcome Banner */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89B5E] block">
            ATELIER OVERVIEW
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#F5F1E8]">
            Welcome back, <span className="text-[#B89B5E] italic">{customerName}</span>.
          </h2>
          <p className="text-xs text-[#D8CBB8]/70 font-sans max-w-xl">
            Manage your bespoke commissions, track ongoing craftsmanship, review delivery addresses, and explore saved footwear creations.
          </p>
        </div>

        {/* ========================================================
            1. EXECUTIVE METRICS GRID
        ======================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/account/orders"
            className="p-5 bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/50 rounded-xl space-y-2 transition-all hover:bg-[#161616] group"
          >
            <div className="flex items-center justify-between text-[#D8CBB8]/50 group-hover:text-[#B89B5E] transition-colors">
              <span className="text-[10px] uppercase font-mono tracking-widest">Active Orders</span>
              <Package size={15} />
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-[#F5F1E8] font-light">
              {isLoading ? '...' : activeOrders.length}
            </div>
            <span className="text-[10px] text-[#B89B5E] font-mono flex items-center gap-1">
              <span>View workbench</span>
              <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            to="/account/orders"
            className="p-5 bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/50 rounded-xl space-y-2 transition-all hover:bg-[#161616] group"
          >
            <div className="flex items-center justify-between text-[#D8CBB8]/50 group-hover:text-[#B89B5E] transition-colors">
              <span className="text-[10px] uppercase font-mono tracking-widest">Total Orders</span>
              <Clock size={15} />
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-[#F5F1E8] font-light">
              {isLoading ? '...' : orders.length}
            </div>
            <span className="text-[10px] text-[#D8CBB8]/60 font-mono">
              Completed & In-Transit
            </span>
          </Link>

          <Link
            to="/account/bespoke"
            className="p-5 bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/50 rounded-xl space-y-2 transition-all hover:bg-[#161616] group"
          >
            <div className="flex items-center justify-between text-[#D8CBB8]/50 group-hover:text-[#B89B5E] transition-colors">
              <span className="text-[10px] uppercase font-mono tracking-widest">Bespoke</span>
              <Scissors size={15} />
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-[#F5F1E8] font-light">
              {isLoading ? '...' : bespokeInquiries.length}
            </div>
            <span className="text-[10px] text-[#B89B5E] font-mono flex items-center gap-1">
              <span>Commission dossiers</span>
              <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>

          <Link
            to="/account/saved"
            className="p-5 bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/50 rounded-xl space-y-2 transition-all hover:bg-[#161616] group"
          >
            <div className="flex items-center justify-between text-[#D8CBB8]/50 group-hover:text-[#B89B5E] transition-colors">
              <span className="text-[10px] uppercase font-mono tracking-widest">Saved Items</span>
              <Heart size={15} />
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-[#F5F1E8] font-light">
              {savedItemIds.length}
            </div>
            <span className="text-[10px] text-[#D8CBB8]/60 font-mono">
              Curated Footwear
            </span>
          </Link>
        </div>

        {/* ========================================================
            2. RECENT COMMISSIONS SECTION
        ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-[#F5F1E8] font-normal flex items-center gap-2">
              <Package size={16} className="text-[#B89B5E]" />
              <span>Recent Orders</span>
            </h3>
            <Link
              to="/account/orders"
              className="text-xs font-mono text-[#B89B5E] hover:text-[#D4BD86] flex items-center gap-1 transition-colors"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center">
              <Loader2 className="w-5 h-5 text-[#B89B5E] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#D8CBB8]/60 font-mono">Loading commission dossiers...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-3">
              <Package className="w-8 h-8 text-[#B89B5E]/40 mx-auto" />
              <p className="font-serif text-base text-[#F5F1E8]">No orders found yet</p>
              <p className="text-xs text-[#D8CBB8]/60 font-sans max-w-sm mx-auto">
                Explore our signature footwear collection or commission a custom bespoke creation crafted to your exact anatomical measurements.
              </p>
              <div className="pt-2 flex items-center justify-center gap-4 flex-wrap">
                <Link
                  to="/collection"
                  className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider hover:bg-[#D4BD86] transition-colors rounded-lg"
                >
                  Browse Collection
                </Link>
                <Link
                  to="/account/orders"
                  className="px-4 py-2 border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-[#D8CBB8] text-xs font-mono rounded-lg transition-colors"
                >
                  Claim Older Order
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-[#F5F1E8]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B89B5E]/15 text-[#B89B5E] border border-[#B89B5E]/30 uppercase">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#D8CBB8]/60 font-sans flex items-center gap-3 flex-wrap">
                      <span>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{order.items?.length || 1} item{(order.items?.length || 1) > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span className="text-[#F5F1E8] font-mono">
                        ₦{order.subtotalNGN?.toLocaleString() || '0'} / ${order.subtotalUSD?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to={`/account/orders/${order.id}`}
                      className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] hover:text-[#B89B5E] rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
            3. TWO-COLUMN: BESPOKE REQUESTS & ACCOUNT ACTIVITY
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bespoke Requests Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-[#F5F1E8] font-normal flex items-center gap-2">
                <Scissors size={16} className="text-[#B89B5E]" />
                <span>Bespoke Dossiers</span>
              </h3>
              <Link
                to="/account/bespoke"
                className="text-xs font-mono text-[#B89B5E] hover:text-[#D4BD86] flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {recentBespoke.length === 0 ? (
              <div className="p-6 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl space-y-3 text-center">
                <Scissors className="w-6 h-6 text-[#B89B5E]/40 mx-auto" />
                <p className="font-serif text-sm text-[#F5F1E8]">No bespoke requests initiated</p>
                <p className="text-xs text-[#D8CBB8]/60 font-sans max-w-xs mx-auto">
                  Experience full bespoke shoe-making with a hand-carved beechwood last crafted to your feet.
                </p>
                <Link
                  to="/bespoke"
                  className="inline-block px-4 py-2 bg-[#1A1A1A] hover:bg-[#202020] border border-[#B89B5E]/40 text-[#B89B5E] text-xs font-mono rounded-lg transition-colors"
                >
                  Commission Bespoke Pair
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBespoke.map((b) => (
                  <Link
                    key={b.id}
                    to={`/account/bespoke/${b.id}`}
                    className="p-4 bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 rounded-xl block space-y-2 transition-all hover:bg-[#151515]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm text-[#F5F1E8] font-medium">
                        {b.silhouette}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] uppercase">
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#D8CBB8]/60 font-sans flex items-center gap-2">
                      <span>{b.leatherType || 'Curated Calf'}</span>
                      <span>•</span>
                      <span>{b.footSize || 'Custom Last'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Account Activity Timeline */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-[#F5F1E8] font-normal flex items-center gap-2">
              <Clock size={16} className="text-[#B89B5E]" />
              <span>Recent Activity</span>
            </h3>

            <div className="p-5 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl space-y-4">
              {activityEvents.length === 0 ? (
                <p className="text-xs text-[#D8CBB8]/60 font-mono">No recent activity recorded.</p>
              ) : (
                activityEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#B89B5E] mt-1.5 shrink-0" />
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="font-mono text-[#F5F1E8] truncate">{evt.title}</div>
                      <div className="text-[#D8CBB8]/60 text-[11px] truncate">{evt.desc}</div>
                    </div>
                    <div className="text-[10px] text-[#D8CBB8]/40 font-mono shrink-0">
                      {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </CustomerPortalLayout>
  );
};
