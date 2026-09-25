import type { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: "prod-sovereign-oxford",
    slug: "sovereign-wholecut-oxford",
    name: "The Sovereign Wholecut",
    tagline: "Sculpted from a single flawless hide with hand-burnished espresso patina.",
    category: "oxfords",
    categoryLabel: "Oxfords",
    priceNGN: 245000,
    priceUSD: 320,
    isFeatured: true,
    isBespokeOnly: false,
    status: "Available to Commission",
    primaryImage: "/images/hero-bespoke-oxford.jpg",
    gallery: [
      {
        url: "/images/hero-bespoke-oxford.jpg",
        alt: "The Sovereign Wholecut Oxford side profile on volcanic stone",
        viewAngle: "hero"
      },
      {
        url: "/images/craft-artisan-hands.jpg",
        alt: "Hand welt stitching the Sovereign Oxford sole with waxed linen thread",
        viewAngle: "detail"
      },
      {
        url: "/images/craft-workshop-lasts.jpg",
        alt: "Carved wooden last sculpted specifically for the Sovereign silhouette in Lagos workshop",
        viewAngle: "lifestyle"
      }
    ],
    description: "The Sovereign Wholecut represents the pinnacle of shoemaking discipline. Cut from one uninterrupted piece of prime full-grain French box calfskin, this silhouette allows zero margin for flaw. Every curve is pulled by hand over our proprietary chiselled last, creating an unbroken line from the waist to the chiselled toe.",
    story: "In bespoke shoemaking, the wholecut is considered the master exam. Without seams to hide imperfections or ease tension, only the master's eye and relentless tensioning can achieve this sleek, glove-like glove silhouette. Hand-finished with a multilayered espresso and burgundy glacage polish that catches candlelight with subtle distinction.",
    materials: {
      upper: "Grade-A French Full-Grain Box Calfskin",
      lining: "Drum-dyed buttery soft natural calf leather lining",
      sole: "Oak bark vegetable-tanned leather sole with bevelled fiddleback waist",
      construction: "Hand-welted Goodyear construction with hidden channel stitching",
      finishing: "Multi-layered hand-burnished wax patina with high-gloss mirror toe"
    },
    features: [
      "Cut from a single piece of flawless leather (zero side seams)",
      "Bevelled waist and pitch Cuban heel",
      "Hand-pegged waist with brass nails",
      "Reinforced counter and hand-skived toe puff",
      "Complimentary monogramming on the inner waist"
    ],
    sizesAvailable: [39, 40, 41, 42, 43, 44, 45, 46, 47],
    standardLeadTime: "3 to 4 weeks for handcrafted production"
  },
  {
    id: "prod-eko-tassel-loafer",
    slug: "eko-belgian-tassel-loafer",
    name: "The Èkó Tassel Loafer",
    tagline: "Midnight obsidian calfskin with hand-braided apron and artisanal tassels.",
    category: "loafers",
    categoryLabel: "Loafers",
    priceNGN: 215000,
    priceUSD: 280,
    isFeatured: true,
    isBespokeOnly: false,
    status: "Available to Commission",
    primaryImage: "/images/product-tassel-loafer.jpg",
    gallery: [
      {
        url: "/images/product-tassel-loafer.jpg",
        alt: "The Èkó Belgian Tassel Loafer in polished obsidian on slate",
        viewAngle: "hero"
      },
      {
        url: "/images/craft-artisan-hands.jpg",
        alt: "Intricate hand braiding along the apron seam",
        viewAngle: "detail"
      },
      {
        url: "/images/craft-workshop-lasts.jpg",
        alt: "Shaping the loafer collar at the artisan bench",
        viewAngle: "lifestyle"
      }
    ],
    description: "Conceived for the modern cosmopolitan gentleman who transitions seamlessly from Lagos boardroom to evening salon. The Èkó Loafer marries Belgian minimalism with rich artisanal texture through its distinctive hand-plaited apron collar and dual hand-turned tassels.",
    story: "Named after the vibrant spirit of Lagos (Èkó), this silhouette balances relaxed ease with immaculate tailoring. The low vamp elongates the trouser line, while our soft-cushioned vegetable-tanned insole shapes precisely to your foot's contours over time.",
    materials: {
      upper: "Full-grain Aniline Calfskin in Midnight Obsidian",
      lining: "Full glove-leather breathable lining",
      sole: "Stacked leather sole with non-slip rubber island insert",
      construction: "Blake-Rapid stitched flexible welt",
      finishing: "Hand-buffed natural carnauba cream"
    },
    features: [
      "Artisanal hand-braided leather collar",
      "Handmade dual leather tassels",
      "Reinforced heel cup to eliminate heel slip",
      "Featherlight yet structurally enduring build",
      "Ideal for linen tailoring, native attire, or sharp suiting"
    ],
    sizesAvailable: [39, 40, 41, 42, 43, 44, 45, 46],
    standardLeadTime: "3 weeks for handcrafted production"
  },
  {
    id: "prod-ikoyi-monkstrap",
    slug: "ikoyi-double-monkstrap",
    name: "The Ikoyi Double Monk",
    tagline: "Burnished mahogany and espresso box calf with solid antique brass hardware.",
    category: "oxfords",
    categoryLabel: "Monkstraps",
    priceNGN: 250000,
    priceUSD: 330,
    isFeatured: true,
    isBespokeOnly: false,
    status: "Available to Commission",
    primaryImage: "/images/product-monkstrap-espresso.jpg",
    gallery: [
      {
        url: "/images/product-monkstrap-espresso.jpg",
        alt: "The Ikoyi Double Monkstrap resting on dark graphite pedestal",
        viewAngle: "hero"
      },
      {
        url: "/images/craft-artisan-hands.jpg",
        alt: "Fitting and setting antique brass buckles by hand",
        viewAngle: "detail"
      },
      {
        url: "/images/hero-bespoke-oxford.jpg",
        alt: "Burnished cap toe mirror shine reflection",
        viewAngle: "sole"
      }
    ],
    description: "Commanding and confident. The Ikoyi Double Monkstrap features an assertive chiselled toe box and bespoke cut straps anchored by custom antique brass buckles. The hand-burnished toe transitions seamlessly from obsidian to deep espresso mahogany.",
    story: "Inspired by the distinguished architectural lines of Ikoyi, this shoe is designed to make an indelible impression without shouting. The straps are angled at a precise 32-degree pitch to hug the instep with bespoke ergonomics.",
    materials: {
      upper: "Italian Museum Box Calf with mottled hand-dyeing",
      lining: "Vegetable-tanned anti-microbial calf lining",
      sole: "Hand-painted closed-channel leather sole",
      construction: "Goodyear welted with hand-carved heel breast",
      finishing: "Saphir Medaille d'Or mirrored toe glacage"
    },
    features: [
      "Custom cast solid brass buckles with brushed antique finish",
      "Elastic-mounted lower strap for easy foot entry",
      "Chiselled soft-square toe profile",
      "Triple-density cork filler for personalized arch molding",
      "Double row edge fudging on the welt"
    ],
    sizesAvailable: [40, 41, 42, 43, 44, 45, 46],
    standardLeadTime: "3 to 4 weeks for handcrafted production"
  },
  {
    id: "prod-savannah-chelsea",
    slug: "savannah-bespoke-chelsea-boot",
    name: "The Savannah Chelsea",
    tagline: "Wholecut dark chocolate pull-up leather boot with sculpted Cuban pitch heel.",
    category: "boots",
    categoryLabel: "Boots",
    priceNGN: 265000,
    priceUSD: 350,
    isFeatured: true,
    isBespokeOnly: false,
    status: "Available to Commission",
    primaryImage: "/images/product-chelsea-boot.jpg",
    gallery: [
      {
        url: "/images/product-chelsea-boot.jpg",
        alt: "The Savannah Chelsea Boot in dark chocolate pull-up leather",
        viewAngle: "hero"
      },
      {
        url: "/images/craft-workshop-lasts.jpg",
        alt: "Blocking the boot shaft over the wooden ankle former",
        viewAngle: "detail"
      },
      {
        url: "/images/craft-artisan-hands.jpg",
        alt: "Sole stitching and heel stack assembly",
        viewAngle: "lifestyle"
      }
    ],
    description: "The quintessential luxury boot. Formed around a single seamless front piece, the Savannah Chelsea eliminates bulky side seams for an elongated, razor-sharp silhouette that slips effortlessly under tailored trousers or selvedge denim.",
    story: "Pull-up leather possesses a unique memory: as you move, oils shift beneath the surface, developing a rich organic patina that becomes more expressive every season. Handcrafted in our workshop with heavy-gauge elastic webbing that retains its snap indefinitely.",
    materials: {
      upper: "Rich Oil-Infused Full-Grain Pull-Up Leather",
      lining: "Full leather lining with reinforced heel counter",
      sole: "Double leather sole with inset Vibram rubber commando grip",
      construction: "360-degree Storm Welt for superior all-weather resilience",
      finishing: "Natural beeswax edge burnish"
    },
    features: [
      "Seamless wholecut front vamp blocking",
      "High-tension woven Italian elastic side gores",
      "Handcrafted leather pull tab with Nelson brand crest",
      "Sculpted Cuban pitch heel (32mm height)",
      "Built for decades of resoleability"
    ],
    sizesAvailable: [40, 41, 42, 43, 44, 45, 46, 47],
    standardLeadTime: "4 weeks for handcrafted production"
  },
  {
    id: "prod-abike-sandal",
    slug: "abike-artisan-leather-sandal",
    name: "The Àbíkẹ́ Artisan Sandal",
    tagline: "Vegetal-tanned chocolate crossover leather with antique brass harness buckle.",
    category: "sandals",
    categoryLabel: "Sandals",
    priceNGN: 125000,
    priceUSD: 165,
    isFeatured: true,
    isBespokeOnly: false,
    status: "Available to Commission",
    primaryImage: "/images/product-bespoke-sandal.jpg",
    gallery: [
      {
        url: "/images/product-bespoke-sandal.jpg",
        alt: "The Àbíkẹ́ Artisan Leather Sandal on warm travertine limestone",
        viewAngle: "hero"
      },
      {
        url: "/images/craft-artisan-hands.jpg",
        alt: "Hand skiving and edge beveling the strap edges",
        viewAngle: "detail"
      },
      {
        url: "/images/craft-workshop-lasts.jpg",
        alt: "Ergonomic leather footbed forming at the workbench",
        viewAngle: "lifestyle"
      }
    ],
    description: "Elevating traditional West African open-foot elegance to the pinnacle of luxury craftsmanship. The Àbíkẹ́ Sandal is crafted from 3.5mm thick vegetal-tanned harness leather, meticulously beveled by hand and molded over an anatomical cork-leather footbed.",
    story: "In African luxury, footwear is a statement of dignity and relaxed mastery. Designed to complement flowing Agbadas, linen kaftans, and contemporary resort tailoring, this sandal offers whisper-quiet comfort with substantial presence.",
    materials: {
      upper: "3.5mm Thick Vegetal-Tanned Harness Leather",
      lining: "Raw unlined burnished flesh side for hypoallergenic comfort",
      sole: "Compressed leather midsole with slip-resistant EVA-rubber outsole",
      construction: "Hand-lasted and brass-riveted strap anchor",
      finishing: "Organic bone oil and beeswax hand edge wax"
    },
    features: [
      "Sculpted arch contour molded to your foot shape",
      "Hand-beveled and burnished leather strap edges",
      "Heavyweight solid antique brass roller buckle",
      "Breathable, natural shock-absorbing footbed",
      "Handmade in Lagos in strictly limited seasonal batches"
    ],
    sizesAvailable: [39, 40, 41, 42, 43, 44, 45, 46],
    standardLeadTime: "2 to 3 weeks for handcrafted production"
  },
  {
    id: "prod-heritage-custom",
    slug: "heritage-monogram-bespoke-commission",
    name: "The Atelier Bespoke Commission",
    tagline: "A completely custom silhouette, last, and exotic or calf leather crafted to your unique foot anatomy.",
    category: "custom",
    categoryLabel: "Bespoke Only",
    priceNGN: 380000,
    priceUSD: 500,
    isFeatured: true,
    isBespokeOnly: true,
    status: "Available to Commission",
    primaryImage: "/images/craft-workshop-lasts.jpg",
    gallery: [
      {
        url: "/images/craft-workshop-lasts.jpg",
        alt: "Bespoke wooden shoe lasts and leather hides in the Lagos workshop",
        viewAngle: "hero"
      },
      {
        url: "/images/craft-artisan-hands.jpg",
        alt: "Hand carving personal wooden lasts for individual client anatomy",
        viewAngle: "detail"
      },
      {
        url: "/images/hero-bespoke-oxford.jpg",
        alt: "Finished bespoke piece awaiting client fitting",
        viewAngle: "lifestyle"
      }
    ],
    description: "The ultimate expression of bespoke luxury. We build a personalized wooden last carved strictly to the anatomical dimensions of your feet. Select your silhouette, leather tannery, patina colorway, welt detail, and bespoke sole engravings.",
    story: "Your bespoke journey includes an initial digital or atelier consultation, full dimensional mapping of your feet, trial fitting evaluation, and final delivery of a one-of-one pair that will remain unmatched anywhere in the world.",
    materials: {
      upper: "Client Selection (French Box Calf, Italian Suede, Shell Cordovan, or Exotic Leathers)",
      lining: "Personalized engraved calfskin lining",
      sole: "Bespoke Hand-Carved Oak Bark Sole with Fiddleback Waist",
      construction: "100% Traditional Hand-Sewn Inseam and Welt",
      finishing: "Custom Patina Recipe Formulated Exclusively for the Client"
    },
    features: [
      "Custom wooden lasts preserved in the Nelson atelier archive for your future commissions",
      "Personalized initials or heraldic family crest engraved on the waist",
      "Dedicated artisan shoemaker assigned to your commission",
      "Comprehensive fitting session included",
      "Delivered in cedar shoe trees and handmade suede dust bags"
    ],
    sizesAvailable: [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
    standardLeadTime: "6 to 8 weeks for dedicated artisan commission"
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter(p => p.isFeatured);
}
