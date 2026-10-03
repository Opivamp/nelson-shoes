import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors, 
  ArrowRight, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Plus, 
  Loader2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { subscribeToCustomerBespokeInquiries } from '../../services/customerAuthService';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';
import { getWhatsAppUrl } from '../../data/config';
import type { CustomerBespokeInquiry } from '../../types';

export const CustomerBespokePage: React.FC = () => {
  const { customerUser } = useCustomerAuth();
  const [inquiries, setInquiries] = useState<CustomerBespokeInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!customerUser) return;
    setIsLoading(true);

    const unsub = subscribeToCustomerBespokeInquiries(customerUser.uid, (data) => {
      setInquiries(data);
      setIsLoading(false);
    });

    return () => unsub();
  }, [customerUser]);

  return (
    <CustomerPortalLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-widest text-[#B89B5E] block">
              PRIVATE COMMISSIONS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#F5F1E8]">
              My Bespoke Commissions
            </h2>
            <p className="text-xs text-[#D8CBB8]/70 font-sans">
              Custom anatomical lasts, private fitting dialogues, and hand-lasted footwear commissions.
            </p>
          </div>

          <Link
            to="/bespoke"
            className="px-4 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-colors flex items-center gap-2 self-start sm:self-auto shadow-lg"
          >
            <Plus size={14} />
            <span>New Bespoke Request</span>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-2">
            <Loader2 className="w-6 h-6 text-[#B89B5E] animate-spin mx-auto" />
            <p className="text-xs text-[#D8CBB8]/60 font-mono">Loading bespoke dossiers...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-10 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-4">
            <Scissors className="w-10 h-10 text-[#B89B5E]/30 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-[#F5F1E8]">No bespoke requests initiated</h3>
              <p className="text-xs text-[#D8CBB8]/60 font-sans max-w-md mx-auto">
                A bespoke shoe is formed around your rhythm, posture, and personality. Nelson Shoes builds personalized wooden lasts that translate your anatomy into wearable art.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/bespoke"
                className="px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider hover:bg-[#D4BD86] transition-colors rounded-lg font-mono inline-flex items-center gap-2"
              >
                <span>Explore Bespoke Atelier</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {inquiries.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 rounded-xl space-y-4 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-[#B89B5E]">
                      REF: #{item.id.slice(0, 10).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/30 uppercase">
                      {item.status || 'Under Review'}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-[#F5F1E8] font-medium">
                    {item.silhouette}
                  </h3>

                  <div className="space-y-1.5 text-xs font-sans text-[#D8CBB8]/80">
                    <p><strong className="text-[#F5F1E8]">Leather:</strong> {item.leatherType || item.materialPreference || 'Curated French Calf'}</p>
                    <p><strong className="text-[#F5F1E8]">Patina:</strong> {item.colorPreference || 'Atelier Signature Glacage'}</p>
                    <p><strong className="text-[#F5F1E8]">Size / Last:</strong> {item.footSize || 'Anatomical Fitting'}</p>
                    {item.occasion && (
                      <p><strong className="text-[#F5F1E8]">Occasion:</strong> {item.occasion}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D8CBB8]/10 flex items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-[#D8CBB8]/50 font-mono">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/account/bespoke/${item.id}`}
                      className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#222222] border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] hover:text-[#B89B5E] rounded transition-colors flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </CustomerPortalLayout>
  );
};
