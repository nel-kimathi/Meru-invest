"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Photo } from "@/components/site/photo";
import { pad2 } from "@/lib/text";
import { cn } from "@/lib/utils";

export type ProgItem = { title: string; time?: string; description?: string; image: string };

function daysOf(time = "", total: number): number[] {
  const t = time.toLowerCase();
  if (t.includes("all")) return Array.from({ length: total }, (_, i) => i + 1);
  const nums = (t.match(/\d+/g) ?? []).map(Number).filter((n) => n >= 1 && n <= total);
  if (nums.length >= 2 && /day\s*\d+\s*(to|-|–|—)\s*\d+/.test(t)) {
    const [a, b] = [Math.min(nums[0], nums[1]), Math.max(nums[0], nums[1])];
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }
  return nums.length ? [nums[0]] : [];
}

/** Programme with day tabs and alternating photo rows. */
export function ProgrammeTabs({ items, dates }: { items: ProgItem[]; dates: string[] }) {
  const total = dates.length;
  const [day, setDay] = useState(0);
  const mapped = useMemo(() => items.map((it) => ({ ...it, days: daysOf(it.time, total) })), [items, total]);
  const list = day === 0 ? mapped : mapped.filter((m) => m.days.includes(day));

  return (
    <div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {["All days", ...dates].map((d, i) => (
          <button
            key={d}
            onClick={() => setDay(i)}
            className={cn("shrink-0 rounded-2xl px-6 py-4 text-left transition", day === i ? "bg-forest text-white" : "bg-mint text-ink hover:bg-[#e8edf4]")}
          >
            <span className={cn("block text-xs font-semibold uppercase tracking-[.2em]", day === i ? "text-gold" : "text-brand")}>{i === 0 ? "Overview" : `Day ${i}`}</span>
            <span className="mt-1 block font-display text-2xl leading-none">{d}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {list.map((it, i) => (
          <article
            key={it.title + day}
            className={cn(
              "group grid items-stretch gap-0 overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_50px_-35px_rgba(13,34,64,.5)] animate-in fade-in slide-in-from-bottom-6 fill-mode-both duration-700 md:grid-cols-[.9fr_1.4fr]",
              i % 2 === 1 && "md:[&>*:first-child]:order-2",
            )}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <Photo src={it.image} alt="" sizes="(min-width:1024px) 30vw, 100vw" className="min-h-[240px] w-full transition duration-700 group-hover:brightness-110" />
            <div className="flex flex-col p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-2">
                {it.time ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-sm font-semibold text-[#8a6a00]">
                    <Clock className="size-4" /> {it.time}
                  </span>
                ) : null}
                {it.days.map((d) => (
                  <span key={d} className="rounded-full bg-mint px-3 py-1.5 text-sm font-semibold text-ink/70">{dates[d - 1]}</span>
                ))}
              </div>
              <p className="mt-6 font-display text-xl text-brand">{pad2(i + 1)}</p>
              <h3 className="font-display text-[clamp(36px,3.6vw,56px)] leading-[.95] text-ink">{it.title}</h3>
              {it.description ? <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/70">{it.description}</p> : null}
            </div>
          </article>
        ))}
        {!list.length ? <p className="rounded-[2rem] bg-mint p-10 text-ink/60">Sessions for this day will be published soon.</p> : null}
      </div>
    </div>
  );
}
