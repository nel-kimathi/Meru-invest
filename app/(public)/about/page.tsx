import type { Metadata } from "next";
import Image from "next/image";
import { getBlocks, pick } from "@/lib/content";
import { PARTNERS } from "@/lib/event";
import { IMG } from "@/lib/media";
import { clean, paragraphs } from "@/lib/text";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Container, SectionHead, Words } from "@/components/site/primitives";
import { SpinBadge } from "@/components/site/spin-badge";
import { CommitteeGrid, type Member } from "@/components/site/committee-grid";
import { CtaBand } from "@/components/site/cta-band";
import { SectionRenderer } from "@/components/public/sections";

export const revalidate = 300; // cached page, refreshed in the background (admin saves refresh it at once)
export const metadata: Metadata = { title: "About MIICCOF" };

const PLACED = ["hero", "body", "mission", "leadership", "committee"];

export default async function AboutPage() {
  const blocks = await getBlocks("about");
  const hero = pick(blocks, "hero");
  const story = pick(blocks, "body");
  const mission = pick(blocks, "mission");
  const leadership = pick(blocks, "leadership");
  const committee = pick(blocks, "committee");
  const paras = paragraphs(story?.body);
  const mv: { title: string; description?: string }[] = mission?.meta.cards ?? [];
  const leaders: Member[] = leadership?.meta.cards ?? [];
  const members: Member[] = committee?.meta.cards ?? [];

  return (
    <>
      <PageHero
        title={clean(hero?.title) || "About MIICCOF"}
        subtitle={clean(hero?.subtitle)}
        eyebrow="Our story"
        image={hero?.imageUrl || IMG.aboutHero}
        crumb="About"
      />

      {/* Story: 45 / 55 split */}
      <section className="bg-white py-28 lg:py-36">
        <Container className="grid items-center gap-16 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative mx-auto w-full max-w-[520px]" data-reveal="up">
            <div className="shape-circle relative grid w-full place-items-center bg-white p-[10%] shadow-[0_40px_80px_-40px_rgba(13,34,64,.45)] ring-[14px] ring-sand">
              <Photo src={story?.imageUrl || IMG.tripartite} alt="The MIICCOF tripartite partnership" tone="light" sizes="(min-width:1024px) 36vw, 90vw" className="aspect-square w-full bg-transparent" imgClassName="object-contain" />
            </div>
            <SpinBadge tone="gold" uid="about" text="Business  /  Research  /  Government  /  " className="absolute -bottom-4 -right-2 size-36" />
          </div>
          <div>
            <p className="eyebrow eyebrow-brand" data-reveal="up">{clean(story?.title) || "Our story"}</p>
            <Words as="h2" text={paras[0] || "Three institutions. One vision."} className="display-lg mt-5 text-ink" />
            <div className="mt-8 columns-1 gap-10 space-y-5 text-lg leading-relaxed text-ink/75 md:columns-2">
              {paras.slice(1).map((p, i) => (
                <p key={i} data-reveal="up" className="break-inside-avoid">{p}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Three pillars: light surface so partner logos show exactly as designed */}
      <section className="bg-mint py-24">
        <Container>
          <SectionHead eyebrow="The partnership" title="One platform. Three pillars." size="md" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PARTNERS.map((p, i) => (
              <a key={p.name} href={p.href} target="_blank" rel="noreferrer" data-reveal="up" style={{ ["--d" as string]: `${i * 120}ms` }} className="group flex flex-col py-4 transition duration-500 hover:-translate-y-1">
                <Image src={p.logo} alt={p.name} width={200} height={140} className="h-24 w-auto self-start object-contain" />
                <p className="mt-10 font-display text-6xl leading-none text-brand">{p.pillar}</p>
                <p className="mt-2 text-ink/65">{p.name}</p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* Mission & Vision: two full-height photo halves */}
      {mv.length ? (
        <section className="grid md:grid-cols-2">
          {mv.slice(0, 2).map((c, i) => (
            <div key={c.title} className="group relative isolate flex min-h-[620px] items-end overflow-hidden text-white">
              <Photo src={i === 0 ? IMG.opening : IMG.panel} alt="" sizes="50vw" parallax={0.1} className="absolute inset-0 -z-10" />
              <div className={cn("absolute inset-0 -z-10 bg-gradient-to-t to-transparent", i === 0 ? "from-brand-deep via-brand-deep/70" : "from-forest via-forest/70")} />
              <div className="p-8 md:p-12 lg:p-16">
                <p className="eyebrow">{i === 0 ? "Why we exist" : "Where we are going"}</p>
                <h2 className="display-lg mt-3">{clean(c.title)}</h2>
                <p className="mt-5 max-w-md text-xl leading-relaxed text-white/85">{clean(c.description)}</p>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {/* Leadership: alternating 40 / 60 rows */}
      {leaders.length ? (
        <section id="leadership" className="scroll-mt-24 bg-white py-28 lg:py-36">
          <Container>
            <SectionHead eyebrow="Leadership" title={clean(leadership?.title) || "Our leadership"} intro={clean(leadership?.subtitle)} />
            <div className="mt-20 space-y-24 lg:space-y-32">
              {leaders.map((l, i) => {
                const flip = i % 2 === 1;
                return (
                  <article key={l.title} className={cn("grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20", flip && "lg:[&>*:first-child]:order-2")}>
                    <div data-reveal={flip ? "right" : "left"} className="relative mx-auto w-full max-w-[440px]">
                      <div className={cn("absolute -z-0 rounded-[2.5rem]", flip ? "-left-6 -top-6 bottom-12 right-12 bg-sand" : "-right-6 -top-6 bottom-12 left-12 bg-mint")} />
                      <Photo
                        src={l.image || IMG.panel}
                        alt={l.title}
                        tone={(l as { imageBg?: string }).imageBg === "white" ? "light" : "dark"}
                        sizes="(min-width:1024px) 34vw, 90vw"
                        className={cn("relative aspect-[4/5] w-full", ["shape-arch", "shape-leaf", "shape-tab"][i % 3], (l as { imageBg?: string }).imageBg === "white" && "bg-white")}
                        imgClassName={(l as { imageBg?: string }).imageBg === "white" ? "object-contain object-bottom" : "object-top"}
                      />
                    </div>
                    <div data-reveal="up">
                      <p className="font-display text-2xl text-brand">0{i + 1}</p>
                      <h3 className="display-md mt-2 text-ink">{l.title}</h3>
                      <p className="mt-3 text-lg font-semibold text-gold">{clean(l.role)}</p>
                      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">{clean(l.description)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Committee */}
      {members.length ? (
        <section id="organising" className="scroll-mt-24 bg-sand py-28 lg:py-36">
          <Container>
            <div className="grid items-end gap-6 lg:grid-cols-[1.3fr_1fr]">
              <SectionHead eyebrow="Organising committee" title={clean(committee?.title) || "Organising committee"} />
              <p data-reveal="up" className="max-w-md text-lg text-ink/70 lg:justify-self-end">{clean(committee?.subtitle)}. Filter by institution, hover a card for their role.</p>
            </div>
            <div className="mt-12">
              <CommitteeGrid members={members.map((m) => ({ ...m, title: m.title, role: clean(m.role), description: clean(m.description) }))} />
            </div>
          </Container>
        </section>
      ) : null}

      {blocks.filter((b) => !PLACED.includes(b.key)).map((b, i) => (
        <SectionRenderer key={b.key + i} block={b} slug="about" index={i} />
      ))}

      <CtaBand
        title="Join the partnership on the floor."
        body="Register as a delegate, exhibitor or sponsor and be part of Meru's first tripartite investment conference."
        image={IMG.tradeFair}
        cta={[{ label: "Register now", href: "/register" }, { label: "Sponsorship packages", href: "/sponsors-partners" }]}
      />
    </>
  );
}
