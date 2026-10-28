import type { Metadata } from "next";
import { getBlocks, pick } from "@/lib/content";
import { getFloorPlan } from "@/lib/floor-plan";
import { IMG } from "@/lib/media";
import { clean, paragraphs, pad2 } from "@/lib/text";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Btn, Container, SectionHead, Words } from "@/components/site/primitives";
import { CtaBand } from "@/components/site/cta-band";
import { WordMarquee } from "@/components/site/marquee";
import { FloorPlan3D } from "@/components/gl/lazy";
import { BoothDrop } from "@/components/site/booth-drop";
import { SectionRenderer } from "@/components/public/sections";

export const revalidate = 60; // booth availability: refreshed at least every minute (booth edits refresh it at once)
export const metadata: Metadata = { title: "Consumer Fair" };

type Card = { title: string; description?: string };

export default async function TradeFairPage() {
  const [blocks, plan] = await Promise.all([getBlocks("trade-fair"), getFloorPlan()]);
  const hero = pick(blocks, "hero");
  const body = pick(blocks, "body");
  const info = pick(blocks, "info");
  const cta = pick(blocks, "cta");
  const cards: Card[] = info?.meta.cards ?? [];
  const paras = paragraphs(body?.body);

  return (
    <>
      <PageHero
        title={clean(hero?.title) || "Consumer Fair & Exhibitions"}
        subtitle={clean(hero?.subtitle)}
        eyebrow="Exhibit, sell, connect"
        image={hero?.imageUrl || IMG.tradeFair}
        crumb="Consumer Fair"
      >
        <div className="flex flex-wrap gap-3">
          <Btn href="#floor-plan">Explore the floor plan</Btn>
          <Btn href="/register" variant="ghost-light">Register as an exhibitor</Btn>
        </div>
      </PageHero>

      {/* Body: 60 / 40 split with stacked photos */}
      <section className="overflow-hidden bg-white py-28 lg:py-36">
        <Container className="grid items-center gap-16 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow eyebrow-brand" data-reveal="up">The fair</p>
            <Words text={clean(body?.title) || "Exhibit at MIICCOF"} className="display-lg mt-5 text-ink" />
            <div className="mt-8 space-y-5 text-xl leading-relaxed text-ink/75">
              {paras.map((p, i) => <p key={i} data-reveal="up">{p}</p>)}
            </div>
            <div className="mt-10 flex flex-wrap gap-3" data-reveal="up">
              <Btn href="/register" variant="forest">Book your booth</Btn>
              <Btn href="/faq" variant="ghost-dark">Exhibitor FAQ</Btn>
            </div>
          </div>
          <div className="relative h-[560px]">
            <div className="absolute right-0 top-0 w-[72%]" data-reveal="clip">
              <Photo src={IMG.opening} alt="" sizes="(min-width:1024px) 28vw, 70vw" className="shape-arch aspect-[3/4] w-full" />
            </div>
            <div className="absolute bottom-0 left-0 w-[55%]" data-reveal="up" style={{ ["--d" as string]: "250ms" }}>
              <Photo src={IMG.panel} alt="" sizes="(min-width:1024px) 22vw, 55vw" className="shape-leaf aspect-square w-full ring-[10px] ring-white" />
            </div>
          </div>
        </Container>
      </section>

      <WordMarquee words={["Exhibit", "Sell", "Connect", "Grow"]} className="bg-gold text-ink" />

      {/* Info cards over a full-bleed photo */}
      {cards.length ? (
        <section className="relative isolate overflow-hidden py-28 text-white lg:py-36">
          <Photo src={IMG.tradeFair} alt="" sizes="100vw" quality={90} parallax={0.12} className="absolute inset-0 -z-10" />
          <div className="absolute inset-0 -z-10 bg-forest/75" />
          <Container>
            <SectionHead dark eyebrow="For exhibitors" title={clean(info?.title) || "Exhibitor information"} />
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {cards.map((c, i) => (
                <div key={c.title} data-reveal="up" style={{ ["--d" as string]: `${i * 120}ms` }} className="glass rounded-[2rem] p-8">
                  <span className="font-display text-3xl text-gold">{pad2(i + 1)}</span>
                  <h3 className="mt-10 font-display text-5xl leading-none">{clean(c.title)}</h3>
                  {c.description ? <p className="mt-4 text-white/75">{clean(c.description)}</p> : null}
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <BoothDrop floorPlanHref="#floor-plan" />

      {/* 3D floor plan */}
      <section id="floor-plan" className="scroll-mt-24 bg-mint py-28 lg:py-32">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-[1.3fr_1fr]">
            <SectionHead eyebrow="Floor plan" title="Walk the halls before you arrive." />
            <p data-reveal="up" className="max-w-md text-lg text-ink/70 lg:justify-self-end">
              {plan.live
                ? "Live availability from the booking system. Rotate the hall, filter by status and tap a booth."
                : "Sample layout. Live availability appears here as soon as halls and booths are added in Booth Management."}
            </p>
          </div>
          <div className="mt-12" data-reveal="up">
            <FloorPlan3D halls={plan.halls} />
          </div>
        </Container>
      </section>

      {blocks.filter((b) => !["hero", "body", "info", "cta"].includes(b.key)).map((b, i) => (
        <SectionRenderer key={b.key + i} block={b} slug="trade-fair" index={i} />
      ))}

      <CtaBand block={cta} image={IMG.opening} eyebrow="Exhibitors" />
    </>
  );
}
