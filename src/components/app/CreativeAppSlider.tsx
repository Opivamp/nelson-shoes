import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Eye, 
  ShoppingBag, 
  MessageCircle,
  Pause,
  Play,
  ShieldCheck
} from 'lucide-react';
import { formatCurrencyNGN, getWhatsAppUrl } from '../../data/config';
import type { Product } from '../../types';

interface SlideItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  priceNGN: number;
  specs: string;
  slug: string;
  shortName: string;
  badge: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 'slide-01',
    tag: 'ATELIER PIECE NO. 01 • HAND-WELTED',
    title: 'THE SOVEREIGN WHOLECUT',
    subtitle: "Tanneries d'Annonay Box Calf • 7-Stage Mirror Glacage",
    image: '/images/hero-bespoke-oxford.jpg',
    priceNGN: 485000,
    specs: '12 SPI Inseam • Bevelled Fiddleback Waist',
    slug: 'the-sovereign-wholecut-oxford',
    shortName: 'Wholecut',
    badge: 'Flagship'
  },
  {
    id: 'slide-02',
    tag: 'ATELIER PIECE NO. 02 • SARTORIAL GRACE',
    title: 'THE IMPERIAL MONKSTRAP',
    subtitle: 'Deep Espresso Museum Calf • Solid Brass Buckles',
    image: '/images/product-monkstrap-espresso.jpg',
    priceNGN: 465000,
    specs: 'Oak Bark Tanned Soles • Hand-Burnished Patina',
    slug: 'the-imperial-double-monkstrap',
    shortName: 'Monkstrap',
    badge: 'Popular'
  },
  {
    id: 'slide-03',
    tag: 'ATELIER PIECE NO. 03 • MODERN ARCHITECTURE',
    title: 'THE NOCTURNE CHELSEA',
    subtitle: 'Single-Piece Molded Italian Calf • Goodyear Welt',
    image: '/images/product-chelsea-boot.jpg',
    priceNGN: 495000,
    specs: 'Reinforced Elastic Gussets • English Pull Tabs',
    slug: 'the-nocturne-chelsea-boot',
    shortName: 'Chelsea',
    badge: 'Signature'
  },
  {
    id: 'slide-04',
    tag: 'ATELIER PIECE NO. 04 • TIMELESS REFINEMENT',
    title: 'THE VENETIAN LOAFER',
    subtitle: 'Antique Cognac Patina • Hand-Braided Tassels',
    image: '/images/product-tassel-loafer.jpg',
    priceNGN: 420000,
    specs: 'Unlined Glove Vamp • Flexible Leather Insole',
    slug: 'the-eko-tassel-loafer',
    shortName: 'Loafer',
    badge: 'Essential'
  },
  {
    id: 'slide-05',
    tag: 'ATELIER PIECE NO. 05 • INDIVIDUAL COMMISSION',
    title: 'BESPOKE WOODEN LASTS',
    subtitle: '100% Anatomical Foot Sculpting • 85+ Hours Craft',
    image: '/images/anatomy-05-masterpiece.jpg',
    priceNGN: 550000,
    specs: 'Personalized Cedar Trees • Worldwide Courier',
    slug: 'bespoke',
    shortName: 'Bespoke',
    badge: 'Private Order'
  }
];

interface CreativeAppSliderProps {
  onQuickView?: (productSlug: string) => void;
  products?: Product[];
}

export const CreativeAppSlider: React.FC<CreativeAppSliderProps> = ({ onQuickView, products = [] }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 6000; // 6 seconds per slide
  const TICK_INTERVAL = 50;

  // Auto-slide effect with progress tracking
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIdx((c) => (c + 1) % SLIDES.length);
          return 0;
        }
        return prev + (TICK_INTERVAL / SLIDE_DURATION) * 100;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, currentIdx]);

  const handleSelectSlide = (idx: number) => {
    setCurrentIdx(idx);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
  };

  const currentSlide = SLIDES[currentIdx];

  const handleQuickViewClick = () => {
    if (onQuickView) {
      onQuickView(currentSlide.slug);
    }
  };

  const whatsAppInquiryUrl = getWhatsAppUrl(
    `Hello Nelson Atelier,\n\nI am inquiring about the ${currentSlide.title} (${formatCurrencyNGN(currentSlide.priceNGN)}).\nCould you advise on sizing and commission schedule?`
  );

  return (
    <div 
      className="relative rounded-2xl overflow-hidden border border-[#D8CBB8]/20 bg-[#0E0E0E] shadow-2xl group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      
      {/* 1. Background Imagery Layer with Ken-Burns and Crossfade */}
      <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/9] min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] w-full overflow-hidden">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentIdx;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[6500ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0A0A0A]/85 via-[#0A0A0A]/40 to-transparent pointer-events-none" />
        
        {/* Top Status & Controls Bar */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-center justify-between pointer-events-auto">
          
          {/* Atelier Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#B89B5E]/40 text-[10px] sm:text-[11px] font-mono text-[#B89B5E]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">{currentSlide.badge}</span>
            <span className="text-[#D8CBB8]/40">•</span>
            <span className="text-[#D8CBB8]/80">{currentIdx + 1} / {SLIDES.length}</span>
          </div>

          {/* Pause / Play Indicator */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#D8CBB8]/20 text-[#D8CBB8]/70 hover:text-[#B89B5E] transition-colors"
            title={isPaused ? "Play Slider" : "Pause Slider"}
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>

        {/* Arrow Navigation (Previous / Next) */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md border border-[#D8CBB8]/20 text-[#F5F1E8] hover:text-[#B89B5E] hover:border-[#B89B5E] flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md border border-[#D8CBB8]/20 text-[#F5F1E8] hover:text-[#B89B5E] hover:border-[#B89B5E] flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>

        {/* 2. Main Slide Information & Interactive CTAs */}
        <div className="absolute bottom-16 sm:bottom-20 left-4 sm:left-6 md:left-8 right-4 sm:right-6 md:right-8 z-20 pointer-events-auto">
          
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            
            {/* Tagline */}
            <div className="inline-block">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#B89B5E] font-medium block">
                {currentSlide.tag}
              </span>
            </div>

            {/* Monumental Headline */}
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-light text-[#F5F1E8] leading-tight tracking-tight drop-shadow-md">
              {currentSlide.title}
            </h2>

            {/* Subtitle / Leather details */}
            <p className="font-sans text-xs sm:text-sm text-[#D8CBB8]/90 max-w-xl leading-relaxed drop-shadow-sm font-light">
              {currentSlide.subtitle}
            </p>

            {/* Price & Specs Floating Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
              <span className="font-mono text-sm sm:text-base font-semibold text-[#B89B5E] bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-[#B89B5E]/30">
                {formatCurrencyNGN(currentSlide.priceNGN)}
              </span>

              <span className="font-mono text-[10px] sm:text-xs text-[#D8CBB8]/80 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D8CBB8]/15 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-[#B89B5E]" />
                <span>{currentSlide.specs}</span>
              </span>
            </div>

            {/* Interactive CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              
              {/* Primary Commission CTA */}
              <Link
                to={currentSlide.slug === 'bespoke' ? '/bespoke' : `/product/${currentSlide.slug}`}
                className="px-5 sm:px-6 py-2.5 rounded-lg bg-[#B89B5E] hover:bg-[#C9AD70] text-[#0A0A0A] font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(184,155,94,0.4)]"
              >
                <ShoppingBag size={14} />
                <span>Commission Piece</span>
              </Link>

              {/* Inspect Specs (Quick View) */}
              <button
                onClick={handleQuickViewClick}
                className="px-4 py-2.5 rounded-lg bg-black/60 backdrop-blur-md border border-[#D8CBB8]/30 hover:border-[#B89B5E] text-[#F5F1E8] font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye size={13} className="text-[#B89B5E]" />
                <span>Inspect Specs</span>
              </button>

              {/* WhatsApp direct consultation */}
              <a
                href={whatsAppInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/80 text-emerald-300 font-mono text-xs transition-colors flex items-center gap-1.5"
                title="Consult with Master Cordwainer"
              >
                <MessageCircle size={13} />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

            </div>

          </div>

        </div>

        {/* 3. Bottom Slide Selector Pills & Animated Progress Line */}
        <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6 z-20 pointer-events-auto">
          
          {/* Animated Gold Progress Line */}
          <div className="w-full h-1 bg-[#D8CBB8]/15 rounded-full overflow-hidden mb-2.5">
            <div 
              className="h-full bg-gradient-to-r from-[#B89B5E] to-[#E8D49E] transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Silhouette Selector Pills */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {SLIDES.map((slide, idx) => {
              const isSelected = idx === currentIdx;
              return (
                <button
                  key={slide.id}
                  onClick={() => handleSelectSlide(idx)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer truncate ${
                    isSelected
                      ? 'bg-black/80 border border-[#B89B5E] shadow-md'
                      : 'bg-black/40 border border-transparent hover:border-[#D8CBB8]/20 text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
                  }`}
                  aria-label={`Select ${slide.shortName}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-[#B89B5E] font-bold' : 'text-[#D8CBB8]/50'}`}>
                      0{idx + 1}
                    </span>
                    <span className={`text-[11px] font-mono truncate ${isSelected ? 'text-[#F5F1E8] font-semibold' : 'text-[#D8CBB8]/70'}`}>
                      {slide.shortName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
