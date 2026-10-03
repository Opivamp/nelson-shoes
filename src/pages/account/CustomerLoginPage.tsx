import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export const CustomerLoginPage: React.FC = () => {
  const { signIn, authError, clearError } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setFormError('Please provide both your registered email address and passphrase.');
      return;
    }

    setIsSubmitting(true);
    const res = await signIn(cleanEmail, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
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
          <div className="w-12 h-12 border border-[#B89B5E] mx-auto flex items-center justify-center bg-[#121212] shadow-lg">
            <span className="font-serif text-2xl text-[#B89B5E]">N</span>
          </div>
          <h1 className="font-display tracking-[0.25em] text-xl font-bold text-[#F5F1E8]">
            NELSON ATELIER
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono">
            Customer Sign In
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="font-serif text-xl text-[#F5F1E8]">Welcome Back</h2>
            <p className="text-xs text-[#D8CBB8]/60 font-sans">
              Sign in to view your bespoke orders, lasting progress, and saved silhouettes.
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@domain.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 font-mono">
                  Passphrase
                </label>
                <Link
                  to="/account/forgot-password"
                  className="text-[11px] text-[#B89B5E] hover:underline"
                >
                  Forgot Passphrase?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-widest uppercase hover:bg-[#D4BD86] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SIGNING IN...</span>
                </>
              ) : (
                <>
                  <span>ENTER CUSTOMER PORTAL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Join Atelier Callout */}
          <div className="pt-4 border-t border-[#D8CBB8]/10 text-center space-y-2">
            <span className="text-xs text-[#D8CBB8]/60 block font-sans">
              Don't have an atelier account yet?
            </span>
            <Link
              to="/account/register"
              className="inline-flex items-center gap-1.5 text-xs text-[#B89B5E] hover:text-[#D4BD86] font-medium tracking-wide uppercase transition-colors"
            >
              <Sparkles size={13} />
              <span>Create Customer Account</span>
            </Link>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[10px] uppercase tracking-widest text-[#D8CBB8]/40 flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} className="text-[#B89B5E]" />
              <span>Encrypted Atelier Connection</span>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
