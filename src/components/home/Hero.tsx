import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  tagline: string;
  pieceNumber: string;
  shoeName: string;
  leatherType: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'oxford',
    image: '/images/hero-bespoke-oxford.jpg',
    title: 'CRAFTED',
    subtitle: 'BEYOND',
    tagline: 'ORDINARY.',
    pieceNumber: 'ATELIER PIECE NO. 01',
    shoeName: 'THE SOVEREIGN WHOLECUT',
    leatherType: 'French Boxcalf • Hand-Burnished Glacage'
  },
  {
    id: 'monkstrap',
    image: '/images/product-monkstrap-espresso.jpg',
    title: 'COMMANDING',
    subtitle: 'SARTORIAL',
    tagline: 'ELEGANCE.',
    pieceNumber: 'ATELIER PIECE NO. 02',
    shoeName: 'THE ESPRESSO MONKSTRAP',
    leatherType: 'Full-Grain Calfskin • Solid Brass Buckles'
  },
  {
    id: 'chelsea',
    image: '/images/product-chelsea-boot.jpg',
    title: 'ARCHITECTURAL',
    subtitle: 'MODERN',
    tagline: 'MAJESTY.',
    pieceNumber: 'ATELIER PIECE NO. 03',
    shoeName: 'THE NOCTURNE CHELSEA',
    leatherType: 'Hand-Molded Italian Calf • Goodyear Welt'
  },
  {
    id: 'loafer',
    image: '/images/product-tassel-loafer.jpg',
    title: 'CONTEMPLATIVE',
    subtitle: 'TIMELESS',
    tagline: 'REFINEMENT.',
    pieceNumber: 'ATELIER PIECE NO. 04',
    shoeName: 'THE VENETIAN LOAFER',
    leatherType: 'Supple Antique Patina • Braided Tassels'
  },
  {
    id: 'masterpiece',
    image: '/images/anatomy-05-masterpiece.jpg',
    title: 'PURE',
    subtitle: 'BESPOKE',
    tagline: 'PERFECTION.',
    pieceNumber: 'ATELIER PIECE NO. 05',
    shoeName: 'THE BESPOKE SILHOUETTE',
    leatherType: '85 Hours of Cordwaining • Fiddleback Waist'
  }
];

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slides smoothly every 6.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 6500);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleNextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const handlePrevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16 bg-[#0A0A0A]">
      
      {/* ========================================================
          FULL-SCREEN BACKGROUND SLIDES WITH KEN-BURNS ANIMATION
          Light overlay so images show very brightly and clearly
      ======================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_SLIDES.map((s, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={s.image}
                alt={s.shoeName}
                className={`w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.02] transform transition-transform duration-[7000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* LIGHT, DELICATE LUXURY OVERLAY
            Allows the shoe photograph and leather texture to shine brightly,
            while ensuring typography remains effortless to read */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/70 via-[#0A0A0A]/25 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/35 z-10 pointer-events-none" />
      </div>

      {/* ========================================================
          CONTENT CONTAINER
      ======================================================== */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-10 w-full flex flex-col justify-between py-12">
        
        <div className="max-w-2xl space-y-6 md:space-y-8 text-left">
          
          {/* Top Monogram Label */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 border border-[#B89B5E]/40 bg-[#0A0A0A]/60 backdrop-blur-md shadow-lg">
            <span className="w-1.5 h-1.5 bg-[#B89B5E] rounded-full animate-pulse"></span>
            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-medium text-[#B89B5E]">
              NIGERIAN BESPOKE CORDWAINING
            </span>
          </div>

          {/* Monumental Editorial Headline with Smooth Keyframe Transition */}
          <h1 
            key={slide.id + '-title'}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#F5F1E8] leading-[0.98] tracking-tight animate-fadeIn"
          >
            {slide.title}<br />
            <span className="italic font-normal text-[#B89B5E]">{slide.subtitle}</span><br />
            {slide.tagline}
          </h1>

          {/* Supporting Copy */}
          <p className="font-sans text-sm md:text-base text-[#F5F1E8]/90 max-w-lg leading-relaxed font-light drop-shadow-sm">
            Bespoke footwear meticulously shaped by hand, defined by precision. For those who understand that true luxury lives in the details.
          </p>

          {/* Active Shoe Signature Pill */}
          <div 
            key={slide.id + '-spec'}
            className="inline-flex items-center gap-3 px-3 py-1.5 bg-[#0A0A0A]/70 border border-[#D8CBB8]/20 backdrop-blur-md text-xs font-mono tracking-wider animate-fadeIn"
          >
            <span className="text-[#B89B5E]">{slide.pieceNumber}</span>
            <span className="text-[#D8CBB8]/40">•</span>
            <span className="text-[#F5F1E8]">{slide.shoeName}</span>
            <span className="text-[#D8CBB8]/40 hidden sm:inline">•</span>
            <span className="text-[#D8CBB8]/80 text-[11px] hidden sm:inline">{slide.leatherType}</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              to="/collection"
              className="px-8 py-4 bg-[#B89B5E] hover:bg-[#D4BD86] text-[#0A0A0A] text-xs font-semibold tracking-[0.22em] uppercase transition-all duration-300 text-center flex items-center justify-center gap-2 group shadow-2xl"
            >
              <span>EXPLORE THE COLLECTION</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/bespoke"
              className="px-8 py-4 bg-[#141414]/80 hover:bg-[#1C1C1C] border border-[#D8CBB8]/30 hover:border-[#B89B5E] text-[#F5F1E8] text-xs font-medium tracking-[0.22em] uppercase transition-all duration-300 text-center backdrop-blur-md shadow-lg"
            >
              START YOUR BESPOKE JOURNEY
            </Link>
          </div>

        </div>

        {/* Bottom Bar: Slide Navigation & Scroll Indicator */}
        <div className="pt-16 lg:pt-24 flex items-end justify-between border-t border-[#D8CBB8]/15 text-[#D8CBB8]/70 text-[11px] font-sans tracking-widest uppercase">
          
          {/* Slide Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    i === currentSlide 
                      ? 'w-8 bg-[#B89B5E]' 
                      : 'w-2 bg-[#D8CBB8]/30 hover:bg-[#D8CBB8]/60'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={handlePrevSlide}
                className="w-7 h-7 rounded-full border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-[#D8CBB8] hover:text-[#B89B5E] flex items-center justify-center transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextSlide}
                className="w-7 h-7 rounded-full border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-[#D8CBB8] hover:text-[#B89B5E] flex items-center justify-center transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scroll Down Hint */}
          <a 
            href="#statement"
            className="flex items-center gap-2 text-[#D8CBB8] hover:text-[#B89B5E] transition-colors"
          >
            <span>DISCOVER THE CRAFT</span>
            <span className="animate-bounce">↓</span>
          </a>

        </div>

      </div>

    </section>
  );
};
