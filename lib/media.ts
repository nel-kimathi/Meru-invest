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
  tea: "/images/hero/tea-harvesting.jpeg",
  aboutHero: "/images/hero/about-us-hero.jpeg",
  opening: "/images/events/opening-ceremony.jpg",
  panel: "/images/events/panel-discussion.jpg",
  tradeFair: "/images/events/Trade Fair-exhibitions.jpg",
  meruCounty: "/images/sections/meru-county.png",
  tripartite: "/images/sections/about-tripartite.png",
  /** Transparent, trimmed versions of the logos live in /logos/clean. */
  logo: "/logos/clean/meru-invest.png",
} as const;

export type Slide = { src: string; caption: string };

/** Home hero WebGL slideshow. Add more slides by adding lines. */
export const HERO_SLIDES: Slide[] = [
  { src: IMG.tea, caption: "Tea slopes of Meru" },
  { src: IMG.tradeFair, caption: "The trade fair floor" },
  { src: IMG.panel, caption: "The conversation" },
  { src: IMG.opening, caption: "The opening" },
  { src: IMG.aboutHero, caption: "Three partners, one vision" },
];

/** Rotating fallbacks for cards that have no image of their own (e.g. news). */
export const FALLBACK_POOL = [IMG.panel, IMG.tradeFair, IMG.opening, IMG.tea, IMG.aboutHero, IMG.meruCounty];
export const fallbackImage = (i: number) => FALLBACK_POOL[((i % FALLBACK_POOL.length) + FALLBACK_POOL.length) % FALLBACK_POOL.length];

/** Per-page hero defaults (used when the CMS hero has no image). */
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
