import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Product, ProductCategory } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { SectionHeading } from '../components/common/SectionHeading';
import { useWishlist } from '../context/WishlistContext';

export const CollectionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as ProductCategory) || 'all';
  const showSavedOnly = searchParams.get('saved') === 'true';

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(initialCategory);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { wishlistIds } = useWishlist();

  useEffect(() => {
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category') as ProductCategory);
    }
  }, [searchParams]);

  const categories: { key: ProductCategory; label: string }[] = [
    { key: 'all', label: 'ALL SILHOUETTES' },
    { key: 'oxfords', label: 'OXFORDS' },
    { key: 'loafers', label: 'LOAFERS' },
    { key: 'boots', label: 'BOOTS' },
    { key: 'sandals', label: 'SANDALS' },
    { key: 'custom', label: 'CUSTOM / BESPOKE' },
  ];

  const materials = [
    { key: 'all', label: 'All Leathers' },
    { key: 'Calfskin', label: 'French Box Calfskin' },
    { key: 'Pull-Up', label: 'Oil Pull-up Leather' },
    { key: 'Vegetal', label: 'Vegetal-Tanned Harness' },
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Material filter
      if (selectedMaterial !== 'all') {
        if (!p.materials.upper.toLowerCase().includes(selectedMaterial.toLowerCase())) {
          return false;
        }
      }
      // Wishlist filter
      if (showSavedOnly && !wishlistIds.includes(p.id)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceNGN - b.priceNGN;
      if (sortBy === 'price-desc') return b.priceNGN - a.priceNGN;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [selectedCategory, selectedMaterial, showSavedOnly, wishlistIds, sortBy]);

  const handleCategoryChange = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedMaterial('all');
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-12">
        
        {/* Editorial Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#B89B5E] font-medium block">
            THE ATELIER ARCHIVE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-[#F5F1E8] leading-tight">
            {showSavedOnly ? "SAVED CREATIONS" : "BESPOKE COLLECTION"}
          </h1>
          <p className="text-xs md:text-sm text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
            {showSavedOnly
              ? "Your curated shortlist of commissioned footwear pieces."
              : "Explore our collection of handcrafted footwear. Each silhouette is individually lasted in Lagos from the finest full-grain hides, finished with multilayered wax patina."}
          </p>
        </div>

        {/* Filter & Category Bar */}
        <div className="pt-6 border-t border-[#D8CBB8]/15 space-y-6">
          
          {/* Main Category Tabs */}
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 no-scrollbar">
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`px-4 py-2 text-[11px] tracking-[0.2em] uppercase font-medium whitespace-nowrap transition-all duration-300 border ${
                    selectedCategory === cat.key && !showSavedOnly
                      ? 'border-[#B89B5E] bg-[#B89B5E] text-[#0A0A0A]'
                      : 'border-[#D8CBB8]/15 bg-[#121212] text-[#D8CBB8]/70 hover:border-[#B89B5E]/40 hover:text-[#F5F1E8]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#121212] border border-[#D8CBB8]/15 text-xs text-[#D8CBB8] px-3 py-2 uppercase tracking-wider focus:outline-none focus:border-[#B89B5E]"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="price-asc">Price: Ascending</option>
                <option value="price-desc">Price: Descending</option>
              </select>

              <button
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className="p-2 border border-[#D8CBB8]/15 bg-[#121212] hover:border-[#B89B5E] text-[#D8CBB8] md:hidden"
                aria-label="Filter leathers"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Secondary Leather Filters (Desktop Bar & Mobile Drawer) */}
          <div className={`md:flex items-center justify-between text-xs py-3 border-y border-[#D8CBB8]/10 bg-[#0E0E0E] px-4 ${filterDrawerOpen ? 'block' : 'hidden md:flex'}`}>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] font-medium mr-2">
                FILTER LEATHER:
              </span>
              {materials.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMaterial(m.key)}
                  className={`text-[11px] font-sans transition-colors ${
                    selectedMaterial === m.key
                      ? 'text-[#B89B5E] underline font-semibold'
                      : 'text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {(selectedCategory !== 'all' || selectedMaterial !== 'all' || showSavedOnly) && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] uppercase tracking-widest text-[#B89B5E] hover:underline flex items-center gap-1 mt-2 md:mt-0"
              >
                <RefreshCw className="w-3 h-3" /> RESET FILTERS
              </button>
            )}
          </div>

        </div>

        {/* Product Count Indicator */}
        <div className="flex items-center justify-between text-[11px] text-[#D8CBB8]/60 font-sans tracking-widest uppercase">
          <span>SHOWING {filteredProducts.length} CREATIONS</span>
          <span>100% HANDCRAFTED IN NIGERIA</span>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-[#121212] border border-[#D8CBB8]/10 p-8">
            <h3 className="font-serif text-2xl text-[#F5F1E8]">
              NO CREATIONS MATCH YOUR SELECTION
            </h3>
            <p className="text-xs text-[#D8CBB8]/70 font-sans max-w-md mx-auto">
              Our master shoemakers create bespoke pieces to your exact specifications. Reset your filters or commission a custom silhouette.
            </p>
            <div className="pt-2">
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-[#B89B5E] text-[#0A0A0A] text-xs uppercase tracking-widest font-semibold hover:bg-[#D4BD86]"
              >
                RESET ALL FILTERS
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
