"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as THREE from "three";
import { crisp, fontFamily, optimizedSrc, useGL } from "@/components/gl/use-gl";
import { BRAND } from "@/lib/theme";

export type Speaker = { name: string; role: string; img?: string };

const PLACEHOLDERS: Speaker[] = [
  { name: "To be announced", role: "Keynote address" },
  { name: "To be announced", role: "Investment panel" },
  { name: "To be announced", role: "Agribusiness forum" },
];

// High-res card textures keep portraits crisp when a card is in focus.
const W = 1024, H = 1440, RADIUS = 64;

/** Photo cards show the portrait exactly as supplied, only with rounded corners. */
function drawPhoto(c: HTMLCanvasElement, img: HTMLImageElement) {
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, W, H);
  x.save();
  x.beginPath(); x.roundRect(0, 0, W, H, RADIUS); x.clip();
  const k = Math.max(W / img.width, H / img.height);
  // Keep faces in frame: anchor portraits slightly above centre.
  x.drawImage(img, (W - img.width * k) / 2, (H - img.height * k) * 0.3, img.width * k, img.height * k);
  x.restore();
}

/** Speakers without a photo yet get a branded placeholder card. */
function drawPlaceholder(c: HTMLCanvasElement, sp: Speaker) {
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  const display = fontFamily("--font-bebas", "Impact, sans-serif");
  const body = fontFamily("--font-barlow", "sans-serif");
  x.clearRect(0, 0, W, H);
  x.save();
  x.beginPath(); x.roundRect(0, 0, W, H, RADIUS); x.clip();
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, BRAND.green); g.addColorStop(1, BRAND.forestDeep);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = "rgba(255,255,255,.1)";
  x.beginPath(); x.arc(512, 520, 200, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.ellipse(512, 1080, 380, 380, 0, Math.PI, 0); x.fill();
  x.textAlign = "left";
  x.fillStyle = "#fff"; x.font = `400 104px ${display}`; x.fillText(sp.name.toUpperCase(), 64, H - 120, W - 128);
  x.fillStyle = BRAND.gold; x.font = `600 44px ${body}`; x.fillText(sp.role, 64, H - 60, W - 128);
  x.restore();
}

function drawFloor() {
  const c = document.createElement("canvas");
  c.width = c.height = 2048;
  const q = c.getContext("2d")!;
  const rg = q.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
  rg.addColorStop(0, BRAND.green); rg.addColorStop(1, BRAND.forestDeep);
  q.fillStyle = rg; q.fillRect(0, 0, 2048, 2048);
  q.translate(1024, 1024);
  q.strokeStyle = BRAND.gold;
  [240, 500, 760, 990].forEach((d, i) => {
    q.lineWidth = i === 3 ? 18 : 5; q.globalAlpha = i === 3 ? 0.9 : 0.35;
    q.beginPath(); q.arc(0, 0, d, 0, Math.PI * 2); q.stroke();
  });
  q.globalAlpha = 0.6;
  for (let i = 0; i < 72; i++) {
    q.save(); q.rotate((i * Math.PI) / 36);
    q.lineWidth = i % 6 ? 4 : 9;
    q.beginPath(); q.moveTo(0, 840); q.lineTo(0, i % 6 ? 900 : 930); q.stroke();
    q.restore();
  }
  return c;
}

export function SpeakersStage({ speakers = PLACEHOLDERS }: { speakers?: Speaker[] }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef({ step: (d: number) => void d });
  const [cur, setCur] = useState(0);
  const N = speakers.length;

  useGL(
    canvas,
    ({ renderer, reduce, width, height, canvas: cv }) => {
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      const st = (2 * Math.PI) / N, R = Math.max(4.3, N * 0.62);
      const ring = new THREE.Group();
      scene.add(ring);

      const geo = new THREE.PlaneGeometry(2.3, 3.23);
      const textures: THREE.Texture[] = [];
      const cards = speakers.map((sp, i) => {
        const c = document.createElement("canvas");
        drawPlaceholder(c, sp);
        const tex = crisp(new THREE.CanvasTexture(c), renderer);
        textures.push(tex);
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
        // Back face: same rounded silhouette, shaded dark.
        m.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, color: 0x0c1a12, transparent: true, side: THREE.BackSide })));
        m.rotation.y = i * st;
        m.userData = { i };
        ring.add(m);
        if (sp.img) {
          const im = new Image();
          im.decoding = "async";
          im.onload = () => { drawPhoto(c, im); tex.needsUpdate = true; };
          im.src = optimizedSrc(sp.img, 720, 90);
        }
        return m;
      });
      // Redraw text once the web fonts are ready (canvas text needs loaded fonts).
      document.fonts.ready.then(() => speakers.forEach((sp, i) => {
        if (sp.img) return;
        drawPlaceholder(textures[i].image as HTMLCanvasElement, sp);
        textures[i].needsUpdate = true;
      }));

      const ftex = crisp(new THREE.CanvasTexture(drawFloor()), renderer);
      const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 1.8, 128), new THREE.MeshBasicMaterial({ map: ftex }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.7;
      ring.add(floor);

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(2.4, 7, 48, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xeaf7ee, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      );
      cone.position.set(0, 1.8, R + 0.4);
      scene.add(cone);

      let rot = 0, tg = 0, drag: number | null = null, moved = 0, last = performance.now(), mx = 0, shown = 0;
      const rc = new THREE.Raycaster(), v2 = new THREE.Vector2();
      api.current.step = (d) => { tg += d * st; last = performance.now(); };

      const down = (e: PointerEvent) => { drag = e.clientX; moved = 0; cv.setPointerCapture(e.pointerId); };
      const move = (e: PointerEvent) => {
        mx = e.clientX / innerWidth - 0.5;
        if (drag === null) return;
        const dx = e.clientX - drag; moved += Math.abs(dx); tg += dx * 0.008; drag = e.clientX; last = performance.now();
      };
      const up = (e: PointerEvent) => {
        drag = null; last = performance.now();
        if (moved < 6) {
          const b = cv.getBoundingClientRect();
          v2.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
          rc.setFromCamera(v2, cam);
          const hit = rc.intersectObjects(cards, false)[0];
          if (hit) {
            const i = hit.object.userData.i as number, kc = Math.round(-tg / st);
            let dk = (((i - kc) % N) + N) % N;
            if (dk > N / 2) dk -= N;
            tg = -(kc + dk) * st;
            return;
          }
        }
        tg = Math.round(tg / st) * st;
      };
      cv.addEventListener("pointerdown", down);
      cv.addEventListener("pointermove", move);
      cv.addEventListener("pointerup", up);

      const place = (w: number, h: number) => {
        cam.aspect = w / h;
        cam.position.z = w / h < 1 ? R * 3.9 : R * 2.9;
        cam.updateProjectionMatrix();
      };
      place(width, height);

      return {
        resize: place,
        frame: (t) => {
          const now = t * 1000;
          if (drag === null && !reduce && now - last > 4200) { tg -= st; last = now; }
          rot += (tg - rot) * 0.07;
          ring.rotation.y = rot;
          cards.forEach((m, i) => {
            const a = ((((i * st + rot) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
            let k = Math.max(0, 1 - Math.abs(a) / (st * 0.75));
            k = k * k * (3 - 2 * k);
            m.scale.setScalar(0.8 + 0.45 * k);
            // Cards out of focus are only gently shaded, never tinted.
            (m.material as THREE.MeshBasicMaterial).color.setScalar(0.72 + 0.28 * k);
            const rr = R + 0.55 * k;
            m.position.set(Math.sin(i * st) * rr, 0.1 * k, Math.cos(i * st) * rr);
          });
          cam.position.x += (mx * 2.2 - cam.position.x) * 0.04;
          cam.position.y = 2.1;
          cam.lookAt(0, -0.1, 0);
          const idx = ((Math.round(-tg / st) % N) + N) % N;
          if (idx !== shown) { shown = idx; setCur(idx); }
          renderer.render(scene, cam);
        },
        dispose: () => {
          cv.removeEventListener("pointerdown", down);
          cv.removeEventListener("pointermove", move);
          cv.removeEventListener("pointerup", up);
          cards.forEach((m) => (m.material as THREE.Material).dispose());
          textures.forEach((t) => t.dispose());
          ftex.dispose(); geo.dispose();
          cards.forEach((m) => ((m.children[0] as THREE.Mesh).material as THREE.Material).dispose());
          floor.geometry.dispose(); (floor.material as THREE.Material).dispose();
          cone.geometry.dispose(); (cone.material as THREE.Material).dispose();
        },
      };
    },
    [speakers],
  );

  const sp = speakers[cur] ?? speakers[0];
  return (
    <div>
      <div className="relative h-[460px] cursor-grab touch-pan-y active:cursor-grabbing md:h-[620px]">
        <canvas ref={canvas} className="h-full w-full" aria-label="Rotating stage of speaker portraits" />
        <button aria-label="Previous speaker" onClick={() => api.current.step(1)} className="absolute left-0 top-[44%] grid size-14 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-gold hover:text-forest">
          <ChevronLeft className="size-6" />
        </button>
        <button aria-label="Next speaker" onClick={() => api.current.step(-1)} className="absolute right-0 top-[44%] grid size-14 place-items-center rounded-full bg-gold text-forest transition hover:bg-white">
          <ChevronRight className="size-6" />
        </button>
      </div>
      <div className="mt-2 text-center" aria-live="polite">
        <p className="text-xs font-semibold tracking-[.25em] text-gold">{String(cur + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}</p>
        <p className="mt-2 font-display text-[clamp(40px,6vw,76px)] leading-none text-white">{sp.name}</p>
        <p className="mt-1 text-white/70">{sp.role}</p>
      </div>
    </div>
  );
}
