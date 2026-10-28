"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Code-split, viewport-deferred WebGL.
 *
 * three.js and each scene live in their own chunks and are only downloaded
 * when the section comes within ~1 screen of the viewport. The first page
 * load stays light and fast; the server-rendered text around each scene is
 * there immediately.
 */
export function Deferred({
  children,
  className,
  rootMargin = "800px 0px",
  fallback = null,
}: {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
  fallback?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShow(true);
        io.disconnect();
      }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return (
    <div ref={ref} className={className}>
      {show ? children : fallback}
    </div>
  );
}

/** Calm placeholder with the same footprint as the scene it stands in for. */
export function GLPlaceholder({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return <div aria-hidden className={cn("h-full w-full animate-pulse rounded-[2rem]", tone === "dark" ? "bg-white/[.04]" : "bg-ink/[.04]", className)} />;
}

export const StatsField = dynamic(() => import("./stats-field").then((m) => m.StatsField), { ssr: false });
export const Silk = dynamic(() => import("./silk").then((m) => m.Silk), { ssr: false });
export const GlobeCanvas = dynamic(() => import("./globe").then((m) => m.GlobeCanvas), {
  ssr: false,
  loading: () => <GLPlaceholder />,
});
export const SpeakersStage = dynamic(() => import("./speakers-stage").then((m) => m.SpeakersStage), {
  ssr: false,
  loading: () => <GLPlaceholder className="h-[540px] md:h-[700px]" />,
});
export const FloorPlan3D = dynamic(() => import("./floor-plan-3d").then((m) => m.FloorPlan3D), {
  ssr: false,
  loading: () => <GLPlaceholder tone="light" className="h-[560px]" />,
});
export const TentDrop = dynamic(() => import("./tent-drop").then((m) => m.TentDrop), {
  ssr: false,
  loading: () => <GLPlaceholder tone="light" />,
});
export const HeroCanvas = dynamic(() => import("./hero-gl").then((m) => m.HeroCanvas), { ssr: false });

/** Flowing silk background: brand gradient first, WebGL fades in when near. */
export function SilkBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 bg-gradient-to-br from-forest-deep via-forest to-brand-deep", className)}>
      <Deferred className="h-full w-full" rootMargin="400px 0px">
        <Silk />
      </Deferred>
    </div>
  );
}
