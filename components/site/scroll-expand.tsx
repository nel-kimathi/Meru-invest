"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Pinned section that exposes scroll progress as CSS variables:
 *   --p  0 -> 1 while the frame expands to full bleed
 *   --t  0 -> 1 while the overlay text comes in
 * Children style themselves with calc(var(--p)).
 */
export function ScrollExpand({ children, className, height = "220vh" }: { children: React.ReactNode; className?: string; height?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.style.setProperty("--p", "1");
      el.style.setProperty("--t", "1");
      return;
    }
    // Recompute only when the page scrolls or resizes.
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const prog = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
      const p = Math.min(1, prog / 0.55);
      const t = Math.min(1, Math.max(0, (prog - 0.35) / 0.35));
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--t", t.toFixed(4));
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <section ref={ref} className={cn("relative", className)} style={{ height, ["--p" as string]: 0, ["--t" as string]: 0 }}>
      <div className="sticky top-0 h-svh overflow-hidden">{children}</div>
    </section>
  );
}
