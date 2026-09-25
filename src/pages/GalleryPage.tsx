import React, { useState } from 'react';
import { GALLERY_ITEMS } from '../data/gallery';
import type { GalleryItem } from '../types';
import { LightboxModal } from '../components/common/LightboxModal';
import { SectionHeading } from '../components/common/SectionHeading';
import { Eye } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = [
    { key: 'all', label: 'ALL VISUALS' },
    { key: 'shoes', label: 'SHOES' },
    { key: 'craft', label: 'CRAFT' },
    { key: 'workshop', label: 'WORKSHOP' },
    { key: 'details', label: 'DETAILS' },
    { key: 'lifestyle', label: 'LIFESTYLE' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === selectedCategory);

  const handlePrev = () => {
    if (!activeItem) return;
    const currentIndex = filteredItems.findIndex(i => i.id === activeItem.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
    setActiveItem(filteredItems[prevIndex]);
  };

  const handleNext = () => {
    if (!activeItem) return;
    const currentIndex = filteredItems.findIndex(i => i.id === activeItem.id);
    const nextIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
    setActiveItem(filteredItems[nextIndex]);
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-16">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
            VISUAL EXHIBITION
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-[#F5F1E8] leading-tight">
            ATELIER GALLERY
          </h1>
          <p className="text-xs md:text-sm text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
            An archival retrospective of finished commissions, cordwaining tools, workbench details, and leather patinas from the Nelson workshop.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex border-b border-[#D8CBB8]/15 gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-medium transition-colors border-b-2 whitespace-nowrap ${
                selectedCategory === cat.key
                  ? 'border-[#B89B5E] text-[#B89B5E] bg-[#141414]'
                  : 'border-transparent text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry / Editorial Visual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group cursor-pointer bg-[#121212] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/50 overflow-hidden relative transition-all"
            >
              <div className="aspect-[4/5] overflow-hidden bg-[#161616]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <span className="text-[9px] uppercase tracking-widest text-[#B89B5E] block">
                  {item.categoryLabel}
                </span>
                <h3 className="font-serif text-lg text-[#F5F1E8]">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[#D8CBB8]/80 font-sans line-clamp-1 mt-1">
                  {item.caption}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[10px] text-[#B89B5E] uppercase tracking-widest">
                  <Eye className="w-3.5 h-3.5" />
                  <span>VIEW ENLARGED ARCHIVE</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        item={activeItem}
        onClose={() => setActiveItem(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
};
