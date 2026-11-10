import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlides } from "@/components/home/hero-slides";
import { SpinBadge } from "@/components/site/spin-badge";
import { EVENT } from "@/lib/event";
import type { Slide } from "@/lib/media";

export function Hero({ slides, body }: { slides: Slide[]; body?: string }) {
  return (
    <section className="relative isolate h-svh min-h-[720px] overflow-hidden bg-forest text-white">
      <HeroSlides slides={slides}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest via-forest/20 to-forest/55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forest/75 via-forest/10 to-transparent" />
      </HeroSlides>

      {/*
        Content sits between the fixed header (top padding) and the date/countdown
        bar that overlaps the bottom of the hero (bottom padding), centred in
        that space so it never touches the navbar on short laptop screens.
      */}
      <div
        className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-center px-4 pb-[180px] pt-[120px] sm:px-8 sm:pb-[200px] sm:pt-[124px] lg:pb-[170px] lg:pt-[calc(84px_+_clamp(2rem,6vh,4.5rem))]"
      >
        <p className="eyebrow animate-in fade-in duration-1000">
          {EVENT.dateLabel} / {EVENT.venue}
        </p>
        <h1
          className="words mt-4 max-w-5xl font-display leading-[.86] text-[clamp(38px,min(11vw,16svh),200px)] sm:text-[clamp(56px,min(11vw,16svh),200px)]"
          aria-label="Invest. Trade. Grow."
        >
          {["Invest.", "Trade."].map((w, i) => (
            <span key={w} className="w" aria-hidden>
              <span style={{ ["--i" as string]: i + 2 }}>{w}</span>
              {"\u00a0"}
            </span>
          ))}
          <span className="w block" aria-hidden>
            <span style={{ ["--i" as string]: 5 }} className="text-transparent [-webkit-text-stroke:2px_#dba600]">
              Grow.
            </span>
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85 animate-in fade-in duration-1000 delay-500 fill-mode-both">
          {body || `${EVENT.name}. Three days of deals, ideas and discovery across seven sectors.`}
        </p>
        <div className="pointer-events-auto mt-8 flex flex-wrap gap-3 animate-in fade-in duration-1000 delay-700 fill-mode-both">
          <Link href="/register" className="btn btn-gold">
            Register now <ArrowRight className="size-4" />
          </Link>
          <Link href="/trade-fair#floor-plan" className="btn btn-ghost-light">
            Book a booth <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div
        className="pointer-events-none absolute right-[6vw] z-10 hidden lg:block"
        style={{ top: "calc(84px + 8vh)" }}
      >
        <SpinBadge tone="gold" uid="hero" text="Together for a stronger business community  /  " className="size-40 -rotate-12 xl:size-44" />
      </div>

    </section>
  );
}