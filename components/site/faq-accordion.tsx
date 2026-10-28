"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type Faq = { q: string; a: string };

/** Accordion with live search. No dividers: each question is its own soft card. */
export function FaqAccordion({ items, searchable = false }: { items: Faq[]; searchable?: boolean }) {
  const [open, setOpen] = useState<number>(0);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.map((it, i) => ({ ...it, i })).filter((it) => !t || (it.q + " " + it.a).toLowerCase().includes(t));
  }, [items, q]);

  return (
    <div>
      {searchable ? (
        <label className="mb-6 flex h-16 items-center gap-3 rounded-full bg-mint px-6 ring-1 ring-transparent focus-within:ring-brand/40">
          <Search className="size-5 text-ink/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions"
            className="h-full flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-ink/40"
          />
          {q ? <span className="text-sm text-ink/50">{list.length} found</span> : null}
        </label>
      ) : null}
      <div className="space-y-3">
        {list.map((it) => {
          const on = open === it.i;
          return (
            <div key={it.i} className={cn("overflow-hidden rounded-[1.75rem] transition-colors duration-500", on ? "bg-forest text-white" : "bg-mint text-ink hover:bg-[#e8edf4]")}>
              <button onClick={() => setOpen(on ? -1 : it.i)} aria-expanded={on} className="flex w-full items-center justify-between gap-6 px-7 py-6 text-left">
                <span className="font-display text-[clamp(24px,2.2vw,32px)] leading-tight">{it.q}</span>
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-full transition duration-500", on ? "rotate-45 bg-gold text-ink" : "bg-white text-ink")}>
                  <Plus className="size-5" />
                </span>
              </button>
              <div className={cn("grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.6,0,.2,1)]", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="max-w-3xl px-7 pb-7 text-lg leading-relaxed text-white/75">{it.a}</p>
                </div>
              </div>
            </div>
          );
        })}
        {!list.length ? <p className="rounded-[1.75rem] bg-mint p-8 text-ink/60">No questions match that search. Try another word or contact the secretariat.</p> : null}
      </div>
    </div>
  );
}
