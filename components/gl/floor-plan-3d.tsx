"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box, Hand, LayoutGrid, List, Minus, Plus, RotateCcw, RotateCw, Search, X } from "lucide-react";
import { crisp, fontFamily, useGL } from "@/components/gl/use-gl";
import type { BoothStatus, FloorBooth, FloorHall } from "@/lib/floor-plan";
import { BRAND } from "@/lib/theme";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export const STATUS: Record<BoothStatus, { label: string; color: string }> = {
  AVAILABLE: { label: "Available", color: BRAND.green },
  RESERVED: { label: "Reserved", color: BRAND.gold },
  ALLOCATED: { label: "Allocated", color: BRAND.navy }, // navy accent
  OCCUPIED: { label: "Occupied", color: "#8a978f" },
};
const STATUSES = Object.keys(STATUS) as BoothStatus[];

type Placed = FloorBooth & { hall: string; x: number; z: number; w: number };
type Pad = { name: string; x: number; z: number; w: number; d: number };

const BOOTH = 2.2, AISLE = 3, GAP = 0.25, HALL_GAP = 4, BOOTH_H = 1.1;

/** Lays booths out in two rows facing a central aisle, hall after hall. */
function layout(halls: FloorHall[]) {
  const placed: Placed[] = [];
  const pads: Pad[] = [];
  let cursor = 0;
  halls.forEach((h) => {
    const widths = h.booths.map((b) => {
      const m = /(\d+)\s*[x×]\s*(\d+)/i.exec(b.size ?? "");
      return m ? Math.min(2, Math.max(1, Number(m[1]) / 3)) : 1;
    });
    const rowW = (row: number) => widths.filter((_, i) => i % 2 === row).reduce((a, w) => a + w * BOOTH + GAP, 0);
    const hallW = Math.max(rowW(0), rowW(1), BOOTH) + 2;
    const hallD = BOOTH * 2 + AISLE + 3;
    const cx = [cursor + 1, cursor + 1];
    h.booths.forEach((b, i) => {
      const row = i % 2;
      const w = widths[i] * BOOTH;
      placed.push({ ...b, hall: h.name, x: cx[row] + w / 2, z: row === 0 ? -(AISLE / 2 + BOOTH / 2) : AISLE / 2 + BOOTH / 2, w });
      cx[row] += w + GAP;
    });
    pads.push({ name: h.name, x: cursor + hallW / 2, z: 0, w: hallW, d: hallD });
    cursor += hallW + HALL_GAP;
  });
  const total = Math.max(1, cursor - HALL_GAP);
  placed.forEach((p) => (p.x -= total / 2));
  pads.forEach((p) => (p.x -= total / 2));
  return { placed, pads, total };
}

function textTexture(renderer: THREE.WebGLRenderer, text: string, opts: { w: number; h: number; bg?: string; color?: string; sub?: string }) {
  const c = document.createElement("canvas");
  c.width = opts.w; c.height = opts.h;
  const x = c.getContext("2d")!;
  if (opts.bg) { x.fillStyle = opts.bg; x.fillRect(0, 0, opts.w, opts.h); }
  x.fillStyle = opts.color ?? "#fff";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = `400 ${Math.round(opts.h * (opts.sub ? 0.4 : 0.62))}px ${fontFamily("--font-bebas", "Impact, sans-serif")}`;
  x.fillText(text, opts.w / 2, opts.sub ? opts.h * 0.42 : opts.h / 2, opts.w * 0.92);
  if (opts.sub) {
    x.globalAlpha = 0.8;
    x.font = `600 ${Math.round(opts.h * 0.12)}px ${fontFamily("--font-barlow", "sans-serif")}`;
    x.fillText(opts.sub, opts.w / 2, opts.h * 0.76, opts.w * 0.9);
  }
  return crisp(new THREE.CanvasTexture(c), renderer);
}

type SceneApi = {
  select: (i: number | null, focus?: boolean) => void;
  filter: (f: BoothStatus | null) => void;
  zoom: (factor: number) => void;
  rotate: (rad: number) => void;
  reset: () => void;
  topView: (on: boolean) => void;
  setActive: (on: boolean) => void;
};

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

export function FloorPlan3D({ halls }: { halls: FloorHall[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const api = useRef<SceneApi | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [filter, setFilter] = useState<BoothStatus | null>(null);
  const [view, setView] = useState<"3d" | "list">("3d");
  const [top, setTop] = useState(false);
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState(false);
  const touch = useMediaQuery("(pointer: coarse)");
  const [active, setActive] = useState(false);

  const { placed, pads, total } = useMemo(() => layout(halls), [halls]);
  const counts = useMemo(() => {
    const c: Record<BoothStatus, number> = { AVAILABLE: 0, RESERVED: 0, ALLOCATED: 0, OCCUPIED: 0 };
    placed.forEach((p) => c[p.status]++);
    return c;
  }, [placed]);
  const sel = selected !== null ? placed[selected] : null;
  const hov = hovered !== null ? placed[hovered] : null;

  // Refs mirror UI state for the scene, which may finish loading after the UI.
  const filterRef = useRef<BoothStatus | null>(null);
  const interactive = useRef(true);
  useEffect(() => {
    filterRef.current = filter;
    api.current?.filter(filter);
  }, [filter]);
  useEffect(() => {
    interactive.current = !touch || active;
    api.current?.setActive(interactive.current);
  }, [touch, active]);

  useGL(
    canvas,
    ({ renderer, canvas: cv, width, height, invalidate, reduce }) => {
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(34, width / height, 0.1, 600);

      scene.add(new THREE.HemisphereLight(0xffffff, 0xc5d8cc, 1.7));
      const sun = new THREE.DirectionalLight(0xffffff, 2.1);
      sun.position.set(total * 0.25, 42, 26);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      const sc = sun.shadow.camera as THREE.OrthographicCamera;
      sc.left = -total / 2 - 8; sc.right = total / 2 + 8; sc.top = 16; sc.bottom = -16; sc.far = 120;
      sun.shadow.bias = -0.0004;
      scene.add(sun);

      // Ground, halls, aisles and signage
      const disposables: { dispose: () => void }[] = [];
      const add = <T extends { dispose: () => void }>(d: T) => (disposables.push(d), d);

      const floor = new THREE.Mesh(add(new THREE.PlaneGeometry(total + 80, 120)), add(new THREE.MeshStandardMaterial({ color: BRAND.mint, roughness: 1 })));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const padMat = add(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 }));
      const aisleMat = add(new THREE.MeshStandardMaterial({ color: "#d6eadc", roughness: 1 }));
      pads.forEach((p) => {
        const pad = new THREE.Mesh(add(new THREE.BoxGeometry(p.w, 0.12, p.d)), padMat);
        pad.position.set(p.x, 0.06, p.z);
        pad.receiveShadow = true;
        scene.add(pad);
        const aisle = new THREE.Mesh(add(new THREE.PlaneGeometry(p.w - 1.2, AISLE - 0.6)), aisleMat);
        aisle.rotation.x = -Math.PI / 2;
        aisle.position.set(p.x, 0.125, p.z);
        aisle.receiveShadow = true;
        scene.add(aisle);
        const sign = new THREE.Mesh(
          add(new THREE.PlaneGeometry(Math.min(p.w - 1, 12), 1.5)),
          add(new THREE.MeshBasicMaterial({ map: add(textTexture(renderer, p.name.toUpperCase(), { w: 1024, h: 128, bg: BRAND.forest })) })),
        );
        sign.rotation.x = -Math.PI / 2;
        sign.position.set(p.x, 0.13, p.z + p.d / 2 - 1.1);
        scene.add(sign);
      });
      const entrance = new THREE.Mesh(
        add(new THREE.PlaneGeometry(8, 1.4)),
        add(new THREE.MeshBasicMaterial({ map: add(textTexture(renderer, "ENTRANCE", { w: 1024, h: 180, color: BRAND.green })), transparent: true })),
      );
      entrance.rotation.x = -Math.PI / 2;
      entrance.position.set(0, 0.02, BOOTH * 2 + AISLE / 2 + 3.2);
      scene.add(entrance);

      // Booths: shared geometry per width, own material for hover/filter states
      const geos = new Map<number, THREE.BoxGeometry>();
      const topGeos = new Map<number, THREE.PlaneGeometry>();
      const meshes: THREE.Mesh[] = [];
      placed.forEach((b, i) => {
        if (!geos.has(b.w)) {
          geos.set(b.w, add(new THREE.BoxGeometry(b.w - 0.1, BOOTH_H, 2.1)));
          topGeos.set(b.w, add(new THREE.PlaneGeometry(Math.min(b.w - 0.3, 2), 1.6)));
        }
        const col = new THREE.Color(STATUS[b.status].color);
        const mat = add(new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, metalness: 0.05, emissive: col, emissiveIntensity: 0, transparent: true }));
        const m = new THREE.Mesh(geos.get(b.w)!, mat);
        m.position.set(b.x, 0.12 + BOOTH_H / 2, b.z);
        m.castShadow = true;
        m.receiveShadow = true;
        m.userData = { i, y: m.position.y, lift: 0 };
        const label = new THREE.Mesh(
          topGeos.get(b.w)!,
          add(new THREE.MeshBasicMaterial({ map: add(textTexture(renderer, b.number, { w: 512, h: 512, sub: STATUS[b.status].label })), transparent: true })),
        );
        label.rotation.x = -Math.PI / 2;
        label.position.y = BOOTH_H / 2 + 0.01;
        m.add(label);
        scene.add(m);
        meshes.push(m);
      });

      const marker = new THREE.Mesh(add(new THREE.RingGeometry(1.5, 1.75, 64)), add(new THREE.MeshBasicMaterial({ color: BRAND.gold, transparent: true, opacity: 0.95 })));
      marker.rotation.x = -Math.PI / 2;
      marker.visible = false;
      scene.add(marker);

      // Camera + controls
      const controls = new OrbitControls(cam, cv);
      controls.enableDamping = true;
      controls.dampingFactor = 0.09;
      controls.zoomToCursor = true;
      controls.screenSpacePanning = false;
      controls.minPolarAngle = 0.02;
      controls.maxPolarAngle = 1.2; // never dip below the floor
      controls.rotateSpeed = 0.7;
      controls.zoomSpeed = 0.9;
      const limit = total / 2 + 6;

      // Distance at which every hall fits the canvas width, viewed from ~50 degrees up.
      const ELEVATION = THREE.MathUtils.degToRad(50);
      const homeDistance = () => {
        const halfW = total / 2 + 3;
        const hHalf = Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect);
        return Math.max(16, (halfW / Math.tan(hHalf)) * 0.9);
      };
      const homePos = () => {
        const d = homeDistance();
        return new THREE.Vector3(0, Math.sin(ELEVATION) * d, Math.cos(ELEVATION) * d);
      };
      const fitLimits = () => {
        controls.minDistance = 5;
        controls.maxDistance = homeDistance() * 1.8;
      };
      cam.aspect = width / height;
      cam.updateProjectionMatrix();
      fitLimits();
      cam.position.copy(homePos());
      controls.target.set(0, 0, 0);
      controls.update();

      // Smooth camera moves
      let tween: { p0: THREE.Vector3; p1: THREE.Vector3; t0: THREE.Vector3; t1: THREE.Vector3; start: number; dur: number } | null = null;
      const flyTo = (pos: THREE.Vector3, target: THREE.Vector3, dur = 900) => {
        tween = { p0: cam.position.clone(), p1: pos, t0: controls.target.clone(), t1: target, start: performance.now(), dur: reduce ? 1 : dur };
        invalidate();
      };

      // Hover + click picking
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2(9, 9);
      let hover = -1, down: { x: number; y: number } | null = null, filterNow: BoothStatus | null = null, selectedNow = -1;
      const pick = () => {
        ray.setFromCamera(ndc, cam);
        const hit = ndc.x < 5 ? ray.intersectObjects(meshes, false)[0] : undefined;
        return hit ? (hit.object.userData.i as number) : -1;
      };
      const onMove = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        if (tip.current) tip.current.style.transform = `translate3d(${Math.round(e.clientX - r.left + 16)}px, ${Math.round(e.clientY - r.top + 16)}px, 0)`;
        const h = pick();
        if (h !== hover) {
          hover = h;
          setHovered(h >= 0 ? h : null);
          cv.style.cursor = h >= 0 ? "pointer" : "grab";
          invalidate();
        }
      };
      const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
      const onUp = (e: PointerEvent) => {
        if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) {
          const h = pick();
          api.current?.select(h >= 0 ? h : null, h >= 0);
          setSelected(h >= 0 ? h : null);
        }
        down = null;
      };
      const onLeave = () => {
        ndc.set(9, 9);
        if (hover !== -1) { hover = -1; setHovered(null); invalidate(); }
      };
      // Wheel zooms only with Ctrl/Cmd (or after clicking into the plan), so
      // the page keeps scrolling normally when the cursor passes over.
      let engaged = false;
      const onWheel = (e: WheelEvent) => {
        const allow = engaged || e.ctrlKey || e.metaKey;
        controls.enableZoom = allow;
        if (!allow) setHint(true);
      };
      const onEngage = () => { engaged = true; };
      const onDisengage = (e: PointerEvent) => { if (!cv.contains(e.target as Node)) engaged = false; };
      cv.addEventListener("pointermove", onMove);
      cv.addEventListener("pointerdown", onDown);
      cv.addEventListener("pointerdown", onEngage);
      cv.addEventListener("pointerup", onUp);
      cv.addEventListener("pointerleave", onLeave);
      cv.addEventListener("wheel", onWheel, { capture: true, passive: true });
      window.addEventListener("pointerdown", onDisengage);
      controls.addEventListener("change", invalidate);

      const focusOn = (i: number) => {
        const b = placed[i];
        const target = new THREE.Vector3(b.x, 0, b.z);
        const dir = cam.position.clone().sub(controls.target).normalize();
        flyTo(target.clone().add(dir.multiplyScalar(19)), target);
      };

      api.current = {
        select: (i, focus = true) => {
          selectedNow = i ?? -1;
          if (i !== null && i >= 0) {
            marker.visible = true;
            marker.position.set(placed[i].x, 0.14, placed[i].z);
            marker.scale.set(placed[i].w / BOOTH, 1, 1);
            if (focus) focusOn(i);
          } else marker.visible = false;
          invalidate();
        },
        filter: (f) => { filterNow = f; invalidate(); },
        zoom: (factor) => {
          const offset = cam.position.clone().sub(controls.target);
          const d = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
          flyTo(controls.target.clone().add(offset.setLength(d)), controls.target.clone(), 420);
        },
        rotate: (rad) => {
          const offset = cam.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), rad);
          flyTo(controls.target.clone().add(offset), controls.target.clone(), 600);
        },
        reset: () => flyTo(homePos(), new THREE.Vector3()),
        topView: (on) => {
          const d = cam.position.distanceTo(controls.target);
          const t = controls.target.clone();
          flyTo(on ? t.clone().add(new THREE.Vector3(0, d, 0.01)) : t.clone().add(new THREE.Vector3(0, d * 0.72, d * 0.7)), t, 700);
        },
        setActive: (on) => {
          controls.enabled = on;
          // When locked (touch screens), let one-finger swipes scroll the page.
          cv.style.touchAction = on ? "none" : "pan-y";
        },
      };
      // Apply UI state that existed before the scene finished loading.
      api.current.setActive(interactive.current);
      api.current.filter(filterRef.current);

      return {
        resize: (w, h) => {
          cam.aspect = w / h;
          cam.updateProjectionMatrix();
          fitLimits();
        },
        frame: () => {
          let animating = false;
          if (tween) {
            const k = Math.min(1, (performance.now() - tween.start) / tween.dur);
            const e = easeInOut(k);
            cam.position.lerpVectors(tween.p0, tween.p1, e);
            controls.target.lerpVectors(tween.t0, tween.t1, e);
            if (k >= 1) tween = null;
            animating = true;
          }
          // Keep the view over the halls.
          controls.target.x = THREE.MathUtils.clamp(controls.target.x, -limit, limit);
          controls.target.z = THREE.MathUtils.clamp(controls.target.z, -14, 14);
          controls.target.y = 0;
          if (controls.update()) animating = true;

          meshes.forEach((m, i) => {
            const on = !filterNow || placed[i].status === filterNow;
            const target = (i === hover || i === selectedNow ? 0.4 : 0) + (on ? 0 : -0.5);
            const mat = m.material as THREE.MeshStandardMaterial;
            const emissive = i === selectedNow ? 0.3 : i === hover ? 0.22 : 0;
            const opacity = on ? 1 : 0.2;
            m.userData.lift += (target - m.userData.lift) * 0.2;
            mat.emissiveIntensity += (emissive - mat.emissiveIntensity) * 0.25;
            mat.opacity += (opacity - mat.opacity) * 0.25;
            m.position.y = m.userData.y + m.userData.lift;
            if (Math.abs(target - m.userData.lift) > 0.002 || Math.abs(opacity - mat.opacity) > 0.004 || Math.abs(emissive - mat.emissiveIntensity) > 0.004) animating = true;
          });
          renderer.render(scene, cam);
          if (animating) invalidate();
        },
        dispose: () => {
          cv.removeEventListener("pointermove", onMove);
          cv.removeEventListener("pointerdown", onDown);
          cv.removeEventListener("pointerdown", onEngage);
          cv.removeEventListener("pointerup", onUp);
          cv.removeEventListener("pointerleave", onLeave);
          cv.removeEventListener("wheel", onWheel, { capture: true });
          window.removeEventListener("pointerdown", onDisengage);
          controls.removeEventListener("change", invalidate);
          controls.dispose();
          disposables.forEach((d) => d.dispose());
          api.current = null;
        },
      };
    },
    [placed, pads, total],
    { demand: true, shadows: true },
  );

  // Hide the zoom hint shortly after it appears
  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(false), 1600);
    return () => clearTimeout(t);
  }, [hint]);

  const choose = (i: number | null) => {
    setSelected(i);
    setView("3d");
    api.current?.select(i, true);
  };

  const matches = query.trim()
    ? placed.map((p, i) => ({ p, i })).filter(({ p }) => p.number.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="relative overflow-hidden rounded-[2rem] bg-mint">
        {/* Toolbar */}
        <div className="absolute inset-x-4 top-4 z-10 flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <FilterChip on={!filter} onClick={() => setFilter(null)}>All {placed.length}</FilterChip>
            {STATUSES.map((s) => (
              <FilterChip key={s} on={filter === s} onClick={() => setFilter(filter === s ? null : s)}>
                <i className="size-3 rounded-[4px]" style={{ background: STATUS[s].color }} />
                {STATUS[s].label} {counts[s]}
              </FilterChip>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <label className="flex h-10 items-center gap-2 rounded-full bg-white px-4 shadow-sm">
                <Search className="size-4 text-ink/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && matches[0] && (choose(matches[0].i), setQuery(""))}
                  placeholder="Find booth"
                  aria-label="Find a booth by number"
                  className="w-24 bg-transparent text-sm text-ink outline-none placeholder:text-ink/45"
                />
              </label>
              {matches.length ? (
                <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-2xl bg-white shadow-xl">
                  {matches.map(({ p, i }) => (
                    <button key={p.number} onClick={() => (choose(i), setQuery(""))} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-mint">
                      <span className="font-semibold text-ink">{p.number}</span>
                      <span className="text-xs" style={{ color: STATUS[p.status].color }}>{STATUS[p.status].label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex rounded-full bg-white p-1 shadow-sm">
              <button aria-label="3D view" aria-pressed={view === "3d"} onClick={() => setView("3d")} className={cn("grid size-8 place-items-center rounded-full transition", view === "3d" ? "bg-forest text-white" : "text-ink")}>
                <Box className="size-4" />
              </button>
              <button aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")} className={cn("grid size-8 place-items-center rounded-full transition", view === "list" ? "bg-forest text-white" : "text-ink")}>
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-[460px] md:h-[560px]">
            <canvas ref={canvas} className="h-full w-full" aria-label="3D floor plan of the exhibition halls. Click a booth to see its details." />

            {/* Hover tooltip (follows the cursor without re-rendering) */}
            <div ref={tip} className={cn("pointer-events-none absolute left-0 top-0 z-10 rounded-xl bg-forest px-3 py-2 text-sm text-white shadow-lg transition-opacity", hov && !touch ? "opacity-100" : "opacity-0")}>
              {hov ? (
                <>
                  <span className="font-display text-xl">Booth {hov.number}</span>
                  <span className="ml-2" style={{ color: hov.status === "ALLOCATED" ? "#9dbbe3" : STATUS[hov.status].color }}>{STATUS[hov.status].label}</span>
                </>
              ) : null}
            </div>

            {/* Touch screens: tap to interact, so swipes keep scrolling the page */}
            {touch && !active ? (
              <button onClick={() => setActive(true)} className="absolute inset-0 z-10 grid place-items-center bg-forest/10">
                <span className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 font-semibold text-white shadow-xl">
                  <Hand className="size-4" /> Tap to explore in 3D
                </span>
              </button>
            ) : null}
            {touch && active ? (
              <button onClick={() => setActive(false)} className="absolute left-4 top-[4.5rem] z-10 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg">
                <X className="size-4" /> Done
              </button>
            ) : null}

            <div className={cn("pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-300", hint ? "opacity-100" : "opacity-0")}>
              <span className="rounded-full bg-forest/90 px-5 py-3 text-sm font-semibold text-white">Hold Ctrl (or Cmd) and scroll to zoom, or click the plan first</span>
            </div>

            <div className="absolute bottom-4 right-4 z-10 flex gap-2">
              <CtlButton label="Zoom in" onClick={() => api.current?.zoom(0.7)}><Plus className="size-5" /></CtlButton>
              <CtlButton label="Zoom out" onClick={() => api.current?.zoom(1.4)}><Minus className="size-5" /></CtlButton>
              <CtlButton label="Rotate" onClick={() => api.current?.rotate(Math.PI / 4)}><RotateCw className="size-5" /></CtlButton>
              <CtlButton label={top ? "Angled view" : "Top-down view"} pressed={top} onClick={() => { api.current?.topView(!top); setTop(!top); }}>
                <LayoutGrid className="size-5" />
              </CtlButton>
              <CtlButton label="Reset view" onClick={() => { api.current?.reset(); setTop(false); }}><RotateCcw className="size-5" /></CtlButton>
            </div>
            <p className="pointer-events-none absolute bottom-5 left-5 hidden text-sm text-ink/55 md:block">
              Drag to rotate. Right-drag to pan. Ctrl + scroll to zoom. Click a booth.
            </p>

          {/* List view: accessible alternative to the 3D scene (the canvas stays mounted underneath) */}
          {view === "list" ? (
          <div className="absolute inset-0 z-[5] overflow-y-auto bg-mint px-4 pb-6 pt-20" data-lenis-prevent>
            {halls.map((h) => (
              <div key={h.name} className="mt-4">
                <p className="font-display text-2xl text-ink">{h.name}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {placed.map((p, i) => ({ p, i })).filter(({ p }) => p.hall === h.name && (!filter || p.status === filter)).map(({ p, i }) => (
                    <button
                      key={p.number}
                      onClick={() => choose(i)}
                      className={cn("rounded-2xl p-3 text-left text-white transition hover:-translate-y-0.5", selected === i && "ring-4 ring-gold")}
                      style={{ background: STATUS[p.status].color }}
                    >
                      <span className="block font-display text-2xl leading-none">{p.number}</span>
                      <span className="text-xs opacity-80">{STATUS[p.status].label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          ) : null}
        </div>
      </div>

      <aside className="flex flex-col rounded-[2rem] bg-forest p-7 text-white" aria-live="polite">
        {sel ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow">{sel.hall}</p>
              <button aria-label="Clear selection" onClick={() => choose(null)} className="grid size-8 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-3 font-display text-7xl leading-none">Booth {sel.number}</p>
            <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: STATUS[sel.status].color }}>
              {STATUS[sel.status].label}
            </span>
            <dl className="mt-8 grid grid-cols-2 gap-4">
              <Fact label="Size" value={sel.size || "3 x 3 m"} />
              <Fact label="Category" value={sel.category || "Standard"} />
              {sel.price ? <Fact label="Price" value={`KES ${sel.price}`} wide /> : null}
            </dl>
            <Link href="/register" className={cn("btn mt-auto w-full", sel.status === "AVAILABLE" ? "btn-gold" : "btn-ghost-light")}>
              {sel.status === "AVAILABLE" ? "Book this booth" : "Join the waiting list"}
            </Link>
          </>
        ) : (
          <>
            <p className="eyebrow">Live floor plan</p>
            <p className="mt-3 font-display text-6xl leading-[.9]">Pick your spot on the floor</p>
            <p className="mt-4 text-white/65">Tap any booth to fly to it and see its size, category and availability. Green booths are open now.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {STATUSES.map((s) => (
                <button key={s} onClick={() => setFilter(filter === s ? null : s)} className={cn("rounded-2xl p-4 text-left transition", filter === s ? "bg-white/15" : "bg-white/6 hover:bg-white/10")}>
                  <p className="font-display text-5xl leading-none" style={{ color: s === "ALLOCATED" ? "#9dbbe3" : s === "AVAILABLE" ? "#5fd394" : STATUS[s].color }}>{counts[s]}</p>
                  <p className="mt-1 text-sm text-white/60">{STATUS[s].label}</p>
                </button>
              ))}
            </div>
            <Link href="/register" className="btn btn-gold mt-auto w-full">Book your booth</Link>
          </>
        )}
      </aside>
    </div>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold shadow-sm transition", on ? "bg-forest text-white" : "bg-white text-ink hover:bg-white/80")}
    >
      {children}
    </button>
  );
}

function CtlButton({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: React.ReactNode }) {
  return (
    <button aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} className={cn("grid size-11 place-items-center rounded-full shadow-lg transition", pressed ? "bg-forest text-white" : "bg-white text-ink hover:bg-gold")}>
      {children}
    </button>
  );
}

function Fact({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn("rounded-2xl bg-white/6 p-4", wide && "col-span-2")}>
      <dt className="text-xs uppercase tracking-widest text-white/50">{label}</dt>
      <dd className="mt-1 font-display text-3xl">{value}</dd>
    </div>
  );
}
