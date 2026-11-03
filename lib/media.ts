/**
 * One place for every photo on the public site.
 *
 * Swap a path here and it changes everywhere. Photos edited from the Admin
 * Portal (CMS imageUrl fields) always take priority over these defaults.
 *
 * For crisp results on large and retina screens:
 *   full-bleed / hero photos  -> at least 2400px wide (3200px is ideal), JPG quality 85+
 *   split / half-width photos -> at least 1600px wide
 *   portraits                 -> at least 900 x 1200px
 * next/image converts them to AVIF/WebP and serves the right size per device,
 * so large originals do not slow the site down.
 */
export const IMG = {
  tea: "/images/sectors/agriculture-1.jpg",
  tourism: "/images/sectors/tourism.jpg",
  energy: "/images/sectors/energy1.jpg",
  realEstate: "/images/sectors/real-estate.jpg",
  infrastructure: "/images/sectors/infrastructure.jpg",
  finance: "/images/sectors/finance.jpg",
  education: "/images/sectors/education.jpg",
  map:"/images/sectors/map.jpg",
  ict: "/images/sectors/ICT.jpg",
  conference: "/images/sectors/conference.jpg",
  business: "/images/sectors/business.jpg",
  aboutHero: "/images/hero/about-us-hero.jpeg",
  opening: "/images/events/opening-ceremony.jpg",
  panel: "/images/events/panel-discussion.jpg",
  tradeFair: "/images/sectors/tradefair.jpg",
  tradeFair2: "/images/sectors/tradefair2.jpg",
  tradeFair3: "/images/sectors/tradefair3.jpg",
  meruCounty: "/images/sections/meru-county.png",
  tripartite: "/images/sections/about-tripartite.png",
  program: "/images/sectors/program.jpg",
  /** Transparent, trimmed versions of the logos live in /logos/clean. */
  logo: "/logos/clean/meru-invest.png",
} as const;

export type Slide = { src: string; caption: string };


export const HERO_SLIDES: Slide[] = [
  { src: IMG.energy, caption: "Tea slopes of Meru" },
  { src: IMG.infrastructure, caption: "The trade fair floor" },
  { src: IMG.finance, caption: "The conversation" },
  { src: IMG.tea, caption: "The opening" },
  { src: IMG.aboutHero, caption: "Three partners, one vision" },
];


export const FALLBACK_POOL = [IMG.business, IMG.conference, IMG.tradeFair2, IMG.business, IMG.aboutHero, IMG.meruCounty];
export const fallbackImage = (i: number) => FALLBACK_POOL[((i % FALLBACK_POOL.length) + FALLBACK_POOL.length) % FALLBACK_POOL.length];


export const PAGE_HERO: Record<string, string> = {
  about: IMG.aboutHero,
  "investment-opportunities": IMG.tea,
  "trade-fair": IMG.tradeFair,
  "conference-programme": IMG.panel,
  "sponsors-partners": IMG.opening,
  news: IMG.panel,
  faq: IMG.meruCounty,
  contact: IMG.aboutHero,
};
export const AUTH_PHOTOS = {
  login: "/images/sectors/conference.jpg",          
  register: "/images/sectors/tradefair.jpg", 
  password: "/images/sectors/energy.jpg",          
};
