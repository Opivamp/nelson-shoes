import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors, 
  Ruler, 
  Sparkles, 
  MessageCircle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  FileText, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  X, 
  Loader2, 
  DollarSign, 
  Package, 
  Send, 
  Lock 
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { formatCurrencyNGN, formatCurrencyUSD } from '../../data/config';
import { 
  BESPOKE_STAGES, 
  canTransitionBespokeStatus, 
  getBespokeProgressPercent,
  validateBespokeQuotation 
} from '../../services/bespokeLifecycle';
import type { 
  BespokeInquiryDocument, 
  BespokeLifecycleStatus, 
  BespokeQuotation 
} from '../../types';

export const AdminBespokePage: React.FC = () => {
  const { adminUser, firebaseUser } = useAdminAuth();
  const [inquiries, setInquiries] = useState<BespokeInquiryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected inquiry for detail modal
  const [selectedInquiry, setSelectedInquiry] = useState<BespokeInquiryDocument | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states for modal
  const [newStatus, setNewStatus] = useState<BespokeLifecycleStatus>('under_review');
  const [statusNote, setStatusNote] = useState('');
  
  // Quotation form
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    amountNGN: 350000,
    amountUSD: 460,
    depositPercentage: 50,
    estimatedLeadWeeks: 5,
    terms: '50% bench deposit required to commence wood last carving and hide allocation. Balance due prior to final dispatch.',
    notes: ''
  });

  // Notes forms
  const [internalNote, setInternalNote] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  // Real-time Firestore subscription
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'bespoke_inquiries'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const docs: BespokeInquiryDocument[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as any;
          docs.push({
            id: doc.id,
            inquiryReference: data.inquiryReference || doc.id,
            customerUid: data.customerUid || null,
            customerName: data.customerName || data.fullName || 'Anonymous Client',
            customerEmail: data.customerEmail || data.email || '',
            customerPhone: data.customerPhone || data.phoneWhatsApp || data.phoneOrWhatsApp || '',
            country: data.country || 'Nigeria',
            city: data.city || 'Lagos',
            status: data.status || 'inquiry_submitted',
            specifications: data.specifications || {
              silhouette: data.silhouette || 'Oxford Wholecut',
              leatherType: data.leatherType || 'French Box Calf',
              colorPreference: data.colorPreference || 'Atelier Patina',
              footSize: data.footSize || 'EU 42',
              fittingPreference: data.fittingPreference || 'atelier-measurement',
              occasion: data.occasion,
              budgetRange: data.budgetRange,
              specialRequests: data.specialRequests
            },
            referenceImages: Array.isArray(data.referenceImages) ? data.referenceImages : [],
            quotation: data.quotation || null,
            customerVisibleNotes: Array.isArray(data.customerVisibleNotes) ? data.customerVisibleNotes : [],
            artisanNotes: Array.isArray(data.artisanNotes) ? data.artisanNotes : [],
            auditTrail: Array.isArray(data.auditTrail) ? data.auditTrail : [],
            convertedOrderId: data.convertedOrderId || null,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
          });
        });
        setInquiries(docs);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching bespoke inquiries:', err);
        setLoading(false);
      });

      return () => unsub();
    } catch (err) {
      console.error('Error initializing bespoke inquiry listener:', err);
      setLoading(false);
    }
  }, []);

  // Update selected inquiry when the list updates
  useEffect(() => {
    if (selectedInquiry) {
      const refreshed = inquiries.find(i => i.id === selectedInquiry.id);
      if (refreshed) setSelectedInquiry(refreshed);
    }
  }, [inquiries]);

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = 
      inq.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.customerPhone.includes(searchQuery) ||
      inq.inquiryReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.specifications.silhouette.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'review') {
      return ['inquiry_submitted', 'under_review', 'awaiting_customer_details', 'design_review'].includes(inq.status);
    }
    if (filterStatus === 'quote') {
      return ['quotation_ready', 'awaiting_customer_approval'].includes(inq.status);
    }
    if (filterStatus === 'deposit') {
      return ['approved', 'deposit_pending', 'deposit_confirmed'].includes(inq.status);
    }
    if (filterStatus === 'production') {
      return ['in_production', 'quality_inspection', 'ready_for_dispatch'].includes(inq.status);
    }
    if (filterStatus === 'completed') {
      return inq.status === 'completed';
    }
    if (filterStatus === 'cancelled') {
      return inq.status === 'cancelled' || inq.status === 'declined';
    }
    return true;
  });

  // API Call helper with admin token
  const callManageApi = async (payload: any) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { auth } = await import('../../services/firebase');
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated as administrator.');
      }

      const res = await fetch('/api/manage-bespoke-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update commission record.');
      }

      setActionSuccess('Action applied successfully.');
      return data;
    } catch (err: any) {
      setActionError(err.message || 'Error executing admin action.');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (targetStatus: BespokeLifecycleStatus) => {
    if (!selectedInquiry) return;
    try {
      await callManageApi({
        inquiryId: selectedInquiry.id,
        action: 'update_status',
        targetStatus,
        note: statusNote
      });
      setStatusNote('');
    } catch {}
  };

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    try {
      await callManageApi({
        inquiryId: selectedInquiry.id,
        action: 'set_quotation',
        quotation: {
          amountNGN: Number(quoteForm.amountNGN),
          amountUSD: Number(quoteForm.amountUSD),
          depositPercentage: Number(quoteForm.depositPercentage),
          estimatedLeadWeeks: Number(quoteForm.estimatedLeadWeeks),
          terms: quoteForm.terms,
          notes: quoteForm.notes
        }
      });
      setShowQuoteForm(false);
    } catch {}
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !internalNote.trim()) return;

    try {
      await callManageApi({
        inquiryId: selectedInquiry.id,
        action: 'add_artisan_note',
        message: internalNote
      });
      setInternalNote('');
    } catch {}
  };

  const handleAddCustomerNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !customerNote.trim()) return;

    try {
      await callManageApi({
        inquiryId: selectedInquiry.id,
        action: 'add_customer_note',
        message: customerNote
      });
      setCustomerNote('');
    } catch {}
  };

  const handleConfirmDeposit = async () => {
    if (!selectedInquiry) return;
    try {
      await callManageApi({
        inquiryId: selectedInquiry.id,
        action: 'confirm_deposit',
        paymentReference: `MANUAL-WIRE-${Date.now()}`
      });
    } catch {}
  };

  const handleConvertToOrder = async () => {
    if (!selectedInquiry) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { auth } = await import('../../services/firebase');
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated.');

      const res = await fetch('/api/convert-bespoke-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          inquiryId: selectedInquiry.id,
          deliveryMethod: selectedInquiry.specifications.fittingPreference === 'atelier-measurement' ? 'atelier-pickup' : 'dhl-express'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to convert commission to order.');
      }

      setActionSuccess(`Successfully converted to Commission Order #${data.orderNumber}!`);
    } catch (err: any) {
      setActionError(err.message || 'Failed to convert commission.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8CBB8]/15">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
            MASTER CORDWAINER ATELIER WORKBENCH
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#F5F1E8] font-light">
            Bespoke Commission Registry
          </h1>
          <p className="text-xs text-[#D8CBB8]/60 font-sans mt-0.5">
            Manage custom anatomical last carving dossiers, issue authoritative quotations, and convert approved commissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[#B89B5E]/30 bg-[#B89B5E]/10 text-[#B89B5E] flex items-center gap-2">
            <ShieldCheck size={14} />
            <span className="capitalize">{adminUser?.role?.replace('_', ' ') || 'Atelier Staff'}</span>
          </span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none text-xs font-mono">
          {[
            { id: 'all', label: `All (${inquiries.length})` },
            { id: 'review', label: 'In Review' },
            { id: 'quote', label: 'Quoted' },
            { id: 'deposit', label: 'Deposit' },
            { id: 'production', label: 'In Production' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-[#B89B5E] text-[#0A0A0A] font-semibold'
                  : 'bg-[#181818] text-[#D8CBB8]/70 hover:text-[#F5F1E8] border border-[#D8CBB8]/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
          <input
            type="text"
            placeholder="Search client, email, ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-[#D8CBB8]/20 pl-9 pr-3 py-1.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] rounded-lg"
          />
        </div>
      </div>

      {/* Table / Inquiries List */}
      {loading ? (
        <div className="p-16 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#B89B5E] animate-spin mx-auto" />
          <p className="text-xs text-[#D8CBB8]/60 font-mono">Loading bespoke commissions from atelier database...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="p-16 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-3">
          <Scissors className="w-8 h-8 text-[#B89B5E]/30 mx-auto" />
          <p className="text-sm text-[#F5F1E8] font-serif">No bespoke dossiers matching criteria</p>
          <p className="text-xs text-[#D8CBB8]/50 font-mono">Try adjusting search filters or check back for new submissions.</p>
        </div>
      ) : (
        <>
          {/* Inquiries Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredInquiries.map((inq) => {
              const stage = BESPOKE_STAGES.find(s => s.status === inq.status);
              const isApproved = ['approved', 'deposit_pending', 'deposit_confirmed', 'in_production', 'quality_inspection', 'completed'].includes(inq.status);

              return (
                <div key={inq.id} className="bg-[#121212] border border-[#D8CBB8]/15 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#B89B5E] font-mono font-bold text-xs">{inq.inquiryReference}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                      isApproved 
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40' 
                        : 'bg-[#B89B5E]/20 text-[#B89B5E] border-[#B89B5E]/30'
                    }`}>
                      {stage?.shortLabel || inq.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="font-medium text-[#F5F1E8]">{inq.customerName}</div>
                    <div className="text-[11px] text-[#D8CBB8]/60">{inq.customerEmail} • {inq.customerPhone}</div>
                  </div>
                  <div className="text-xs space-y-0.5 bg-[#181818] p-2.5 rounded border border-[#D8CBB8]/10">
                    <div className="font-serif text-[#F5F1E8]">{inq.specifications.silhouette}</div>
                    <div className="text-[11px] text-[#D8CBB8]/70">
                      {inq.specifications.leatherType} • {inq.specifications.colorPreference} (Size: {inq.specifications.footSize})
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#D8CBB8]/10 text-xs">
                    <div className="font-mono">
                      {inq.quotation ? (
                        <span className="text-[#F5F1E8] font-bold">{formatCurrencyNGN(inq.quotation.amountNGN)}</span>
                      ) : (
                        <span className="text-[#D8CBB8]/40 italic text-[11px]">Awaiting Quote</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedInquiry(inq);
                        setNewStatus(inq.status);
                        setActionError(null);
                        setActionSuccess(null);
                      }}
                      className="px-3 py-1.5 min-h-[36px] bg-[#1E1E1E] hover:bg-[#B89B5E] hover:text-[#0A0A0A] border border-[#D8CBB8]/20 rounded-lg text-xs font-mono transition-colors inline-flex items-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>Dossier</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-[#121212] border border-[#D8CBB8]/15 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#181818] border-b border-[#D8CBB8]/15 text-[#D8CBB8]/60 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="px-5 py-3">Reference / Date</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Footwear Specification</th>
                  <th className="px-5 py-3">Quotation / Value</th>
                  <th className="px-5 py-3">Stage & Status</th>
                  <th className="px-5 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8CBB8]/10 text-[#F5F1E8]">
                {filteredInquiries.map((inq) => {
                  const stage = BESPOKE_STAGES.find(s => s.status === inq.status);
                  const isApproved = ['approved', 'deposit_pending', 'deposit_confirmed', 'in_production', 'quality_inspection', 'completed'].includes(inq.status);

                  return (
                    <tr key={inq.id} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="px-5 py-4 font-mono space-y-1">
                        <span className="text-[#B89B5E] font-bold block">{inq.inquiryReference}</span>
                        <span className="text-[10px] text-[#D8CBB8]/50 block">
                          {new Date(inq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>

                      <td className="px-5 py-4 space-y-0.5">
                        <span className="font-medium text-[#F5F1E8] block">{inq.customerName}</span>
                        <span className="text-[11px] text-[#D8CBB8]/60 block">{inq.customerEmail}</span>
                        <span className="text-[11px] text-[#D8CBB8]/50 font-mono block">{inq.customerPhone}</span>
                      </td>

                      <td className="px-5 py-4 space-y-1">
                        <span className="font-serif text-sm text-[#F5F1E8] block">{inq.specifications.silhouette}</span>
                        <span className="text-[11px] text-[#D8CBB8]/70 block">
                          {inq.specifications.leatherType} • {inq.specifications.colorPreference}
                        </span>
                        <span className="text-[10px] text-[#B89B5E] font-mono block">
                          Size: {inq.specifications.footSize}
                          {inq.specifications.monogramInitials && ` • Monogram: [${inq.specifications.monogramInitials}]`}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono space-y-1">
                        {inq.quotation ? (
                          <>
                            <span className="text-emerald-400 font-bold block">
                              {formatCurrencyNGN(inq.quotation.amountNGN)}
                            </span>
                            <span className="text-[10px] text-[#D8CBB8]/60 block">
                              Deposit: {inq.quotation.depositStatus === 'paid' ? '✓ Paid' : 'Pending'} ({inq.quotation.depositPercentage}%)
                            </span>
                          </>
                        ) : (
                          <span className="text-[#D8CBB8]/40 italic">Awaiting Quote</span>
                        )}
                        {inq.convertedOrderId && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40 block">
                            Order Linked
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 space-y-1.5">
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                          isApproved 
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/40' 
                            : 'bg-[#B89B5E]/20 text-[#B89B5E] border-[#B89B5E]/30'
                        }`}>
                          {stage?.shortLabel || inq.status.replace(/_/g, ' ')}
                        </span>
                        
                        {/* Progress Bar */}
                        <div className="w-24 bg-[#222222] rounded-full h-1 overflow-hidden">
                          <div 
                            className="bg-[#B89B5E] h-1 transition-all duration-500" 
                            style={{ width: `${getBespokeProgressPercent(inq.status)}%` }} 
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setNewStatus(inq.status);
                            setActionError(null);
                            setActionSuccess(null);
                          }}
                          className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#B89B5E] hover:text-[#0A0A0A] border border-[#D8CBB8]/20 rounded-lg text-xs font-mono transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}

      {/* =====================================================================
          INSPECTOR & WORKBENCH MODAL
      ===================================================================== */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#121212] border border-[#D8CBB8]/25 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#D8CBB8]/15">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#B89B5E]">
                    {selectedInquiry.inquiryReference}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/40 uppercase">
                    {selectedInquiry.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="font-serif text-2xl text-[#F5F1E8]">
                  {selectedInquiry.specifications.silhouette}
                </h2>
                <p className="text-xs text-[#D8CBB8]/60 font-sans">
                  Client: <strong className="text-[#F5F1E8]">{selectedInquiry.customerName}</strong> ({selectedInquiry.customerEmail} • {selectedInquiry.customerPhone})
                </p>
              </div>

              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-[#D8CBB8]/50 hover:text-[#F5F1E8] p-1.5 rounded-lg hover:bg-[#1A1A1A]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Notification messages */}
            {actionSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-700/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle size={14} />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="p-3 bg-red-950/40 border border-red-700/40 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{actionError}</span>
              </div>
            )}

            {/* Specification Grid */}
            <div className="bg-[#181818] p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#B89B5E]">
                SARTORIAL SPECIFICATIONS
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div>
                  <span className="text-[10px] text-[#D8CBB8]/50 font-mono block">Leather / Tannery</span>
                  <span className="text-[#F5F1E8]">{selectedInquiry.specifications.leatherType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8CBB8]/50 font-mono block">Color / Patina</span>
                  <span className="text-[#F5F1E8]">{selectedInquiry.specifications.colorPreference}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8CBB8]/50 font-mono block">Sole Specification</span>
                  <span className="text-[#F5F1E8]">{selectedInquiry.specifications.solePreference || 'Oak-Bark Leather'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8CBB8]/50 font-mono block">Construction</span>
                  <span className="text-[#F5F1E8] capitalize">{selectedInquiry.specifications.constructionPreference || 'Hand-Welted'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8CBB8]/50 font-mono block">Foot Size / Last</span>
                  <span className="text-[#F5F1E8]">{selectedInquiry.specifications.footSize}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8CBB8]/50 font-mono block">Fitting Mode</span>
                  <span className="text-[#F5F1E8] capitalize">{selectedInquiry.specifications.fittingPreference}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8CBB8]/50 font-mono block">Monogram Initials</span>
                  <span className="text-[#B89B5E] font-mono font-bold">{selectedInquiry.specifications.monogramInitials || 'None'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#D8CBB8]/50 font-mono block">Budget Indication</span>
                  <span className="text-[#F5F1E8]">{selectedInquiry.specifications.budgetRange || 'Bespoke Tier'}</span>
                </div>
              </div>

              {selectedInquiry.specifications.specialRequests && (
                <div className="pt-2 border-t border-[#D8CBB8]/10 text-xs">
                  <span className="text-[10px] text-[#D8CBB8]/50 font-mono block mb-1">Client Special Requests</span>
                  <p className="text-[#D8CBB8]/80 leading-relaxed italic">
                    "{selectedInquiry.specifications.specialRequests}"
                  </p>
                </div>
              )}
            </div>

            {/* Reference Images Gallery */}
            {selectedInquiry.referenceImages.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#B89B5E]">
                  Inspiration Reference Assets ({selectedInquiry.referenceImages.length})
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {selectedInquiry.referenceImages.map((img) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block relative rounded-lg border border-[#D8CBB8]/20 overflow-hidden bg-[#181818] aspect-square"
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-mono text-[#F5F1E8] p-1 text-center">
                        View Asset
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quotation Management Section */}
            <div className="bg-[#161616] border border-[#D8CBB8]/20 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-[#F5F1E8]">Authoritative Atelier Quotation</h3>
                  <p className="text-xs text-[#D8CBB8]/60 font-sans">
                    {selectedInquiry.quotation 
                      ? 'Formal quotation is active. Customer can approve or decline via portal.' 
                      : 'No quotation currently issued for this bespoke dossier.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQuoteForm(!showQuoteForm)}
                  className="px-3 py-1.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono rounded hover:bg-[#D4BD86] transition-colors"
                >
                  {selectedInquiry.quotation ? 'Edit Quotation' : '+ Prepare Quotation'}
                </button>
              </div>

              {selectedInquiry.quotation && !showQuoteForm && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#121212] rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#D8CBB8]/50 block">Commission Total</span>
                    <span className="text-base text-emerald-400 font-bold block">
                      {formatCurrencyNGN(selectedInquiry.quotation.amountNGN)}
                    </span>
                    <span className="text-[10px] text-[#D8CBB8]/60">{formatCurrencyUSD(selectedInquiry.quotation.amountUSD)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#D8CBB8]/50 block">Deposit Required</span>
                    <span className="text-[#B89B5E] font-bold block">
                      {formatCurrencyNGN(selectedInquiry.quotation.depositAmountNGN)}
                    </span>
                    <span className="text-[10px] text-[#D8CBB8]/60">{selectedInquiry.quotation.depositPercentage}% bench reservation</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#D8CBB8]/50 block">Deposit Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedInquiry.quotation.depositStatus === 'paid' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' 
                        : 'bg-amber-950 text-amber-400 border border-amber-700'
                    }`}>
                      {selectedInquiry.quotation.depositStatus === 'paid' ? 'Settled & Verified' : 'Awaiting Settlement'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#D8CBB8]/50 block">Estimated Lead Time</span>
                    <span className="text-[#F5F1E8]">{selectedInquiry.quotation.estimatedLeadWeeks} Weeks Workbench</span>
                  </div>
                </div>
              )}

              {/* Quotation Editor Form */}
              {showQuoteForm && (
                <form onSubmit={handleSaveQuotation} className="p-4 bg-[#121212] rounded-lg space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Total Amount (NGN) *</label>
                      <input
                        type="number"
                        required
                        value={quoteForm.amountNGN}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setQuoteForm({
                            ...quoteForm,
                            amountNGN: val,
                            amountUSD: Math.round(val * 0.0013) // approx reference
                          });
                        }}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-[#F5F1E8] rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Total Amount (USD) *</label>
                      <input
                        type="number"
                        required
                        value={quoteForm.amountUSD}
                        onChange={(e) => setQuoteForm({ ...quoteForm, amountUSD: Number(e.target.value) })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-[#F5F1E8] rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Deposit Percentage (%)</label>
                      <select
                        value={quoteForm.depositPercentage}
                        onChange={(e) => setQuoteForm({ ...quoteForm, depositPercentage: Number(e.target.value) })}
                        className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-[#F5F1E8] rounded font-mono"
                      >
                        <option value={50}>50% Standard Bench Deposit (Minimum)</option>
                        <option value={60}>60% Custom Reservation</option>
                        <option value={75}>75% Dedicated Allocation</option>
                        <option value={100}>100% Full Pre-Payment</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Bespoke Terms of Craft</label>
                    <textarea
                      rows={2}
                      value={quoteForm.terms}
                      onChange={(e) => setQuoteForm({ ...quoteForm, terms: e.target.value })}
                      className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2 text-[#F5F1E8] rounded"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowQuoteForm(false)}
                      className="px-3 py-1.5 border border-[#D8CBB8]/20 text-[#D8CBB8] rounded font-mono"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded font-mono font-semibold hover:bg-emerald-500"
                    >
                      {actionLoading ? 'Saving...' : 'Issue Formal Quotation'}
                    </button>
                  </div>
                </form>
              )}

              {/* Deposit manual confirmation */}
              {selectedInquiry.quotation && selectedInquiry.quotation.depositStatus === 'pending' && (
                <div className="pt-2 flex items-center justify-between border-t border-[#D8CBB8]/10 text-xs">
                  <span className="text-[#D8CBB8]/70">Verified wire payment received in GTBank clearing treasury?</span>
                  <button
                    type="button"
                    onClick={handleConfirmDeposit}
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold font-mono rounded hover:bg-[#D4BD86]"
                  >
                    Confirm Deposit Settlement
                  </button>
                </div>
              )}
            </div>

            {/* Stage Transition Control */}
            <div className="bg-[#181818] p-5 rounded-xl space-y-4">
              <h3 className="font-serif text-base text-[#F5F1E8]">Workflow Progression</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Advance Stage To:</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-[#121212] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] rounded font-mono"
                  >
                    {BESPOKE_STAGES.map((s, idx) => (
                      <option key={s.status} value={s.status}>
                        Step {idx + 1}: {s.label} ({s.percent}%)
                      </option>
                    ))}
                    <option value="cancelled">Cancelled (Exception)</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#D8CBB8]/70 block mb-1">Workbench Transition Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Beechwood block calibrated to foot contours"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full bg-[#121212] border border-[#D8CBB8]/20 p-2.5 text-[#F5F1E8] rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#D8CBB8]/50 font-mono">
                  Enforces authoritative lifecycle state machine.
                </span>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(newStatus)}
                  className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] font-mono font-semibold rounded hover:bg-[#D4BD86] transition-colors"
                >
                  {actionLoading ? 'Updating Stage...' : 'Apply Stage Transition'}
                </button>
              </div>
            </div>

            {/* Convert to Commission Order */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-600/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-serif text-sm text-[#F5F1E8] block">Commission-to-Order Pipeline</span>
                <p className="text-xs text-[#D8CBB8]/70 font-sans">
                  {selectedInquiry.convertedOrderId 
                    ? `Linked Order Reference: #${selectedInquiry.convertedOrderId}` 
                    : 'Convert approved bespoke commission into an active production order in the fulfillment ledger.'}
                </p>
              </div>

              {!selectedInquiry.convertedOrderId ? (
                <button
                  type="button"
                  disabled={actionLoading || !['approved', 'deposit_pending', 'deposit_confirmed', 'in_production'].includes(selectedInquiry.status) || !selectedInquiry.quotation}
                  onClick={handleConvertToOrder}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold rounded-lg disabled:opacity-40 transition-colors shrink-0"
                >
                  Convert to Commission Order
                </button>
              ) : (
                <Link
                  to={`/admin/orders?search=${selectedInquiry.convertedOrderId}`}
                  className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-700/50 rounded font-mono text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Check size={12} />
                  <span>View Order #{selectedInquiry.convertedOrderId} →</span>
                </Link>
              )}
            </div>

            {/* Notes: Internal Bench Log & Customer Communication */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Internal Notes */}
              <div className="bg-[#181818] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                    <Lock size={12} />
                    <span>Internal Artisan Notes (Private)</span>
                  </h4>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
                  {selectedInquiry.artisanNotes && selectedInquiry.artisanNotes.length > 0 ? (
                    selectedInquiry.artisanNotes.map((n) => (
                      <div key={n.id} className="p-2 bg-[#121212] rounded border border-[#D8CBB8]/10 space-y-1">
                        <p className="text-[#D8CBB8]/90">{n.message}</p>
                        <span className="text-[9px] text-[#D8CBB8]/40 font-mono block">
                          {n.authorName} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#D8CBB8]/40 italic text-[11px]">No internal bench notes recorded.</p>
                  )}
                </div>

                <form onSubmit={handleAddInternalNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Log internal workbench note..."
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    className="flex-1 bg-[#121212] border border-[#D8CBB8]/20 px-3 py-1.5 text-xs text-[#F5F1E8] rounded"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-[#B89B5E] text-[#0A0A0A] font-mono text-xs font-semibold rounded"
                  >
                    Log
                  </button>
                </form>
              </div>

              {/* Customer Notes */}
              <div className="bg-[#181818] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#B89B5E] flex items-center gap-1.5">
                    <Send size={12} />
                    <span>Customer Dialogue (Portal Visible)</span>
                  </h4>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
                  {selectedInquiry.customerVisibleNotes && selectedInquiry.customerVisibleNotes.length > 0 ? (
                    selectedInquiry.customerVisibleNotes.map((n) => (
                      <div key={n.id} className="p-2 bg-[#121212] rounded border border-[#D8CBB8]/10 space-y-1">
                        <p className="text-[#F5F1E8]">{n.message}</p>
                        <span className="text-[9px] text-[#B89B5E] font-mono block">
                          {n.authorName} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#D8CBB8]/40 italic text-[11px]">No concierge messages dispatched.</p>
                  )}
                </div>

                <form onSubmit={handleAddCustomerNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Message to customer's portal..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="flex-1 bg-[#121212] border border-[#D8CBB8]/20 px-3 py-1.5 text-xs text-[#F5F1E8] rounded"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-3 py-1.5 bg-[#B89B5E] text-[#0A0A0A] font-mono text-xs font-semibold rounded"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>

            {/* Direct WhatsApp Concierge CTA */}
            <div className="pt-2 flex items-center justify-between border-t border-[#D8CBB8]/15">
              <span className="text-xs text-[#D8CBB8]/60 font-sans">
                Contact client directly via verified WhatsApp:
              </span>
              <a
                href={`https://wa.me/${selectedInquiry.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedInquiry.customerName}, this is Nelson from Nelson Shoes Atelier regarding your bespoke consultation request #${selectedInquiry.inquiryReference}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366] text-[#0A0A0A] font-semibold font-mono text-xs rounded-lg hover:bg-[#20ba59] transition-colors flex items-center gap-1.5"
              >
                <MessageCircle size={14} />
                <span>Open WhatsApp Dialogue</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
