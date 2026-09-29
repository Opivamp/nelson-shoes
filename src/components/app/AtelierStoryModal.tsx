import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AtelierStory } from '../../data/stories';

interface AtelierStoryModalProps {
  story: AtelierStory | null;
  onClose: () => void;
  onNextStory?: () => void;
  onPrevStory?: () => void;
}

export const AtelierStoryModal: React.FC<AtelierStoryModalProps> = ({
  story,
  onClose,
  onNextStory,
  onPrevStory
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setCurrentSlideIndex(0);
    setProgress(0);
  }, [story]);

  useEffect(() => {
    if (!story) return;

    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Next slide or next story
          if (currentSlideIndex < story.slides.length - 1) {
            setCurrentSlideIndex((curr) => curr + 1);
            return 0;
          } else {
            if (onNextStory) {
              onNextStory();
            } else {
              onClose();
            }
            return 0;
          }
        }
        return prev + 2; // ~5 seconds per slide
      });
    }, 100);

    return () => clearInterval(interval);
  }, [story, currentSlideIndex, isPaused, onNextStory, onClose]);

  if (!story) return null;

  const currentSlide = story.slides[currentSlideIndex] || story.slides[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((curr) => curr - 1);
      setProgress(0);
    } else if (onPrevStory) {
      onPrevStory();
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlideIndex < story.slides.length - 1) {
      setCurrentSlideIndex((curr) => curr + 1);
      setProgress(0);
    } else if (onNextStory) {
      onNextStory();
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="relative w-full h-full sm:h-[85vh] sm:max-w-md sm:rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[#B89B5E]/30 flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Story Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {story.slides.map((slide, idx) => (
            <div key={slide.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#B89B5E] transition-all duration-100 rounded-full"
                style={{
                  width: idx < currentSlideIndex 
                    ? '100%' 
                    : idx === currentSlideIndex 
                      ? `${progress}%` 
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header (Author, Avatar, Close) */}
        <div className="absolute top-6 left-4 right-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#B89B5E] to-[#D4BD86]">
              <img 
                src={story.avatar} 
                alt={story.title}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block leading-tight">
                {story.author}
              </span>
              <span className="text-[10px] text-[#B89B5E] font-mono block">
                {story.title} • {currentSlide.tag}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/90 transition-colors"
            aria-label="Close story"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Story Image */}
        <div className="relative flex-1 bg-black">
          <img 
            src={currentSlide.image} 
            alt={currentSlide.headline}
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/20 to-black/60 pointer-events-none" />

          {/* Invisible Left/Right Click Nav Zones */}
          <div 
            className="absolute inset-y-0 left-0 w-1/3 cursor-pointer z-10"
            onClick={handlePrev}
          />
          <div 
            className="absolute inset-y-0 right-0 w-1/3 cursor-pointer z-10"
            onClick={handleNext}
          />

          {/* Navigation Arrows for Desktop */}
          <button 
            onClick={handlePrev}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 items-center justify-center text-white/80 hover:text-white hover:bg-black/90"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={handleNext}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 items-center justify-center text-white/80 hover:text-white hover:bg-black/90"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Story Caption & Action Footer */}
        <div className="p-5 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent space-y-3 z-30">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B89B5E] font-mono font-semibold flex items-center gap-1.5">
            <Sparkles size={12} />
            <span>{currentSlide.tag}</span>
          </span>

          <h3 className="font-serif text-xl sm:text-2xl text-[#F5F1E8] font-light leading-snug">
            {currentSlide.headline}
          </h3>

          <p className="text-xs text-[#D8CBB8]/80 font-sans leading-relaxed line-clamp-3">
            {currentSlide.description}
          </p>

          {currentSlide.ctaText && currentSlide.ctaLink && (
            <Link
              to={currentSlide.ctaLink}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-wider uppercase hover:bg-[#D4BD86] transition-colors rounded shadow-lg mt-2"
            >
              <span>{currentSlide.ctaText}</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
