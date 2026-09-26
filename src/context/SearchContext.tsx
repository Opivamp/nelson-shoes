import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Product, JournalArticle } from '../types';
import { useProducts } from './ProductContext';
import { JOURNAL_ARTICLES } from '../data/journal';

interface SearchContextType {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  productResults: Product[];
  articleResults: JournalArticle[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useProducts();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const productResults = useMemo(() => {
    if (!trimmedQuery) return [];
    return products.filter(product => 
      product.name.toLowerCase().includes(trimmedQuery) ||
      product.description.toLowerCase().includes(trimmedQuery) ||
      product.category.toLowerCase().includes(trimmedQuery) ||
      product.categoryLabel.toLowerCase().includes(trimmedQuery) ||
      product.materials.upper.toLowerCase().includes(trimmedQuery)
    );
  }, [trimmedQuery, products]);

  const articleResults = useMemo(() => {
    if (!trimmedQuery) return [];
    return JOURNAL_ARTICLES.filter(article => 
      article.title.toLowerCase().includes(trimmedQuery) ||
      article.subtitle.toLowerCase().includes(trimmedQuery) ||
      article.excerpt.toLowerCase().includes(trimmedQuery) ||
      article.category.toLowerCase().includes(trimmedQuery)
    );
  }, [trimmedQuery]);

  return (
    <SearchContext.Provider
      value={{
        isSearchOpen,
        openSearch,
        closeSearch,
        searchQuery,
        setSearchQuery,
        productResults,
        articleResults,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within a SearchProvider');
  return context;
};
