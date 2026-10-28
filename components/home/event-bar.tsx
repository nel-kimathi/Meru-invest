"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { EVENT } from "@/lib/event";
import { pad2 } from "@/lib/text";

export function EventBar() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const T = new Date(EVENT.start).getTime();
    const u = () => setMs(Math.max(0, T - Date.now()));
    u();
    const i = setInterval(u, 1000);
    return () => clearInterval(i);
  }, []);

  const t = ms ?? 0;
  const parts = [
    ["Days", Math.floor(t / 864e5)],
    ["Hours", Math.floor((t % 864e5) / 36e5)],
    ["Minutes", Math.floor((t % 36e5) / 6e4)],
    ["Seconds", Math.floor((t % 6e4) / 1e3)],
  ] as const;

  return (
    <div className="relative z-20 mx-auto -mt-[180px] max-w-[1320px] px-5 sm:px-8 lg:-mt-[120px]">
      <div className="grid overflow-hidden rounded-[2rem] bg-white text-ink shadow-[0_40px_80px_-30px_rgba(8,26,51,.55)] lg:grid-cols-[1fr_1fr_1.55fr]">
        <div className="flex items-center gap-5 p-6 lg:p-8">
          <div className="w-[86px] shrink-0 overflow-hidden rounded-2xl bg-forest text-center text-white">
            <div className="bg-gold py-1.5 text-[11px] font-bold tracking-[.25em] text-ink">FEB</div>
            <div className="py-2 font-display text-5xl leading-none">25</div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-brand">Date</p>
            <p className="mt-1 font-display text-3xl leading-none">25, 26 & 27 Feb 2027</p>
            <p className="mt-1 text-sm text-ink/60">{EVENT.days}</p>
          </div>
        </div>

        <div className="flex items-center gap-5 bg-mint p-6 lg:p-8">
          <div className="grid size-[86px] shrink-0 place-items-center rounded-2xl bg-brand text-white">
            <MapPin className="size-9" strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-brand">Venue</p>
            <p className="mt-1 font-display text-3xl leading-none">{EVENT.venue}</p>
            <a href={EVENT.mapUrl} target="_blank" rel="noreferrer" className="link-arrow mt-1 text-sm text-ink/70 hover:text-brand">
              {EVENT.place} / Directions <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-5 bg-forest p-6 text-white sm:flex-row sm:items-center sm:justify-between lg:p-8">
          <div className="flex gap-2" role="timer" aria-label="Time until the event opens">
            {parts.map(([label, v]) => (
              <div key={label} className="w-[72px] rounded-2xl bg-white/7 py-2.5 text-center">
                <div className="font-display text-5xl leading-none tabular-nums text-gold" suppressHydrationWarning>
                  {ms === null ? "00" : pad2(v)}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[.18em] text-white/55">{label}</div>
              </div>
            ))}
          </div>
          <Link href="/register" className="btn btn-gold">
            Secure your place <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
