import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SeoProductData {
  name: string;
  description: string;
  image: string;
  priceNGN?: number;
  priceUSD?: number;
  sku?: string;
  category?: string;
  inStock?: boolean;
}

export interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  product?: SeoProductData;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const PRODUCTION_DOMAIN = 'https://nelson-shoes.vercel.app';
const DEFAULT_TITLE = 'Nelson Shoes | Luxury Bespoke Nigerian Footwear | Crafted Beyond Ordinary';
const DEFAULT_DESC = 'Nelson Shoes is a premier bespoke footwear house handcrafted in Lagos, Nigeria. Meticulously shaped by hand, defined by precision, and sculpted for discerning connoisseurs.';
const DEFAULT_OG_IMAGE = `${PRODUCTION_DOMAIN}/images/hero-bespoke-oxford.jpg`;

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description = DEFAULT_DESC,
  canonicalPath,
  noIndex = false,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  product,
  breadcrumbs,
  jsonLd
}) => {
  const location = useLocation();

  useEffect(() => {
    // 1. Title formatting
    const formattedTitle = title
      ? (title.toLowerCase().includes('nelson shoes') ? title : `${title} | Nelson Shoes`)
      : DEFAULT_TITLE;
    document.title = formattedTitle;

    // Helper to set/update a meta tag
    const setMetaTag = (attribute: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to set/update link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Meta description
    setMetaTag('name', 'description', description);

    // 3. Robots directive
    const robotsContent = noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMetaTag('name', 'robots', robotsContent);

    // 4. Canonical URL (strip query parameters and hash to prevent duplicate content indexing)
    const targetPath = canonicalPath || location.pathname;
    const cleanPath = targetPath === '/' ? '' : targetPath.replace(/\/$/, '');
    const canonicalUrl = `${PRODUCTION_DOMAIN}${cleanPath}`;
    setLinkTag('canonical', canonicalUrl);

    // 5. Open Graph tags
    const absoluteOgImage = ogImage.startsWith('http')
      ? ogImage
      : `${PRODUCTION_DOMAIN}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', absoluteOgImage);
    setMetaTag('property', 'og:site_name', 'Nelson Shoes');

    // 6. Twitter Card tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', absoluteOgImage);

    // 7. Dynamic JSON-LD Structured Data
    const scriptId = 'nelson-seo-jsonld';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (scriptElement) {
      scriptElement.remove();
    }

    const structuredDataObjects: any[] = [];

    // BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      structuredDataObjects.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': item.name,
          'item': item.url.startsWith('http') ? item.url : `${PRODUCTION_DOMAIN}${item.url}`
        }))
      });
    }

    // Product Schema
    if (product) {
      const productSchema: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': product.name,
        'description': product.description,
        'image': product.image.startsWith('http')
          ? product.image
          : `${PRODUCTION_DOMAIN}${product.image.startsWith('/') ? '' : '/'}${product.image}`,
        'brand': {
          '@type': 'Brand',
          'name': 'Nelson Shoes'
        },
        'category': product.category || 'Footwear'
      };

      if (product.sku) {
        productSchema.sku = product.sku;
      }

      if (product.priceNGN) {
        productSchema.offers = {
          '@context': 'https://schema.org',
          '@type': 'Offer',
          'url': canonicalUrl,
          'priceCurrency': 'NGN',
          'price': product.priceNGN,
          'availability': product.inStock !== false
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          'itemCondition': 'https://schema.org/NewCondition',
          'seller': {
            '@type': 'Organization',
            'name': 'Nelson Shoes'
          }
        };
      }

      structuredDataObjects.push(productSchema);
    }

    // Custom or additional JSON-LD
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        structuredDataObjects.push(...jsonLd);
      } else {
        structuredDataObjects.push(jsonLd);
      }
    }

    if (structuredDataObjects.length > 0) {
      const newScript = document.createElement('script');
      newScript.id = scriptId;
      newScript.type = 'application/ld+json';
      newScript.textContent = JSON.stringify(
        structuredDataObjects.length === 1 ? structuredDataObjects[0] : { '@graph': structuredDataObjects }
      );
      document.head.appendChild(newScript);
    }

    return () => {
      // Clean up injected structured data when route unmounts
      const script = document.getElementById(scriptId);
      if (script) script.remove();
    };
  }, [
    title,
    description,
    canonicalPath,
    noIndex,
    ogType,
    ogImage,
    location.pathname,
    product,
    breadcrumbs,
    jsonLd
  ]);

  return null;
};
