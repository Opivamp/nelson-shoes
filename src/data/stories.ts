export interface StorySlide {
  id: string;
  image: string;
  headline: string;
  description: string;
  tag: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface AtelierStory {
  id: string;
  title: string;
  author: string;
  avatar: string;
  seen: boolean;
  slides: StorySlide[];
}

export const ATELIER_STORIES: AtelierStory[] = [
  {
    id: 'story-lasting',
    title: 'The Lasting',
    author: 'Nelson Atelier',
    avatar: '/images/anatomy-01-last.jpg',
    seen: false,
    slides: [
      {
        id: 's1-1',
        image: '/images/anatomy-01-last.jpg',
        headline: 'Sculpting The Wooden Last',
        description: 'Every bespoke masterpiece begins with a wooden last hand-carved to mirror the patron’s unique foot contours.',
        tag: 'STAGE 01',
        ctaText: 'Explore Bespoke Lasting',
        ctaLink: '/bespoke'
      },
      {
        id: 's1-2',
        image: '/images/anatomy-02-upper.jpg',
        headline: 'Tension & Alignment',
        description: 'Leather is pulled over the last with artisanal pincers and nailed under calibrated tension for flawless balance.',
        tag: 'CRAFT',
        ctaText: 'View The Craft',
        ctaLink: '/craft'
      }
    ]
  },
  {
    id: 'story-leather',
    title: 'French Box Calf',
    author: 'Leather Atelier',
    avatar: '/images/anatomy-02-upper.jpg',
    seen: false,
    slides: [
      {
        id: 's2-1',
        image: '/images/anatomy-02-upper.jpg',
        headline: 'Grade-A French Calfskin',
        description: 'Sourced from the historic tanneries of Puy-en-Velay. Supple, tight-pored, and designed to age with sublime patina.',
        tag: 'MATERIALS',
        ctaText: 'Discover Collection',
        ctaLink: '/collection'
      }
    ]
  },
  {
    id: 'story-welting',
    title: 'Hand Welt',
    author: 'Workbench',
    avatar: '/images/anatomy-03-welt.jpg',
    seen: false,
    slides: [
      {
        id: 's3-1',
        image: '/images/anatomy-03-welt.jpg',
        headline: 'Goodyear & Blake Welt',
        description: 'Stitched by hand through a 6mm leather rib using double-waxed braided hemp thread for waterproof longevity.',
        tag: 'CONSTRUCTION',
        ctaText: 'See Welt Anatomy',
        ctaLink: '/craft'
      }
    ]
  },
  {
    id: 'story-glacage',
    title: 'Patina Glacage',
    author: 'Master Nelson',
    avatar: '/images/anatomy-05-masterpiece.jpg',
    seen: false,
    slides: [
      {
        id: 's4-1',
        image: '/images/anatomy-05-masterpiece.jpg',
        headline: 'Mirror Glacage Finish',
        description: 'Ten thin layers of natural beeswax and ice-cold water burnished by hand until the toe box reflects light like obsidian glass.',
        tag: 'FINISHING',
        ctaText: 'Commission A Pair',
        ctaLink: '/collection'
      }
    ]
  },
  {
    id: 'story-soles',
    title: 'Oak Bark Soles',
    author: 'Soling Bench',
    avatar: '/images/anatomy-04-sole.jpg',
    seen: false,
    slides: [
      {
        id: 's5-1',
        image: '/images/anatomy-04-sole.jpg',
        headline: '14-Month Oak Bark Bath',
        description: 'Our soles rest for 14 months in natural oak and chestnut bark baths. Lightweight, shock-absorbent, and resolable for decades.',
        tag: 'DURABILITY',
        ctaText: 'Track Your Commission',
        ctaLink: '/track'
      }
    ]
  }
];
