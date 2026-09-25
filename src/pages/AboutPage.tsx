import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { BRAND_CONFIG } from '../data/config';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-24">
        
        {/* ========================================================
            HERO: ABOUT NELSON
        ======================================================== */}
        <div className="space-y-6 max-w-3xl">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
            THE ATELIER HOUSE
          </span>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-[#F5F1E8] leading-tight">
            HONORING THE HAND.<br />
            <span className="italic font-normal text-[#B89B5E]">ELEVATING IDENTITY.</span>
          </h1>

          <p className="text-sm md:text-base text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
            Nelson Shoes was established to prove that the highest tier of bespoke cordwaining can emerge from Nigerian hands. We create footwear that carries masculine presence, anatomical comfort, and timeless beauty.
          </p>
        </div>

        {/* ========================================================
            SECTION: THE FOUNDER & ATELIER HEAD
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center border-t border-[#D8CBB8]/15 pt-16">
          
          <div className="lg:col-span-5 relative">
            <div className="aspect-[3/4] bg-[#141414] border border-[#D8CBB8]/20 overflow-hidden relative group">
              <img
                src="/images/craft-workshop-lasts.jpg"
                alt="Nelson, Founder and Master Shoemaker at work in Lagos"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-6 right-6 text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] font-medium block">
                  FOUNDER & MASTER CORDWAINER
                </span>
                <h3 className="font-serif text-2xl text-[#F5F1E8]">
                  NELSON
                </h3>
                <p className="text-xs text-[#D8CBB8]/70 font-sans mt-0.5">
                  Lagos Atelier, Nigeria
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B89B5E] font-medium">
              THE FOUNDER'S JOURNEY
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#F5F1E8] leading-tight">
              A RELENTLESS DEVOTION TO THE BENCH
            </h2>

            <div className="space-y-4 text-xs md:text-sm text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
              <p>
                Known online through his workshop dispatches on TikTok (<strong>{BRAND_CONFIG.social.tiktokHandle}</strong>), Nelson has established himself as one of Nigeria's most focused contemporary shoemakers. Rather than pursuing mass manufacture, he anchored his work at the artisan bench—obsessing over leather thickness, bevelled waistlines, and stitch precision.
              </p>
              <p>
                "A shoe should not just look distinguished in a photo box; it must hold its poise across years of walking on cobblestones, tarmac, and marble floors. When you build with true welted construction, the shoe becomes a companion, not a disposable season item."
              </p>
              <p>
                Every bespoke piece that leaves the atelier is personally examined by Nelson, ensuring that balance, curve, and mirror shine meet our strict criteria.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <a
                href={BRAND_CONFIG.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#141414] border border-[#B89B5E]/50 hover:bg-[#B89B5E] hover:text-[#0A0A0A] text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F1E8] transition-colors"
              >
                FOLLOW NELSON'S PROCESS ON TIKTOK
              </a>
            </div>

          </div>

        </div>

        {/* ========================================================
            FOUR PILLARS: THE PHILOSOPHY, WORKSHOP, VISION, NIGERIAN CRAFTSMANSHIP
        ======================================================== */}
        <div className="border-t border-[#D8CBB8]/15 pt-20 space-y-16">
          <SectionHeading
            category="OUR CONVICTION"
            title="THE FOUNDATIONS OF THE HOUSE"
            subtitle="Four core pillars guide every pattern cut, stitch driven, and commission accepted."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* The Philosophy */}
            <div className="p-8 bg-[#121212] border border-[#D8CBB8]/10 space-y-4 hover:border-[#B89B5E]/40 transition-colors">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#B89B5E] font-semibold">
                01 • THE PHILOSOPHY
              </span>
              <h3 className="font-serif text-2xl text-[#F5F1E8]">
                Quiet Confidence Over Ostentation
              </h3>
              <p className="text-xs text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
                Luxury does not shout with oversized logos or fleeting synthetic gimmicks. True luxury is an immaculate bevelled waistline, the subtle reflection of natural carnauba wax on dark espresso calf, and a shoe that supports the human foot with glove-like fidelity.
              </p>
            </div>

            {/* The Workshop */}
            <div className="p-8 bg-[#121212] border border-[#D8CBB8]/10 space-y-4 hover:border-[#B89B5E]/40 transition-colors">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#B89B5E] font-semibold">
                02 • THE WORKSHOP
              </span>
              <h3 className="font-serif text-2xl text-[#F5F1E8]">
                An Atelier in the Heart of Lagos
              </h3>
              <p className="text-xs text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
                Our workshop is a sanctuary of focus. Shelves of carved wooden lasts, rolls of vegetable-tanned hides from world-renowned tanneries, and brass cobbler tools create an environment where time slows down to allow precision to reign supreme.
              </p>
            </div>

            {/* Nigerian Craftsmanship */}
            <div className="p-8 bg-[#121212] border border-[#D8CBB8]/10 space-y-4 hover:border-[#B89B5E]/40 transition-colors">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#B89B5E] font-semibold">
                03 • NIGERIAN CRAFTSMANSHIP
              </span>
              <h3 className="font-serif text-2xl text-[#F5F1E8]">
                Redefining the African Luxury Narrative
              </h3>
              <p className="text-xs text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
                West Africa possesses rich traditions of leatherworking, dyeing, and architectural form. Nelson Shoes channels this profound heritage into world-class cordwaining that commands respect in London, New York, Milan, and Tokyo.
              </p>
            </div>

            {/* The Vision */}
            <div className="p-8 bg-[#121212] border border-[#D8CBB8]/10 space-y-4 hover:border-[#B89B5E]/40 transition-colors">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#B89B5E] font-semibold">
                04 • THE VISION
              </span>
              <h3 className="font-serif text-2xl text-[#F5F1E8]">
                An Enduring Footwear Dynasty
              </h3>
              <p className="text-xs text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
                We envision a global network of discerning patrons who turn to Nelson Shoes for their most defining life occasions: boardroom milestones, international galas, and treasured wedding celebrations.
              </p>
            </div>

          </div>
        </div>

        {/* ========================================================
            ATELIER CONSULTATION CALLOUT
        ======================================================== */}
        <div className="p-10 md:p-14 bg-[#141414] border border-[#B89B5E]/40 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif text-2xl md:text-3xl text-[#F5F1E8]">
              Experience the Lagos Atelier in Person
            </h3>
            <p className="text-xs text-[#D8CBB8]/70 font-sans max-w-lg">
              Private consultations are available by appointment in Lagos, Nigeria, or via digital video foot mapping for international collectors.
            </p>
          </div>

          <Link
            to="/bespoke"
            className="px-8 py-3.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors shrink-0"
          >
            SCHEDULE CONSULTATION
          </Link>
        </div>

      </div>
    </div>
  );
};
