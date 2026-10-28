import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Cache tags for public-site data. Readers in lib/content.ts,
 * lib/public-settings.ts and lib/floor-plan.ts tag their cached queries with
 * these; admin Server Actions call the refresh helpers after saving so the
 * public pages update straight away instead of waiting for the timer.
 */
export const TAGS = {
  cms: "cms",
  news: "news",
  settings: "settings",
  booths: "booths",
} as const;

/** How long cached public data may be reused before a background refresh. */
export const PUBLIC_REVALIDATE_SECONDS = 300;

const now = { expire: 0 }; // the editor expects to see their change on the next load

export function refreshNews(slug?: string) {
  revalidateTag(TAGS.news, now);
  revalidatePath("/news");
  if (slug) revalidatePath(`/news/${slug}`);
}

export function refreshSettings() {
  revalidateTag(TAGS.settings, now);
  revalidatePath("/", "layout");
}

export function refreshBooths() {
  revalidateTag(TAGS.booths, now);
  revalidatePath("/trade-fair");
}

export function refreshCms() {
  revalidateTag(TAGS.cms, now);
  revalidatePath("/", "layout");
}
