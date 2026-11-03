import { revalidatePath, revalidateTag } from "next/cache";


export const TAGS = {
  cms: "cms",
  news: "news",
  settings: "settings",
  booths: "booths",
} as const;


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
