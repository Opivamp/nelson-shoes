import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Scissors, 
  ArrowLeft, 
  Clock, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { fetchCustomerBespokeInquiryById } from '../../services/customerAuthService';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';
import { getWhatsAppUrl } from '../../data/config';
import type { CustomerBespokeInquiry } from '../../types';

export const CustomerBespokeDetailPage: React.FC = () => {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const { customerUser } = useCustomerAuth();

  const [inquiry, setInquiry] = useState<CustomerBespokeInquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerUser || !inquiryId) return;
    setIsLoading(true);

    fetchCustomerBespokeInquiryById(customerUser.uid, inquiryId)
      .then((data) => {
        if (!data) {
          setError('Bespoke inquiry not found or not associated with your customer account.');
        } else {
          setInquiry(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bespoke inquiry:', err);
        setError('Unable to load bespoke inquiry details.');
        setIsLoading(false);
      });
  }, [customerUser, inquiryId]);

  const getConciergeMessage = () => {
    if (!inquiry) return '';
    const text = `Hello Nelson Shoes Concierge, I would like to consult on my bespoke footwear inquiry (#${inquiry.id.slice(0, 8).toUpperCase()} - ${inquiry.silhouette}). Could we discuss next steps?`;
    return getWhatsAppUrl(text);
  };

  return (
    <CustomerPortalLayout>
      <div className="space-y-8">

        {/* Back Link */}
        <Link
          to="/account/bespoke"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#D8CBB8]/70 hover:text-[#B89B5E] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Bespoke Commissions</span>
        </Link>

        {isLoading ? (
          <div className="p-16 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#B89B5E] animate-spin mx-auto" />
            <p className="text-xs text-[#D8CBB8]/60 font-mono">Loading bespoke dossier...</p>
          </div>
        ) : error || !inquiry ? (
          <div className="p-12 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="font-serif text-xl text-[#F5F1E8]">Bespoke Dossier Unavailable</h3>
            <p className="text-xs text-[#D8CBB8]/70 font-sans max-w-md mx-auto">
              {error || 'This bespoke inquiry could not be located.'}
            </p>
            <div className="pt-2">
              <Link
                to="/account/bespoke"
                className="px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-colors"
              >
                Return to Bespoke List
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Header Card */}
            <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D8CBB8]/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-[#B89B5E]">
                      DOSSIER #{inquiry.id.slice(0, 10).toUpperCase()}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/40 uppercase font-semibold">
                      {inquiry.status || 'Under Review'}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#F5F1E8] font-normal">
                    {inquiry.silhouette}
                  </h2>
                  <p className="text-xs text-[#D8CBB8]/60 font-mono">
                    Submitted: {new Date(inquiry.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={getConciergeMessage()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Leather & Hide</span>
                  <span className="font-serif text-sm text-[#F5F1E8]">{inquiry.leatherType || inquiry.materialPreference || 'Curated French Calf'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Patina & Finish</span>
                  <span className="font-serif text-sm text-[#F5F1E8]">{inquiry.colorPreference || 'Atelier Signature Glacage'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Foot Size / Last</span>
                  <span className="font-serif text-sm text-[#F5F1E8]">{inquiry.footSize || 'Anatomical Fitting'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Occasion</span>
                  <span className="font-serif text-sm text-[#F5F1E8]">{inquiry.occasion || 'Executive / Formal'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Budget Preference</span>
                  <span className="font-serif text-sm text-[#F5F1E8]">{inquiry.budgetRange || 'Bespoke Tier'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Fitting Preference</span>
                  <span className="font-serif text-sm text-[#F5F1E8] capitalize">{inquiry.fittingPreference || 'Atelier Measurement'}</span>
                </div>
              </div>
            </div>

            {/* Customer Special Requests / Notes */}
            {(inquiry.specialRequests || inquiry.additionalDetails) && (
              <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 rounded-xl space-y-3">
                <h4 className="font-serif text-base text-[#F5F1E8]">Customer Notes & Sartorial Instructions</h4>
                <p className="text-xs text-[#D8CBB8]/80 font-sans leading-relaxed whitespace-pre-wrap">
                  {inquiry.specialRequests || inquiry.additionalDetails}
                </p>
              </div>
            )}

            {/* Bespoke Dialogue Guidance */}
            <div className="p-6 bg-[#161616] border border-[#B89B5E]/30 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-mono text-[#B89B5E] tracking-widest block">
                WHAT HAPPENS NEXT
              </span>
              <p className="text-xs text-[#D8CBB8]/80 font-sans leading-relaxed">
                Our master cordwainer reviews every bespoke submission. You will be contacted via WhatsApp to schedule your anatomical fitting dialogue and review last dimensions.
              </p>
            </div>

          </div>
        )}

      </div>
    </CustomerPortalLayout>
  );
};
