"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function ScrollExpand({ children, className, height = "220vh" }: { children: React.ReactNode; className?: string; height?: string }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 1024;
    if (reduce || isMobile) {
      el.style.setProperty("--p", "1");
      el.style.setProperty("--t", "1");
      if (isMobile) el.style.height = "100vh";
      return;
    }

    const ctx = gsap.context(() => {
      const progress = { p: 0, t: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      // Photo expands and overlay darkens over the first ~55% of the scroll span.
      tl.to(progress, {
        p: 1,
        duration: 0.55,
        ease: "none",
        onUpdate: () => el.style.setProperty("--p", progress.p.toFixed(4)),
      }, 0);

      // Text stays hidden for the first ~35%, then fades/slides in.
      tl.fromTo(progress, { t: 0 }, { t: 0, duration: 0.35, ease: "none" }, 0);
      tl.to(progress, {
        t: 1,
        duration: 0.35,
        ease: "none",
        onUpdate: () => el.style.setProperty("--t", progress.t.toFixed(4)),
      }, 0.35);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className={cn("relative", className)} style={{ height, ["--p" as string]: 0, ["--t" as string]: 0 }}>
      <div className="sticky top-0 h-[100vh] w-full overflow-hidden">{children}</div>
    </section>
  );
}
