export type ProductCategory = 
  | 'all' 
  | 'oxfords' 
  | 'loafers' 
  | 'boots' 
  | 'sandals' 
  | 'custom' 
  | 'limited';

export interface ProductImage {
  url: string;
  alt: string;
  viewAngle: 'hero' | 'side' | 'overhead' | 'sole' | 'detail' | 'lifestyle';
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  categoryLabel: string;
  priceNGN: number;
  priceUSD: number;
  isBespokeOnly?: boolean;
  isFeatured?: boolean;
  isLimitedEdition?: boolean;
  status: 'Available to Commission' | 'Limited Batch' | 'Archive Piece';
  primaryImage: string;
  gallery: ProductImage[];
  description: string;
  story: string;
  materials: {
    upper: string;
    lining: string;
    sole: string;
    construction: string;
    finishing: string;
  };
  features: string[];
  sizesAvailable: number[]; // EU sizes 39 - 47
  standardLeadTime: string;
}

export interface CartItem {
  id: string;
  product: Product;
  size: number;
  isBespokeFitting: boolean;
  customNotes?: string;
  quantity: number;
}

export interface BespokeInquiry {
  fullName: string;
  email: string;
  phoneOrWhatsApp: string;
  country: string;
  city: string;
  silhouette: string;
  leatherType: string;
  colorPreference: string;
  footSize: string;
  occasion: string;
  budgetRange: string;
  specialRequests: string;
  fittingPreference: 'standard-size' | 'atelier-measurement' | 'virtual-consultation';
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'The Craft' | 'Philosophy' | 'The Process' | 'Style';
  publishedDate: string;
  readTime: string;
  heroImage: string;
  excerpt: string;
  content: {
    heading?: string;
    paragraphs: string[];
    quote?: string;
    subImage?: string;
    subImageCaption?: string;
  }[];
  author: {
    name: string;
    role: string;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'shoes' | 'craft' | 'workshop' | 'details' | 'lifestyle';
  categoryLabel: string;
  imageUrl: string;
  aspectRatio: 'square' | 'portrait' | 'landscape';
  caption: string;
  year: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  titleOrLocation: string;
  shoeCommissioned: string;
  verifiedStatus: string;
}
