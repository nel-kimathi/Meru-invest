import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { DEFAULT_NEWS, DEFAULT_PAGES } from "@/lib/default-content";
import { PUBLIC_REVALIDATE_SECONDS, TAGS } from "@/lib/cache-tags";

/* -------------------------------------------------------------------------- */
/* Raw queries (uncached; kept for scripts and admin use)                     */
/* -------------------------------------------------------------------------- */

export const getPage = cache(async (slug: string) => {
  try {
    return await prisma.page.findUnique({
      where: { slug },
      include: { sections: { orderBy: { order: "asc" } } },
    });
  } catch {
    return null;
  }
});

export type PageWithSections = NonNullable<Awaited<ReturnType<typeof getPage>>>;
export type PageSection = PageWithSections["sections"][number];

/* -------------------------------------------------------------------------- */
/* Public-site readers: cached across requests, tagged for instant refresh    */
/* -------------------------------------------------------------------------- */

export type Meta = Record<string, any>;

/** A CMS section in the shape the public components use. */
export type Block = {
  key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  meta: Meta;
};

const toBlock = (s: {
  key: string;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  metadata?: unknown;
}): Block => ({
  key: s.key,
  title: s.title ?? null,
  subtitle: s.subtitle ?? null,
  body: s.body ?? null,
  imageUrl: s.imageUrl ?? null,
  meta: ((s.metadata as Meta | null) ?? {}) as Meta,
});

/*
 * Cached loaders let database errors throw. A failed query is therefore never
 * cached, and the public wrappers below fall back to default content for that
 * one request only.
 */
const loadBlocks = unstable_cache(
  async (slug: string): Promise<Block[] | null> => {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: { sections: { orderBy: { order: "asc" } } },
    });
    return page ? page.sections.map(toBlock) : null;
  },
  ["public-blocks"],
  { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [TAGS.cms] },
);

const fallbackBlocks = (slug: string) => {
  const p = DEFAULT_PAGES.find((x) => x.slug === slug);
  return p ? [...p.sections].sort((a, b) => a.order - b.order).map(toBlock) : [];
};

/** Sections for a page: database first, defaults if the page is missing or the DB is down. */
export const getBlocks = cache(async (slug: string): Promise<Block[]> => {
  try {
    const blocks = await loadBlocks(slug);
    if (blocks?.length) return blocks;
  } catch (e) {
    console.warn(`[content] using default content for "${slug}":`, (e as Error).message);
  }
  return fallbackBlocks(slug);
});

export const pick = (blocks: Block[], key: string) => blocks.find((b) => b.key === key);

export type NewsCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  /** ISO string (cached data is serialised as JSON). */
  publishedAt: string | null;
};

const loadNews = unstable_cache(
  async (): Promise<NewsCard[]> => {
    const rows = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true, category: true, publishedAt: true },
    });
    return rows.map((n) => ({ ...n, publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null }));
  },
  ["public-news"],
  { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [TAGS.news] },
);

/** Published news; sample articles only if the database is unreachable. */
export const getNewsCards = cache(async (): Promise<NewsCard[]> => {
  try {
    return await loadNews();
  } catch (e) {
    console.warn("[content] using sample news:", (e as Error).message);
    return DEFAULT_NEWS.map((n) => ({ ...n, id: n.slug, coverImage: null, publishedAt: n.publishedAt.toISOString() }));
  }
});

export const getNewsCard = cache(async (slug: string): Promise<NewsCard | null> => {
  const all = await getNewsCards();
  return all.find((n) => n.slug === slug) ?? null;
});

/** Formats an ISO date for display, e.g. "20 October 2026". */
export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" }) : null;
