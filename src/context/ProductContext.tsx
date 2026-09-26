import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, ProductCategory } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';

interface ProductContextType {
  products: Product[];
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: ProductCategory | string) => Product[];
  getFeaturedProducts: () => Product[];
  addProduct: (productData: Partial<Product> & { name: string; priceNGN: number; primaryImage: string }) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetToDefaultProducts: () => void;
}

const PRODUCTS_STORAGE_KEY = 'nelson_shoes_catalog_v2';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse stored products:', e);
    }
    return DEFAULT_PRODUCTS;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to persist products:', e);
    }
  }, [products]);

  const getProductBySlug = (slug: string): Product | undefined => {
    return products.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const getProductsByCategory = (category: ProductCategory | string): Product[] => {
    if (!category || category === 'all') return products;
    return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  };

  const getFeaturedProducts = (): Product[] => {
    const featured = products.filter(p => p.isFeatured);
    return featured.length > 0 ? featured : products.slice(0, 4);
  };

  const addProduct = (
    productData: Partial<Product> & { name: string; priceNGN: number; primaryImage: string }
  ): Product => {
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const id = `prod-${slug}-${Date.now().toString().slice(-4)}`;
    const priceUSD = productData.priceUSD || Math.round(productData.priceNGN / 760);

    const newProduct: Product = {
      id,
      slug: productData.slug || slug,
      name: productData.name,
      tagline: productData.tagline || 'Handcrafted bespoke leather footwear from Nelson Atelier Lagos.',
      category: (productData.category as ProductCategory) || 'oxfords',
      categoryLabel: productData.categoryLabel || 'Bespoke Footwear',
      priceNGN: Number(productData.priceNGN),
      priceUSD,
      isFeatured: productData.isFeatured ?? true,
      isBespokeOnly: productData.isBespokeOnly ?? false,
      isLimitedEdition: productData.isLimitedEdition ?? false,
      status: productData.status || 'Available to Commission',
      primaryImage: productData.primaryImage,
      gallery: productData.gallery || [
        {
          url: productData.primaryImage,
          alt: `${productData.name} profile`,
          viewAngle: 'hero'
        }
      ],
      description: productData.description || 'Master-crafted leather footwear constructed with artisanal attention to proportion, tension, and comfort.',
      story: productData.story || 'Individually lasted and finished with natural beeswax and organic carnauba glacage at our Lagos atelier.',
      materials: productData.materials || {
        upper: 'Premium Full-Grain Calfskin',
        lining: 'Natural drum-dyed calf lining',
        sole: 'Oak bark vegetable-tanned leather sole',
        construction: 'Goodyear / Blake-Rapid Hand-Welted',
        finishing: 'Hand-burnished artisanal wax polish'
      },
      features: productData.features || [
        'Hand-lasted over custom wooden formers',
        'Bevelled waist with brass nail stabilization',
        'Complimentary waist personalization monogram',
        'Bespoke fitting evaluation included'
      ],
      sizesAvailable: productData.sizesAvailable || [39, 40, 41, 42, 43, 44, 45, 46, 47],
      standardLeadTime: productData.standardLeadTime || '3 to 4 weeks for handcrafted production'
    };

    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(item => item.id !== id));
  };

  const resetToDefaultProducts = () => {
    setProducts(DEFAULT_PRODUCTS);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        getProductBySlug,
        getProductById,
        getProductsByCategory,
        getFeaturedProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaultProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
