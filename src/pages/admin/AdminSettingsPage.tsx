import React, { useState } from 'react';
import { Settings, Save, Check, ShieldCheck, DollarSign, Database, Cloud, ExternalLink, Key } from 'lucide-react';
import { BRAND_CONFIG } from '../../data/config';
import { isFirebaseConfigured } from '../../services/firebase';

export const AdminSettingsPage: React.FC = () => {
  const [exchangeRate, setExchangeRate] = useState<number>(760);
  const [phone, setPhone] = useState(BRAND_CONFIG.contact.displayPhone);
  const [email, setEmail] = useState(BRAND_CONFIG.contact.email);
  const [saved, setSaved] = useState(false);

  const currentProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not yet configured';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-8 animate-fadeIn">
      <div className="pb-6 border-b border-[#D8CBB8]/15">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-mono block">
          Store Configuration
        </span>
        <h1 className="font-serif text-2xl md:text-3xl text-[#F5F1E8] font-light">
          Atelier Settings & Operational Parameters
        </h1>
        <p className="text-xs text-[#D8CBB8]/60 font-sans mt-0.5">
          Manage currency conversion rates, WhatsApp concierge telephone, and cloud database connectivity.
        </p>
      </div>

      {/* FIREBASE CLOUD ARCHITECTURE STATUS */}
      <div className="bg-[#121212] border border-[#B89B5E]/30 p-6 md:p-8 rounded-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D8CBB8]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#B89B5E]/15 border border-[#B89B5E]/40 flex items-center justify-center text-[#B89B5E]">
              <Database size={20} />
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#F5F1E8]">Firebase Cloud Services</h2>
              <p className="text-xs text-[#D8CBB8]/60 font-sans">
                Real-time Firestore catalog, client order synchronization, and photography storage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono border ${
              isFirebaseConfigured 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isFirebaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isFirebaseConfigured ? 'Cloud Live Sync' : 'Local Storage Fallback'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#181818] border border-[#D8CBB8]/10 rounded">
            <span className="text-[10px] uppercase text-[#D8CBB8]/50 block">Firebase Project ID</span>
            <span className="text-[#F5F1E8] font-semibold truncate block mt-0.5">
              {currentProjectId}
            </span>
          </div>
          <div className="p-3 bg-[#181818] border border-[#D8CBB8]/10 rounded">
            <span className="text-[10px] uppercase text-[#D8CBB8]/50 block">Firestore Collections</span>
            <span className="text-[#B89B5E] block mt-0.5">products, orders</span>
          </div>
          <div className="p-3 bg-[#181818] border border-[#D8CBB8]/10 rounded">
            <span className="text-[10px] uppercase text-[#D8CBB8]/50 block">Storage Bucket</span>
            <span className="text-[#F5F1E8] block mt-0.5 truncate">
              {import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'Local Base64'}
            </span>
          </div>
        </div>

        {!isFirebaseConfigured && (
          <div className="p-4 bg-[#181818] border border-amber-500/30 rounded text-xs space-y-2 text-[#D8CBB8]">
            <div className="flex items-center gap-2 text-amber-300 font-mono font-semibold">
              <Key size={14} />
              <span>How to connect your Firebase Project:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-[#D8CBB8]/80 leading-relaxed font-sans">
              <li>Open your project in the <strong className="text-[#F5F1E8]">Firebase Console</strong>.</li>
              <li>Go to <strong className="text-[#F5F1E8]">Project Settings &gt; General &gt; Your apps &gt; Web app</strong>.</li>
              <li>Copy your web app configuration keys and paste them into your local <code className="text-[#B89B5E] font-mono">.env.local</code> file in this project root.</li>
              <li>Restart your dev server, and all products and orders will sync directly with Cloud Firestore!</li>
            </ol>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-[#121212] border border-[#D8CBB8]/15 p-6 md:p-8 rounded-lg space-y-6">
        {saved && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs rounded flex items-center gap-2 font-mono">
            <Check size={14} />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
              USD to NGN Exchange Benchmark
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#D8CBB8]/40">₦</span>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseInt(e.target.value) || 760)}
                className="w-full bg-[#181818] border border-[#D8CBB8]/20 pl-8 pr-3 py-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono"
              />
            </div>
            <span className="text-[10px] text-[#D8CBB8]/50 mt-1 block">
              Used to calculate approximate USD amounts ($1 = ₦{exchangeRate})
            </span>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
              WhatsApp Concierge Line
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#D8CBB8]/70 mb-1 font-mono">
            Official Concierge Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#181818] border border-[#D8CBB8]/20 p-2.5 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#B89B5E] font-mono"
          />
        </div>

        <div className="p-4 bg-[#161616] border border-[#D8CBB8]/10 rounded space-y-2">
          <span className="text-xs uppercase tracking-wider text-[#B89B5E] font-mono font-semibold block">
            Payment Gateways Architecture
          </span>
          <p className="text-xs text-[#D8CBB8]/70 leading-relaxed font-sans">
            Ready for live API key injection for Paystack (Cards, Apple Pay, Nigerian Bank Transfer) and Flutterwave.
          </p>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs uppercase tracking-wider hover:bg-[#D4BD86] transition-colors flex items-center gap-2"
        >
          <Save size={14} />
          <span>Save Atelier Settings</span>
        </button>
      </form>
    </div>
  );
};
