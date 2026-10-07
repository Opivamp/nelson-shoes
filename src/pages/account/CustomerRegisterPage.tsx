import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon,
  Mail, 
  Phone, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { SeoHead } from '../../components/common/SeoHead';

export const CustomerRegisterPage: React.FC = () => {
  const { signUp, authError, clearError } = useCustomerAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phoneWhatsApp.trim();

    if (!cleanName || !cleanEmail || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Passphrase must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passphrases do not match. Please re-enter carefully.');
      return;
    }

    setIsSubmitting(true);
    const res = await signUp({
      fullName: cleanName,
      email: cleanEmail,
      phoneWhatsApp: cleanPhone,
      password
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else if (res.error) {
      setFormError(res.error);
    }
  };

  const displayedError = formError || authError;

  if (isSuccess) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-[#0A0A0A] text-[#F5F1E8]">
        <div className="w-full max-w-md bg-[#121212] border border-[#B89B5E]/30 p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-[#B89B5E]/15 border border-[#B89B5E] text-[#B89B5E] flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-[#F5F1E8]">Welcome to the Atelier</h2>
            <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed">
              Your customer account has been created. A verification dispatch has been sent to{' '}
              <span className="font-mono text-[#B89B5E]">{email}</span>.
            </p>
          </div>

          <div className="p-3 bg-[#181818] border border-[#D8CBB8]/15 rounded text-[11px] text-[#D8CBB8]/60 text-left font-mono space-y-1">
            <div className="text-[#B89B5E] font-semibold">CUSTOMER ACCOUNT ACTIVE:</div>
            <div>• Name: {fullName}</div>
            <div>• Identifier: {email}</div>
          </div>

          <button
            onClick={() => navigate('/account', { replace: true })}
            className="w-full py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-widest uppercase hover:bg-[#D4BD86] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>GO TO CUSTOMER DASHBOARD</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#0A0A0A] text-[#F5F1E8]">
      <SeoHead
        title="Create Account | Customer Registration | Nelson Shoes"
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
            New Customer Registration
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="font-serif text-xl text-[#F5F1E8]">Create Customer Account</h2>
            <p className="text-xs text-[#D8CBB8]/60 font-sans">
              Register to track custom commissions, save your anatomical preferences, and expedite future commissions.
            </p>
          </div>

          {displayedError && (
            <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs text-center rounded leading-relaxed animate-fadeIn space-y-2">
              <p>{displayedError}</p>
              {displayedError.includes('Firebase Console') && (
                <a
                  href="https://console.firebase.google.com/project/nelson-shoes-62767/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 px-3 py-1.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-[11px] uppercase tracking-wider rounded hover:bg-[#D4BD86] transition-colors"
                >
                  Open Firebase Console → Enable Email/Password
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Adebayo Adeleke"
                  autoComplete="name"
                  disabled={isSubmitting}
                  className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                Email Address *
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
              <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                Phone / WhatsApp (For Concierge Fitting)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                <input
                  type="tel"
                  value={phoneWhatsApp}
                  onChange={(e) => setPhoneWhatsApp(e.target.value)}
                  placeholder="+234 803 000 0000"
                  autoComplete="tel"
                  disabled={isSubmitting}
                  className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-9 pr-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                Passphrase (Min. 6 Characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
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

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
                Confirm Passphrase *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
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
                  <span>CREATING CUSTOMER ACCOUNT...</span>
                </>
              ) : (
                <>
                  <span>CREATE CUSTOMER ACCOUNT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Already have account */}
          <div className="pt-4 border-t border-[#D8CBB8]/10 text-center space-y-2">
            <span className="text-xs text-[#D8CBB8]/60 block font-sans">
              Already have an atelier account?
            </span>
            <Link
              to="/account/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#B89B5E] hover:text-[#D4BD86] font-medium tracking-wide uppercase transition-colors"
            >
              <span>Sign In to Existing Account</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[10px] uppercase tracking-widest text-[#D8CBB8]/40 flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} className="text-[#B89B5E]" />
              <span>Identity Secured via Firebase Authentication</span>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
