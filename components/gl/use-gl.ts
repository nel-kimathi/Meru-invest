"use client";

import { useEffect, useState, type RefObject } from "react";
import * as THREE from "three";

export type GLContext = {
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  reduce: boolean;
  width: number;
  height: number;
  /** Request a frame when rendering on demand. */
  invalidate: () => void;
};

export type GLScene = {
  /** Called every animation frame while visible. Return false to skip rendering this frame. */
  frame: (t: number, dt: number) => void | boolean;
  resize?: (w: number, h: number) => void;
  dispose?: () => void;
};

type Options = {
  alpha?: boolean;
  antialias?: boolean;
  /** Max device pixel ratio. 2 keeps retina screens sharp. */
  maxDpr?: number;
  /** Lowest pixel ratio the adaptive quality may drop to on slow devices. */
  minDpr?: number;
  /** Only call frame() after invalidate() (static scenes such as the floor plan). */
  demand?: boolean;
  shadows?: boolean;
};

const ric: (cb: () => void) => number =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (cb) => window.requestIdleCallback(cb, { timeout: 600 })
    : (cb) => window.setTimeout(cb, 1);
const cic = (id: number) =>
  typeof window !== "undefined" && "cancelIdleCallback" in window ? window.cancelIdleCallback(id) : clearTimeout(id);

/**
 * Shared Three.js lifecycle for every canvas on the site:
 *  - starts in an idle callback so it never blocks first paint
 *  - sRGB output, capped device pixel ratio, ResizeObserver sizing
 *  - pauses when off screen or in a background tab
 *  - adaptive quality: lowers the pixel ratio if frames run slow
 *  - optional render-on-demand
 *  - full disposal on unmount
 * Returns false when WebGL is unavailable so callers can show a fallback.
 */
export function useGL(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  setup: (ctx: GLContext) => GLScene,
  deps: unknown[] = [],
  { alpha = true, antialias = true, maxDpr = 2, minDpr = 1, demand = false, shadows = false }: Options = {},
) {
  const [ok, setOk] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cleanup = () => {};
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias, powerPreference: "high-performance" });
      } catch {
        setOk(false);
        return;
      }
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      if (shadows) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }
      let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const host = canvas.parentElement ?? canvas;
      let dirty = true;
      const ctx: GLContext = {
        renderer,
        canvas,
        reduce,
        width: host.clientWidth || 1,
        height: host.clientHeight || 1,
        invalidate: () => (dirty = true),
      };
      const scene = setup(ctx);

      const resize = () => {
        const w = Math.max(1, host.clientWidth);
        const h = Math.max(1, host.clientHeight);
        ctx.width = w;
        ctx.height = h;
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        scene.resize?.(w, h);
        dirty = true;
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      let visible = false;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        dirty = true;
      }, { rootMargin: "100px" });
      io.observe(host);

      // Adaptive quality
      let slow = 0, samples = 0;
      const adapt = (dt: number) => {
        samples++;
        if (dt > 1 / 40) slow++;
        if (samples < 90) return;
        if (slow / samples > 0.5 && dpr > minDpr) {
          dpr = Math.max(minDpr, dpr - 0.25);
          resize();
        }
        slow = samples = 0;
      };

      let raf = 0;
      let last = performance.now();
      const loop = (now: number) => {
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        if (visible && !document.hidden && (!demand || dirty)) {
          dirty = false;
          scene.frame(now / 1000, dt);
          if (!demand) adapt(dt);
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        scene.dispose?.();
        renderer.dispose();
        renderer.forceContextLoss();
      };
    };

    const idleId = ric(start);
    return () => {
      cancelled = true;
      cic(idleId);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ok;
}

const WIDTHS = [640, 750, 828, 1080, 1200, 1440, 1920, 2560, 3840];

/**
 * URL for a photo resized by Next's image optimiser to the width the canvas
 * really needs (CSS width x DPR). Gives WebGL textures the same crispness and
 * small file size as next/image. Remote or absolute URLs are passed through.
 */
export function optimizedSrc(src: string, cssWidth: number, quality = 90) {
  if (!src.startsWith("/")) return src;
  const need = cssWidth * Math.min(window.devicePixelRatio || 1, 2);
  const w = WIDTHS.find((x) => x >= need) ?? WIDTHS[WIDTHS.length - 1];
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`;
}

/** Configure a texture for maximum sharpness at any viewing angle. */
export function crisp<T extends THREE.Texture>(tex: T, renderer: THREE.WebGLRenderer): T {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

/** Resolved font family names (next/font hashes them), for canvas text. */
export function fontFamily(varName: "--font-bebas" | "--font-barlow", fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.body).getPropertyValue(varName).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

/** Disposes every geometry, material and texture under an object. */
export function disposeTree(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    mats.forEach((mat) => {
      Object.values(mat).forEach((v) => (v as THREE.Texture)?.isTexture && (v as THREE.Texture).dispose());
      mat.dispose();
    });
  });
}
