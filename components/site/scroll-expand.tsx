"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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

    // Run once immediately, then on every native scroll/resize.
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    // Integrate with Lenis smooth scroll if it is available.
    const lenis = (window as unknown as { __lenis?: { on: (event: string, callback: () => void) => void } }).__lenis;
    if (lenis) {
      lenis.on("scroll", request);
    }

    // Ensure layout is settled after fonts/images load.
    const layoutTimer = window.setTimeout(update, 100);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(layoutTimer);
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
