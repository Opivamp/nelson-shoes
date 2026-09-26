import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  ShieldCheck, 
  Clock, 
  Check, 
  ArrowRight, 
  MessageCircle, 
  Ruler, 
  Sparkles 
} from 'lucide-react';
import { formatCurrencyNGN, formatCurrencyUSD, getWhatsAppUrl } from '../data/config';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getProductBySlug, products } = useProducts();
  const product = slug ? getProductBySlug(slug) : undefined;

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number>(42);
  const [isBespokeFitting, setIsBespokeFitting] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'sizing' | 'delivery'>('details');
  const [added, setAdded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!product) {
    return (
      <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-40 pb-24 text-center px-6">
        <div className="max-w-md mx-auto space-y-4">
          <h1 className="font-serif text-3xl">CREATION NOT FOUND</h1>
          <p className="text-xs text-[#D8CBB8]/70 font-sans">
            The footwear piece you requested is either an archived commission or does not exist.
          </p>
          <Link
            to="/collection"
            className="inline-block px-6 py-3 bg-[#B89B5E] text-[#0A0A0A] text-xs uppercase tracking-widest font-semibold"
          >
            RETURN TO COLLECTION
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const related = products.filter(p => p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    addItem(product, selectedSize, isBespokeFitting, customNotes);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const whatsappInquiryUrl = getWhatsAppUrl(
    `Hello Nelson Atelier, I am interested in inquiring about "${product.name}" in Size EU ${selectedSize}${isBespokeFitting ? ' with a Bespoke Fitting Last' : ''}.`
  );

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-16">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-[#D8CBB8]/60 font-sans">
          <Link to="/" className="hover:text-[#B89B5E] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-[#B89B5E] transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-[#B89B5E]">{product.name}</span>
        </nav>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Multi-Angle Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Stage Image */}
            <div className="relative aspect-[4/3] md:aspect-[16/11] bg-[#141414] border border-[#D8CBB8]/15 overflow-hidden">
              <img
                src={product.gallery[activeImageIndex]?.url || product.primaryImage}
                alt={product.gallery[activeImageIndex]?.alt || product.name}
                className="w-full h-full object-cover object-center transition-all duration-700 hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-[#0A0A0A]/85 backdrop-blur-md px-3 py-1 border border-[#D8CBB8]/10 text-[9px] uppercase tracking-widest text-[#B89B5E]">
                {product.gallery[activeImageIndex]?.viewAngle || 'hero'} perspective
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square overflow-hidden bg-[#161616] border transition-all ${
                    activeImageIndex === idx 
                      ? 'border-[#B89B5E] opacity-100 ring-1 ring-[#B89B5E]' 
                      : 'border-[#D8CBB8]/15 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>

            {/* Atelier Craft Seal Guarantee */}
            <div className="p-6 bg-[#111111] border border-[#D8CBB8]/10 flex items-center justify-between text-xs text-[#D8CBB8]/80 font-sans">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#B89B5E] shrink-0" />
                <span>Goodyear welted & hand-finished in Lagos workshop</span>
              </div>
              <span className="text-[#B89B5E] font-medium text-[11px] uppercase tracking-wider">
                Full Resoleability
              </span>
            </div>

          </div>

          {/* Right Column: Sticky Purchasing & Bespoke Spec Panel */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
            
            <div className="space-y-3 pb-6 border-b border-[#D8CBB8]/15">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#B89B5E] font-medium">
                  {product.categoryLabel} • {product.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 border border-[#D8CBB8]/15 hover:border-[#B89B5E] text-[#D8CBB8] hover:text-[#B89B5E] transition-colors"
                    aria-label="Share creation"
                    title="Share link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2 border transition-colors ${
                      isSaved
                        ? 'border-[#B89B5E] bg-[#B89B5E] text-[#0A0A0A]'
                        : 'border-[#D8CBB8]/15 hover:border-[#B89B5E] text-[#D8CBB8] hover:text-[#B89B5E]'
                    }`}
                    aria-label="Save creation"
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F1E8] tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-serif text-2xl sm:text-3xl text-[#F5F1E8]">
                  {formatCurrencyNGN(product.priceNGN)}
                </span>
                <span className="text-xs text-[#D8CBB8]/60 font-sans">
                  ≈ {formatCurrencyUSD(product.priceUSD)} USD
                </span>
              </div>

              <p className="font-serif italic text-sm text-[#D8CBB8]/80 pt-1">
                "{product.tagline}"
              </p>

              {copiedShare && (
                <p className="text-[11px] text-[#B89B5E] animate-fade-in font-sans">
                  Direct atelier URL copied to clipboard.
                </p>
              )}
            </div>

            {/* Size Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#D8CBB8]/70">
                <span className="uppercase tracking-wider font-medium text-[#F5F1E8]">
                  SELECT EU SIZE:
                </span>
                <Link
                  to="/bespoke"
                  className="text-[#B89B5E] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Ruler className="w-3 h-3" /> Size & Last Guide
                </Link>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizesAvailable.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-xs font-sans transition-all border ${
                      selectedSize === size
                        ? 'border-[#B89B5E] bg-[#B89B5E] text-[#0A0A0A] font-bold shadow-lg'
                        : 'border-[#D8CBB8]/15 bg-[#121212] text-[#D8CBB8] hover:border-[#B89B5E]/50'
                    }`}
                  >
                    EU {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Bespoke Fitting Option Checkbox */}
            <div className="p-4 bg-[#121212] border border-[#D8CBB8]/15 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isBespokeFitting}
                  onChange={(e) => setIsBespokeFitting(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#B89B5E] bg-black border-[#D8CBB8]/30"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#F5F1E8] font-sans block">
                    COMMISSION WITH BESPOKE ANATOMICAL LAST
                  </span>
                  <span className="text-[11px] text-[#D8CBB8]/70 font-sans block leading-relaxed">
                    Our atelier will schedule a digital or in-person foot measurement session to carve a personal wooden last tailored to your foot curves.
                  </span>
                </div>
              </label>

              {isBespokeFitting && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Note special requirements (e.g. high instep, monogram initials)..."
                    className="w-full bg-[#181818] border border-[#D8CBB8]/20 px-3 py-2 text-xs text-[#F5F1E8] placeholder-[#D8CBB8]/40 focus:outline-none focus:border-[#B89B5E]"
                  />
                </div>
              )}
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs tracking-[0.22em] uppercase hover:bg-[#D4BD86] transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ADDED TO ATELIER BAG</span>
                  </>
                ) : (
                  <span>COMMISSION THIS PIECE (ADD TO BAG)</span>
                )}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  to="/bespoke"
                  className="py-3 bg-transparent border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-[#F5F1E8] hover:text-[#B89B5E] text-[10px] tracking-[0.2em] uppercase font-medium text-center transition-colors"
                >
                  REQUEST BESPOKE VERSION
                </Link>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 bg-[#141414] border border-[#B89B5E]/40 hover:border-[#B89B5E] text-[#F5F1E8] text-[10px] tracking-[0.2em] uppercase font-medium text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#B89B5E]" />
                  <span>ASK ON WHATSAPP</span>
                </a>
              </div>
            </div>

            {/* Production & Dispatch Note */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-[#D8CBB8]/60 font-sans border-t border-[#D8CBB8]/10">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B89B5E]" /> Lead time: {product.standardLeadTime}
              </span>
              <span>Complimentary Global Delivery</span>
            </div>

          </div>

        </div>

        {/* Deep Dive Specification Tabs */}
        <div className="pt-16 border-t border-[#D8CBB8]/15 space-y-8">
          
          <div className="flex border-b border-[#D8CBB8]/15 overflow-x-auto no-scrollbar gap-8">
            {[
              { key: 'details', label: 'THE STORY & CRAFT' },
              { key: 'materials', label: 'LEATHER & SPECIFICATIONS' },
              { key: 'sizing', label: 'ANATOMICAL SIZING' },
              { key: 'delivery', label: 'COURIER & ATELIER CARE' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-3 text-xs tracking-[0.2em] uppercase font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-[#B89B5E] text-[#B89B5E]'
                    : 'border-transparent text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-4 text-xs md:text-sm text-[#D8CBB8]/80 font-sans leading-relaxed max-w-4xl space-y-6">
            
            {activeTab === 'details' && (
              <div className="space-y-4">
                <p className="text-base text-[#F5F1E8] font-serif leading-relaxed">
                  {product.description}
                </p>
                <p>{product.story}</p>
                <div className="pt-4 space-y-2">
                  <h4 className="text-[11px] uppercase tracking-widest text-[#B89B5E] font-semibold">
                    HALLMARK FEATURES
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-[#D8CBB8]/75">
                    {product.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#121212] p-6 border border-[#D8CBB8]/10">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] block mb-1">
                    UPPER LEATHER
                  </span>
                  <p className="text-[#F5F1E8] font-medium">{product.materials.upper}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] block mb-1">
                    INTERNAL LINING
                  </span>
                  <p className="text-[#F5F1E8] font-medium">{product.materials.lining}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] block mb-1">
                    SOLE ARCHITECTURE
                  </span>
                  <p className="text-[#F5F1E8] font-medium">{product.materials.sole}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] block mb-1">
                    CONSTRUCTION METHOD
                  </span>
                  <p className="text-[#F5F1E8] font-medium">{product.materials.construction}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#B89B5E] block mb-1">
                    PATINA & FINISHING
                  </span>
                  <p className="text-[#F5F1E8] font-medium">{product.materials.finishing}</p>
                </div>
              </div>
            )}

            {activeTab === 'sizing' && (
              <div className="space-y-4">
                <p>
                  Nelson shoes are lasted around refined anatomical proportions designed to provide generous volume across the metatarsal joint while hugging the instep with glove-like fidelity.
                </p>
                <div className="p-4 bg-[#141414] border border-[#D8CBB8]/10 space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-[#B89B5E] font-semibold">
                    MEASURING YOUR FEET AT HOME
                  </h4>
                  <p className="text-xs text-[#D8CBB8]/70">
                    Stand barefoot on clean white paper against a straight wall. Mark the longest point of your toe and the heel. Note your length in centimeters and share it with Nelson during your consultation.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-4">
                <p>
                  Every pair is handcrafted specifically to order in our Lagos workshop. Standard production takes between 3 to 4 weeks depending on leather allocation and hand-patina curing times.
                </p>
                <p>
                  We dispatch via insured DHL Express worldwide courier. Tracking updates and progress photographs from the workbench are transmitted directly to your WhatsApp.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Related Creations */}
        <div className="pt-16 border-t border-[#D8CBB8]/15 space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#F5F1E8]">
              COMPLEMENTARY CREATIONS
            </h3>
            <Link
              to="/collection"
              className="text-xs uppercase tracking-widest text-[#B89B5E] hover:underline"
            >
              VIEW ALL SILHOUETTES →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
