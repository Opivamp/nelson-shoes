import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export const CustomerForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset, authError, clearError } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFormError('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await sendPasswordReset(cleanEmail);
    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
    } else if (res.error) {
      setFormError(res.error);
    }
  };

  const displayedError = formError || authError;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#0A0A0A] text-[#F5F1E8]">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#B89B5E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        
        {/* Monogram Header */}
        <div className="text-center space-y-2">
          <Link to="/account/login" className="inline-flex items-center gap-1.5 text-xs text-[#D8CBB8]/60 hover:text-[#F5F1E8] mb-2 transition-colors">
            <ArrowLeft size={13} />
            <span className="uppercase tracking-widest">Back to Sign In</span>
          </Link>

          <div className="w-12 h-12 border border-[#B89B5E] mx-auto flex items-center justify-center bg-[#121212] shadow-lg">
            <span className="font-serif text-2xl text-[#B89B5E]">N</span>
          </div>
          <h1 className="font-display tracking-[0.25em] text-xl font-bold text-[#F5F1E8]">
            NELSON ATELIER
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono">
            Recover Patron Passphrase
          </p>
        </div>

        {/* Reset Card */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 shadow-2xl space-y-6">
          
          {isSubmitted ? (
            <div className="text-center space-y-5 py-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-[#B89B5E]/15 border border-[#B89B5E] text-[#B89B5E] flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-xl text-[#F5F1E8]">Instructions Dispatched</h2>
                <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed">
                  If an atelier patron account is registered under{' '}
                  <span className="font-mono text-[#B89B5E]">{email}</span>, you will receive a secure password recovery link shortly.
                </p>
              </div>

              <div className="p-3 bg-[#181818] border border-[#D8CBB8]/10 rounded text-[11px] text-[#D8CBB8]/50 font-sans leading-relaxed">
                Please check your inbox (and spam folder). The link will remain active for 1 hour.
              </div>

              <Link
                to="/account/login"
                className="inline-flex items-center justify-center w-full py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-widest uppercase hover:bg-[#D4BD86] transition-colors"
              >
                <span>RETURN TO SIGN IN</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-1 text-center">
                <h2 className="font-serif text-xl text-[#F5F1E8]">Reset Your Passphrase</h2>
                <p className="text-xs text-[#D8CBB8]/60 font-sans">
                  Enter your registered atelier email to receive a secure recovery dispatch.
                </p>
              </div>

              {displayedError && (
                <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs text-center rounded leading-relaxed animate-fadeIn">
                  {displayedError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@domain.com"
                      autoComplete="email"
                      disabled={isSubmitting}
                      className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-widest uppercase hover:bg-[#D4BD86] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>DISPATCHING RECOVERY LINK...</span>
                    </>
                  ) : (
                    <>
                      <span>DISPATCH RECOVERY LINK</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <span className="text-[10px] uppercase tracking-widest text-[#D8CBB8]/40 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={12} className="text-[#B89B5E]" />
                  <span>Privacy-Preserving Anti-Enumeration Protection</span>
                </span>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
