/**
 * Tidies CMS copy for display: removes long dashes (em/en dashes) so the
 * public site never shows them, without editors having to change content.
 *   "25th–27th"        -> "25th to 27th"
 *   "Meru — a county"  -> "Meru, a county"
 */
export function clean(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/(\d[a-z]{0,2})\s*[–—]\s*(\d)/gi, "$1 to $2")
    .replace(/\s+[—–]\s+/g, ", ")
    .replace(/[—–]/g, ", ")
    .replace(/,\s*,/g, ",");
}

export function paragraphs(input?: string | null): string[] {
  return clean(input)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
