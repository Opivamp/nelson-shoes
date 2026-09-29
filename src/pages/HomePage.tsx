import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowUpRight, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  Scissors,
  Layers,
  Film,
  Hammer,
  Crown,
  Quote,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { TESTIMONIALS } from '../data/testimonials';
import { BRAND_CONFIG, getWhatsAppUrl, formatCurrencyNGN } from '../data/config';
import { SectionHeading } from '../components/common/SectionHeading';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { Hero } from '../components/home/Hero';
import { useProducts } from '../context/ProductContext';
import type { Product } from '../types';
import { AtelierStoryBar } from '../components/app/AtelierStoryBar';
import { AtelierComposer } from '../components/app/AtelierComposer';
import { AtelierFeedCard } from '../components/app/AtelierFeedCard';

export const HomePage: React.FC = () => {
  const { products, getFeaturedProducts } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [feedTab, setFeedTab] = useState<'feed' | 'cinema' | 'craft' | 'bespoke' | 'reviews'>('feed');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const featured = getFeaturedProducts();
  const heroProduct = products[0] || featured[0];

  const categories = ['All', 'Oxfords', 'Monkstraps', 'Boots', 'Loafers'];

  const filteredProducts = categoryFilter === 'All' 
    ? products 
    : products.filter(p => p.category.toLowerCase().includes(categoryFilter.toLowerCase().slice(0, 4)));

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
          1. TOP APP STORY HIGHLIGHTS BAR
          Social App / PWA Highlights Carousel (Lagos Atelier Stories)
      ======================================================== */}
      <AtelierStoryBar />

      {/* ========================================================
          2. APPLICATION WORKSPACE FEED CONTAINER
          Centered responsive app feed column matching modern web apps
      ======================================================== */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-5">
        
        {/* Atelier Commission Composer Bar ("What's on your mind?") */}
        <AtelierComposer />

        {/* App Feed Segmented Navigation Tabs */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl p-1.5 flex items-center justify-between overflow-x-auto no-scrollbar gap-1">
          
          <button
            onClick={() => setFeedTab('feed')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              feedTab === 'feed'
                ? 'bg-[#B89B5E] text-[#0A0A0A] shadow-md font-semibold'
                : 'text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:bg-[#1A1A1A]'
            }`}
          >
            <Sparkles size={13} />
            <span>Atelier Feed</span>
          </button>

          <button
            onClick={() => setFeedTab('cinema')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              feedTab === 'cinema'
                ? 'bg-[#B89B5E] text-[#0A0A0A] shadow-md font-semibold'
                : 'text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:bg-[#1A1A1A]'
            }`}
          >
            <Film size={13} />
            <span>Cinematic View</span>
          </button>

          <button
            onClick={() => setFeedTab('craft')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              feedTab === 'craft'
                ? 'bg-[#B89B5E] text-[#0A0A0A] shadow-md font-semibold'
                : 'text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:bg-[#1A1A1A]'
            }`}
          >
            <Hammer size={13} />
            <span>Bench Craft</span>
          </button>

          <button
            onClick={() => setFeedTab('bespoke')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              feedTab === 'bespoke'
                ? 'bg-[#B89B5E] text-[#0A0A0A] shadow-md font-semibold'
                : 'text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:bg-[#1A1A1A]'
            }`}
          >
            <Crown size={13} />
            <span>Bespoke Lasts</span>
          </button>

          <button
            onClick={() => setFeedTab('reviews')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              feedTab === 'reviews'
                ? 'bg-[#B89B5E] text-[#0A0A0A] shadow-md font-semibold'
                : 'text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:bg-[#1A1A1A]'
            }`}
          >
            <Quote size={13} />
            <span>Patron Dossiers</span>
          </button>

        </div>

        {/* ========================================================
            VIEW MODE A: ATELIER FEED (Active Social / App Stream)
        ======================================================== */}
        {feedTab === 'feed' && (
          <div className="space-y-4">
            
            {/* Live Atelier Bench Ticker */}
            <div className="bg-[#121212] border border-[#B89B5E]/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[#D8CBB8]/90 truncate">
                  <strong className="text-[#B89B5E] font-semibold">Live Atelier:</strong> Currently hand-lasting Sovereign Wholecuts in French Box Calf.
                </span>
              </div>
              <Link 
                to="/craft" 
                className="text-[11px] text-[#B89B5E] hover:underline shrink-0 hidden sm:inline"
              >
                Inspect Craft →
              </Link>
            </div>

            {/* Silhouette Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-mono text-[#D8CBB8]/50 flex items-center gap-1 pl-1 shrink-0">
                <Filter size={11} />
                <span>Filter:</span>
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-[#B89B5E]/20 border border-[#B89B5E] text-[#B89B5E] font-semibold'
                      : 'bg-[#141414] border border-[#D8CBB8]/15 text-[#D8CBB8]/70 hover:text-[#F5F1E8] hover:border-[#D8CBB8]/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <span className="text-[10px] font-mono text-[#D8CBB8]/40 ml-auto shrink-0 pr-1">
                {filteredProducts.length} Creations
              </span>
            </div>

            {/* Stream of Atelier Feed Cards */}
            <div className="space-y-5">
              {filteredProducts.map((product, idx) => (
                <AtelierFeedCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                  hoursSpent={85 + (idx % 3) * 15}
                  timeAgo={idx === 0 ? "Freshly burnished today" : idx === 1 ? "Finished yesterday at Bench #2" : "Available from Private Reserve"}
                />
              ))}
            </div>

          </div>
        )}

        {/* ========================================================
            VIEW MODE B: CINEMATIC SHOWCASE (Hero + Editorial)
        ======================================================== */}
        {feedTab === 'cinema' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Embedded Hero Component */}
            <div className="rounded-2xl overflow-hidden border border-[#D8CBB8]/15 shadow-2xl">
              <Hero />
            </div>

            {/* Editorial Philosophy Statement Card */}
            <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-2xl p-6 md:p-10 space-y-6 text-center">
              <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
                THE PHILOSOPHY
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-light text-[#F5F1E8] leading-tight">
                "THE DIFFERENCE<br />
                <span className="italic font-normal text-[#D8CBB8]">IS IN THE DETAIL."</span>
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#D8CBB8]/75 max-w-xl mx-auto leading-relaxed font-light">
                In an era of mass consumption and rushed assembly, Nelson Atelier stands as a bastion of contemplative shoemaking. Every hide is inspected by hand. Every bevelled waist is carved with patience.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-[#B89B5E] font-serif italic">
                <span>Hand-Welted Inseam</span>
                <span>—</span>
                <span>French Box Calf</span>
                <span>—</span>
                <span>Anatomical Lasts</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE C: BENCH CRAFT (6 Stages Interactive)
        ======================================================== */}
        {feedTab === 'craft' && (
          <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-2xl p-4 sm:p-6 space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8CBB8]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B89B5E]">
                  Cordwaining Choreography
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#F5F1E8]">
                  The Art of Making
                </h3>
              </div>
              <span className="text-xs font-mono text-[#D8CBB8]/60">
                Stage {activeStep + 1} of {makingStages.length}
              </span>
            </div>

            {/* Interactive Stage Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {makingStages.map((stage, idx) => (
                <button
                  key={stage.num}
                  onClick={() => setActiveStep(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeStep === idx
                      ? 'bg-[#B89B5E] text-[#0A0A0A] font-bold'
                      : 'bg-[#181818] text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
                  }`}
                >
                  {stage.num}. {stage.title}
                </button>
              ))}
            </div>

            {/* Active Stage Display */}
            <div className="space-y-4">
              <div className="aspect-[16/10] overflow-hidden rounded-xl border border-[#D8CBB8]/15 bg-black relative">
                <img
                  src={makingStages[activeStep].image}
                  alt={makingStages[activeStep].title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#B89B5E]/40 font-mono text-xs text-[#B89B5E]">
                  Stage {makingStages[activeStep].num}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-serif text-2xl text-[#F5F1E8]">
                  {makingStages[activeStep].title}
                </h4>
                <p className="text-xs sm:text-sm text-[#D8CBB8]/80 font-sans leading-relaxed">
                  {makingStages[activeStep].desc}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : makingStages.length - 1))}
                  className="px-4 py-2 border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-xs font-mono uppercase tracking-wider text-[#D8CBB8] rounded-lg"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setActiveStep((prev) => (prev < makingStages.length - 1 ? prev + 1 : 0))}
                  className="px-4 py-2 bg-[#B89B5E] text-[#0A0A0A] text-xs font-mono uppercase tracking-wider font-semibold hover:bg-[#D4BD86] rounded-lg"
                >
                  Next Stage →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE D: BESPOKE STUDIO (Personalized Pathway)
        ======================================================== */}
        {feedTab === 'bespoke' && (
          <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-2xl p-4 sm:p-6 space-y-6 animate-fadeIn">
            <div className="text-center space-y-2 border-b border-[#D8CBB8]/10 pb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B89B5E]">
                The Bespoke Pathway
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#F5F1E8]">
                Your Shoe. Your Story.
              </h3>
              <p className="text-xs text-[#D8CBB8]/70 max-w-md mx-auto">
                Comprehensive anatomical foot mapping and instep analysis tailored to the individual patron.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bespokeJourney.map((item) => (
                <div
                  key={item.step}
                  className="p-4 bg-[#181818] border border-[#D8CBB8]/10 rounded-xl space-y-2 hover:border-[#B89B5E]/40 transition-colors"
                >
                  <span className="font-serif text-xl text-[#B89B5E]">
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

            <div className="pt-2 text-center">
              <Link
                to="/bespoke"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#B89B5E] text-[#0A0A0A] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-[#D4BD86] transition-all shadow-xl"
              >
                <span>Initiate Bespoke Commission</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW MODE E: PATRON REVIEWS (Dossiers)
        ======================================================== */}
        {feedTab === 'reviews' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#B89B5E]">Patron Testimonials</span>
                <h3 className="font-serif text-lg text-[#F5F1E8]">Verified Client Chronicles</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>100% Authentic Bespoke</span>
              </span>
            </div>

            <div className="space-y-3">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="p-4 bg-[#121212] border border-[#D8CBB8]/10 rounded-xl space-y-3"
                >
                  <div className="flex text-[#B89B5E] text-xs">
                    {'★'.repeat(5)}
                  </div>
                  <p className="font-serif text-sm text-[#F5F1E8] italic leading-relaxed">
                    "{t.quote}"
                  </p>
                  <div className="border-t border-[#D8CBB8]/10 pt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-sans font-medium text-[#F5F1E8] block">{t.author}</span>
                      <span className="text-[10px] text-[#D8CBB8]/60 font-mono">{t.titleOrLocation}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#B89B5E] bg-[#B89B5E]/10 px-2 py-0.5 rounded">
                      {t.shoeCommissioned}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            3. DIGITAL ATELIER TIKTOK FEED (App Reel Cards)
        ======================================================== */}
        <div className="bg-[#121212] border border-[#D8CBB8]/15 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <h3 className="font-serif text-base text-[#F5F1E8]">
                Atelier Dispatches (@_n_elson)
              </h3>
            </div>
            <a
              href={BRAND_CONFIG.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#B89B5E] hover:underline flex items-center gap-1"
            >
              <span>Watch Reels</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                className="group relative aspect-[3/4] bg-black rounded-lg overflow-hidden border border-[#D8CBB8]/10 hover:border-[#B89B5E] transition-all"
              >
                <img
                  src={reel.img}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[11px] font-mono text-[#F5F1E8] truncate font-medium">
                    {reel.title}
                  </p>
                  <span className="text-[9px] font-mono text-[#B89B5E]">
                    Watch Video →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ========================================================
            4. FINAL CONCIERGE BANNER
        ======================================================== */}
        <div className="bg-gradient-to-r from-[#181818] via-[#1F1B14] to-[#181818] border border-[#B89B5E]/30 rounded-2xl p-6 text-center space-y-4">
          <div className="w-10 h-10 rounded-full border border-[#B89B5E]/50 mx-auto flex items-center justify-center font-serif text-lg text-[#B89B5E]">
            N
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#F5F1E8]">
            Desire a Unique Bespoke Last?
          </h3>
          <p className="text-xs text-[#D8CBB8]/75 max-w-md mx-auto leading-relaxed">
            Begin a private consultation with our Master Cordwainer. Discuss measurements, rare hides, and anatomical lasts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Link
              to="/bespoke"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-mono text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-all shadow-md"
            >
              Start Bespoke Request
            </Link>
            <a
              href={getWhatsAppUrl("Hello Nelson Atelier, I would like to consult on a custom bespoke shoe order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#141414] border border-[#B89B5E]/40 text-[#F5F1E8] font-mono text-xs uppercase tracking-wider rounded-lg hover:border-[#B89B5E] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span>WhatsApp Atelier</span>
            </a>
          </div>
        </div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
