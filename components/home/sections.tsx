import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Block } from "@/lib/content";
import { EVENT, MERU_FACTS, SECTORS } from "@/lib/event";
import { IMG, fallbackImage } from "@/lib/media";
import { clean, paragraphs, pad2 } from "@/lib/text";
import { cn } from "@/lib/utils";
import { Photo } from "@/components/site/photo";
import { Btn, Container, Odometer, SectionHead, Words } from "@/components/site/primitives";
import { ScrollExpand } from "@/components/site/scroll-expand";
import { SectorArt } from "@/components/site/sector-art";
import { CursorList } from "@/components/site/cursor-list";
import { PassCard } from "@/components/site/pass-card";
import { LogoMarquee, WordMarquee, type Logo } from "@/components/site/marquee";
import { GlobeExplorer } from "@/components/site/globe-explorer";
import { Deferred, SilkBackground, SpeakersStage } from "@/components/gl/lazy";
import type { Speaker } from "@/components/gl/speakers-stage";

/* -------------------------------------------------------------------------- */
/* Statement: 60/40 split, text left, layered shaped images right             */
/* -------------------------------------------------------------------------- */
export function Statement() {
  return (
    <section className="overflow-hidden bg-white pb-28 pt-40 lg:pb-36 lg:pt-44">
      <Container className="grid items-center gap-16 lg:grid-cols-[1.45fr_1fr]">
        <div>
          <p className="eyebrow eyebrow-brand" data-reveal="up">Why Meru, why now</p>
          <Words
            as="p"
            className="mt-6 font-display text-[clamp(40px,5.4vw,84px)] leading-[.98] text-ink"
            text="Business, research and government have never shared one stage in Meru. Now they do. Investors come to find opportunity. Innovators come to be found."
            accent={{ words: ["Investors", "come", "to", "find", "opportunity", "Innovators", "be", "found"], className: "text-brand" }}
          />
          <div className="mt-10 flex flex-wrap items-center gap-6" data-reveal="up">
            <Btn href="/about" variant="forest">Our story</Btn>
            <Link href="/investment-opportunities" className="link-arrow text-ink hover:text-brand">
              See the opportunities <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <div data-reveal="clip">
            <Photo src={IMG.opening} alt="Opening ceremony at MIICCOF" sizes="(min-width:1024px) 34vw, 90vw" parallax={0.08} className="shape-arch aspect-[4/5] w-[82%]" />
          </div>
          <div data-reveal="up" style={{ ["--d" as string]: "250ms" }} className="absolute -right-2 bottom-[-6%] w-[46%]">
            <Photo src={IMG.tea} alt="Tea farms on the slopes of Mount Kenya" sizes="240px" className="shape-circle w-full ring-[10px] ring-white" />
          </div>
          <div data-reveal="up" style={{ ["--d" as string]: "400ms" }} className="absolute -left-4 top-[12%] rounded-3xl bg-gold px-6 py-5 text-ink shadow-xl sm:-left-10">
            <p className="font-display text-6xl leading-none">3</p>
            <p className="text-sm font-semibold">days in Meru</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Sectors: expanding image panels                                            */
/* -------------------------------------------------------------------------- */
export function Sectors() {
  return (
    <section className="bg-sand py-28 lg:py-36">
      <Container>
        <div className="grid items-end gap-6 lg:grid-cols-[1.3fr_1fr]">
          <SectionHead eyebrow="Seven sectors" title="Seven sectors. One floor." />
          <p data-reveal="up" className="max-w-md text-lg text-ink/70 lg:justify-self-end">
            Hover a sector to open it. Every one of them has projects looking for partners and capital.
          </p>
        </div>

        {/* Desktop: accordion of tall photos */}
        <div className="group/panels mt-14 hidden h-[600px] gap-3 lg:flex" data-reveal="up">
          {SECTORS.map((s, i) => (
            <Link
              key={s.name}
              href="/investment-opportunities"
              className={cn(
                "group/panel relative flex-1 overflow-hidden rounded-[2rem] transition-[flex-grow] duration-700 ease-[cubic-bezier(.6,0,.2,1)] hover:flex-[5]",
                i === 0 && "flex-[5] group-hover/panels:flex-1 hover:!flex-[5]",
              )}
            >
              {s.image ? <Photo src={s.image} alt={s.name} sizes="(min-width:1024px) 55vw, 100vw" className="absolute inset-0" /> : <SectorArt sector={s} index={i} />}
              <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/30 to-transparent" />
              <span className="absolute left-6 top-6 font-display text-2xl text-gold">{pad2(i + 1)}</span>
              <span
                className={cn(
                  "absolute bottom-8 left-1/2 -translate-x-1/2 rotate-180 whitespace-nowrap font-display text-4xl [writing-mode:vertical-rl] text-white transition-opacity duration-300 group-hover/panel:!opacity-0",
                  i === 0 && "opacity-0 group-hover/panels:opacity-100",
                )}
              >
                {s.name}
              </span>
              <div
                className={cn(
                  "absolute inset-x-8 bottom-8 translate-y-6 opacity-0 transition duration-500 group-hover/panel:translate-y-0 group-hover/panel:opacity-100 group-hover/panel:delay-200",
                  i === 0 && "translate-y-0 opacity-100 group-hover/panels:translate-y-6 group-hover/panels:opacity-0",
                )}
              >
                <p className="font-display text-6xl leading-none text-white">{s.name}</p>
                <p className="mt-3 max-w-sm text-white/80">{s.blurb}</p>
                <span className="link-arrow mt-5 text-gold">
                  Explore opportunities <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile / tablet: swipe cards */}
        <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:hidden">
          {SECTORS.map((s, i) => (
            <Link key={s.name} href="/investment-opportunities" className="relative h-[460px] w-[78%] shrink-0 snap-start overflow-hidden rounded-[2rem] sm:w-[46%]">
              {s.image ? <Photo src={s.image} alt={s.name} sizes="80vw" className="absolute inset-0" /> : <SectorArt sector={s} index={i} />}
              <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/30 to-transparent" />
              <span className="absolute left-6 top-6 font-display text-2xl text-gold">{pad2(i + 1)}</span>
              <div className="absolute inset-x-6 bottom-6">
                <p className="font-display text-5xl leading-none text-white">{s.name}</p>
                <p className="mt-2 text-sm text-white/80">{s.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Leadership: 35/65 split, sticky title + staggered shaped portraits         */
/* -------------------------------------------------------------------------- */
type Card = { title: string; role?: string; description?: string; image?: string; imageBg?: string; org?: string };
const SHAPES = ["shape-arch", "shape-leaf", "shape-tab"];

export function Leadership({ block }: { block?: Block }) {
  const cards: Card[] = block?.meta.cards ?? [];
  if (!cards.length) return null;
  return (
    <section className="bg-white py-28 lg:py-36">
      <Container className="grid gap-14 lg:grid-cols-[.8fr_1.5fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHead eyebrow="Leadership" title={clean(block?.title) || "Our leadership"} intro={clean(block?.subtitle)} size="md" />
          <div className="mt-10" data-reveal="up">
            <Btn href="/about#leadership" variant="ghost-dark">Meet the team</Btn>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {cards.map((c, i) => (
            <article key={c.title} data-reveal="up" style={{ ["--d" as string]: `${i * 120}ms` }} className={cn("group", i === 1 && "sm:mt-20", i === 2 && "sm:mt-8")}>
              <div className="relative">
                <Photo
                  src={c.image || fallbackImage(i)}
                  alt={c.title}
                  tone={c.imageBg === "white" ? "light" : "dark"}
                  sizes="(min-width:1024px) 22vw, (min-width:640px) 30vw, 90vw"
                  className={cn("aspect-[3/4] w-full", SHAPES[i % SHAPES.length], c.imageBg === "white" && "bg-white")}
                  imgClassName={c.imageBg === "white" ? "object-contain object-bottom" : "object-top"}
                />
                {c.description ? (
                  <div className={cn("absolute inset-0 flex items-end bg-forest/85 p-6 opacity-0 transition duration-500 group-hover:opacity-100", SHAPES[i % SHAPES.length])}>
                    <p className="text-sm leading-relaxed text-white/90">{clean(c.description)}</p>
                  </div>
                ) : null}
              </div>
              <h3 className="mt-5 font-display text-3xl leading-none text-ink">{c.title}</h3>
              {c.role ? <p className="mt-1.5 text-sm font-semibold text-brand">{clean(c.role)}</p> : null}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Meru County: pinned photo that expands to full bleed on scroll             */
/* -------------------------------------------------------------------------- */
export function MeruReveal({ block }: { block?: Block }) {
  const paras = paragraphs(block?.body);
  return (
    <>
      <ScrollExpand className="bg-white" height="230vh">
        <div
          className="absolute inset-0"
          style={{ clipPath: "inset(calc((1 - var(--p)) * 14%) calc((1 - var(--p)) * 22%) round calc((1 - var(--p)) * 2.5rem))" }}
        >
          <Photo src={IMG.tea} alt="Tea farms on the slopes of Mount Kenya, Meru County" sizes="100vw" quality={90} className="absolute inset-0" />
          <div className="absolute inset-0 bg-forest/45" style={{ opacity: "calc(var(--p) * 1)" }} />
        </div>
        <Container className="relative flex h-full flex-col justify-center text-white">
          <div style={{ opacity: "var(--t)", transform: "translate3d(0, calc((1 - var(--t)) * 40px), 0)" }}>
            <p className="eyebrow">The land of prosperity</p>
            <h2 className="display-xl mt-4 max-w-5xl">{clean(block?.title) || "Meru County"}</h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">{paras[0]}</p>
          </div>
        </Container>
      </ScrollExpand>

      <section className="bg-white pb-28 pt-4">
        <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div data-reveal="up" className="relative">
            <Photo
              src={block?.imageUrl || IMG.meruCounty}
              alt="Map of Meru County"
              tone="light"
              sizes="(min-width:1024px) 42vw, 100vw"
              className="shape-leaf aspect-[1000/823] w-full bg-white shadow-[0_30px_60px_-30px_rgba(13,34,64,.35)]"
              imgClassName="object-contain"
            />
          </div>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {MERU_FACTS.map((f, i) => (
                <div key={f.label} data-reveal="up" style={{ ["--d" as string]: `${i * 100}ms` }} className={cn("rounded-[2rem] p-7", i === 0 ? "bg-forest text-white" : i === 3 ? "bg-gold text-ink" : "bg-mint text-ink")}>
                  <Odometer value={f.value} prefix={f.prefix} suffix={f.suffix} delay={i * 120} className="font-display text-[clamp(56px,5vw,84px)] leading-none" />
                  <p className={cn("mt-3 font-semibold", i === 0 ? "text-gold" : i === 3 ? "text-ink" : "text-brand")}>{f.label}</p>
                  <p className={cn("text-sm", i === 0 ? "text-white/60" : "text-ink/60")}>{f.note}</p>
                </div>
              ))}
            </div>
            {paras.slice(1).map((p, i) => (
              <p key={i} data-reveal="up" className="mt-6 leading-relaxed text-ink/75">{p}</p>
            ))}
            <div className="mt-8" data-reveal="up">
              <Btn href="/about" variant="forest">About Meru and MIICCOF</Btn>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Investment opportunities: 40/60 split with notched photo                   */
/* -------------------------------------------------------------------------- */
export function Opportunities({ block }: { block?: Block }) {
  const cards: Card[] = block?.meta.cards ?? [];
  const cta = block?.meta.cta as { label: string; href: string } | undefined;
  return (
    <section className="relative overflow-hidden bg-brand-deep py-28 text-white lg:py-36">
      <Container className="grid items-center gap-14 lg:grid-cols-[1fr_1.5fr]">
        <div className="relative">
          <div data-reveal="clip">
            <div>
              <Photo src={IMG.tradeFair} alt="Trade fair exhibitions" sizes="(min-width:1024px) 38vw, 100vw" parallax={0.1} className="shape-notch aspect-[4/5] w-full" />
            </div>
          </div>
          <div className="glass absolute -bottom-6 right-6 rounded-3xl px-6 py-5 text-white" data-reveal="up" style={{ ["--d" as string]: "300ms" }}>
            <p className="font-display text-5xl leading-none text-gold">{cards.length || 4}+</p>
            <p className="text-sm text-white/80">priority sectors open now</p>
          </div>
        </div>
        <div>
          <SectionHead dark eyebrow="Invest" title={clean(block?.title) || "Investment opportunities"} intro={clean(block?.subtitle)} size="md" />
          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {cards.map((c, i) => (
              <Link
                key={c.title}
                href={cta?.href ?? "/investment-opportunities"}
                data-reveal="up"
                style={{ ["--d" as string]: `${i * 90}ms` }}
                className="group relative overflow-hidden rounded-[1.75rem] bg-white/6 p-7 transition duration-500 hover:bg-gold hover:text-ink"
              >
                <span className="font-display text-2xl text-gold transition group-hover:text-ink">{pad2(i + 1)}</span>
                <p className="mt-6 font-display text-4xl leading-[.95]">{c.title}</p>
                {c.description ? <p className="mt-3 text-white/70 transition group-hover:text-ink/80">{clean(c.description)}</p> : null}
                <ArrowUpRight className="absolute right-6 top-6 size-6 opacity-40 transition duration-500 group-hover:rotate-45 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
          <div className="mt-10" data-reveal="up">
            <Btn href={cta?.href ?? "/investment-opportunities"}>{cta?.label ?? "View all opportunities"}</Btn>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Globe                                                                       */
/* -------------------------------------------------------------------------- */
export function GlobeSection() {
  return (
    <section className="relative overflow-hidden bg-forest py-28 text-white lg:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_70%_50%,rgba(29,66,110,.85),transparent)]" />
      <Container className="relative">
        <GlobeExplorer />
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Programme preview: 30/70 split, calendar + cursor-image list               */
/* -------------------------------------------------------------------------- */
type EventItem = { title: string; time?: string; description?: string; image?: string };

export function ProgrammePreview({ block }: { block?: Block }) {
  const events: EventItem[] = block?.meta.events ?? [];
  const cta = block?.meta.cta as { label: string; href: string } | undefined;
  return (
    <section className="bg-white py-28 lg:py-36">
      <Container>
        <SectionHead eyebrow="Programme" title={clean(block?.title) || "Scheduled events"} intro={clean(block?.subtitle)} />
        <div className="mt-14 grid gap-10 lg:grid-cols-[340px_1fr]">
          <div className="lg:sticky lg:top-32 lg:self-start" data-reveal="up">
            <MiniCalendar />
            <Btn href={cta?.href ?? "/conference-programme"} variant="forest" className="mt-5 w-full">
              {cta?.label ?? "Full programme"}
            </Btn>
          </div>
          <CursorList
            items={events.map((e, i) => ({
              title: clean(e.title),
              meta: clean(e.time),
              text: clean(e.description),
              image: e.image || fallbackImage(i),
              href: "/conference-programme",
            }))}
          />
        </div>
      </Container>
    </section>
  );
}

export function MiniCalendar({ dark }: { dark?: boolean }) {
  const start = new Date(EVENT.start);
  const y = start.getFullYear(), m = start.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const s = start.getDate(), e = new Date(EVENT.end).getDate();
  const month = start.toLocaleString("en-US", { month: "long" });
  return (
    <div className={cn("rounded-[2rem] p-7", dark ? "bg-white/6 text-white" : "bg-forest text-white")}>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-4xl">{month}</p>
        <p className="font-display text-2xl text-gold">{y}</p>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold tracking-wider text-white/45">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
        {Array.from({ length: first }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const on = d >= s && d <= e;
          return (
            <span key={d} className={cn("grid aspect-square place-items-center rounded-xl", on ? "bg-gold font-display text-lg text-ink" : "text-white/70")}>
              {d}
            </span>
          );
        })}
      </div>
      <p className="mt-5 text-sm text-white/60">{EVENT.days} / {EVENT.venue}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Voices: 3D speakers stage                                                  */
/* -------------------------------------------------------------------------- */
export function Voices({ leaders }: { leaders: Card[] }) {
  const speakers: Speaker[] = [
    ...leaders.map((l) => ({ name: l.title.replace(/^(H\.E\.|Prof\.|Mr\.|Dr\.)\s*/, "").replace(/,.*$/, ""), role: clean(l.role) || "Host", img: l.image })),
    { name: "To be announced", role: "Keynote address" },
    { name: "To be announced", role: "Investment panel" },
    { name: "To be announced", role: "Agribusiness forum" },
  ];
  return (
    <section className="relative overflow-hidden bg-forest py-28 text-white lg:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_55%_at_50%_60%,rgba(29,66,110,.75),transparent)]" />
      <Container className="relative">
        <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <SectionHead dark eyebrow="On stage" title="Voices to hear." />
          <p data-reveal="up" className="max-w-md text-lg text-white/70 lg:justify-self-end">
            Drag the stage, tap a portrait, or let it turn. Hosts are confirmed and keynote speakers will be announced soon.
          </p>
        </div>
        <Deferred className="mt-6 min-h-[540px] md:min-h-[700px]">
          <SpeakersStage speakers={speakers} />
        </Deferred>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Partners                                                                    */
/* -------------------------------------------------------------------------- */
export function Partners({ logos }: { logos: Logo[] }) {
  return (
    <section className="overflow-hidden bg-white py-24">
      <Container className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <SectionHead eyebrow="Partners" title="In good company." size="md" />
        <div data-reveal="up">
          <Btn href="/sponsors-partners" variant="ghost-dark">Become a partner</Btn>
        </div>
      </Container>
      <LogoMarquee logos={logos} />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Register: silk shader + interactive pass                                   */
/* -------------------------------------------------------------------------- */
export function RegisterCta() {
  return (
    <section className="relative isolate overflow-hidden py-28 text-white lg:py-36">
      <SilkBackground className="-z-10" />
      <WordMarquee words={["Invest", "Trade", "Grow", "Meru 2027"]} className="pointer-events-none absolute inset-x-0 top-6 -z-10 text-white/10" />
      <Container className="grid items-center gap-16 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow" data-reveal="up">Registration is open</p>
          <Words text="Be part of Meru's next chapter." className="display-lg mt-5" />
          <p data-reveal="up" className="mt-6 max-w-lg text-lg text-white/75">
            Register as a delegate, exhibitor or sponsor. Verify your email and your dashboard, announcements and pass details are ready.
          </p>
          <div className="mt-10 flex flex-wrap gap-3" data-reveal="up">
            <Btn href="/register">Register now</Btn>
            <Btn href="/faq" variant="ghost-light">Read the FAQ</Btn>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end" data-reveal="up">
          <PassCard />
        </div>
      </Container>
    </section>
  );
}
