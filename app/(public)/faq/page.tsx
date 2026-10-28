import type { Metadata } from "next";
import { getBlocks, pick } from "@/lib/content";
import { IMG } from "@/lib/media";
import { clean } from "@/lib/text";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Btn, Container } from "@/components/site/primitives";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { SectionRenderer } from "@/components/public/sections";

export const revalidate = 300; // cached page, refreshed in the background (admin saves refresh it at once)
export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const blocks = await getBlocks("faq");
  const hero = pick(blocks, "hero");
  const faqBlocks = blocks.filter((b) => b.key === "items");
  const items = faqBlocks.flatMap((b) => (b.meta.items ?? []) as { question: string; answer: string }[]);

  return (
    <>
      <PageHero
        variant="split"
        title={clean(hero?.title) || "Frequently asked questions"}
        subtitle={clean(hero?.subtitle)}
        eyebrow="Help centre"
        image={hero?.imageUrl || IMG.panel}
        image2={IMG.opening}
        crumb="FAQ"
      />

      <section className="bg-white py-24 lg:py-32">
        <Container className="grid gap-12 lg:grid-cols-[.75fr_1.5fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div data-reveal="clip">
              <Photo src={IMG.tradeFair} alt="" sizes="(min-width:1024px) 28vw, 100vw" className="shape-arch aspect-[4/5] w-full" />
            </div>
            <div className="mt-4 rounded-[2rem] bg-forest p-7 text-white" data-reveal="up">
              <p className="font-display text-4xl leading-none">Still have a question?</p>
              <p className="mt-3 text-white/70">The secretariat usually replies within one working day.</p>
              <Btn href="/contact" className="mt-6 w-full">Contact us</Btn>
            </div>
          </aside>
          <div>
            <FaqAccordion searchable items={items.map((i) => ({ q: clean(i.question), a: clean(i.answer) }))} />
          </div>
        </Container>
      </section>

      {blocks.filter((b) => !["hero", "items"].includes(b.key)).map((b, i) => (
        <SectionRenderer key={b.key + i} block={b} slug="faq" index={i} />
      ))}
    </>
  );
}
