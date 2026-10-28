import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getBlocks, pick } from "@/lib/content";
import { partnerLogos, sponsorshipSettings } from "@/lib/public-settings";
import { IMG } from "@/lib/media";
import { clean, pad2 } from "@/lib/text";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/site/page-hero";
import { Photo } from "@/components/site/photo";
import { Btn, Container, Odometer, SectionHead, Words } from "@/components/site/primitives";
import { LogoMarquee } from "@/components/site/marquee";
import { CtaBand } from "@/components/site/cta-band";
import { SectionRenderer } from "@/components/public/sections";

export const revalidate = 300; // cached page, refreshed in the background (admin saves refresh it at once)
export const metadata: Metadata = { title: "Sponsors & Partners" };

const TIER_STYLE = [
  "bg-gradient-to-br from-[#f3cf4a] via-gold to-[#a77d00] text-ink",
  "bg-gradient-to-br from-[#e9eef5] to-[#b9c6d8] text-ink",
  "bg-forest text-white",
  "bg-brand text-white",
  "bg-sand text-ink",
];

export default async function SponsorsPage() {
  const [blocks, settings, logos] = await Promise.all([getBlocks("sponsors-partners"), sponsorshipSettings(), partnerLogos()]);
  const hero = pick(blocks, "hero");
  const cta = pick(blocks, "cta");
  const tiers = settings.sponsorshipTiers;
  const slots = tiers.reduce((a, t) => a + (parseInt(t.slots, 10) || 0), 0);

  return (
    <>
      <PageHero
        title={clean(hero?.title) || "Sponsors & partners"}
        subtitle={clean(hero?.subtitle)}
        eyebrow="Partner with MIICCOF"
        image={hero?.imageUrl || IMG.opening}
        crumb="Sponsors & Partners"
      >
        <div className="flex flex-wrap gap-3">
          <Btn href="#packages">See packages</Btn>
          <Btn href="/register" variant="ghost-light">Register as a sponsor</Btn>
        </div>
      </PageHero>

      {/* Intro + numbers */}
      <section className="bg-white py-28 lg:py-32">
        <Container className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow eyebrow-brand" data-reveal="up">Why sponsor</p>
            <p data-reveal="up" className="mt-6 text-[clamp(22px,2.1vw,30px)] leading-[1.45] text-ink">{clean(settings.sponsorsIntro)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 self-end">
            <div data-reveal="up" className="rounded-[2rem] bg-forest p-7 text-white">
              <Odometer value={tiers.length} className="font-display text-8xl leading-none text-gold" />
              <p className="mt-2 text-white/70">Partnership tiers</p>
            </div>
            <div data-reveal="up" style={{ ["--d" as string]: "120ms" }} className="rounded-[2rem] bg-gold p-7 text-ink">
              <Odometer value={slots} className="font-display text-8xl leading-none" />
              <p className="mt-2 text-ink/75">Partner slots in total</p>
            </div>
            <div data-reveal="up" style={{ ["--d" as string]: "240ms" }} className="col-span-2 rounded-[2rem] bg-mint p-7">
              <Odometer value={3} className="font-display text-8xl leading-none text-ink" />
              <p className="mt-2 text-ink/70">Days of brand visibility on site, plus digital and media exposure before and after</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Packages bento */}
      <section id="packages" className="scroll-mt-24 bg-mint py-28 lg:py-32">
        <Container>
          <SectionHead eyebrow="Packages" title="Sponsorship packages" intro="Pick the visibility that fits your goals. Every package includes delegate passes and networking access." />
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((t, i) => (
              <article
                key={t.name}
                data-reveal="up"
                style={{ ["--d" as string]: `${i * 90}ms` }}
                className={cn(
                  "group relative flex min-h-[320px] flex-col overflow-hidden rounded-[2rem] p-8 transition duration-500 hover:-translate-y-2 hover:shadow-[0_40px_60px_-30px_rgba(13,34,64,.55)]",
                  TIER_STYLE[i % TIER_STYLE.length],
                  i === 0 && "lg:col-span-2 lg:row-span-2 lg:min-h-[520px] lg:p-12",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-bold uppercase tracking-[.18em]">{t.slots}</span>
                  <span className="font-display text-2xl opacity-60">{pad2(i + 1)}</span>
                </div>
                <h3 className={cn("mt-auto font-display leading-[.9]", i === 0 ? "text-[clamp(64px,7vw,120px)]" : "text-5xl")}>{t.name}</h3>
                <p className={cn("mt-3 font-display", i === 0 ? "text-5xl" : "text-3xl")}>{t.amount}</p>
                <p className="mt-2 opacity-75">{t.position}</p>
                <Link href="/register" className="link-arrow mt-6 w-fit font-semibold">
                  Enquire <ArrowUpRight className="size-4 transition group-hover:rotate-45" />
                </Link>
                {i === 0 ? <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/20" /> : null}
              </article>
            ))}
            <article
              data-reveal="up"
              className={cn(
                "group relative isolate flex min-h-[320px] flex-col overflow-hidden rounded-[2rem] p-8 text-white",
                ["lg:col-span-3", "lg:col-span-1", "lg:col-span-2"][(tiers.length + 3) % 3],
              )}
            >
              <Photo src={IMG.panel} alt="" sizes="(min-width:1024px) 40vw, 100vw" className="absolute inset-0 -z-10 transition duration-700 group-hover:brightness-110" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/70 to-forest/20" />
              <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[.18em]">Tailored</span>
              <h3 className="mt-auto font-display text-5xl leading-[.9]">Custom partnership</h3>
              <p className="mt-3 max-w-sm text-white/75">Session naming, activations, media or hospitality. Tell us what you want to achieve.</p>
              <Link href="/contact" className="link-arrow mt-6 w-fit font-semibold text-gold">
                Talk to us <ArrowUpRight className="size-4 transition group-hover:rotate-45" />
              </Link>
            </article>
          </div>
        </Container>
      </section>

      {/* Why partner: 40 / 60 split */}
      {settings.whyPartnerPoints.length ? (
        <section className="bg-white py-28 lg:py-36">
          <Container className="grid items-center gap-16 lg:grid-cols-[1fr_1.4fr]">
            <div className="relative" data-reveal="clip">
              <Photo src={IMG.panel} alt="" sizes="(min-width:1024px) 38vw, 100vw" parallax={0.08} className="shape-arch aspect-[4/5] w-full" />
            </div>
            <div>
              <p className="eyebrow eyebrow-brand" data-reveal="up">The return</p>
              <Words text="Why partner with us" className="display-lg mt-5 text-ink" />
              <ol className="mt-10 grid gap-3 sm:grid-cols-2">
                {settings.whyPartnerPoints.map((p, i) => (
                  <li key={i} data-reveal="up" style={{ ["--d" as string]: `${i * 70}ms` }} className="rounded-[1.75rem] bg-mint p-6 transition duration-500 hover:bg-forest hover:text-white">
                    <span className="font-display text-3xl text-brand">{pad2(i + 1)}</span>
                    <p className="mt-3 leading-relaxed">{clean(p)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      ) : null}

      <section className="overflow-hidden bg-sand py-24">
        <Container className="mb-12">
          <SectionHead eyebrow="Our partners" title="Organisations making MIICCOF possible." size="md" />
        </Container>
        <LogoMarquee logos={logos} />
      </section>

      {blocks.filter((b) => !["hero", "cta"].includes(b.key)).map((b, i) => (
        <SectionRenderer key={b.key + i} block={b} slug="sponsors-partners" index={i} />
      ))}

      <CtaBand block={cta} image={IMG.tradeFair} eyebrow="Partnerships" />
    </>
  );
}
