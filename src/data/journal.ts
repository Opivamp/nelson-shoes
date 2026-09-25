import type { JournalArticle } from '../types';

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: "art-anatomy-of-a-wholecut",
    slug: "anatomy-of-a-wholecut-oxford",
    title: "The Anatomy of a Wholecut: Why One Piece of Leather Changes Everything",
    subtitle: "In bespoke shoemaking, the absence of seams is both the greatest aesthetic victory and the ultimate technical trial.",
    category: "The Craft",
    publishedDate: "October 14, 2025",
    readTime: "5 min read",
    heroImage: "/images/hero-bespoke-oxford.jpg",
    excerpt: "Most dress shoes are assembled from six to nine separate leather cuts stitched together. The wholecut requires a single uninterrupted piece of leather without a single blemish.",
    author: {
      name: "Nelson Atelier",
      role: "Master Artisan"
    },
    content: [
      {
        heading: "The Intolerance for Error",
        paragraphs: [
          "In the hierarchy of classical cordwaining, the wholecut oxford occupies a sacred station. When a pattern maker designs a standard oxford, seams along the quarter and cap provide opportunities to navigate minor grain variations or tension irregularities. With a wholecut, there is nowhere to hide.",
          "To cut a single wholecut upper, an artisan must inspect an entire hide under raking natural light. If there is a single bug bite, stretch mark, or micro-scar across the 24 square inches needed for the pattern, the hide cannot be used for that shoe. Only the top two percent of full-grain skins qualify."
        ],
        quote: "A wholecut is not merely a shoe; it is an uninterrupted line of intention pulled over wood."
      },
      {
        heading: "Pulling Wood into Form",
        paragraphs: [
          "The lasting process for a wholecut is intensely physical. Using lasting pliers and brass tacks, the leather must be wet-stretched three-dimensionally over the wooden last. Because the leather must curve around the heel, hug the waist, and wrap across the instep without creasing, the artisan's fingers must sense every micro-ounce of tensile resistance.",
          "It takes years of muscle memory to know precisely how hard to pull without tearing the grain. Once tacked, the shoe rests on the last for up to two weeks, allowing the leather fibers to memorize the exact curves of the wooden anatomy."
        ],
        subImage: "/images/craft-artisan-hands.jpg",
        subImageCaption: "Hand-stitching the Goodyear welt with pure waxed Irish linen thread at the Lagos atelier."
      },
      {
        heading: "The Mirror Glacage",
        paragraphs: [
          "Once assembled and bottomed with oak-bark tanned leather, the piece undergoes our signature glacage. Layer by layer, pigmented natural beeswax is applied with ice water in circular, meditative motions until the toe reflects light like obsidian glass. The result is a piece that commands silent reverence wherever it steps."
        ]
      }
    ]
  },
  {
    id: "art-shaping-the-nigerian-last",
    slug: "shaping-the-nigerian-last",
    title: "Shaping the Nigerian Last: Modern African Luxury and Heritage Cobblery",
    subtitle: "How traditional West African anatomical proportions and contemporary international tailoring converge at our workbench.",
    category: "Philosophy",
    publishedDate: "November 28, 2025",
    readTime: "6 min read",
    heroImage: "/images/craft-workshop-lasts.jpg",
    excerpt: "Shoe lasts historically carved in Northampton or Florence were never designed around West African foot morphology. Nelson Atelier is quietly writing a new chapter.",
    author: {
      name: "Nelson Atelier",
      role: "Creative Direction"
    },
    content: [
      {
        heading: "The Anatomy of Fit",
        paragraphs: [
          "Every great shoe begins with a block of wood called a last. For centuries, European lasts have dominated luxury shoemaking, built around distinct anatomical conventions: narrower waistlines, flatter arches, or compressed insteps.",
          "However, Nigerian and broader African gentlemen often possess slightly broader metatarsals, higher insteps, and powerful heel arches. For too long, luxury clients in Lagos, Abuja, London, and Atlanta had to endure uncomfortable break-in periods or sizing up to accommodate instep height."
        ],
        quote: "True luxury is not about forcing the foot into European convention; it is about honouring the foot's natural majesty."
      },
      {
        heading: "Carving our Proprietary Silhouette",
        paragraphs: [
          "At Nelson Shoes, our proprietary lasts are hand-sculpted in beechwood. We engineered a sleek, elongated chiselled toe that provides the razor-sharp aesthetic of Mayfair or Milan, while giving generous volume across the ball and instep.",
          "The consequence is immediate: our shoes feel broken-in from the very first stride, grounding the wearer with effortless confidence."
        ],
        subImage: "/images/product-chelsea-boot.jpg",
        subImageCaption: "The Savannah Chelsea: sculpted volume with an aggressive bevelled waist."
      }
    ]
  },
  {
    id: "art-art-of-patina-beeswax",
    slug: "meditative-art-of-patina-finishing",
    title: "Mirror Glacage: The Meditative Art of Patina & Beeswax Finishing",
    subtitle: "Understanding why true hand-burnished finishing can never be replicated by spray guns or factory machines.",
    category: "The Process",
    publishedDate: "January 19, 2026",
    readTime: "4 min read",
    heroImage: "/images/product-monkstrap-espresso.jpg",
    excerpt: "The depth of color on a luxury shoe is not a coat of paint. It is a living graduation of pigments, alcohol dyes, and natural waxes.",
    author: {
      name: "Nelson Atelier",
      role: "Master Colorist"
    },
    content: [
      {
        heading: "The Dialect of Color",
        paragraphs: [
          "When crust leather arrives from the tannery, it is essentially a blank canvas—undyed, raw, and thirsty. In our workshop, color is built up in transparent glazes. An espresso wholecut is never just dark brown; it is an undertone of burnt umber, a vein of deep mahogany, and an edge of midnight obsidian.",
          "Using alcohol-based dyes applied with sheepskin wool daubers, we hand-brush layers that penetrate deep into the pores rather than sitting on top."
        ],
        quote: "Like fine wine and great jazz, bespoke patina only reveals its secrets to those who look closely."
      }
    ]
  }
];

export function getArticleBySlug(slug: string): JournalArticle | undefined {
  return JOURNAL_ARTICLES.find(a => a.slug === slug);
}
