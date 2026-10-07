import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowUpRight, 
  MessageCircle, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';
import { TESTIMONIALS } from '../data/testimonials';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/config';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { useProducts } from '../context/ProductContext';
import type { Product } from '../types';
import { CreativeAppSlider } from '../components/app/CreativeAppSlider';
import { AtelierComposer } from '../components/app/AtelierComposer';
import { AtelierFeedCard } from '../components/app/AtelierFeedCard';
import { SeoHead } from '../components/common/SeoHead';

export const HomePage: React.FC = () => {
  const { products, getFeaturedProducts } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Oxfords', 'Monkstraps', 'Boots', 'Loafers'];

  const filteredProducts = categoryFilter === 'All' 
    ? products 
    : products.filter(p => p.category.toLowerCase().includes(categoryFilter.toLowerCase().slice(0, 4)));

  const handleQuickViewBySlug = (slug: string) => {
    const product = products.find(p => p.slug === slug);
    if (product) {
      setQuickViewProduct(product);
    }
  };

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
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen w-full min-w-0">
      <SeoHead
        title="Nelson Shoes | Luxury Bespoke Nigerian Footwear | Crafted Beyond Ordinary"
        description="Nelson Shoes is a premier bespoke footwear house handcrafted in Lagos, Nigeria. Meticulously shaped by hand, defined by precision, and sculpted for discerning gentlemen and connoisseurs."
        canonicalPath="/"
        ogImage="/images/hero-bespoke-oxford.jpg"
      />
      <h1 className="sr-only">Nelson Shoes — Luxury Bespoke Nigerian Footwear Atelier</h1>
      
      {/* ========================================================
          APPLICATION MAIN STREAM CONTAINER
          Responsive container tailored for web application layout
      ======================================================== */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-5 space-y-4 sm:space-y-6 w-full min-w-0 overflow-x-hidden">
        
        {/* ========================================================
            1. CREATIVE AUTOMATIC ATELIER SLIDER
            Auto-advancing masterpiece showcase with progress bar & direct CTAs
        ======================================================== */}
        <section aria-label="Signature Footwear Showcase" className="w-full min-w-0">
          <CreativeAppSlider 
            onQuickView={handleQuickViewBySlug} 
            products={products}
          />
        </section>

        {/* ========================================================
            2. ATELIER QUICK UTILITY / COMMISSION BAR
            High utility: Custom Last, Foot Anatomy Scan, Live Cordwainer, Track Order
        ======================================================== */}
        <section aria-label="Atelier Commission Services" className="w-full min-w-0">
          <AtelierComposer />
        </section>

        {/* ========================================================
            3. LIVE ATELIER BENCH STATUS TICKER
            Useful status info indicating active cordwaining in Lagos
        ======================================================== */}
        <div className="bg-[#121212] border border-[#B89B5E]/25 rounded-xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5 text-xs font-mono shadow-md w-full min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[#D8CBB8]/90 truncate min-w-0 block text-[11px] sm:text-xs">
              <strong className="text-[#B89B5E] font-semibold">Active Bench:</strong> Nelson Lagos Atelier currently lasting Batch #14 in French Box Calf.
            </span>
          </div>
          <Link 
            to="/craft" 
            className="text-[11px] text-[#B89B5E] hover:underline shrink-0 hidden sm:inline whitespace-nowrap"
          >
            Inspect Technique →
          </Link>
        </div>

        {/* ========================================================
            4. CURATED ATELIER CREATIONS FEED
            Filter pills + high-utility interactive product cards
        ======================================================== */}
        <section aria-label="Bespoke Footwear Collection" className="space-y-4 w-full min-w-0">
          
          {/* Header & Silhouette Filter Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#111111] p-2.5 sm:p-3 rounded-xl border border-[#D8CBB8]/15 w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 shrink-0">
              <Sparkles size={14} className="text-[#B89B5E] shrink-0" />
              <h2 className="font-serif text-sm sm:text-base md:text-lg text-[#F5F1E8] whitespace-nowrap">
                Atelier Creations
              </h2>
              <span className="text-[10px] font-mono text-[#B89B5E] bg-[#B89B5E]/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                {filteredProducts.length} Silhouettes
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold shadow-md'
                      : 'bg-[#181818] border border-[#D8CBB8]/15 text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:border-[#D8CBB8]/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Stream */}
          <div className="space-y-4 w-full min-w-0">
            {filteredProducts.map((product, idx) => (
              <AtelierFeedCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
                hoursSpent={85 + (idx % 3) * 15}
                timeAgo={idx === 0 ? "Freshly glazed today" : idx === 1 ? "Completed at Bench #2" : "Available in Private Reserve"}
              />
            ))}
          </div>

        </section>

        {/* ========================================================
            5. THE ART OF MAKING (INTERACTIVE 6-STAGE SCRUBBER)
            Educational, high-value visualizer of the cordwaining process
        ======================================================== */}
        <section aria-label="Cordwaining Craftsmanship" className="bg-[#121212] border border-[#D8CBB8]/15 rounded-2xl p-3.5 sm:p-6 space-y-4 sm:space-y-5 w-full min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#D8CBB8]/10 pb-3 sm:pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B89B5E] block">
                Atelier Choreography
              </span>
              <h3 className="font-serif text-lg sm:text-2xl text-[#F5F1E8]">
                The Art of Making
              </h3>
            </div>
            <span className="text-xs font-mono text-[#D8CBB8]/60">
              Stage {activeStep + 1} of {makingStages.length}
            </span>
          </div>

          {/* Step Selector Buttons */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full">
            {makingStages.map((stage, idx) => (
              <button
                key={stage.num}
                onClick={() => setActiveStep(idx)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  activeStep === idx
                    ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold shadow-md'
                    : 'bg-[#181818] border border-[#D8CBB8]/15 text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
                }`}
              >
                {stage.num}. {stage.title}
              </button>
            ))}
          </div>

          {/* Active Stage Card */}
          <div className="space-y-3 sm:space-y-4 w-full min-w-0">
            <div className="aspect-[16/10] overflow-hidden rounded-xl border border-[#D8CBB8]/15 bg-black relative">
              <img
                src={makingStages[activeStep].image}
                alt={makingStages[activeStep].title}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-black/80 backdrop-blur-md px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#B89B5E]/40 font-mono text-[11px] sm:text-xs text-[#B89B5E]">
                Stage {makingStages[activeStep].num}
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <h4 className="font-serif text-lg sm:text-2xl text-[#F5F1E8]">
                {makingStages[activeStep].title}
              </h4>
              <p className="text-xs sm:text-sm text-[#D8CBB8]/80 font-sans leading-relaxed">
                {makingStages[activeStep].desc}
              </p>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : makingStages.length - 1))}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-xs font-mono uppercase tracking-wider text-[#D8CBB8] rounded-lg transition-colors cursor-pointer"
              >
                ← Prev
              </button>
              <button
                onClick={() => setActiveStep((prev) => (prev < makingStages.length - 1 ? prev + 1 : 0))}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#B89B5E] text-[#0A0A0A] text-xs font-mono uppercase tracking-wider font-semibold hover:bg-[#D4BD86] rounded-lg transition-colors cursor-pointer"
              >
                Next Stage →
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. BESPOKE PATHWAY
            The 6-step journey from consultation to delivery
        ======================================================== */}
        <section aria-label="Bespoke Pathway" className="bg-[#121212] border border-[#D8CBB8]/15 rounded-2xl p-3.5 sm:p-6 space-y-4 sm:space-y-5 w-full min-w-0 overflow-hidden">
          <div className="text-center space-y-1 border-b border-[#D8CBB8]/10 pb-3 sm:pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B89B5E]">
              Custom Shoemaking
            </span>
            <h3 className="font-serif text-xl sm:text-3xl text-[#F5F1E8]">
              Your Shoe. Your Story.
            </h3>
            <p className="text-xs text-[#D8CBB8]/70 max-w-md mx-auto">
              Every curve of the insole and bevel of the waist sculpted exclusively for the individual wearer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 w-full min-w-0">
            {bespokeJourney.map((item) => (
              <div
                key={item.step}
                className="p-3 sm:p-3.5 bg-[#181818] border border-[#D8CBB8]/10 rounded-xl space-y-1 hover:border-[#B89B5E]/40 transition-colors"
              >
                <span className="font-serif text-base sm:text-lg text-[#B89B5E] font-medium">
                  {item.step}
                </span>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#F5F1E8] font-semibold">
                  {item.title}
                </h4>
                <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-1 text-center">
            <Link
              to="/bespoke"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#B89B5E] text-[#0A0A0A] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-[#D4BD86] transition-all shadow-xl"
            >
              <span>Initiate Bespoke Commission</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ========================================================
            7. VERIFIED CLIENT DOSSIERS & TESTIMONIALS
        ======================================================== */}
        <section aria-label="Client Testimonials" className="space-y-3 w-full min-w-0">
          <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl p-3 sm:p-3.5 flex items-center justify-between w-full min-w-0">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#B89B5E]">Client Testimonials</span>
              <h3 className="font-serif text-sm sm:text-lg text-[#F5F1E8]">Verified Client Chronicles</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 shrink-0">
              <CheckCircle2 size={13} />
              <span className="hidden sm:inline">100% Authentic Bespoke</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full min-w-0">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="p-3.5 sm:p-4 bg-[#121212] border border-[#D8CBB8]/10 rounded-xl space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex text-[#B89B5E] text-xs">
                    {'★'.repeat(5)}
                  </div>
                  <p className="font-serif text-xs sm:text-sm text-[#F5F1E8] italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="border-t border-[#D8CBB8]/10 pt-2 text-xs">
                  <span className="font-sans font-medium text-[#F5F1E8] block">{t.author}</span>
                  <span className="text-[10px] text-[#D8CBB8]/60 font-mono block">{t.titleOrLocation}</span>
                  <span className="text-[10px] font-mono text-[#B89B5E] block mt-1">
                    {t.shoeCommissioned}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            8. DIGITAL ARCHIVE DISPATCHES (@_n_elson)
        ======================================================== */}
        <section aria-label="Digital Atelier Archive" className="bg-[#121212] border border-[#D8CBB8]/15 rounded-2xl p-3.5 sm:p-5 space-y-3.5 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <h3 className="font-serif text-sm sm:text-base text-[#F5F1E8] truncate">
                Atelier Dispatches (@_n_elson)
              </h3>
            </div>
            <a
              href={BRAND_CONFIG.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#B89B5E] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Watch Reels</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full min-w-0">
            {[
              { img: "/images/hero-bespoke-oxford.jpg", title: "Wholecut Glacage" },
              { img: "/images/craft-artisan-hands.jpg", title: "Hand-Welt Stitching" },
              { img: "/images/product-tassel-loafer.jpg", title: "Braided Apron" },
              { img: "/images/product-bespoke-sandal.jpg", title: "Vegetal Sandal" }
            ].map((reel, idx) => (
              <a
                key={idx}
                href={BRAND_CONFIG.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[3/4] bg-black rounded-lg overflow-hidden border border-[#D8CBB8]/10 hover:border-[#B89B5E] transition-all min-w-0"
              >
                <img
                  src={reel.img}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[10px] sm:text-[11px] font-mono text-[#F5F1E8] truncate font-medium">
                    {reel.title}
                  </p>
                  <span className="text-[9px] font-mono text-[#B89B5E]">
                    Watch Reel →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ========================================================
            9. FINAL CONCIERGE BANNER
        ======================================================== */}
        <section aria-label="Bespoke Consultation" className="bg-gradient-to-r from-[#181818] via-[#1F1B14] to-[#181818] border border-[#B89B5E]/30 rounded-2xl p-4 sm:p-6 text-center space-y-3.5 w-full min-w-0 overflow-hidden">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#B89B5E]/50 mx-auto flex items-center justify-center font-serif text-base sm:text-lg text-[#B89B5E]">
            N
          </div>
          <h3 className="font-serif text-lg sm:text-2xl text-[#F5F1E8]">
            Desire an Heirloom Bespoke Last?
          </h3>
          <p className="text-xs text-[#D8CBB8]/75 max-w-md mx-auto leading-relaxed">
            Begin a private consultation with our Master Cordwainer. Discuss measurements, rare hides, and anatomical lasts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Link
              to="/bespoke"
              className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-mono text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-all shadow-md"
            >
              Start Bespoke Request
            </Link>
            <a
              href={getWhatsAppUrl("Hello Nelson Atelier, I would like to consult on a custom bespoke shoe order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 bg-[#141414] border border-[#B89B5E]/40 text-[#F5F1E8] font-mono text-xs uppercase tracking-wider rounded-lg hover:border-[#B89B5E] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} className="text-emerald-400 shrink-0" />
              <span>WhatsApp Atelier</span>
            </a>
          </div>
        </section>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
