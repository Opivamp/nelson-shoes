import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { confirmCustomerPasswordReset } from '../../services/customerAuthService';
import { SeoHead } from '../../components/common/SeoHead';

export const CustomerResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const oobCode = searchParams.get('oobCode') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setFormError('No password reset code detected. Please request a new recovery link from the Forgot Passphrase page.');
    }
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!oobCode) {
      setFormError('Invalid or missing reset token.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('New passphrase must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passphrases do not match. Please re-enter carefully.');
      return;
    }

    setIsSubmitting(true);
    const res = await confirmCustomerPasswordReset(oobCode, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else if (res.error) {
      setFormError(res.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#0A0A0A] text-[#F5F1E8]">
      <SeoHead
        title="Reset Password | Customer Account | Nelson Shoes"
        noIndex={true}
      />
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#B89B5E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        
        {/* Monogram Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border border-[#B89B5E] mx-auto flex items-center justify-center bg-[#121212] shadow-lg">
            <span className="font-serif text-2xl text-[#B89B5E]">N</span>
          </div>
          <h1 className="font-display tracking-[0.25em] text-xl font-bold text-[#F5F1E8]">
            NELSON ATELIER
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono">
            New Passphrase Configuration
          </p>
        </div>

        {/* Reset Card */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 shadow-2xl space-y-6">
          
          {isSuccess ? (
            <div className="text-center space-y-5 py-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-[#B89B5E]/15 border border-[#B89B5E] text-[#B89B5E] flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-xl text-[#F5F1E8]">Passphrase Updated</h2>
                <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed">
                  Your atelier account has been secured with your new passphrase.
                </p>
              </div>

              <Link
                to="/account/login"
                className="inline-flex items-center justify-center w-full py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-widest uppercase hover:bg-[#D4BD86] transition-colors"
              >
                <span>SIGN IN WITH NEW PASSPHRASE</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-1 text-center">
                <h2 className="font-serif text-xl text-[#F5F1E8]">Set New Passphrase</h2>
                <p className="text-xs text-[#D8CBB8]/60 font-sans">
                  Choose a strong passphrase with at least 6 characters.
                </p>
              </div>

              {formError && (
                <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs text-center rounded leading-relaxed animate-fadeIn flex items-center gap-2 justify-center">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                    New Passphrase
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      disabled={isSubmitting || !oobCode}
                      className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-10 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40 hover:text-[#B89B5E] transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                    Confirm New Passphrase
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      disabled={isSubmitting || !oobCode}
                      className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !oobCode}
                  className="w-full py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-widest uppercase hover:bg-[#D4BD86] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>CONFIGURING PASSPHRASE...</span>
                    </>
                  ) : (
                    <>
                      <span>CONFIRM NEW PASSPHRASE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <span className="text-[10px] uppercase tracking-widest text-[#D8CBB8]/40 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={12} className="text-[#B89B5E]" />
                  <span>Firebase Authentication Cryptographic Reset</span>
                </span>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
