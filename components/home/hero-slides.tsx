"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Photo } from "@/components/site/photo";
import { HeroCanvas } from "@/components/gl/lazy";
import type { HeroApi } from "@/components/gl/hero-gl";
import type { Slide } from "@/lib/media";
import { pad2 } from "@/lib/text";
import { cn } from "@/lib/utils";

/**
 * Hero background: the first photo is server-rendered (fast first paint and
 * the no-WebGL fallback); the WebGL slideshow loads in its own chunk.
 */
export function HeroSlides({ slides, children }: { slides: Slide[]; children?: React.ReactNode }) {
  const api = useRef<HeroApi | null>(null);
  const drag = useRef<number | null>(null);
  const [cur, setCur] = useState(0);
  const N = slides.length;
  const go = (i: number, dir: number) => api.current?.go(i, dir);

  return (
    <div
      className="absolute inset-0"
      onPointerDown={(e) => (drag.current = e.clientX)}
      onPointerUp={(e) => {
        if (drag.current === null) return;
        const dx = e.clientX - drag.current;
        drag.current = null;
        if (Math.abs(dx) > 60) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }}
    >
      <Photo src={slides[0].src} alt={slides[0].caption} preload quality={90} sizes="100vw" className="absolute inset-0" />
      <HeroCanvas slides={slides} onReady={(a) => (api.current = a)} onChange={setCur} />
      {children}

      <div className="absolute bottom-[200px] right-5 z-20 hidden items-center gap-5 sm:right-8 md:flex lg:bottom-[150px]">
        <div className="text-right">
          <p className="font-display text-4xl leading-none">
            {pad2(cur + 1)} <span className="text-white/40">/ {pad2(N)}</span>
          </p>
          <p className="mt-1 text-sm text-white/75">{slides[cur].caption}</p>
        </div>
        <div className="flex -space-x-3">
          {slides.map((s, i) => (
            <button
              key={s.src}
              onClick={() => go(i, i > cur ? 1 : -1)}
              aria-label={`Show ${s.caption}`}
              aria-current={i === cur}
              className={cn(
                "relative size-12 overflow-hidden rounded-full ring-2 transition duration-500 hover:z-10 hover:-translate-y-1",
                i === cur ? "z-10 scale-110 ring-white" : "ring-forest/80 opacity-70 hover:opacity-100",
              )}
            >
              <Photo src={s.src} alt="" sizes="64px" className="absolute inset-0" />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button aria-label="Previous slide" onClick={() => go(cur - 1, -1)} className="grid size-12 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white hover:text-forest">
            <ArrowLeft className="size-5" />
          </button>
          <button aria-label="Next slide" onClick={() => go(cur + 1, 1)} className="grid size-12 place-items-center rounded-full bg-gold text-forest transition hover:bg-white">
            <ArrowRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
