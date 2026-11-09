import Image from "next/image";
import { Deferred, StatsField } from "@/components/gl/lazy";
import { Photo } from "@/components/site/photo";
import { Container, Odometer, SectionHead } from "@/components/site/primitives";
import { PARTNERS, SECTORS, STATS, type Stat } from "@/lib/event";
import { IMG } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Statistics: a short, wide partnership band on top, then a row of equal stat
 * cards, all over the WebGL "data city" that rises on scroll.
 */
export function Stats({ stats = STATS }: { stats?: Stat[] }) {
  const lead = stats.find((s) => s.visual === "partners");
  const rest = stats.filter((s) => s !== lead);

  return (
    <section className="relative isolate overflow-hidden bg-forest pb-20 pt-16 text-white sm:pb-28 sm:pt-24 lg:pb-36 lg:pt-32">
      <Deferred className="absolute inset-x-0 bottom-0 -z-10 h-[75%]" rootMargin="300px 0px">
        <StatsField />
      </Deferred>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest via-forest/70 to-forest/10" />

      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <SectionHead dark eyebrow="By the numbers" title="Three institutions. One vision." />
          <p data-reveal="up" className="max-w-md text-lg leading-relaxed text-white/70 lg:justify-self-end">
            Business, research and government on one platform, opening Meru to investors, innovators and consumers.
          </p>
        </div>

        {lead ? <PartnerBand s={lead} /> : null}

        <div className={cn("grid gap-4 md:grid-cols-2", rest.length >= 3 && "lg:grid-cols-3", lead ? "mt-4" : "mt-16")}>
          {rest.map((s, i) => (
            <StatCard key={s.label + i} s={s} i={i + 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/** Wide, short band: number on the left, partner logos in the middle, photo on the right. */
function PartnerBand({ s }: { s: Stat }) {
  return (
    <div
      data-reveal="up"
      className="mt-10 grid items-center gap-6 overflow-hidden rounded-[2rem] bg-sand p-6 text-ink sm:mt-16 sm:gap-8 sm:p-7 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto] lg:gap-12 lg:p-8 lg:pl-10"
    >
      <div className="flex items-end gap-5">
        <Odometer
          value={s.value}
          prefix={s.prefix}
          suffix={s.suffix}
          className="font-display text-[clamp(110px,10vw,160px)] leading-[.8] text-brand"
        />
        <div className="pb-2">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-brand">{s.label}</p>
          <p className="mt-1 max-w-[16rem] text-ink/70">{s.note}</p>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 items-center gap-3 sm:flex sm:flex-nowrap sm:justify-center sm:gap-x-6 lg:gap-x-8">
        {PARTNERS.map((p) => (
          <a key={p.name} href={p.href} target="_blank" rel="noreferrer" className="group/logo flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
            <Image src={p.logo} alt={p.name} width={160} height={120} className="h-11 w-auto max-w-full object-contain transition group-hover/logo:-translate-y-0.5 sm:h-14 lg:h-16" />
            <span className="hidden text-sm font-semibold leading-tight text-ink/60 2xl:block">{p.pillar}</span>
          </a>
        ))}
      </div>

      <Photo
        src={IMG.business}
        alt=""
        sizes="280px"
        className="shape-leaf hidden aspect-[16/10] w-[260px] lg:block xl:w-[300px]"
      />
    </div>
  );
}

function StatCard({ s, i }: { s: Stat; i: number }) {
  return (
    <div
      data-reveal="up"
      style={{ ["--d" as string]: `${i * 110}ms` }}
      className="glass group flex flex-col rounded-[2rem] p-6 sm:p-7 lg:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-gold">{s.label}</p>
        {s.visual === "days" ? <DaysVisual /> : null}
      </div>
      <div className="mt-5 flex items-end gap-4 sm:mt-8">
        <Odometer
          value={s.value}
          prefix={s.prefix}
          suffix={s.suffix}
          delay={i * 140}
          className="font-display text-[clamp(96px,8vw,136px)] leading-[.8] text-white"
        />
        <p className="max-w-[12rem] pb-1 text-white/70">{s.note}</p>
      </div>
      <div className="mt-auto pt-4 sm:pt-6">
        {s.visual === "sectors" ? <SectorsVisual /> : null}
        {s.visual === "booths" ? <BoothsVisual total={s.value} /> : null}
      </div>
    </div>
  );
}

function SectorsVisual() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SECTORS.map((s) => (
        <span key={s.name} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition group-hover:bg-white/15">
          {s.name}
        </span>
      ))}
    </div>
  );
}

function DaysVisual() {
  return (
    <div className="grid grid-cols-3 gap-1 text-center" aria-hidden>
      {[25, 26, 27].map((d) => (
        <span key={d} className="grid size-9 place-items-center rounded-xl bg-gold font-display text-xl text-ink">
          {d}
        </span>
      ))}
    </div>
  );
}

function BoothsVisual({ total }: { total: number }) {
  const n = Math.min(28, total);
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className={cn("aspect-square rounded-[4px]", i % 5 === 2 ? "bg-gold" : i % 7 === 0 ? "bg-[#4a78b5]" : "bg-brand")}
        />
      ))}
    </div>
  );
}