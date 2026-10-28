"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { useGL } from "@/components/gl/use-gl";
import { MERU_LL, ORIGINS } from "@/lib/globe-data";
import { BRAND } from "@/lib/theme";

const AFRICA = new Set(
  "012 024 204 072 854 108 120 132 140 148 174 178 180 262 818 226 232 748 231 266 270 288 324 624 384 404 426 430 434 450 454 466 478 504 508 516 562 566 646 686 694 706 710 728 729 834 768 788 800 732 894 716".split(" "),
);
const KENYA = "404";
const D = Math.PI / 180;
const EARTH = 5;
const ATMOS = 5.45;

const ll = (la: number, lo: number, r: number) =>
  new THREE.Vector3(r * Math.cos(la * D) * Math.sin(lo * D), r * Math.sin(la * D), r * Math.cos(la * D) * Math.cos(lo * D));

/** Equirectangular map: Africa in brand green, Kenya in gold, the rest muted. */
function paintMap() {
  const W = 4096, H = 2048;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  x.fillStyle = "#0c3a3a"; // deep teal ocean: the only hint of blue
  x.fillRect(0, 0, W, H);
  x.strokeStyle = "rgba(255,255,255,.05)";
  x.lineWidth = 2;
  for (let l = -180; l <= 180; l += 20) { const p = ((l + 180) / 360) * W; x.beginPath(); x.moveTo(p, 0); x.lineTo(p, H); x.stroke(); }
  for (let l = -80; l <= 80; l += 20) { const p = ((90 - l) / 180) * H; x.beginPath(); x.moveTo(0, p); x.lineTo(W, p); x.stroke(); }

  const feats: any[] = (feature(world as any, (world as any).objects.countries) as any).features;
  const path = (g: any) => {
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    x.beginPath();
    for (const poly of polys)
      for (const ring of poly) {
        ring.forEach(([lo, la]: number[], i: number) => {
          const px = ((lo + 180) / 360) * W, py = ((90 - la) / 180) * H;
          if (i) x.lineTo(px, py); else x.moveTo(px, py);
        });
        x.closePath();
      }
  };
  const id = (f: any) => String(f.id ?? "").padStart(3, "0");
  const draw = (f: any, fill: string, stroke: string, lw: number) => {
    path(f.geometry); x.fillStyle = fill; x.fill("evenodd"); x.strokeStyle = stroke; x.lineWidth = lw; x.stroke();
  };
  feats.filter((f) => id(f) !== "010" && !AFRICA.has(id(f))).forEach((f) => draw(f, "#2a5b46", "rgba(255,255,255,.14)", 1.5));
  feats.filter((f) => AFRICA.has(id(f)) && id(f) !== KENYA).forEach((f) => draw(f, BRAND.leaf, "rgba(255,255,255,.35)", 2));
  feats.filter((f) => id(f) === KENYA).forEach((f) => draw(f, BRAND.gold, "#ffffff", 4));
  return c;
}

const EARTH_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
// Soft daylight from the upper left + a faint mint rim. No hard terminator.
const EARTH_FRAG = /* glsl */ `
uniform sampler2D uMap; uniform vec3 uRim;
varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){
  vec3 base = texture2D(uMap, vUv).rgb;
  vec3 L = normalize(vec3(-0.55, 0.6, 0.75));
  float diff = 0.55 + 0.6 * max(dot(vN, L), 0.);
  float rim = pow(1. - max(dot(vN, vV), 0.), 3.);
  gl_FragColor = vec4(base * diff + uRim * rim * .35, 1.);
  #include <colorspace_fragment>
}`;
const ATMOS_VERT = /* glsl */ `
varying vec3 vN;
void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
// Halo fades to zero at its outer edge, so there is never a visible ring or border.
const ATMOS_FRAG = /* glsl */ `
uniform vec3 uColor; uniform float uEdge;
varying vec3 vN;
void main(){
  float k = clamp(-vN.z, 0., 1.);
  float a = pow(clamp(k / uEdge, 0., 1.), 2.2) * .45;
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}`;

/**
 * The 3D globe. `selected` (index into ORIGINS, or -1) highlights one route
 * and turns the globe to frame it. Drag to spin.
 */
export function GlobeCanvas({ selected }: { selected: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const select = useRef<(i: number) => void>(() => {});
  const initial = useRef(selected);

  useEffect(() => {
    select.current(selected);
  }, [selected]);

  useGL(canvas, ({ renderer, reduce, width, height, canvas: cv }) => {
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(34, width / height, 0.1, 200);
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = 0.2;
    scene.add(tiltGroup);
    const G = new THREE.Group();
    tiltGroup.add(G);

    const tex = new THREE.CanvasTexture(paintMap());
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const earthMat = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: tex }, uRim: { value: new THREE.Color(BRAND.mint) } },
      vertexShader: EARTH_VERT,
      fragmentShader: EARTH_FRAG,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH, 160, 120), earthMat);
    earth.rotation.y = -Math.PI / 2; // aligns the texture with ll()
    G.add(earth);

    const atmosMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color("#7fd6a3") }, uEdge: { value: Math.sqrt(1 - (EARTH / ATMOS) ** 2) } },
      vertexShader: ATMOS_VERT,
      fragmentShader: ATMOS_FRAG,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const atmos = new THREE.Mesh(new THREE.SphereGeometry(ATMOS, 96, 64), atmosMat);
    tiltGroup.add(atmos);

    const meru = ll(MERU_LL.lat, MERU_LL.lon, EARTH + 0.01);
    const pinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.45, 12);
    pinGeo.translate(0, 0.225, 0);
    const pinGold = new THREE.MeshBasicMaterial({ color: BRAND.gold });
    const pinWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const up = new THREE.Vector3(0, 1, 0);
    const pin = (p: THREE.Vector3, mat: THREE.Material, s: number) => {
      const m = new THREE.Mesh(pinGeo, mat);
      m.position.copy(p);
      m.quaternion.setFromUnitVectors(up, p.clone().normalize());
      m.scale.setScalar(s);
      G.add(m);
    };
    pin(meru, pinGold, 2.2);

    const SEG = 80, RAD = 8, STEP = RAD * 6, TOTAL = SEG * STEP;
    const arcs = ORIGINS.map((o, i) => {
      const a = ll(o.lat, o.lon, EARTH + 0.01);
      pin(a, pinWhite, 1);
      const mid = a.clone().add(meru).multiplyScalar(0.5);
      mid.setLength(EARTH + a.distanceTo(meru) * 0.32);
      const geo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, meru), SEG, 0.024, RAD, false);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false });
      G.add(new THREE.Mesh(geo, mat));
      return { geo, mat, i };
    });

    // Rotation state
    const base = -MERU_LL.lon * D;
    let off = 0, tilt = 0.2, drag: number | null = null, idle = 0, focusLon: number | null = null, focusLat = 0, sel = -1;
    G.rotation.y = base - 1.2;

    select.current = (i: number) => {
      sel = i;
      off = 0;
      idle = performance.now();
      if (i < 0) { focusLon = null; return; }
      const o = ORIGINS[i];
      let dl = o.lon - MERU_LL.lon;
      if (dl > 180) dl -= 360;
      if (dl < -180) dl += 360;
      focusLon = MERU_LL.lon + dl / 2;
      focusLat = (o.lat + MERU_LL.lat) / 2;
    };
    select.current(initial.current);

    const down = (e: PointerEvent) => { drag = e.clientX; cv.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (drag === null) return; off += (e.clientX - drag) * 0.008; drag = e.clientX; idle = performance.now(); };
    const upH = () => { drag = null; };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", upH);

    // Fit the whole globe and its halo inside the canvas with breathing room,
    // whatever the aspect ratio, so the edges of the canvas never cut it off.
    const fit = (w: number, h: number) => {
      cam.aspect = w / h;
      const vHalf = (cam.fov / 2) * D;
      const hHalf = Math.atan(Math.tan(vHalf) * cam.aspect);
      cam.position.set(0, 0, (ATMOS * 1.06) / Math.sin(Math.min(vHalf, hHalf)));
      cam.lookAt(0, 0, 0);
      cam.updateProjectionMatrix();
    };
    fit(width, height);

    return {
      resize: fit,
      frame: (t) => {
        const auto = drag === null && performance.now() - idle > 3500;
        if (auto && focusLon === null) off *= 0.98;
        const sway = auto && !reduce && focusLon === null ? Math.sin(t * 0.22) * 0.55 : 0;
        const target = (focusLon === null ? base : -focusLon * D) + off + sway;
        G.rotation.y += (target - G.rotation.y) * 0.06;
        tilt += ((focusLon === null ? 0.2 : focusLat * D) - tilt) * 0.06;
        tiltGroup.rotation.x = tilt;

        arcs.forEach(({ geo, mat, i }) => {
          const on = sel === i;
          const ph = reduce ? 1 : (t * 0.4 + i * 0.19) % 1.8;
          const k = on ? 1 : Math.min(1, ph);
          geo.setDrawRange(0, Math.max(STEP, Math.floor((k * TOTAL) / STEP) * STEP));
          mat.color.set(on ? BRAND.gold : 0xffffff);
          const fade = ph < 1 ? 0.75 : Math.max(0, 0.75 - (ph - 1) / 0.8);
          mat.opacity = on ? 1 : sel >= 0 ? fade * 0.25 : fade;
        });
        renderer.render(scene, cam);
      },
      dispose: () => {
        cv.removeEventListener("pointerdown", down);
        cv.removeEventListener("pointermove", move);
        cv.removeEventListener("pointerup", upH);
        tex.dispose();
        earthMat.dispose(); earth.geometry.dispose();
        atmosMat.dispose(); atmos.geometry.dispose();
        arcs.forEach((a) => { a.geo.dispose(); a.mat.dispose(); });
        pinGeo.dispose(); pinGold.dispose(); pinWhite.dispose();
      },
    };
  });

  return <canvas ref={canvas} className="h-full w-full" aria-label="Interactive globe highlighting Africa, Kenya and routes into Meru" />;
}
