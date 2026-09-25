import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_CONFIG } from '../data/config';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-10 space-y-12">
        <div className="space-y-4 border-b border-[#D8CBB8]/15 pb-8">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
            ATELIER AGREEMENTS
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#F5F1E8]">
            TERMS & BESPOKE COMMISSION CONDITIONS
          </h1>
          <p className="text-xs text-[#D8CBB8]/70 font-sans">
            Nelson Bespoke Footwear Atelier • Lagos, Nigeria
          </p>
        </div>

        <div className="space-y-8 text-xs md:text-sm text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[#F5F1E8]">1. Nature of Bespoke Commissioning</h2>
            <p>
              Every pair of shoes produced by Nelson Shoes is handcrafted individually by master artisans using organic leathers and traditional cordwaining techniques. Natural slight variations in patina depth, hand-burnishing tones, and leather grain texture are the hallmark of authentic bespoke art and do not constitute flaws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[#F5F1E8]">2. Commission Deposits & Lead Times</h2>
            <p>
              Bespoke commissions require a 50% non-refundable deposit upon finalization of the design dossier, with the remaining 50% due prior to dispatch. Standard lead times range from 3 to 6 weeks depending on hide sourcing and hand-patina curing requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[#F5F1E8]">3. Fittings & Fitting Adjustments</h2>
            <p>
              For clients commissioning custom wooden lasts, a trial fitting or detailed digital fitting evaluation is conducted. In the rare event that minor adjustments are required, our atelier provides complimentary adjustment service within thirty (30) days of delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-[#F5F1E8]">4. Worldwide Courier & Customs</h2>
            <p>
              We provide insured international express courier via DHL Express. International import duties or customs tariffs, where applicable depending on the destination jurisdiction, are the responsibility of the commissioning client.
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
