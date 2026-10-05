import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  MessageCircle, 
  ShoppingBag, 
  PackageCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { verifyServerPayment, ServerVerifyPaymentResult } from '../services/paystack';
import { formatCurrencyNGN, formatCurrencyUSD, getWhatsAppUrl } from '../data/config';

type VerificationState = 'loading' | 'success' | 'failed' | 'not_found';

export const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const reference = searchParams.get('reference') || searchParams.get('trxref') || '';

  const [state, setState] = useState<VerificationState>('loading');
  const [result, setResult] = useState<ServerVerifyPaymentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!reference) {
      setState('not_found');
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        setState('loading');
        const res = await verifyServerPayment(reference);
        if (!isMounted) return;

        setResult(res);

        if (res.success && (res.paymentStatus === 'paid' || res.alreadyPaid)) {
          clearCart();
          setState('success');
        } else {
          setErrorMessage(res.error || 'Payment confirmation could not be verified by the gateway.');
          setState('failed');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMessage(err.message || 'Network error verifying transaction with atelier treasury.');
        setState('failed');
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [reference, clearCart]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        {/* Verification in Progress */}
        {state === 'loading' && (
          <div className="border border-[#B89B5E]/30 bg-[#121212]/90 backdrop-blur-md p-8 sm:p-12 text-center rounded-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#B89B5E] to-transparent animate-pulse" />
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#B89B5E]/10 border border-[#B89B5E]/40">
              <Loader2 className="w-8 h-8 text-[#B89B5E] animate-spin" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-semibold mb-2">
              Atelier Treasury Verification
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F1E8] mb-3">
              Confirming Transaction Settlement
            </h1>
            <p className="text-xs sm:text-sm text-[#D8CBB8]/70 max-w-md mx-auto leading-relaxed mb-6">
              Contacting Paystack gateway to cryptographically verify payment settlement and activate your bespoke commission dossier.
            </p>
            {reference && (
              <div className="inline-block px-4 py-1.5 bg-[#1B1917] border border-[#B89B5E]/20 text-[11px] font-mono text-[#D8CBB8]/80">
                Ref: {reference}
              </div>
            )}
          </div>
        )}

        {/* Verification Success */}
        {state === 'success' && result && (
          <div className="border border-[#B89B5E]/40 bg-[#121212]/95 backdrop-blur-md p-8 sm:p-12 text-center rounded-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#B89B5E] via-[#F5F1E8] to-[#B89B5E]" />

            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-[#B89B5E]/15 border border-[#B89B5E]/50 shadow-[0_0_30px_rgba(184,155,94,0.25)]">
              <ShieldCheck className="w-10 h-10 text-[#B89B5E]" />
            </div>

            <p className="text-[11px] uppercase tracking-[0.35em] text-[#B89B5E] font-semibold mb-2">
              Commission Secured & Paid
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F1E8] mb-4">
              Payment Confirmed
            </h1>
            <p className="text-xs sm:text-sm text-[#D8CBB8]/80 max-w-md mx-auto leading-relaxed mb-8">
              Your transaction has been officially recorded in the atelier workbench ledger. Master shoemakers have been notified to begin materials procurement.
            </p>

            {/* Dossier Summary Box */}
            <div className="bg-[#181614] border border-[#B89B5E]/25 rounded-sm p-6 mb-8 text-left space-y-3.5">
              <div className="flex justify-between items-center pb-3 border-b border-[#2C2722]">
                <span className="text-xs uppercase tracking-wider text-[#A89A88]">Commission Order</span>
                <span className="font-mono text-sm font-semibold text-[#F5F1E8]">{result.orderNumber || 'Pending Confirmation'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#2C2722]">
                <span className="text-xs uppercase tracking-wider text-[#A89A88]">Gateway Reference</span>
                <span className="font-mono text-xs text-[#D8CBB8] truncate max-w-[200px]">{reference}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#2C2722]">
                <span className="text-xs uppercase tracking-wider text-[#A89A88]">Settled Amount</span>
                <span className="font-serif text-base font-semibold text-[#B89B5E]">
                  {result.currency === 'USD' 
                    ? formatCurrencyUSD(result.amount || 0)
                    : formatCurrencyNGN(result.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-[#A89A88]">Payment Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" /> Settled
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {result.orderNumber && (
                <Link
                  to={`/track?order=${encodeURIComponent(result.orderNumber)}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#B89B5E] text-[#0A0A0A] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C9AF72] transition-colors"
                >
                  <PackageCheck className="w-4 h-4" />
                  Track Commission
                </Link>
              )}
              <Link
                to="/account/orders"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[#B89B5E]/40 text-[#F5F1E8] text-xs uppercase tracking-[0.2em] hover:bg-[#B89B5E]/10 transition-colors"
              >
                Patron Orders
              </Link>
            </div>
          </div>
        )}

        {/* Verification Failed */}
        {state === 'failed' && (
          <div className="border border-red-900/40 bg-[#121212]/95 backdrop-blur-md p-8 sm:p-12 text-center rounded-sm shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-950/30 border border-red-800/50">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-red-400 font-semibold mb-2">
              Verification Notice
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F1E8] mb-3">
              Payment Could Not Be Confirmed
            </h1>
            <p className="text-xs sm:text-sm text-[#D8CBB8]/70 max-w-md mx-auto leading-relaxed mb-6">
              {errorMessage || 'The payment gateway could not confirm completion of this transaction.'}
            </p>

            {reference && (
              <div className="inline-block px-4 py-1.5 bg-[#1B1917] border border-red-900/30 text-[11px] font-mono text-[#D8CBB8]/80 mb-6">
                Ref: {reference}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#B89B5E] text-[#0A0A0A] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C9AF72] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Verification
              </button>
              <a
                href={getWhatsAppUrl(`Hello Nelson Concierge, I experienced an issue confirming my Paystack payment for reference: ${reference}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#B89B5E]/40 text-[#F5F1E8] text-xs uppercase tracking-[0.2em] hover:bg-[#B89B5E]/10 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Contact Concierge
              </a>
            </div>
          </div>
        )}

        {/* Missing Reference State */}
        {state === 'not_found' && (
          <div className="border border-[#2C2722] bg-[#121212] p-8 sm:p-12 text-center rounded-sm">
            <h1 className="font-serif text-2xl text-[#F5F1E8] mb-3">No Transaction Specified</h1>
            <p className="text-xs text-[#D8CBB8]/70 mb-6">
              No payment reference was detected in the callback request.
            </p>
            <Link
              to="/collection"
              className="inline-block px-6 py-3 bg-[#B89B5E] text-[#0A0A0A] text-xs uppercase tracking-[0.2em] font-semibold"
            >
              Explore Collection
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
