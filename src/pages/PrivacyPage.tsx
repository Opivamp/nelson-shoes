import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../data/config';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-10 space-y-12">
        <div className="space-y-4 border-b border-[#D8CBB8]/15 pb-8">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
            CLIENT CONFIDENTIALITY
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#F5F1E8]">
            PRIVACY & DATA DISCRETION
          </h1>
          <p className="text-xs text-[#D8CBB8]/70 font-sans">
            Last Updated: February 2026 • Nelson Bespoke Atelier
          </p>
        </div>

        <div className="space-y-8 text-xs md:text-sm text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[#F5F1E8]">1. The Principle of Atelier Discretion</h2>
            <p>
              Nelson Shoes adheres to the highest traditions of luxury discretion. We serve corporate leaders, public figures, and discerning private connoisseurs. Any information regarding your foot measurements, custom wooden lasts, commission values, or delivery destinations is treated with strict confidentiality.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[#F5F1E8]">2. Footwear Anatomical Data</h2>
            <p>
              Foot measurement diagrams, girth notes, and 3D digital scans taken during your consultation are stored solely for the purpose of carving and adjusting your personal wooden lasts. We never sell, monetize, or license your biometric or fit data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[#F5F1E8]">3. Direct Communications (WhatsApp & Email)</h2>
            <p>
              Direct communications via WhatsApp or official email are utilized solely for bespoke consultations, progress updates from the workbench, and delivery coordination. You may request deletion of your records at any time by contacting {BRAND_CONFIG.contact.email}.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[#F5F1E8]">4. Courier Logistics</h2>
            <p>
              Delivery details are securely shared with our official international courier partner (DHL Express) solely for insured door-to-door transit and customs clearance.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-[#D8CBB8]/15">
          <Link
            to="/"
            className="text-xs uppercase tracking-widest text-[#B89B5E] hover:underline"
          >
            ← RETURN TO ATELIER HOME
          </Link>
        </div>
      </div>
    </div>
  );
};
