"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useGL } from "@/components/gl/use-gl";
import { BRAND, hex } from "@/lib/theme";

/**
 * A "data city": a field of blocks that rises when the stats section scrolls
 * into view and lifts toward the cursor. Sits behind the statistics.
 */
export function StatsField({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useGL(canvas, ({ renderer, reduce, width, height, canvas: cv }) => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(hex(BRAND.forest), 26, 58);
    const cam = new THREE.PerspectiveCamera(32, width / height, 0.1, 200);

    const COLS = 40, ROWS = 20, GAP = 1.05;
    const count = COLS * ROWS;
    const geo = new THREE.BoxGeometry(0.86, 1, 0.86);
    geo.translate(0, 0.5, 0);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.15 });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    scene.add(new THREE.HemisphereLight(0xcfe8d8, hex(BRAND.forest), 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(12, 24, 10);
    scene.add(sun);

    const hsh = (x: number, y: number) => {
      const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const pos: THREE.Vector3[] = [];
    const base: number[] = [];
    const cur: number[] = [];
    const delay: number[] = [];
    for (let z = 0; z < ROWS; z++)
      for (let x = 0; x < COLS; x++) {
        const px = (x - COLS / 2) * GAP, pz = (z - ROWS / 2) * GAP;
        pos.push(new THREE.Vector3(px, 0, pz));
        const wave = (Math.sin(x * 0.35) + Math.cos(z * 0.45) + 2) * 0.55;
        const tower = hsh(x, z) > 0.94 ? 2.5 + hsh(z, x) * 3.5 : 0;
        base.push(0.15 + wave * hsh(x + 3, z) * 1.6 + tower);
        cur.push(0.02);
        delay.push(Math.hypot(px, pz) * 0.045 + hsh(z, x + 9) * 0.25);
      }

    const deep = new THREE.Color(BRAND.greenDeep);
    const mid = new THREE.Color(BRAND.green);
    const leaf = new THREE.Color(BRAND.leaf);
    const gold = new THREE.Color(BRAND.gold);
    const tmp = new THREE.Color();
    const dummy = new THREE.Object3D();

    // Pointer -> ground plane
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2(9, 9);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3(999, 0, 999);
    const smooth = new THREE.Vector3(999, 0, 999);
    const section = cv.closest("section") ?? cv;
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const onLeave = () => ndc.set(9, 9);
    section.addEventListener("pointermove", onMove as EventListener);
    section.addEventListener("pointerleave", onLeave);

    let shownAt = -1;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && shownAt < 0) shownAt = performance.now() / 1000;
    }, { threshold: 0.2 });
    io.observe(cv);

    const place = (w: number, h: number) => {
      cam.aspect = w / h;
      cam.position.set(0, w / h < 1 ? 30 : 19, w / h < 1 ? 34 : 27);
      cam.lookAt(0, 0, 2);
      cam.updateProjectionMatrix();
    };
    place(width, height);

    return {
      resize: place,
      frame: (t) => {
        if (ndc.x < 5) {
          ray.setFromCamera(ndc, cam);
          ray.ray.intersectPlane(plane, hit);
        } else hit.set(999, 0, 999);
        smooth.lerp(hit, 0.12);
        const since = shownAt < 0 ? -1 : t - shownAt;

        for (let i = 0; i < count; i++) {
          const p = pos[i];
          const grown = reduce ? 1 : since < 0 ? 0 : THREE.MathUtils.smoothstep(since - delay[i], 0, 1.1);
          const d2 = (p.x - smooth.x) ** 2 + (p.z - smooth.z) ** 2;
          const lift = Math.exp(-d2 / 7) * 2.6;
          const breathe = reduce ? 0 : Math.sin(t * 0.8 + p.x * 0.3 + p.z * 0.2) * 0.08;
          const target = 0.02 + (base[i] + breathe) * grown + lift * grown;
          cur[i] += (target - cur[i]) * 0.12;
          dummy.position.copy(p);
          dummy.scale.set(1, Math.max(0.02, cur[i]), 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);

          const k = Math.min(1, cur[i] / 4);
          tmp.copy(deep).lerp(mid, k).lerp(leaf, Math.max(0, k - 0.55));
          if (base[i] > 2.6) tmp.lerp(gold, 0.85);
          tmp.lerp(gold, Math.min(0.9, lift / 2.6));
          mesh.setColorAt(i, tmp);
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        if (!reduce) mesh.rotation.y = Math.sin(t * 0.06) * 0.08;
        renderer.render(scene, cam);
      },
      dispose: () => {
        io.disconnect();
        section.removeEventListener("pointermove", onMove as EventListener);
        section.removeEventListener("pointerleave", onLeave);
        geo.dispose();
        mat.dispose();
      },
    };
  });

  return <canvas ref={canvas} aria-hidden className={className ?? "absolute inset-0 h-full w-full"} />;
}
