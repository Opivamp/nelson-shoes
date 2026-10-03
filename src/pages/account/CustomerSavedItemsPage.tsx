import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, ExternalLink, Package, ShoppingBag } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { CustomerPortalLayout } from '../../components/customer/CustomerPortalLayout';

export const CustomerSavedItemsPage: React.FC = () => {
  const { savedItemIds, removeItem } = useCustomerAuth();
  const { products } = useProducts();
  const { addItem, openCart } = useCart();

  // Match saved IDs with available products in catalog
  const savedProducts = savedItemIds.map((id) => {
    const matched = products.find(p => p.id === id || p.slug === id);
    return {
      id,
      product: matched || null
    };
  });

  return (
    <CustomerPortalLayout>
      <div className="space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-widest text-[#B89B5E] block">
              CURATED WISHLIST
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#F5F1E8]">
              Saved Items ({savedItemIds.length})
            </h2>
            <p className="text-xs text-[#D8CBB8]/70 font-sans">
              Personal footwear inspirations and future commission aspirations saved to your customer account.
            </p>
          </div>

          <Link
            to="/collection"
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#B89B5E]/40 text-xs font-mono text-[#B89B5E] hover:text-[#D4BD86] rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Explore Catalog</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Grid or Empty State */}
        {savedItemIds.length === 0 ? (
          <div className="p-12 bg-[#121212] border border-[#D8CBB8]/15 rounded-xl text-center space-y-4">
            <Heart className="w-10 h-10 text-[#B89B5E]/30 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-[#F5F1E8]">No saved items yet</h3>
              <p className="text-xs text-[#D8CBB8]/60 font-sans max-w-sm mx-auto">
                Discover your next bespoke or ready-to-wear piece from our curated master collection. Click the heart icon on any piece to save it here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/collection"
                className="px-5 py-2.5 bg-[#B89B5E] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded-lg hover:bg-[#D4BD86] transition-colors inline-block"
              >
                Browse Collection
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProducts.map(({ id, product }) => {
              if (!product) {
                // Section 18: Product Availability Edge Case (archived, deleted, out of stock)
                return (
                  <div
                    key={id}
                    className="p-5 bg-[#121212] border border-amber-900/30 rounded-xl space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="h-40 bg-[#161616] rounded-lg flex items-center justify-center text-xs text-[#D8CBB8]/40 font-mono">
                        Piece Archived
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/30 text-amber-300">
                        Item No Longer Available
                      </span>
                      <p className="text-xs text-[#D8CBB8]/60 font-sans">
                        This creation has been archived or removed from the catalog.
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(id)}
                      className="w-full py-2 bg-[#1A1A1A] hover:bg-red-950/30 border border-red-500/20 text-xs text-red-400 hover:text-red-300 rounded font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Remove from Saved</span>
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={product.id}
                  className="bg-[#121212] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/40 rounded-xl overflow-hidden transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Shoe Photography */}
                    <div className="relative aspect-[4/3] bg-[#161616] overflow-hidden">
                      <img
                        src={product.primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={() => removeItem(product.id)}
                        className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-red-400 hover:text-red-300 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
                        title="Remove from saved"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Shoe Details */}
                    <div className="p-5 pt-1 space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#B89B5E] block">
                        {product.category}
                      </span>
                      <h3 className="font-serif text-lg text-[#F5F1E8] font-medium leading-snug">
                        {product.name}
                      </h3>
                      <div className="font-mono text-xs text-[#D8CBB8] font-medium">
                        ₦{product.priceNGN?.toLocaleString()} / ${product.priceUSD?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <Link
                      to={`/product/${product.slug || product.id}`}
                      className="py-2.5 bg-[#1A1A1A] hover:bg-[#222222] border border-[#D8CBB8]/20 hover:border-[#B89B5E] text-xs font-mono text-[#F5F1E8] hover:text-[#B89B5E] rounded text-center transition-colors block"
                    >
                      View Shoe
                    </Link>
                    <button
                      onClick={() => {
                        const defaultSize = product.sizesAvailable?.[0] || 42;
                        addItem(product, defaultSize);
                        openCart();
                      }}
                      className="py-2.5 bg-[#B89B5E] hover:bg-[#D4BD86] text-[#0A0A0A] font-semibold text-xs font-mono uppercase tracking-wider rounded text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingBag size={13} />
                      <span>Order</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </CustomerPortalLayout>
  );
};
