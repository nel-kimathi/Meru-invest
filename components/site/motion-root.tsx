"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Lenis from "lenis";

/**
 * One client component drives all page motion so pages can stay server
 * components and simply annotate markup:
 *   data-reveal="up|left|right|fade|clip|clip-x"   reveal on scroll (optional --d delay)
 *   className="words"                              word-by-word headline rise
 *   data-parallax="0.15"                           pixel-snapped parallax (keeps images sharp)
 * It also runs Lenis smooth scrolling.
 */
export function MotionRoot() {
  const path = usePathname();

  // Smooth scroll
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -90 }, lerp: 0.11, wheelMultiplier: 0.95 });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => lenis.destroy();
  }, []);

  // Reset scroll on route change
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (!window.location.hash) lenis?.scrollTo(0, { immediate: true });
  }, [path]);

  // Reveal + parallax
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    let layers: HTMLElement[] = [];
    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in), .words:not(.is-in)").forEach((el) => {
        if (reduce) el.classList.add("is-in");
        else io.observe(el);
      });
      layers = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
      requestUpdate();
    };

    // Parallax runs only when the page scrolls or resizes, never on idle frames.
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of layers) {
        const host = el.parentElement;
        if (!host) continue;
        const r = host.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const speed = parseFloat(el.dataset.parallax || "0.15");
        // Whole pixels only: sub-pixel translation softens photos.
        el.style.transform = `translate3d(0, ${Math.round((r.top + r.height / 2 - vh / 2) * -speed)}px, 0)`;
      }
    };
    const requestUpdate = () => {
      if (!reduce && !frame) frame = requestAnimationFrame(update);
    };

    // New content (client-side tabs, lazy sections): rescan, debounced, only
    // when element nodes were added.
    let timer = 0;
    const mo = new MutationObserver((records) => {
      if (!records.some((r) => Array.from(r.addedNodes).some((n) => n.nodeType === 1))) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(scan, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    scan();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [path]);

  return null;
}
