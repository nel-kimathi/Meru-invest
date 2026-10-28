import type { Metadata } from "next";
import { getBlocks, pick } from "@/lib/content";
import { MERU_FACTS, visualFor } from "@/lib/event";
import { SectorArt } from "@/components/site/sector-art";
import { IMG } from "@/lib/media";
import { clean, pad2 } from "@/lib/text";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Btn, Container, Odometer, SectionHead } from "@/components/site/primitives";
import { ScrollSpy } from "@/components/site/scroll-spy";
import { CtaBand } from "@/components/site/cta-band";
import { SectionRenderer } from "@/components/public/sections";

export const revalidate = 300; // cached page, refreshed in the background (admin saves refresh it at once)
export const metadata: Metadata = { title: "Investment Opportunities" };

type Card = { title: string; description?: string; image?: string };
const SHAPES = ["shape-leaf", "shape-arch", "shape-tab", "shape-leaf-alt"];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default async function InvestmentPage() {
  const blocks = await getBlocks("investment-opportunities");
  const hero = pick(blocks, "hero");
  const sectors = pick(blocks, "sectors");
  const cta = pick(blocks, "cta");
  const cards: Card[] = sectors?.meta.cards ?? [];
  const index = cards.map((c) => ({ id: `sector-${slugify(c.title)}`, label: clean(c.title).replace(/ &.*$/, "") }));

  return (
    <>
      <PageHero
        variant="split"
        title={clean(hero?.title) || "Investment opportunities"}
        subtitle={clean(hero?.subtitle)}
        eyebrow="Invest in Meru"
        image={hero?.imageUrl || IMG.tea}
        image2={IMG.tradeFair}
        crumb="Investment Opportunities"
      >
        <div className="flex flex-wrap gap-3">
          <Btn href="#sectors">Explore sectors</Btn>
          <Btn href="/register" variant="ghost-light">Register as an investor</Btn>
        </div>
      </PageHero>

      {/* Facts strip */}
      <section className="bg-white py-16">
        <Container className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MERU_FACTS.map((f, i) => (
            <div key={f.label} data-reveal="up" style={{ ["--d" as string]: `${i * 90}ms` }} className="rounded-[2rem] bg-mint p-7">
              <Odometer value={f.value} prefix={f.prefix} suffix={f.suffix} delay={i * 120} className="font-display text-7xl leading-none text-ink" />
              <p className="mt-2 font-semibold text-brand">{f.label}</p>
              <p className="text-sm text-ink/60">{f.note}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Sectors with sticky index */}
      <section id="sectors" className="scroll-mt-24 bg-white pb-28 pt-12 lg:pb-36">
        <Container>
          <SectionHead eyebrow="Priority sectors" title={clean(sectors?.title) || "Priority sectors"} intro="Each sector below has live projects and partners ready to meet investors during the conference." />
          <div className="mt-16 grid gap-12 lg:grid-cols-[300px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <ScrollSpy items={index} />
                <Btn href="/register" variant="gold" className="mt-6 w-full">Request project briefs</Btn>
              </div>
            </aside>
            <div className="space-y-6">
              {cards.map((c, i) => {
                const flip = i % 2 === 1;
                return (
                  <article
                    key={c.title}
                    id={index[i].id}
                    className={cn("group grid scroll-mt-28 items-center gap-8 overflow-hidden rounded-[2.5rem] p-4 md:grid-cols-[1fr_1.1fr] md:p-5", i % 3 === 1 ? "bg-forest text-white" : i % 3 === 2 ? "bg-sand" : "bg-mint")}
                  >
                    <div className={cn(flip && "md:order-2")} data-reveal="clip">
                      {(() => {
                        const v = visualFor(c.title);
                        const src = c.image || v.image;
                        return src ? (
                          <Photo src={src} alt={clean(c.title)} sizes="(min-width:1024px) 34vw, 100vw" parallax={0.06} className={cn("aspect-[5/4] w-full", SHAPES[i % SHAPES.length])} />
                        ) : (
                          <div className={cn("relative aspect-[5/4] w-full overflow-hidden", SHAPES[i % SHAPES.length])}>
                            <SectorArt sector={v} index={i} />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="px-3 pb-6 md:px-6 md:py-6" data-reveal="up">
                      <p className={cn("font-display text-3xl", i % 3 === 1 ? "text-gold" : "text-brand")}>{pad2(i + 1)}</p>
                      <h3 className="mt-3 font-display text-[clamp(40px,4vw,64px)] leading-[.92]">{clean(c.title)}</h3>
                      {c.description ? <p className={cn("mt-5 text-lg leading-relaxed", i % 3 === 1 ? "text-white/75" : "text-ink/75")}>{clean(c.description)}</p> : null}
                      <div className="mt-8">
                        <Btn href="/register" variant={i % 3 === 1 ? "gold" : "forest"}>Request the brief</Btn>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {blocks.filter((b) => !["hero", "sectors", "cta"].includes(b.key)).map((b, i) => (
        <SectionRenderer key={b.key + i} block={b} slug="investment-opportunities" index={i} />
      ))}

      <CtaBand block={cta} image={IMG.panel} eyebrow="Investment desk" />
    </>
  );
}
