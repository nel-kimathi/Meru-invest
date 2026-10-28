import Image from "next/image";
import { Deferred, StatsField } from "@/components/gl/lazy";
import { Photo } from "@/components/site/photo";
import { Container, Odometer, SectionHead } from "@/components/site/primitives";
import { PARTNERS, SECTORS, STATS, type Stat } from "@/lib/event";
import { IMG } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Statistics: bento grid of rolling numbers, each with its own mini visual,
 * over a WebGL "data city" that rises on scroll and follows the cursor.
 */
export function Stats({ stats = STATS }: { stats?: Stat[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-forest pb-40 pt-32 text-white">
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

        <div className="mt-16 grid auto-rows-[minmax(250px,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCell key={s.label + i} s={s} i={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function StatCell({ s, i }: { s: Stat; i: number }) {
  const big = s.visual === "partners";
  return (
    <div
      data-reveal="up"
      style={{ ["--d" as string]: `${i * 110}ms` }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2rem] p-7 lg:p-9",
        big ? "min-h-[440px] bg-sand text-ink md:col-span-2 lg:row-span-2" : "glass",
        s.visual === "booths" && "md:col-span-2",
      )}
    >
      {big ? (
        <Photo src={IMG.opening} alt="" sizes="(min-width:1024px) 18vw, 40vw" className="shape-arch absolute right-7 top-7 hidden aspect-[3/4] w-[34%] sm:block lg:right-9 lg:top-9" />
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <p className={cn("text-sm font-semibold uppercase tracking-[.18em]", big ? "text-brand" : "text-gold")}>{s.label}</p>
        {s.visual === "days" ? <DaysVisual /> : null}
      </div>

      <div className={cn("mt-auto pt-10", big && "pt-24")}>
        <Odometer
          value={s.value}
          prefix={s.prefix}
          suffix={s.suffix}
          delay={i * 140}
          className={cn("font-display leading-[.82]", big ? "text-[clamp(160px,20vw,300px)] text-brand" : "text-[clamp(110px,10vw,160px)] text-white")}
        />
        <p className={cn("mt-4 max-w-xs", big ? "text-ink/70" : "text-white/70")}>{s.note}</p>
        {s.visual === "partners" ? <PartnersVisual /> : null}
        {s.visual === "sectors" ? <SectorsVisual /> : null}
        {s.visual === "booths" ? <BoothsVisual total={s.value} /> : null}
      </div>
    </div>
  );
}

function PartnersVisual() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-8">
      {PARTNERS.map((p) => (
        <Image key={p.name} src={p.logo} alt={p.name} width={160} height={120} className="h-16 w-auto object-contain" />
      ))}
    </div>
  );
}

function SectorsVisual() {
  return (
    <div className="mt-6 flex flex-wrap gap-1.5">
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
  const n = Math.min(40, total);
  return (
    <div className="mt-6 grid grid-cols-10 gap-1" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className={cn(
            "aspect-square rounded-[4px] transition duration-500",
            i % 5 === 2 ? "bg-gold" : i % 7 === 0 ? "bg-[#4a78b5]" : "bg-brand",
          )}
          style={{ transitionDelay: `${i * 18}ms` }}
        />
      ))}
    </div>
  );
}
