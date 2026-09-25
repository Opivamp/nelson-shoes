import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scissors, Sparkles, ShieldCheck, Compass, Hammer } from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { getWhatsAppUrl } from '../data/config';

export const CraftPage: React.FC = () => {
  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-28">
        
        {/* ========================================================
            EDITORIAL HERO: THE CRAFT
        ======================================================== */}
        <div className="space-y-6 max-w-3xl">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
            ATELIER ANATOMY & CORDWAINING
          </span>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-[#F5F1E8] leading-tight">
            THE ARCHITECTURE<br />
            <span className="italic font-normal text-[#B89B5E]">OF PERFECTION.</span>
          </h1>

          <p className="text-sm md:text-base text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
            In an age of automated factory conveyor belts, Nelson Shoes defends the human hand. True bespoke shoemaking is not an assembly process; it is a patient dialogue between wood, leather, linen thread, and muscle memory.
          </p>
        </div>

        {/* ========================================================
            CHAPTER 01: SELECTED BY HAND
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center border-t border-[#D8CBB8]/15 pt-16">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B89B5E] font-medium">
              CHAPTER 01
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#F5F1E8] leading-tight">
              SELECTED BY HAND.
            </h2>
            <div className="space-y-4 text-xs md:text-sm text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
              <p>
                Flawless shoes begin in the selection room. We examine hides under angled morning natural light. An animal that lived naturally bears scars, insect marks, and variable grain tension across its hide.
              </p>
              <p>
                Our master clicker identifies the tightest, densest grain section along the backbone for the shoe's vamp and toe box, leaving softer flank leather strictly for non-structural interior linings.
              </p>
            </div>
            <div className="p-4 bg-[#121212] border-l-2 border-[#B89B5E] text-xs text-[#D8CBB8]/80 italic font-serif">
              "If the hide does not want to become a shoe, forcing it will only reveal weakness years later. We only cut leather that yields with grace."
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] bg-[#141414] border border-[#D8CBB8]/15 overflow-hidden">
              <img
                src="/images/hero-bespoke-oxford.jpg"
                alt="Flawless leather grain inspection"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            CHAPTER 02: SHAPED BY EXPERIENCE
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center border-t border-[#D8CBB8]/15 pt-16">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="aspect-[4/3] bg-[#141414] border border-[#D8CBB8]/15 overflow-hidden">
              <img
                src="/images/craft-artisan-hands.jpg"
                alt="Artisan hands stitching Goodyear welt"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B89B5E] font-medium">
              CHAPTER 02
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#F5F1E8] leading-tight">
              SHAPED BY EXPERIENCE.
            </h2>
            <div className="space-y-4 text-xs md:text-sm text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
              <p>
                Shoemaking lasts are anatomical sculptures in wood. Every millimeter represents instep volume, arch height, and heel lock.
              </p>
              <p>
                Once lasted, our shoes are welted by hand. Using a curved diamond-point awl, the cordwainer pierces through the leather insole rib, the upper leather, and the welt strip simultaneously. Twin needles carrying heavy Irish linen thread saturated in shoemaker's pitch form an interlocking knot inside every single stitch.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#B89B5E] font-sans tracking-widest uppercase">
              <span>Waxed Linen Thread</span>
              <span>•</span>
              <span>Curved Awl</span>
              <span>•</span>
              <span>100% Hand-Welted</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            CHAPTER 03: FINISHED WITH PRECISION
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center border-t border-[#D8CBB8]/15 pt-16">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B89B5E] font-medium">
              CHAPTER 03
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#F5F1E8] leading-tight">
              FINISHED WITH PRECISION.
            </h2>
            <div className="space-y-4 text-xs md:text-sm text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
              <p>
                The bottoming of a Nelson shoe is a study in sculptural restraint. We bevel the waist with Japanese miniature block planes, carving the outsole inward until it sits flush against the upper like the waistline of a tailored tuxedo.
              </p>
              <p>
                The finishing culminates in our meditative glacage. Soft cotton cloth, cold distilled water, and pure beeswax paste are massaged in thousands of tiny circles across the toe cap until microscopic pores fill and the leather mirror reflects light.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/bespoke"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B89B5E] hover:text-[#F5F1E8] font-semibold"
              >
                <span>EXPERIENCE THE BESPOKE PROCESS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] bg-[#141414] border border-[#D8CBB8]/15 overflow-hidden">
              <img
                src="/images/product-monkstrap-espresso.jpg"
                alt="Mirror shine toe glacage finish"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            THE ANATOMICAL BREAKDOWN
        ======================================================== */}
        <div className="border-t border-[#D8CBB8]/15 pt-20 space-y-12">
          <SectionHeading
            category="THE BLUEPRINT"
            title="INSIDE A NELSON CREATION"
            subtitle="Understand every hidden component that grants our footwear decades of resilience."
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: Scissors,
                title: "GOODYEAR WELT",
                desc: "Allows the shoe to be completely resoled by any master cobbler around the world indefinitely without damaging the upper."
              },
              {
                icon: Compass,
                title: "CORK FILLER",
                desc: "Natural granulized cork creates an ergonomic cushion that gradually molds to your individual foot footprint."
              },
              {
                icon: Hammer,
                title: "BEVELLED WAIST",
                desc: "The sole waist is shaved paper-thin and hand-pegged with brass nails, elevating your arch and creating dramatic silhouette lines."
              },
              {
                icon: ShieldCheck,
                title: "OAK-BARK SOLE",
                desc: "Tanned slowly for twelve months in oak-bark pits for unmatched density, water resistance, and ground dampening."
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-6 bg-[#121212] border border-[#D8CBB8]/10 space-y-3">
                  <Icon className="w-5 h-5 text-[#B89B5E]" />
                  <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F1E8]">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
