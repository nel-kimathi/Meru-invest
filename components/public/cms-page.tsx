import { getBlocks } from "@/lib/content";
import { SectionRenderer } from "@/components/public/sections";

/**
 * Renders any CMS-backed page with the generic redesigned section renderers.
 * Every section stays editable from the Administration Portal.
 */
export async function CmsPage({ slug }: { slug: string }) {
  const blocks = await getBlocks(slug);
  return (
    <>
      {blocks.map((b, i) => (
        <SectionRenderer key={b.key + i} block={b} slug={slug} index={i} />
      ))}
    </>
  );
}
