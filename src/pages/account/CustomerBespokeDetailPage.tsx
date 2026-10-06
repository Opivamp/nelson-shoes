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
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Send,
  ExternalLink,
  Package
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { fetchCustomerBespokeInquiryById } from '../../services/customerAuthService';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';
import { getWhatsAppUrl, formatCurrencyNGN, formatCurrencyUSD } from '../../data/config';
import { BESPOKE_STAGES, getBespokeProgressPercent } from '../../services/bespokeLifecycle';
import type { CustomerBespokeInquiry } from '../../types';

export const CustomerBespokeDetailPage: React.FC = () => {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const { customerUser } = useCustomerAuth();

  const [inquiry, setInquiry] = useState<CustomerBespokeInquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customerMessage, setCustomerMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadDossier = () => {
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
  };

  useEffect(() => {
    loadDossier();
  }, [customerUser, inquiryId]);

  const callCustomerAction = async (action: string, payload: Record<string, any> = {}) => {
    if (!customerUser || !inquiryId) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const idToken = await customerUser.getIdToken();
      const res = await fetch('/api/customer-bespoke-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          inquiryId,
          action,
          ...payload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete bespoke action.');
      }

      setActionSuccess('Your instruction has been recorded by the atelier.');
      loadDossier();
    } catch (err: any) {
      setActionError(err.message || 'Error executing action.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveQuotation = () => {
    callCustomerAction('approve_quote');
  };

  const handleDeclineQuotation = () => {
    callCustomerAction('decline_quote', { reason: 'Customer requested cancellation or revision of quotation.' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessage.trim()) return;
    callCustomerAction('send_message', { message: customerMessage }).then(() => {
      setCustomerMessage('');
    });
  };

  const getConciergeMessage = () => {
    if (!inquiry) return '';
    const refCode = inquiry.inquiryReference || inquiry.id.slice(0, 8).toUpperCase();
    const text = `Hello Nelson Atelier Concierge, I am reviewing my bespoke footwear dossier (${refCode} - ${inquiry.silhouette}) and would like to discuss next steps.`;
    return getWhatsAppUrl(text);
  };

  const currentStage = BESPOKE_STAGES.find(s => s.status === inquiry?.status);
  const progressPercent = inquiry ? getBespokeProgressPercent(inquiry.status as any) : 0;

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
            <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl space-y-6 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D8CBB8]/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs text-[#B89B5E]">
                      DOSSIER #{inquiry.inquiryReference || inquiry.id.slice(0, 10).toUpperCase()}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/40 uppercase font-semibold">
                      {currentStage?.shortLabel || inquiry.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#F5F1E8] font-normal">
                    {inquiry.specifications?.silhouette || inquiry.silhouette}
                  </h2>
                  <p className="text-xs text-[#D8CBB8]/60 font-mono">
                    Initiated: {new Date(inquiry.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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

              {/* Action feedback */}
              {actionSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-700/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>{actionSuccess}</span>
                </div>
              )}
              {actionError && (
                <div className="p-3 bg-red-950/40 border border-red-700/40 rounded-lg text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Progress Bar & Current Stage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#D8CBB8]/70">{currentStage?.label || 'Commission Progress'}</span>
                  <span className="text-[#B89B5E] font-bold">{progressPercent}% Completed</span>
                </div>
                <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden border border-[#D8CBB8]/15">
                  <div 
                    className="bg-[#B89B5E] h-2 rounded-full transition-all duration-700" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
                <p className="text-xs text-[#D8CBB8]/60 font-sans italic pt-1">
                  {currentStage?.description}
                </p>
              </div>

              {/* Converted Order Link Banner */}
              {inquiry.convertedOrderId && (
                <div className="p-4 bg-emerald-950/30 border border-emerald-600/40 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div className="space-y-0.5">
                      <span className="font-serif text-sm text-[#F5F1E8] block">Commission Active in Order Ledger</span>
                      <p className="text-xs text-[#D8CBB8]/70 font-sans">
                        Order #{inquiry.convertedOrderNumber || inquiry.convertedOrderId} is currently advancing through our workshop craft pipeline.
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/account/orders/${inquiry.convertedOrderId}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs rounded-lg font-semibold shrink-0 transition-colors"
                  >
                    View Order
                  </Link>
                </div>
              )}

              {/* Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Leather & Hide</span>
                  <span className="font-serif text-sm text-[#F5F1E8]">{inquiry.specifications?.leatherType || inquiry.leatherType || inquiry.materialPreference || 'Curated French Calf'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Patina & Finish</span>
                  <span className="font-serif text-sm text-[#F5F1E8]">{inquiry.specifications?.colorPreference || inquiry.colorPreference || 'Atelier Signature Glacage'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Foot Size / Last</span>
                  <span className="font-serif text-sm text-[#F5F1E8]">{inquiry.specifications?.footSize || inquiry.footSize || 'Anatomical Fitting'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Construction Spec</span>
                  <span className="font-serif text-sm text-[#F5F1E8] capitalize">{inquiry.specifications?.constructionPreference || 'Hand-Welted Inseam'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Sole Profile</span>
                  <span className="font-serif text-sm text-[#F5F1E8]">{inquiry.specifications?.solePreference || 'Oak-Bark Leather'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D8CBB8]/40 block">Monogram Initials</span>
                  <span className="font-mono text-sm text-[#B89B5E] font-bold">{inquiry.specifications?.monogramInitials || 'None Requested'}</span>
                </div>
              </div>
            </div>

            {/* Authoritative Atelier Quotation Card */}
            {inquiry.quotation ? (
              <div className="bg-[#121212] border border-[#B89B5E]/30 p-6 sm:p-8 rounded-xl space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8CBB8]/15">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#B89B5E] block">
                      OFFICIAL ATELIER QUOTATION
                    </span>
                    <h3 className="font-serif text-2xl text-[#F5F1E8]">
                      Commission Terms & Investment
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-2xl text-emerald-400 font-bold block">
                      {formatCurrencyNGN(inquiry.quotation.amountNGN)}
                    </span>
                    <span className="font-mono text-xs text-[#D8CBB8]/60">
                      {formatCurrencyUSD(inquiry.quotation.amountUSD)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 bg-[#181818] rounded-lg">
                    <span className="text-[10px] text-[#D8CBB8]/50 block">Required Bench Deposit</span>
                    <span className="text-[#B89B5E] font-bold text-sm block">
                      {formatCurrencyNGN(inquiry.quotation.depositAmountNGN)}
                    </span>
                    <span className="text-[10px] text-[#D8CBB8]/60">{inquiry.quotation.depositPercentage}% of total</span>
                  </div>

                  <div className="p-3 bg-[#181818] rounded-lg">
                    <span className="text-[10px] text-[#D8CBB8]/50 block">Deposit Status</span>
                    <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold ${
                      inquiry.quotation.depositStatus === 'paid' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' 
                        : 'bg-amber-950 text-amber-400 border border-amber-700'
                    }`}>
                      {inquiry.quotation.depositStatus === 'paid' ? '✓ Deposit Settled' : 'Pending Settlement'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#181818] rounded-lg">
                    <span className="text-[10px] text-[#D8CBB8]/50 block">Estimated Bench Time</span>
                    <span className="text-[#F5F1E8] font-bold text-sm block">
                      {inquiry.quotation.estimatedLeadWeeks} Weeks
                    </span>
                    <span className="text-[10px] text-[#D8CBB8]/60">Handcrafted from Beechwood Last</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <span className="font-mono text-[10px] uppercase text-[#D8CBB8]/50 tracking-wider block">
                    Agreed Terms & Conditions
                  </span>
                  <p className="text-[#D8CBB8]/80 leading-relaxed bg-[#181818] p-3 rounded-lg">
                    {inquiry.quotation.terms}
                  </p>
                </div>

                {/* Customer Approval Actions */}
                {['quotation_ready', 'awaiting_customer_approval'].includes(inquiry.status) && (
                  <div className="pt-4 border-t border-[#D8CBB8]/15 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleDeclineQuotation}
                      className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 border border-red-700/40 text-red-400 hover:bg-red-950/30 rounded-lg text-xs font-mono transition-all cursor-pointer active:scale-[0.985] disabled:opacity-50"
                    >
                      Decline Quotation
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleApproveQuotation}
                      className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-[0.985] disabled:opacity-50"
                    >
                      <Check size={14} />
                      <span>Authorize & Approve Commission Quote</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Customer Special Requests / Notes */}
            {(inquiry.specifications?.specialRequests || inquiry.specialRequests || inquiry.additionalDetails) && (
              <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 rounded-xl space-y-3">
                <h4 className="font-serif text-base text-[#F5F1E8]">Submitted Anatomical & Aesthetic Notes</h4>
                <p className="text-xs text-[#D8CBB8]/80 font-sans leading-relaxed whitespace-pre-wrap">
                  {inquiry.specifications?.specialRequests || inquiry.specialRequests || inquiry.additionalDetails}
                </p>
              </div>
            )}

            {/* Atelier Consultation Dialogue */}
            <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 rounded-xl space-y-4">
              <h4 className="font-serif text-base text-[#F5F1E8] flex items-center gap-2">
                <MessageCircle size={16} className="text-[#B89B5E]" />
                <span>Atelier Concierge Messages</span>
              </h4>

              <div className="space-y-3">
                {inquiry.customerVisibleNotes && inquiry.customerVisibleNotes.length > 0 ? (
                  inquiry.customerVisibleNotes.map((msg) => (
                    <div key={msg.id} className="p-3 bg-[#181818] rounded-lg border border-[#D8CBB8]/10 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[#B89B5E] font-semibold">{msg.authorName}</span>
                        <span className="text-[10px] text-[#D8CBB8]/40 font-mono">
                          {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#F5F1E8] font-sans leading-relaxed">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#D8CBB8]/50 italic">
                    No active notices. Our concierge will post updates and fitting appointment notes here.
                  </p>
                )}
              </div>

              {/* Message Reply Form */}
              <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Send a question or specification update to the atelier..."
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  className="flex-1 bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded-lg font-sans"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !customerMessage.trim()}
                  className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-mono text-xs font-semibold rounded-lg hover:bg-[#D4BD86] transition-colors disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Send</span>
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </CustomerPortalLayout>
  );
};
