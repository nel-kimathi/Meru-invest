"use client";

import { useState } from "react";
import { Deferred, GlobeCanvas, GLPlaceholder } from "@/components/gl/lazy";
import { MERU_LL, ORIGINS, distanceKm } from "@/lib/globe-data";
import { cn } from "@/lib/utils";

/** City picker + lazily loaded 3D globe. The text renders immediately. */
export function GlobeExplorer() {
  const [sel, setSel] = useState(-1);
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.35fr]">
      <div>
        <p className="eyebrow">Open to the world</p>
        <h2 className="display-lg words mt-4 text-white">
          {["Kenya.", "Meru.", "You."].map((w, i) => (
            <span key={w} className="w">
              <span style={{ ["--i" as string]: i }} className={i === 2 ? "text-gold" : undefined}>{w}</span>
              {" "}
            </span>
          ))}
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
          Investors, buyers and partners are flying in from across the globe. Pick a city to trace its route into Meru, or drag the globe to explore.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {ORIGINS.map((o, i) => (
            <button
              key={o.city}
              onClick={() => setSel(sel === i ? -1 : i)}
              aria-pressed={sel === i}
              className={cn("rounded-2xl px-4 py-3 text-left transition", sel === i ? "bg-gold text-forest" : "bg-white/6 text-white hover:bg-white/12")}
            >
              <span className="block font-semibold">{o.city}</span>
              <span className={cn("block text-xs", sel === i ? "text-forest/70" : "text-white/50")}>
                {distanceKm(o, MERU_LL).toLocaleString("en-US")} km to Meru
              </span>
            </button>
          ))}
        </div>
      </div>
      <Deferred className="relative aspect-square w-full cursor-grab touch-pan-y active:cursor-grabbing" fallback={<GLPlaceholder className="rounded-full" />}>
        <GlobeCanvas selected={sel} />
      </Deferred>
    </div>
  );
}
