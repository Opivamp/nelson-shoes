import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Save
} from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';

export const CustomerProfilePage: React.FC = () => {
  const { customerUser, profile, updateProfile } = useCustomerAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || customerUser?.displayName || '');
      setPhone(profile.phone || '');
    } else if (customerUser) {
      setFullName(customerUser.displayName || '');
    }
  }, [profile, customerUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim()
    });

    setIsUpdating(false);

    if (res.success) {
      setSuccessMsg('Your customer profile has been successfully updated.');
    } else {
      setErrorMsg(res.error || 'Failed to update profile details.');
    }
  };

  const memberSince = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '2026';

  return (
    <CustomerPortalLayout>
      <div className="space-y-8 max-w-2xl">

        {/* Header */}
        <div className="space-y-1">
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89B5E] block">
            PERSONAL DOSSIER
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#F5F1E8]">
            Customer Profile
          </h2>
          <p className="text-xs text-[#D8CBB8]/70 font-sans">
            Manage your personal identity information, concierge contact details, and account credentials.
          </p>
        </div>

        {/* Profile Card & Form */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 p-6 sm:p-8 rounded-xl space-y-6">
          
          {successMsg && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center gap-3 text-xs text-emerald-300 font-mono">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-lg flex items-center gap-3 text-xs text-red-300 font-mono">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                Full Legal Name *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Adekunle Gold"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email (Authentication Identity Field - Read Only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                  Primary Email (Identity ID)
                </label>
                <Link
                  to="/account/security"
                  className="text-[10px] font-mono text-[#B89B5E] hover:underline"
                >
                  Manage in Security
                </Link>
              </div>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/30" />
                <input
                  type="email"
                  disabled
                  value={customerUser?.email || ''}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#161616] border border-[#D8CBB8]/10 text-xs font-mono text-[#D8CBB8]/60 rounded cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-[#D8CBB8]/40 font-mono block">
                Email address is bound to your Firebase Authentication identity.
              </span>
            </div>

            {/* Phone (WhatsApp / Delivery updates) */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-[#D8CBB8]/70 block">
                WhatsApp / Phone Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D8CBB8]/40" />
                <input
                  type="text"
                  placeholder="+234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#181818] border border-[#D8CBB8]/20 focus:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] rounded outline-none transition-colors"
                />
              </div>
              <span className="text-[10px] text-[#D8CBB8]/40 font-mono block">
                Used for urgent artisanal fitting scheduling and DHL courier dispatch notifications.
              </span>
            </div>

            {/* Account Metadata Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#181818] border border-[#D8CBB8]/10 rounded-lg space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#D8CBB8]/40 block">Customer ID</span>
                <span className="font-mono text-xs text-[#B89B5E]">#{customerUser?.uid.slice(0, 10).toUpperCase()}</span>
              </div>
              <div className="p-4 bg-[#181818] border border-[#D8CBB8]/10 rounded-lg space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#D8CBB8]/40 block">Member Since</span>
                <span className="font-mono text-xs text-[#F5F1E8]">{memberSince}</span>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 border-t border-[#D8CBB8]/10 flex items-center justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded hover:bg-[#D4BD86] disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
              >
                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isUpdating ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </CustomerPortalLayout>
  );
};
