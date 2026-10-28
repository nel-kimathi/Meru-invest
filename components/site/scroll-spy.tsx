"use client";

import { useEffect, useState } from "react";
import { pad2 } from "@/lib/text";
import { cn } from "@/lib/utils";

/** Sticky index that highlights the section currently in view. */
export function ScrollSpy({ items, dark }: { items: { id: string; label: string }[]; dark?: boolean }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sections" className="space-y-1">
      {items.map((it, i) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={cn(
            "flex items-baseline gap-4 rounded-2xl px-4 py-3 transition duration-300",
            active === it.id ? (dark ? "bg-white/10 text-white" : "bg-forest text-white") : dark ? "text-white/50 hover:text-white" : "text-ink/50 hover:text-ink",
          )}
        >
          <span className={cn("font-display text-lg", active === it.id ? "text-gold" : "")}>{pad2(i + 1)}</span>
          <span className="font-display text-2xl leading-none">{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
