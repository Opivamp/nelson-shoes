import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem } from '../../types';

interface LightboxModalProps {
  item: GalleryItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  onClose,
  onPrev,
  onNext,
}) => {
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in text-[#F5F1E8]">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-[#D8CBB8]/70 hover:text-[#B89B5E] transition-colors z-50"
        aria-label="Close image lightbox"
      >
        <X className="w-6 h-6 stroke-[1.5]" />
      </button>

      {/* Prev / Next buttons */}
      {onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-[#D8CBB8]/60 hover:text-[#B89B5E] bg-[#121212]/80 border border-[#D8CBB8]/10 transition-colors z-40 hidden md:block"
          aria-label="Previous artwork"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-[#D8CBB8]/60 hover:text-[#B89B5E] bg-[#121212]/80 border border-[#D8CBB8]/10 transition-colors z-40 hidden md:block"
          aria-label="Next artwork"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Image container */}
      <div className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center">
        <div className="relative border border-[#D8CBB8]/15 bg-[#0E0E0E] overflow-hidden max-h-[70vh] flex items-center justify-center">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-h-[70vh] max-w-full object-contain"
          />
        </div>

        {/* Metadata Caption */}
        <div className="mt-4 text-center space-y-1 max-w-xl">
          <div className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.25em] text-[#B89B5E]">
            <span>{item.categoryLabel}</span>
            <span>•</span>
            <span>ATELIER ARCHIVE {item.year}</span>
          </div>
          <h3 className="font-serif text-lg md:text-xl text-[#F5F1E8]">
            {item.title}
          </h3>
          <p className="text-xs text-[#D8CBB8]/70 font-sans font-light">
            {item.caption}
          </p>
        </div>
      </div>
    </div>
  );
};
