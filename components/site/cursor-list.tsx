"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/site/photo";
import { pad2 } from "@/lib/text";
import { cn } from "@/lib/utils";

export type CursorItem = { title: string; meta?: string; text?: string; image: string; href?: string };

/**
 * Editorial list where a photo follows the cursor over the hovered row.
 * On touch screens each row shows its photo inline instead.
 */
export function CursorList({ items, dark }: { items: CursorItem[]; dark?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = box.current!, f = float.current!;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const loop = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      f.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    el.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      el.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={box} className="relative" onPointerLeave={() => setActive(-1)}>
      <div
        ref={float}
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-20 hidden h-[300px] w-[240px] transition-opacity duration-300 md:block",
          active >= 0 ? "opacity-100" : "opacity-0",
        )}
      >
        {items.map((it, i) => (
          <Photo
            key={it.title + i}
            src={it.image}
            alt=""
            sizes="260px"
            className={cn(
              "shape-arch absolute inset-0 shadow-2xl transition-[opacity,transform] duration-500",
              active === i ? "scale-100 opacity-100" : "scale-90 opacity-0",
            )}
          />
        ))}
      </div>

      <ul>
        {items.map((it, i) => {
          const Row = (
            <div
              className={cn(
                "group grid items-center gap-5 rounded-[1.75rem] px-5 py-7 transition duration-500 md:grid-cols-[80px_1fr_1.1fr_48px] md:px-8",
                dark ? "hover:bg-white/6" : "hover:bg-mint",
                active >= 0 && active !== i && "opacity-45",
              )}
              onPointerEnter={() => setActive(i)}
            >
              <span className={cn("font-display text-3xl", dark ? "text-gold" : "text-brand")}>{pad2(i + 1)}</span>
              <div>
                {it.meta ? <p className={cn("text-xs font-semibold uppercase tracking-[.2em]", dark ? "text-white/50" : "text-ink/50")}>{it.meta}</p> : null}
                <p className={cn("mt-1 font-display text-[clamp(32px,3.4vw,52px)] leading-[.95]", dark ? "text-white" : "text-ink")}>{it.title}</p>
              </div>
              {it.text ? <p className={cn("max-w-md", dark ? "text-white/65" : "text-ink/65")}>{it.text}</p> : <span />}
              <span className={cn("hidden size-12 place-items-center rounded-full transition duration-500 group-hover:rotate-45 md:grid", dark ? "bg-white/10 text-white group-hover:bg-gold group-hover:text-ink" : "bg-ink/5 text-ink group-hover:bg-forest group-hover:text-white")}>
                <ArrowUpRight className="size-5" />
              </span>
              <Photo src={it.image} alt="" sizes="100vw" className="shape-soft aspect-[16/10] md:hidden" />
            </div>
          );
          return (
            <li key={it.title + i} data-reveal="up" style={{ ["--d" as string]: `${i * 80}ms` }}>
              {it.href ? <Link href={it.href}>{Row}</Link> : Row}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
