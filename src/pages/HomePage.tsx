import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowUpRight, 
  MessageCircle, 
  Check, 
  ChevronRight, 
  Compass, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Scissors
} from 'lucide-react';
import { TESTIMONIALS } from '../data/testimonials';
import { BRAND_CONFIG, getWhatsAppUrl, formatCurrencyNGN } from '../data/config';
import { SectionHeading } from '../components/common/SectionHeading';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { Hero } from '../components/home/Hero';
import { useProducts } from '../context/ProductContext';
import type { Product } from '../types';

export const HomePage: React.FC = () => {
  const { products, getFeaturedProducts } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const featured = getFeaturedProducts();
  const heroProduct = products[0] || featured[0];
  const sideProducts = products.slice(1, 3);
  const statementProduct = products[2] || products[0];

  const makingStages = [
    {
      num: "01",
      title: "SELECTION",
      desc: "Only the top 2% of full-grain hides are selected under raking atelier light. Zero blemishes, maximum structural density.",
      image: "/images/hero-bespoke-oxford.jpg"
    },
    {
      num: "02",
      title: "CLICKING & CUTTING",
      desc: "Pattern pieces are aligned against the natural stretch line of the hide and hand-sliced with razor-sharp English clicking knives.",
      image: "/images/craft-artisan-hands.jpg"
    },
    {
      num: "03",
      title: "STITCHING & CLOSING",
      desc: "Upper segments are skived to feather-thin tolerances, folded, and stitched with waxed thread for invisible, durable seams.",
      image: "/images/craft-workshop-lasts.jpg"
    },
    {
      num: "04",
      title: "LASTING & SHAPING",
      desc: "Leather is wet-molded over hand-carved wooden lasts, tensioned by hand with lasting pliers to capture the precise anatomy of the foot.",
      image: "/images/product-chelsea-boot.jpg"
    },
    {
      num: "05",
      title: "HAND-WELTING",
      desc: "The insole rib, upper, and leather welt are united by hand using curved awls and twin-bristle waxed linen thread.",
      image: "/images/craft-artisan-hands.jpg"
    },
    {
      num: "06",
      title: "PATINA & GLACAGE",
      desc: "Dyes and natural beeswax are applied layer-by-layer, resulting in a deep translucent mirror finish that reflects candlelight.",
      image: "/images/product-monkstrap-espresso.jpg"
    }
  ];

  const bespokeJourney = [
    { step: "01", title: "CONSULTATION", desc: "Digital or atelier dialogue discussing your style, wardrobe, and intentions." },
    { step: "02", title: "DESIGN", desc: "Selection of silhouette, leather tannery, patina colorway, and sole architecture." },
    { step: "03", title: "MEASUREMENTS", desc: "Comprehensive anatomical foot mapping and instep analysis." },
    { step: "04", title: "CRAFT", desc: "Hand-lasting, welt stitching, and heel breast carving in our Lagos workshop." },
    { step: "05", title: "FITTING", desc: "Evaluation of fit and comfort, ensuring zero friction points." },
    { step: "06", title: "DELIVERY", desc: "Presented in bespoke cedar shoe trees, dust bags, and global courier dispatch." }
  ];

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen">
      
      {/* ========================================================
          SECTION 01 — CINEMATIC ANIMATED HERO
          Full-screen smooth animated carousel with light, vibrant overlay
      ======================================================== */}
      <Hero />


      {/* ========================================================
          SECTION 02 — BRAND STATEMENT
          Minimal editorial section with massive whitespace & typography
      ======================================================== */}
      <section id="statement" className="py-24 md:py-36 px-6 md:px-10 border-b border-[#D8CBB8]/10 relative">
        <div className="max-w-5xl mx-auto text-center space-y-8 md:space-y-12">
          
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
            THE PHILOSOPHY
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-[#F5F1E8] leading-[1.18] tracking-tight">
            "THE DIFFERENCE<br />
            <span className="italic font-normal text-[#D8CBB8]">IS IN THE DETAIL."</span>
          </h2>

          <p className="font-sans text-sm md:text-base text-[#D8CBB8]/75 max-w-2xl mx-auto leading-relaxed font-light">
            In an era of mass consumption and rushed assembly, Nelson Atelier stands as a bastion of contemplative shoemaking. Every hide is inspected by hand. Every bevelled waist is carved with patience. Every pair is made with the unyielding conviction that exceptional footwear transforms not merely a silhouette, but the demeanor of the man who wears it.
          </p>

          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[#B89B5E] font-serif italic">
            <span>Hand-Welted Inseam</span>
            <span>—</span>
            <span>French Box Calf</span>
            <span>—</span>
            <span>Anatomical Lasts</span>
          </div>

        </div>
      </section>


      {/* ========================================================
          SECTION 03 — FEATURED COLLECTION
          Asymmetric editorial layout: large feature on left, stacked right
      ======================================================== */}
      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-[#D8CBB8]/10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#B89B5E] font-medium">
                THE SIGNATURE SILHOUETTES
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#F5F1E8]">
                SIGNATURE CREATIONS
              </h2>
            </div>

            <Link
              to="/collection"
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#B89B5E] hover:text-[#F5F1E8] transition-colors"
            >
              <span>VIEW FULL COLLECTION ({products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Asymmetric Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Large Dominant Feature */}
            <div className="lg:col-span-7">
              <ProductCard 
                product={heroProduct} 
                priority={true}
                onQuickView={setQuickViewProduct}
              />
            </div>

            {/* Right Stacked Pair */}
            <div className="lg:col-span-5 flex flex-col space-y-10">
              {sideProducts.map((product) => (
                <ProductCard 
                  key={product.id}
                  product={product} 
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>

          </div>

          {/* Bottom Callout Banner */}
          <div className="p-8 md:p-12 bg-[#121212] border border-[#D8CBB8]/15 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-serif text-2xl text-[#F5F1E8]">
                Seek a bespoke silhouette not shown here?
              </h3>
              <p className="text-xs text-[#D8CBB8]/70 font-sans max-w-lg">
                Our atelier welcomes custom designs, unique patina colorways, and personalized anatomical lasts for private clients.
              </p>
            </div>

            <Link
              to="/bespoke"
              className="px-6 py-3 border border-[#B89B5E] text-[#B89B5E] hover:bg-[#B89B5E] hover:text-[#0A0A0A] text-xs tracking-[0.2em] uppercase font-semibold transition-colors shrink-0"
            >
              COMMISSION BESPOKE
            </Link>
          </div>

        </div>
      </section>


      {/* ========================================================
          SECTION 04 — THE NELSON DIFFERENCE
          Split image + text section with numbered list 01-05
      ======================================================== */}
      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-[#D8CBB8]/10 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with Subtle Frame */}
          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/5] overflow-hidden bg-[#161616] border border-[#D8CBB8]/15 relative">
              <img
                src="/images/craft-artisan-hands.jpg"
                alt="Master shoemaker hand-stitching Goodyear welt in Lagos atelier"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-6 left-6 bg-[#0A0A0A]/90 backdrop-blur-md p-4 border border-[#B89B5E]/30 max-w-xs">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#B89B5E] block font-medium">
                  ATELIER STANDARDS
                </span>
                <p className="font-serif text-sm text-[#F5F1E8] mt-1">
                  Over 120 individual steps completed strictly by hand before a pair earns the Nelson seal.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Headings & Numbered List */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#B89B5E] font-medium">
                THE PRINCIPLES
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#F5F1E8] leading-tight">
                MADE BY HAND.<br />
                <span className="italic font-normal text-[#D8CBB8]">MADE WITH INTENT.</span>
              </h2>
              <p className="text-xs md:text-sm text-[#D8CBB8]/70 font-sans leading-relaxed font-light">
                True shoemaking is an architectural discipline. We do not take shortcuts. Every pair is systematically developed through five non-negotiable milestones:
              </p>
            </div>

            {/* Numbered List 01 to 05 */}
            <div className="space-y-4 pt-2">
              {[
                { num: "01", title: "DESIGN", text: "Proportion, balance, and aesthetic restraint mapped to the wearer's anatomy." },
                { num: "02", title: "MATERIAL", text: "French box calfskin, Tuscan vegetal-tanned sole bends, and buttery glove linings." },
                { num: "03", title: "CONSTRUCTION", text: "Hand-welted Goodyear and Blake-Rapid techniques for decades of resoleability." },
                { num: "04", title: "FINISHING", text: "Hand-set brass nails, bevelled waists, and multiple layers of mirror wax glacage." },
                { num: "05", title: "INSPECTION", text: "Tension, symmetry, and stitch regularity evaluated by master shoemakers." }
              ].map((item, idx) => (
                <div 
                  key={item.num}
                  className="p-4 bg-[#141414] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/50 transition-colors flex items-start gap-4 group"
                >
                  <span className="font-serif text-xl text-[#B89B5E] group-hover:scale-105 transition-transform">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="text-xs tracking-[0.2em] uppercase font-semibold text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#D8CBB8]/70 font-sans mt-1">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================
          SECTION 05 — CRAFTSMANSHIP (HORIZONTAL PROCESS)
          Cinematic storytelling section through stages of making
      ======================================================== */}
      <section className="py-24 md:py-36 px-6 md:px-10 border-b border-[#D8CBB8]/10 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <SectionHeading
              category="THE METHODOLOGY"
              title="THE ART OF MAKING"
              subtitle="Step behind the workbench. Explore the meticulous choreography of classical shoemaking performed at our Lagos atelier."
              align="left"
            />

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#D8CBB8]/50 uppercase tracking-widest font-sans">
                STAGE {activeStep + 1} OF {makingStages.length}
              </span>
            </div>
          </div>

          {/* Interactive Stage Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-[#D8CBB8]/15">
            {makingStages.map((stage, idx) => (
              <button
                key={stage.num}
                onClick={() => setActiveStep(idx)}
                className={`px-4 py-2.5 text-xs tracking-[0.2em] uppercase whitespace-nowrap transition-all border-b-2 font-medium ${
                  activeStep === idx
                    ? 'border-[#B89B5E] text-[#B89B5E] bg-[#141414]'
                    : 'border-transparent text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
                }`}
              >
                {stage.num} — {stage.title}
              </button>
            ))}
          </div>

          {/* Active Stage Hero Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#121212] border border-[#D8CBB8]/15 p-6 md:p-10">
            <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-[#181818] border border-[#D8CBB8]/10">
              <img
                src={makingStages[activeStep].image}
                alt={makingStages[activeStep].title}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
              />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <span className="font-serif text-4xl text-[#B89B5E]">
                {makingStages[activeStep].num}
              </span>
              <h3 className="font-serif text-3xl md:text-4xl text-[#F5F1E8]">
                {makingStages[activeStep].title}
              </h3>
              <p className="text-sm text-[#D8CBB8]/80 font-sans leading-relaxed font-light">
                {makingStages[activeStep].desc}
              </p>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : makingStages.length - 1))}
                  className="px-4 py-2 border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-xs uppercase tracking-widest text-[#D8CBB8]"
                >
                  PREV
                </button>
                <button
                  onClick={() => setActiveStep((prev) => (prev < makingStages.length - 1 ? prev + 1 : 0))}
                  className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] text-xs uppercase tracking-widest font-semibold hover:bg-[#D4BD86]"
                >
                  NEXT STAGE →
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================
          SECTION 06 — BESPOKE EXPERIENCE
          "YOUR SHOE. YOUR STORY." Visual journey
      ======================================================== */}
      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-[#D8CBB8]/10 bg-[#0B0B0B]">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#B89B5E] font-medium">
              THE BESPOKE PATHWAY
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-[#F5F1E8]">
              YOUR SHOE.<br />
              <span className="italic font-normal text-[#D8CBB8]">YOUR STORY.</span>
            </h2>
            <p className="text-xs md:text-sm text-[#D8CBB8]/70 font-sans leading-relaxed font-light">
              From silhouette to leather, colour to finishing, every detail can be considered around the individual wearer.
            </p>
          </div>

          {/* Visual Step-by-Step Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bespokeJourney.map((item) => (
              <div
                key={item.step}
                className="p-6 md:p-8 bg-[#121212] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/50 transition-all duration-300 space-y-3 group"
              >
                <span className="font-serif text-3xl text-[#B89B5E] group-hover:scale-110 transition-transform inline-block">
                  {item.step}
                </span>
                <h3 className="text-xs tracking-[0.22em] uppercase font-semibold text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Central Call to Action */}
          <div className="text-center pt-4">
            <Link
              to="/bespoke"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.22em] uppercase hover:bg-[#D4BD86] transition-all shadow-xl"
            >
              <span>START A BESPOKE REQUEST</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>


      {/* ========================================================
          SECTION 07 — STATEMENT PRODUCT
          Full-width shoe showcase that visually dominates the screen
      ======================================================== */}
      <section className="relative py-28 md:py-44 px-6 md:px-10 border-b border-[#D8CBB8]/10 overflow-hidden flex items-center justify-center">
        
        {/* Statement Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/craft-workshop-lasts.jpg"
            alt="Nelson Shoes Workshop Statement"
            className="w-full h-full object-cover object-center filter brightness-[0.4] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-[#0A0A0A]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="text-[11px] tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
            THE ARCHITECTURAL BENCHMARK
          </span>

          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-[#F5F1E8] leading-tight">
            THE SIGNATURE
          </h2>

          <p className="font-display tracking-[0.3em] text-xs sm:text-sm text-[#D8CBB8] uppercase">
            HANDCRAFTED IN NIGERIA
          </p>

          <p className="font-sans text-xs sm:text-sm text-[#D8CBB8]/75 max-w-lg mx-auto leading-relaxed font-light">
            An uncompromising celebration of West African artisanal mastery, built on lasts sculpted for anatomical perfection.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/product/${heroProduct.slug}`}
              className="px-8 py-3.5 bg-[#B89B5E] text-[#0A0A0A] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4BD86] transition-colors"
            >
              DISCOVER THE PIECE
            </Link>

            <a
              href={getWhatsAppUrl("Hello Nelson Atelier, I am enquiring about The Signature Oxford.")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-[#121212]/90 border border-[#D8CBB8]/30 hover:border-[#B89B5E] text-[#F5F1E8] text-xs tracking-[0.2em] uppercase transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#B89B5E]" />
              <span>WHATSAPP ATELIER</span>
            </a>
          </div>
        </div>

      </section>


      {/* ========================================================
          SECTION 08 — BRAND STORY
          "FROM CRAFT TO CULTURE."
      ======================================================== */}
      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-[#D8CBB8]/10 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#B89B5E] font-medium">
              THE HERITAGE & ORIGIN
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#F5F1E8] leading-tight">
              FROM CRAFT<br />
              <span className="italic font-normal text-[#D8CBB8]">TO CULTURE.</span>
            </h2>

            <div className="space-y-4 text-xs md:text-sm text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
              <p>
                Nelson Shoes emerged from a singular conviction: that African artisanal shoemaking belongs on the same global stage as the most storied heritage cordwainers of Europe.
              </p>
              <p>
                Founded and directed by Nelson in Lagos, Nigeria, the atelier bridges ancestral hand-techniques with contemporary sartorial silhouettes. We do not mass-produce; we build individual pieces of wearable art for clients who value patience, individuality, and honest material authenticity.
              </p>
              <p>
                Every pair that leaves our workshop carries the cadence of Nigerian dedication—sculpted by hand, burnished with natural oils, and engineered to walk with authority.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#B89B5E] hover:text-[#F5F1E8] font-medium transition-colors"
              >
                <span>DISCOVER OUR STORY</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] bg-[#141414] border border-[#D8CBB8]/15 overflow-hidden">
              <img
                src="/images/craft-workshop-lasts.jpg"
                alt="Nelson shoemaking atelier in Lagos"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[11px] text-[#D8CBB8] font-sans tracking-widest uppercase">
                <span>LAGOS, NIGERIA</span>
                <span className="text-[#B89B5E]">PRIVATE ATELIER</span>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================
          SECTION 09 — SOCIAL PROOF
          Elegant testimonial section with clearly marked placeholders
      ======================================================== */}
      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-[#D8CBB8]/10 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <SectionHeading
            category="CLIENT DISCOURSE"
            title="VOICES OF CONNOISSEURS"
            subtitle="Thoughts from patrons who wear Nelson creations to boardroom negotiations, state functions, and intimate salons."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {TESTIMONIALS.map((t) => (
              <div 
                key={t.id}
                className="p-6 md:p-8 bg-[#121212] border border-[#D8CBB8]/10 flex flex-col justify-between space-y-6 relative group hover:border-[#B89B5E]/40 transition-colors"
              >
                <div className="space-y-4">
                  <span className="font-serif text-5xl text-[#B89B5E]/30 leading-none block -mb-4">
                    “
                  </span>
                  <p className="font-serif italic text-base md:text-lg text-[#F5F1E8] leading-relaxed">
                    {t.quote}
                  </p>
                </div>

                <div className="border-t border-[#D8CBB8]/10 pt-4 space-y-1">
                  <h4 className="text-xs font-semibold text-[#F5F1E8] font-sans tracking-wider">
                    {t.author}
                  </h4>
                  <p className="text-[11px] text-[#D8CBB8]/60 font-sans">
                    {t.titleOrLocation}
                  </p>
                  <p className="text-[10px] text-[#B89B5E] font-sans italic pt-0.5">
                    Commissioned: {t.shoeCommissioned}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ========================================================
          SECTION 10 — SOCIAL / TIKTOK
          "FOLLOW THE CRAFT." Link to @_n_elson
      ======================================================== */}
      <section className="py-24 md:py-32 px-6 md:px-10 border-b border-[#D8CBB8]/10 bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#B89B5E] font-medium">
                DIGITAL ATELIER ARCHIVE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#F5F1E8]">
                FOLLOW THE CRAFT.
              </h2>
              <p className="text-xs md:text-sm text-[#D8CBB8]/70 font-sans max-w-xl">
                See the process unfold in real-time. Discover new creations, witness leather finishing, and follow Nelson's cordwaining journey.
              </p>
            </div>

            <a
              href={BRAND_CONFIG.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#161616] border border-[#B89B5E]/50 hover:border-[#B89B5E] hover:bg-[#B89B5E] hover:text-[#0A0A0A] text-xs uppercase tracking-[0.2em] font-semibold text-[#F5F1E8] transition-all"
            >
              <span>FOLLOW @_N_ELSON ON TIKTOK</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Social Showcase Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                img: "/images/hero-bespoke-oxford.jpg",
                title: "Burnished Wholecut Reveal",
                handle: "@_n_elson"
              },
              {
                img: "/images/craft-artisan-hands.jpg",
                title: "Hand-Welt Inseam Sewing",
                handle: "@_n_elson"
              },
              {
                img: "/images/product-tassel-loafer.jpg",
                title: "Hand-Braided Apron Loafers",
                handle: "@_n_elson"
              },
              {
                img: "/images/product-bespoke-sandal.jpg",
                title: "Vegetal-Tanned Sandal Crafting",
                handle: "@_n_elson"
              }
            ].map((card, idx) => (
              <a
                key={idx}
                href={BRAND_CONFIG.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[3/4] bg-[#141414] overflow-hidden border border-[#D8CBB8]/10 hover:border-[#B89B5E]/60 transition-all"
              >
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/95 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="text-[9px] uppercase tracking-widest text-[#B89B5E] block font-medium">
                    TIKTOK DISPATCH
                  </span>
                  <p className="font-serif text-sm text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors">
                    {card.title}
                  </p>
                  <span className="text-[10px] text-[#D8CBB8]/60 font-sans block mt-0.5">
                    {card.handle}
                  </span>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>


      {/* ========================================================
          SECTION 11 — FINAL CTA
          Dramatic dark section: "READY FOR SOMETHING DISTINCTIVE?"
      ======================================================== */}
      <section className="py-28 md:py-40 px-6 md:px-10 bg-[#070707] relative overflow-hidden">
        
        {/* Subtle decorative background lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B89B5E] to-transparent"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          
          <div className="w-12 h-12 border border-[#B89B5E]/40 mx-auto flex items-center justify-center">
            <span className="font-serif text-2xl font-light text-[#B89B5E]">N</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-[#F5F1E8] tracking-tight leading-tight">
            READY FOR<br />
            <span className="italic font-normal text-[#B89B5E]">SOMETHING DISTINCTIVE?</span>
          </h2>

          <p className="font-sans text-sm md:text-base text-[#D8CBB8]/75 max-w-lg mx-auto leading-relaxed font-light">
            Begin a conversation about your next pair of bespoke shoes. Discuss your measurements, select rare hides, and commission an heirloom built exclusively for you.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/bespoke"
              className="w-full sm:w-auto px-8 py-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.22em] uppercase hover:bg-[#D4BD86] transition-all shadow-xl"
            >
              START BESPOKE REQUEST
            </Link>

            <a
              href={getWhatsAppUrl("Hello Nelson, I am ready to begin a bespoke shoe commission.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#141414] border border-[#B89B5E]/40 hover:border-[#B89B5E] text-[#F5F1E8] text-xs font-medium tracking-[0.22em] uppercase transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#B89B5E]" />
              <span>WHATSAPP NELSON</span>
            </a>
          </div>

          <p className="text-[11px] text-[#D8CBB8]/50 uppercase tracking-widest font-sans pt-4">
            Private Consultations in Lagos • Worldwide Bespoke Express Courier
          </p>

        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
