import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  Send,
  Lock
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';

export const CustomerSecurityPage: React.FC = () => {
  const { 
    customerUser, 
    sendPasswordReset, 
    resendVerification, 
    signOut 
  } = useCustomerAuth();
  const navigate = useNavigate();

  // Password reset request state
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Email verification resend state
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const handlePasswordReset = async () => {
    if (!customerUser?.email) return;
    setIsSendingReset(true);
    setResetFeedback(null);

    const res = await sendPasswordReset(customerUser.email);
    setIsSendingReset(false);

    if (res.success) {
      setResetFeedback(`A secure password reset link has been dispatched to ${customerUser.email}. Please follow the instructions in the email.`);
    } else {
      setResetFeedback(res.error || 'Failed to dispatch password reset link. Please try again later.');
    }
  };

  const handleResendVerification = async () => {
    setIsSendingVerification(true);
    setVerificationFeedback(null);

    const res = await resendVerification();
    setIsSendingVerification(false);

    if (res.success) {
      setVerificationFeedback('A verification email has been dispatched. Please check your inbox and junk folder.');
    } else {
      setVerificationFeedback(res.error || 'Failed to send verification email.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <CustomerPortalLayout>
      <div className="space-y-8 max-w-2xl">

        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89B5E] block">
            CREDENTIALS & ENCRYPTION
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#F5F1E8]">
            Security & Authentication
          </h2>
          <p className="text-xs text-[#D8CBB8]/70 font-sans">
            Manage your account passphrase, verify your email address, and control active sessions.
          </p>
        </div>

        {/* ========================================================
            1. EMAIL VERIFICATION CARD
        ======================================================== */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-[#F5F1E8] flex items-center gap-2">
                <Mail size={16} className="text-[#B89B5E]" />
                <span>Email Verification</span>
              </h3>
              <p className="text-xs text-[#D8CBB8]/70 font-sans">
                Primary Account Email: <span className="font-mono text-[#F5F1E8]">{customerUser?.email}</span>
              </p>
            </div>

            {customerUser?.emailVerified ? (
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <CheckCircle2 size={13} />
                <span>Verified</span>
              </span>
            ) : (
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                <AlertCircle size={13} />
                <span>Unverified</span>
              </span>
            )}
          </div>

          {!customerUser?.emailVerified && (
            <div className="pt-2 space-y-3">
              <p className="text-xs text-[#D8CBB8]/60 font-sans">
                Verifying your email confirms ownership of your account and ensures you receive urgent bespoke fitting updates and international courier dispatches.
              </p>

              {verificationFeedback && (
                <div className="p-3 bg-[#181818] border border-[#B89B5E]/30 rounded text-xs font-mono text-[#B89B5E]">
                  {verificationFeedback}
                </div>
              )}

              <button
                onClick={handleResendVerification}
                disabled={isSendingVerification}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#B89B5E]/50 text-xs font-mono text-[#B89B5E] hover:text-[#D4BD86] rounded transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSendingVerification ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>{isSendingVerification ? 'Sending...' : 'Resend Verification Email'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================
            2. PASSPHRASE & RECOVERY CARD
        ======================================================== */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-[#F5F1E8] flex items-center gap-2">
              <KeyRound size={16} className="text-[#B89B5E]" />
              <span>Passphrase & Account Recovery</span>
            </h3>
            <p className="text-xs text-[#D8CBB8]/70 font-sans">
              Request a secure, single-use password reset link sent to your registered email address.
            </p>
          </div>

          {resetFeedback && (
            <div className="p-3 bg-[#181818] border border-[#B89B5E]/30 rounded text-xs font-mono text-[#B89B5E]">
              {resetFeedback}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handlePasswordReset}
              disabled={isSendingReset}
              className="px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded hover:bg-[#D4BD86] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
            >
              {isSendingReset ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              <span>{isSendingReset ? 'Dispatching link...' : 'Send Password Reset Link'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            3. SESSION MANAGEMENT CARD
        ======================================================== */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-[#F5F1E8] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#B89B5E]" />
              <span>Active Session</span>
            </h3>
            <p className="text-xs text-[#D8CBB8]/70 font-sans">
              Sign out of this device. Your bespoke lasts and order history remain securely archived in the atelier cloud.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-red-950/30 border border-red-500/20 hover:border-red-500/40 text-xs font-mono text-red-400 hover:text-red-300 rounded transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>

      </div>
    </CustomerPortalLayout>
  );
};
