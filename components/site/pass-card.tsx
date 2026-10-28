"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { EVENT } from "@/lib/event";
import { IMG } from "@/lib/media";
import { cn } from "@/lib/utils";

const TYPES = ["Delegate", "Exhibitor", "Sponsor"] as const;

/**
 * Interactive event pass: tilts in 3D with the cursor, with a light sheen,
 * and previews the visitor's name and pass type as they type.
 */
export function PassCard({ interactive = true, className }: { interactive?: boolean; className?: string }) {
  const card = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("Delegate");

  const onMove = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 16}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 20}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const reset = () => {
    card.current?.style.setProperty("--rx", "0deg");
    card.current?.style.setProperty("--ry", "0deg");
  };

  const code = (name || "Your Name").replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "X");

  return (
    <div className={cn("w-full max-w-[400px]", className)}>
      <div className="[perspective:1200px]" onPointerMove={onMove} onPointerLeave={reset}>
        <div
          ref={card}
          className="relative aspect-[5/7.4] w-full rounded-[2rem] bg-white text-ink shadow-[0_50px_90px_-30px_rgba(0,0,0,.6)] transition-transform duration-300 ease-out [transform-style:preserve-3d] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
        >
          <div className="shape-ticket absolute inset-0 overflow-hidden rounded-[2rem] bg-white">
            <div className="relative h-[46%] overflow-hidden bg-forest">
              <Image src={IMG.tea} alt="" fill sizes="400px" quality={85} className="object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest to-forest/10" />
              <span className="absolute left-6 top-7 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-[.18em] text-ink">{type}</span>
              <p className="absolute inset-x-6 bottom-5 font-display text-5xl leading-[.85] text-white">
                Invest. Trade. <span className="text-gold">Grow.</span>
              </p>
            </div>
            <div className="flex h-[54%] flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-ink/45">Pass holder</p>
                <Image src={IMG.logo} alt="Meru Invest" width={110} height={79} className="-mt-2 h-11 w-auto object-contain" />
              </div>
              <p className="mt-1 truncate font-display text-[44px] leading-none">{name || "Your Name"}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-ink/45">Dates</p>
                  <p className="font-semibold">25 to 27 Feb 2027</p>
                </div>
                <div>
                  <p className="text-ink/45">Venue</p>
                  <p className="font-semibold">{EVENT.venue}</p>
                </div>
              </div>
              <div className="mt-auto flex items-end justify-between">
                <p className="font-display text-3xl tracking-wider text-brand">MIC-27-{code}</p>
                <QR seed={name + type} />
              </div>
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-60 mix-blend-soft-light [background:radial-gradient(circle_at_var(--mx,50%)_var(--my,30%),rgba(255,255,255,.9),transparent_45%)]"
          />
        </div>
      </div>

      {interactive ? (
        <div className="mt-8 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 26))}
            placeholder="Type your name to preview your pass"
            aria-label="Preview name"
            className="h-14 w-full rounded-full bg-white/10 px-6 text-white outline-none ring-1 ring-white/20 placeholder:text-white/50 focus:ring-gold"
          />
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn("flex-1 rounded-full py-3 text-sm font-semibold transition", type === t ? "bg-gold text-ink" : "bg-white/10 text-white hover:bg-white/20")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function qrCells(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const cells: boolean[] = [];
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9), c = i % 9;
    const finder = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
    if (finder) {
      cells.push(!(r % 6 === 1 && c % 6 === 1) || (r === 1 && c === 1));
      continue;
    }
    h = Math.imul(h ^ i, 2654435761);
    cells.push((h >>> 0) % 100 > 48);
  }
  return cells;
}

function QR({ seed }: { seed: string }) {
  const cells = qrCells(seed);
  return (
    <div className="grid size-16 grid-cols-9 gap-[1px] rounded-lg bg-white p-1 ring-1 ring-ink/10" aria-hidden>
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-forest" : "bg-transparent"} />
      ))}
    </div>
  );
}
