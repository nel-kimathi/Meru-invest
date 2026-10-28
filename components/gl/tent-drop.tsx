"use client";

import { useRef } from "react";
import * as THREE from "three";
import { crisp, fontFamily, useGL } from "@/components/gl/use-gl";
import { BRAND } from "@/lib/theme";

type TentStyle = { stripe: string; base: string; valance: string; text: string; sign: string; wall: string };

const TENTS: { style: TentStyle; x: number; z: number; scale: number; delay: number; ry: number }[] = [
  { style: { stripe: BRAND.green, base: "#ffffff", valance: BRAND.gold, text: BRAND.forest, sign: "BOOK YOUR BOOTH", wall: "YOUR BRAND HERE" }, x: 0, z: 0.6, scale: 1, delay: 0, ry: -0.18 },
  { style: { stripe: BRAND.gold, base: "#ffffff", valance: BRAND.green, text: "#ffffff", sign: "MERU INVEST", wall: "EXHIBIT" }, x: -4.4, z: -2.6, scale: 0.78, delay: 0.32, ry: 0.32 },
  { style: { stripe: BRAND.navy, base: "#ffffff", valance: BRAND.gold, text: BRAND.forest, sign: "MERU INVEST", wall: "TRADE" }, x: 4.5, z: -2.3, scale: 0.78, delay: 0.55, ry: -0.42 },
];

/** Radial stripes for the canopy (ConeGeometry wraps U around the apex). */
function stripeTexture(a: string, b: string) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 64;
  const x = c.getContext("2d")!;
  const n = 16;
  for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect((i * c.width) / n, 0, c.width / n + 1, c.height); }
  return c;
}

/** Valance band with a scalloped lower edge and optional lettering. */
function valanceTexture(color: string, text: string, textColor: string) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 160;
  const x = c.getContext("2d")!;
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, 110);
  const r = 32;
  for (let cx = r; cx < c.width + r; cx += r * 2) { x.beginPath(); x.arc(cx, 108, r, 0, Math.PI); x.fill(); }
  if (text) {
    x.fillStyle = textColor;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = `400 92px ${fontFamily("--font-bebas", "Impact, sans-serif")}`;
    x.fillText(text, c.width / 2, 58, c.width * 0.92);
  }
  return c;
}

function counterTexture(text: string) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 400;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, c.width, c.height);
  g.addColorStop(0, BRAND.green); g.addColorStop(1, BRAND.forest);
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = BRAND.gold; x.fillRect(0, c.height - 46, c.width, 46);
  x.fillStyle = "#fff";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = `400 150px ${fontFamily("--font-bebas", "Impact, sans-serif")}`;
  x.fillText(text, c.width / 2, c.height / 2 - 20, c.width * 0.9);
  return c;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(10,38,25,.55)"); g.addColorStop(1, "rgba(10,38,25,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return c;
}

const SIZE = 3.2, LEG = 2.3, ROOF_H = 1.15, VAL_H = 0.58;

function buildTent(style: TentStyle, renderer: THREE.WebGLRenderer, shared: { leg: THREE.BufferGeometry; metal: THREE.Material }) {
  const tent = new THREE.Group();
  const body = new THREE.Group(); // squashes on landing; the shadow stays flat
  tent.add(body);
  const textures: THREE.Texture[] = [];
  const tex = (c: HTMLCanvasElement) => { const t = crisp(new THREE.CanvasTexture(c), renderer); textures.push(t); return t; };

  const half = SIZE / 2;
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const leg = new THREE.Mesh(shared.leg, shared.metal);
    leg.position.set(sx * (half - 0.06), LEG / 2, sz * (half - 0.06));
    body.add(leg);
  }

  // Canopy: 4-sided cone turned 45 degrees so its edges meet the corners.
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(half * Math.SQRT2 * 1.04, ROOF_H, 4, 1, true),
    new THREE.MeshStandardMaterial({ map: tex(stripeTexture(style.stripe, style.base)), side: THREE.DoubleSide, roughness: 0.75 }),
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = LEG + ROOF_H / 2;
  body.add(roof);

  // Valance on all four sides; lettering on the front.
  const valFront = tex(valanceTexture(style.valance, style.sign, style.text));
  const valSide = tex(valanceTexture(style.valance, "", style.text));
  for (let i = 0; i < 4; i++) {
    const v = new THREE.Mesh(
      new THREE.PlaneGeometry(SIZE * 1.02, VAL_H * 1.45),
      new THREE.MeshStandardMaterial({ map: i === 0 ? valFront : valSide, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }),
    );
    const a = (i * Math.PI) / 2;
    v.position.set(Math.sin(a) * half * 1.01, LEG - VAL_H * 0.55 + 0.02, Math.cos(a) * half * 1.01);
    v.rotation.y = a;
    body.add(v);
  }

  // Back wall
  const wallMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(SIZE - 0.2, LEG - 0.25, 0.06), [
    wallMat, wallMat, wallMat, wallMat,
    new THREE.MeshStandardMaterial({ map: tex(counterTexture(style.wall)), roughness: 0.8 }),
    wallMat,
  ]);
  wall.position.set(0, (LEG - 0.25) / 2, -half + 0.08);
  body.add(wall);

  // Counter with branded front
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(SIZE * 0.66, 0.95, 0.62),
    [
      new THREE.MeshStandardMaterial({ color: BRAND.forest }),
      new THREE.MeshStandardMaterial({ color: BRAND.forest }),
      new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: BRAND.forest }),
      new THREE.MeshStandardMaterial({ map: tex(counterTexture("MERU INVEST")), roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: BRAND.forest }),
    ],
  );
  counter.position.set(0, 0.475, half * 0.42);
  body.add(counter);

  return { tent, body, textures };
}

/**
 * Three branded canopy tents that pop up, fly and land with a squash and
 * bounce when the section scrolls into view. Hover a tent to make it hop.
 */
export function TentDrop() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useGL(canvas, ({ renderer, reduce, width, height, canvas: cv }) => {
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe3d6, 1.9));
    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(-6, 12, 9);
    scene.add(sun);

    const shared = {
      leg: new THREE.CylinderGeometry(0.05, 0.05, LEG, 10),
      metal: new THREE.MeshStandardMaterial({ color: 0xdfe6e2, metalness: 0.6, roughness: 0.35 }),
    };
    const shadowTex = new THREE.CanvasTexture(shadowTexture());
    const shadowGeo = new THREE.PlaneGeometry(1, 1);
    const allTextures: THREE.Texture[] = [shadowTex];

    type State = { y: number; vy: number; squash: number; sv: number; unfold: number; started: boolean; landed: boolean };
    const tents = TENTS.map((cfg) => {
      const built = buildTent(cfg.style, renderer, shared);
      allTextures.push(...built.textures);
      built.tent.position.set(cfg.x, 0, cfg.z);
      built.tent.rotation.y = cfg.ry;
      built.tent.scale.setScalar(cfg.scale);
      const shadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(cfg.x, 0.01, cfg.z);
      scene.add(built.tent, shadow);
      const s: State = { y: 0, vy: 0, squash: 0, sv: 0, unfold: 0, started: false, landed: false };
      return { cfg, ...built, shadow, s };
    });

    // Play when the section scrolls into view; replay after it has fully left.
    let playAt = -1;
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio > 0.35 && playAt < 0) playAt = performance.now() / 1000;
      if (!e.isIntersecting) {
        playAt = -1;
        tents.forEach((t) => Object.assign(t.s, { y: 0, vy: 0, squash: 0, sv: 0, unfold: 0, started: false, landed: false }));
      }
    }, { threshold: [0, 0.35] });
    io.observe(cv);

    // Hover a tent to make it hop
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2(9, 9);
    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const leave = () => ndc.set(9, 9);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerleave", leave);
    let hovered = -1;

    const G = 32, JUMP = 15;
    const place = (w: number, h: number) => {
      cam.aspect = w / h;
      const narrow = w / h < 1.1;
      cam.position.set(0, narrow ? 7 : 5.4, narrow ? 17.5 : 13.2);
      cam.lookAt(0, 1.4, -0.6);
      cam.updateProjectionMatrix();
    };
    place(width, height);

    return {
      resize: place,
      frame: (t, dt) => {
        const since = playAt < 0 ? -1 : t - playAt;

        ray.setFromCamera(ndc, cam);
        const hit = ndc.x < 5 ? ray.intersectObjects(tents.map((x) => x.body), true)[0] : undefined;
        const over = hit ? tents.findIndex((x) => x.body.getObjectById(hit.object.id)) : -1;
        if (over !== hovered) {
          hovered = over;
          const s = over >= 0 ? tents[over].s : null;
          if (s && s.landed && Math.abs(s.vy) < 0.1 && s.y === 0) s.vy = 6.5;
        }
        cv.style.cursor = over >= 0 ? "pointer" : "default";

        tents.forEach(({ cfg, tent, body, shadow, s }) => {
          if (reduce) {
            Object.assign(s, { y: 0, unfold: 1, started: true, landed: true });
          } else if (since >= cfg.delay && !s.started) {
            s.started = true;
            s.vy = JUMP; // launch
          }
          if (s.started && !reduce) {
            s.vy -= G * dt;
            s.y += s.vy * dt;
            s.unfold = Math.min(1, s.unfold + dt * 2.6);
            if (s.y <= 0) {
              s.y = 0;
              const impact = -s.vy;
              if (impact > 2.5) {
                s.sv += impact * 0.09; // squash on impact
                s.vy = impact * 0.3; // small bounce
              } else {
                s.vy = 0;
              }
              s.landed = true;
            }
          }
          // Damped spring brings the squash back to rest.
          s.sv += (-170 * s.squash - 11 * s.sv) * dt;
          s.squash += s.sv * dt;

          const unfold = s.started ? 1 - Math.pow(1 - s.unfold, 3) : 0;
          const sq = THREE.MathUtils.clamp(s.squash, -0.25, 0.35);
          body.scale.set(unfold * (1 + sq * 0.55), Math.max(0.001, unfold * (1 - sq)), unfold * (1 + sq * 0.55));
          tent.position.y = s.y * cfg.scale;
          tent.rotation.z = Math.sin(t * 1.3 + cfg.x) * 0.01 + (s.y > 0 ? Math.sin(s.y) * 0.04 : 0);

          const lift = THREE.MathUtils.clamp(1 - s.y / 6, 0.2, 1);
          shadow.scale.setScalar(SIZE * 1.7 * cfg.scale * (0.6 + 0.4 * lift) * (s.started ? 1 : 0.001));
          (shadow.material as THREE.MeshBasicMaterial).opacity = 0.85 * lift;
        });

        cam.position.x += (ndc.x < 5 ? ndc.x * 1.2 : 0) * 0.02 - cam.position.x * 0.02;
        cam.lookAt(0, 1.4, -0.6);
        renderer.render(scene, cam);
      },
      dispose: () => {
        io.disconnect();
        cv.removeEventListener("pointermove", move);
        cv.removeEventListener("pointerleave", leave);
        scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry && m.geometry !== shared.leg && m.geometry !== shadowGeo) m.geometry.dispose();
          const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
          mats.forEach((mat) => mat !== shared.metal && mat.dispose());
        });
        shared.leg.dispose(); shared.metal.dispose(); shadowGeo.dispose();
        allTextures.forEach((t) => t.dispose());
      },
    };
  });

  return <canvas ref={canvas} className="h-full w-full" aria-label="Exhibition tents popping up on the fair ground" />;
}
