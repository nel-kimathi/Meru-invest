import type { Block } from "@/lib/content";
import { clean, paragraphs, pad2 } from "@/lib/text";
import { fallbackImage, PAGE_HERO, IMG } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Photo } from "@/components/site/photo";
import { PageHero } from "@/components/site/page-hero";
import { Container, SectionHead } from "@/components/site/primitives";
import { CtaBand } from "@/components/site/cta-band";
import { CursorList } from "@/components/site/cursor-list";
import { FaqAccordion } from "@/components/site/faq-accordion";

/**
 * Generic renderers for any CMS section, used when a page has a section the
 * page layout does not place itself (e.g. an editor adds a new section).
 */

type Card = { title: string; role?: string; description?: string; image?: string };

function HeroSection({ block, slug }: { block: Block; slug: string }) {
  return (
    <PageHero
      title={clean(block.title) || "Meru Invest"}
      subtitle={clean(block.subtitle) || clean(block.body)}
      image={block.imageUrl || PAGE_HERO[slug] || IMG.tea}
      crumb={clean(block.title) || "Page"}
    />
  );
}

function RichSection({ block, index }: { block: Block; index: number }) {
  const paras = paragraphs(block.body);
  const flip = index % 2 === 1;
  if (!block.imageUrl) {
    return (
      <section className="bg-white py-24 lg:py-32">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          {block.title ? <SectionHead title={clean(block.title)} size="md" /> : <span />}
          <div className="space-y-5 text-lg leading-relaxed text-ink/75">
            {paras.map((p, i) => (
              <p key={i} data-reveal="up" className={i === 0 ? "text-2xl text-ink" : undefined}>{p}</p>
            ))}
          </div>
        </Container>
      </section>
    );
  }
  return (
    <section className="bg-white py-24 lg:py-32">
      <Container className={cn("grid items-center gap-14 lg:grid-cols-[1fr_1.2fr]", flip && "lg:[&>*:first-child]:order-2")}>
        <div data-reveal="clip">
          <Photo src={block.imageUrl} alt={clean(block.title)} sizes="(min-width:1024px) 45vw, 100vw" className={cn("aspect-[4/5] w-full", flip ? "shape-leaf-alt" : "shape-leaf")} />
        </div>
        <div>
          {block.title ? <SectionHead title={clean(block.title)} size="md" /> : null}
          <div className="mt-6 space-y-5 leading-relaxed text-ink/75">
            {paras.map((p, i) => <p key={i} data-reveal="up">{p}</p>)}
          </div>
        </div>
      </Container>
    </section>
  );
}

function CardsSection({ block }: { block: Block }) {
  const cards: Card[] = block.meta.cards ?? [];
  return (
    <section className="bg-mint py-24 lg:py-32">
      <Container>
        <SectionHead title={clean(block.title) || "Highlights"} intro={clean(block.subtitle)} size="md" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <article key={c.title + i} data-reveal="up" style={{ ["--d" as string]: `${i * 80}ms` }} className="group overflow-hidden rounded-[2rem] bg-white">
              <Photo src={c.image || fallbackImage(i)} alt="" sizes="(min-width:1024px) 30vw, 100vw" className="aspect-[16/10] transition duration-700 group-hover:brightness-105" />
              <div className="p-7">
                <span className="font-display text-2xl text-brand">{pad2(i + 1)}</span>
                <h3 className="mt-2 font-display text-4xl leading-none text-ink">{clean(c.title)}</h3>
                {c.description ? <p className="mt-3 text-ink/70">{clean(c.description)}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function EventsSection({ block }: { block: Block }) {
  const events: { title: string; time?: string; description?: string; image?: string }[] = block.meta.events ?? [];
  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <SectionHead title={clean(block.title) || "Programme"} intro={clean(block.body) || clean(block.subtitle)} size="md" />
        <div className="mt-12">
          <CursorList items={events.map((e, i) => ({ title: clean(e.title), meta: clean(e.time), text: clean(e.description), image: e.image || fallbackImage(i) }))} />
        </div>
      </Container>
    </section>
  );
}

function FaqSection({ block }: { block: Block }) {
  const items: { question: string; answer: string }[] = block.meta.items ?? [];
  return (
    <section className="bg-white py-24">
      <Container className="max-w-4xl">
        {block.title ? <SectionHead title={clean(block.title)} size="md" /> : null}
        <div className="mt-10">
          <FaqAccordion items={items.map((i) => ({ q: clean(i.question), a: clean(i.answer) }))} />
        </div>
      </Container>
    </section>
  );
}

export function SectionRenderer({ block, slug = "", index = 0 }: { block: Block; slug?: string; index?: number }) {
  switch (block.key) {
    case "hero":
      return <HeroSection block={block} slug={slug} />;
    case "cta":
      return <CtaBand block={block} />;
    case "schedule":
    case "events-preview":
      return <EventsSection block={block} />;
    case "items":
      return <FaqSection block={block} />;
    default:
      return block.meta.cards ? <CardsSection block={block} /> : <RichSection block={block} index={index} />;
  }
}
