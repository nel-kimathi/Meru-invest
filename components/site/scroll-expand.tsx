"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function ScrollExpand({ children, className, height = "220vh" }: { children: React.ReactNode; className?: string; height?: string }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.style.setProperty("--p", "1");
      el.style.setProperty("--t", "1");
      return;
    }

    let raf = 0;
    let visible = false;
    const update = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const prog = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
      const p = Math.min(1, prog / 0.55);
      const t = Math.min(1, Math.max(0, (prog - 0.35) / 0.35));
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--t", t.toFixed(4));
    };
    const loop = () => {
      raf = 0;
      if (!visible) return;
      update();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Use IntersectionObserver to run the animation only while the section is
    // on screen; this is more reliable than scroll events with smooth scroll.
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) start();
        else stop();
      },
      { threshold: 0, rootMargin: "10% 0px 10% 0px" },
    );
    io.observe(el);

    // Run once immediately so the initial frame is correct.
    update();

    // Also update on resize and on Lenis scroll events.
    const handle = () => update();
    window.addEventListener("resize", handle);
    try {
      const lenis = (window as unknown as { __lenis?: { on: (event: string, callback: () => void) => void } }).__lenis;
      lenis?.on("scroll", handle);
    } catch {
      // ignore
    }

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", handle);
    };
  }, []);

  return (
    <section ref={ref} className={cn("relative", className)} style={{ height, ["--p" as string]: 0, ["--t" as string]: 0 }}>
      <div className="sticky top-0 h-svh overflow-hidden">{children}</div>
    </section>
  );
}
