import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlides } from "@/components/home/hero-slides";
import { SpinBadge } from "@/components/site/spin-badge";
import { EVENT } from "@/lib/event";
import type { Slide } from "@/lib/media";

export function Hero({ slides, body }: { slides: Slide[]; body?: string }) {
  return (
    <section className="relative isolate h-svh min-h-[760px] overflow-hidden bg-forest text-white">
      <HeroSlides slides={slides}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest via-forest/20 to-forest/55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forest/75 via-forest/10 to-transparent" />
      </HeroSlides>

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end px-5 pb-[240px] sm:px-8 lg:pb-[190px]">
        <p className="eyebrow animate-in fade-in duration-1000">
          {EVENT.dateLabel} / {EVENT.venue}
        </p>
        <h1 className="words display-xl mt-5 max-w-5xl" aria-label="Invest. Trade. Grow.">
          {["Invest.", "Trade."].map((w, i) => (
            <span key={w} className="w" aria-hidden>
              <span style={{ ["--i" as string]: i + 2 }}>
                {w}
              </span>
              {" "}
            </span>
          ))}
          <span className="w block" aria-hidden>
            <span style={{ ["--i" as string]: 5 }} className="text-transparent [-webkit-text-stroke:2px_#dba600]">Grow.</span>
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 animate-in fade-in duration-1000 delay-500 fill-mode-both">
          {body || `${EVENT.name}. Three days of deals, ideas and discovery across seven sectors.`}
        </p>
        <div className="pointer-events-auto mt-9 flex flex-wrap gap-3 animate-in fade-in duration-1000 delay-700 fill-mode-both">
          <Link href="/register" className="btn btn-gold">
            Register now <ArrowRight className="size-4" />
          </Link>
          <Link href="/trade-fair#floor-plan" className="btn btn-ghost-light">
            Book a booth <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute right-[6vw] top-[22%] z-10 hidden lg:block">
        <SpinBadge tone="gold" uid="hero" text="Together for a stronger business community  /  " className="size-44 -rotate-12" />
      </div>
    </section>
  );
}
