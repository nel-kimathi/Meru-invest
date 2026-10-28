"use client";

import { useMemo, useState } from "react";
import { Photo } from "@/components/site/photo";
import { cn } from "@/lib/utils";

export type Member = { title: string; role?: string; org?: string; description?: string; image?: string };

const TONE: Record<string, string> = {
  MUST: "from-brand to-brand-deep",
  KNCCI: "from-[#b88a00] to-[#7a5c00]",
  County: "from-navy to-navy-deep", // small blue accent for the County
};
const tone = (org?: string) =>
  org?.includes("MUST") ? TONE.MUST : org?.includes("KNCCI") ? TONE.KNCCI : TONE.County;
const initials = (name: string) =>
  name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, "").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/** Organising committee with organisation filter tabs. */
export function CommitteeGrid({ members }: { members: Member[] }) {
  const orgs = useMemo(() => Array.from(new Set(members.map((m) => m.org).filter(Boolean))) as string[], [members]);
  const [org, setOrg] = useState<string | null>(null);
  const list = org ? members.filter((m) => m.org === org) : members;

  return (
    <div>
      {orgs.length > 1 ? (
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
          {[null, ...orgs].map((o) => (
            <button
              key={o ?? "all"}
              onClick={() => setOrg(o)}
              className={cn(
                "shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition",
                org === o ? "bg-forest text-white" : "bg-white text-ink hover:bg-ink/8",
              )}
            >
              {o ?? "Everyone"} <span className="ml-1 opacity-50">{o ? members.filter((m) => m.org === o).length : members.length}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((m, i) => (
          <article key={m.title} className="group animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700" style={{ animationDelay: `${(i % 8) * 50}ms` }}>
            <div className="relative overflow-hidden rounded-[1.75rem] rounded-t-[999px]">
              {m.image ? (
                <Photo src={m.image} alt={m.title} sizes="(min-width:1024px) 22vw, (min-width:768px) 30vw, 46vw" className="aspect-[4/5] w-full" imgClassName="object-[center_18%]" />
              ) : (
                <div className={cn("grain relative grid aspect-[4/5] w-full place-items-center bg-gradient-to-br", tone(m.org))}>
                  <span className="font-display text-[clamp(56px,7vw,96px)] leading-none text-white/90">{initials(m.title)}</span>
                </div>
              )}
              {m.description ? (
                <div className="absolute inset-0 flex items-end bg-forest/88 p-5 opacity-0 transition duration-500 group-hover:opacity-100">
                  <p className="text-sm leading-relaxed text-white/90">{m.description}</p>
                </div>
              ) : null}
            </div>
            <h3 className="mt-4 font-display text-[26px] leading-none text-ink">{m.title}</h3>
            {m.role ? <p className="mt-1 text-sm font-semibold text-brand">{m.role}</p> : null}
            {m.org ? <p className="text-xs text-ink/50">{m.org}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
