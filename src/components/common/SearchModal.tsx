import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowUpRight, BookOpen } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import { formatCurrencyNGN } from '../../data/config';

export const SearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    closeSearch, 
    searchQuery, 
    setSearchQuery, 
    productResults, 
    articleResults 
  } = useSearch();

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeSearch();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSearchOpen, closeSearch]);

  if (!isSearchOpen) return null;

  const handleSelectProduct = (slug: string) => {
    closeSearch();
    navigate(`/product/${slug}`);
  };

  const handleSelectArticle = (slug: string) => {
    closeSearch();
    navigate(`/journal/${slug}`);
  };

  const hasResults = productResults.length > 0 || articleResults.length > 0;
  const isTyping = searchQuery.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl animate-fade-in text-[#F5F1E8]">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        
        {/* Top Close Row */}
        <div className="flex items-center justify-between pb-8 border-b border-[#D8CBB8]/15">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-medium">
            ATELIER SEARCH DIRECTORY
          </span>
          <button
            onClick={closeSearch}
            className="flex items-center gap-1.5 text-xs text-[#D8CBB8]/60 hover:text-[#F5F1E8] transition-colors"
            aria-label="Close search"
          >
            <span>ESC</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Editorial Search Input */}
        <div className="py-8 border-b border-[#D8CBB8]/20 flex items-center gap-4">
          <Search className="w-6 h-6 text-[#B89B5E] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wholecut, loafers, patina, Chelsea boots..."
            className="w-full bg-transparent font-serif text-2xl md:text-4xl text-[#F5F1E8] placeholder-[#D8CBB8]/30 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#D8CBB8]/40 hover:text-[#F5F1E8]"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        {!isTyping && (
          <div className="py-8 space-y-3">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8CBB8]/50 block">
              SUGGESTED EXPLORATIONS
            </span>
            <div className="flex flex-wrap gap-2">
              {['Sovereign Wholecut', 'Èkó Tassel Loafer', 'Ikoyi Monkstrap', 'Àbíkẹ́ Sandal', 'Goodyear Welt', 'Patina Glacage'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1.5 bg-[#141414] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/50 text-xs text-[#D8CBB8]/80 hover:text-[#F5F1E8] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Sections */}
        {isTyping && (
          <div className="py-8 space-y-12">
            
            {/* Products Results */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#D8CBB8]/10 mb-4">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B89B5E]">
                  FOOTWEAR CREATIONS ({productResults.length})
                </span>
              </div>

              {productResults.length === 0 ? (
                <p className="text-xs text-[#D8CBB8]/50 italic py-2">
                  No footwear creations matching "{searchQuery}"
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {productResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product.slug)}
                      className="group cursor-pointer p-3 bg-[#121212] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/60 transition-all flex flex-col justify-between"
                    >
                      <div className="aspect-[4/3] overflow-hidden mb-3 bg-[#181818]">
                        <img
                          src={product.primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#B89B5E] block">
                          {product.categoryLabel}
                        </span>
                        <h4 className="font-serif text-base text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors">
                          {product.name}
                        </h4>
                        <span className="text-xs text-[#D8CBB8]/70 block mt-1 font-sans">
                          {formatCurrencyNGN(product.priceNGN)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Journal Results */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#D8CBB8]/10 mb-4">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#B89B5E]">
                  JOURNAL & EDITORIAL STORIES ({articleResults.length})
                </span>
              </div>

              {articleResults.length === 0 ? (
                <p className="text-xs text-[#D8CBB8]/50 italic py-2">
                  No stories matching "{searchQuery}"
                </p>
              ) : (
                <div className="space-y-3">
                  {articleResults.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => handleSelectArticle(article.slug)}
                      className="group cursor-pointer p-4 bg-[#121212] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/60 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <BookOpen className="w-4 h-4 text-[#B89B5E]" />
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#B89B5E] block">
                            {article.category} • {article.readTime}
                          </span>
                          <h4 className="font-serif text-lg text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors">
                            {article.title}
                          </h4>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#D8CBB8]/40 group-hover:text-[#B89B5E] transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!hasResults && (
              <div className="py-12 text-center space-y-3">
                <p className="font-serif text-xl text-[#F5F1E8]">
                  NO MATCHES DISCOVERED
                </p>
                <p className="text-xs text-[#D8CBB8]/60 font-sans max-w-sm mx-auto">
                  Our atelier also produces custom bespoke one-of-one commissions. Speak with Nelson directly on WhatsApp for bespoke inquiries.
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
