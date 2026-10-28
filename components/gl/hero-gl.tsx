"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useGL, optimizedSrc } from "@/components/gl/use-gl";
import type { Slide } from "@/lib/media";
import { cn } from "@/lib/utils";

const VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

// At rest (uP = 0) the shader samples the photo 1:1 with an exact "cover"
// fit: no zoom, no blur, no colour shift. Distortion only exists mid-transition.
const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA, uB;
uniform vec2 uRes;
uniform float uRa, uRb, uP, uT, uDir;

vec2 cover(vec2 uv, float ia) {
  float sa = uRes.x / uRes.y;
  vec2 s = vec2(1.0);
  if (sa > ia) s.y = ia / sa; else s.x = sa / ia;
  return (uv - 0.5) * s + 0.5;
}
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float n(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}
vec3 rgb(sampler2D t, vec2 uv, float k) {
  if (k < 0.0001) return texture2D(t, uv).rgb;
  return vec3(texture2D(t, uv + vec2(k, 0.0)).r, texture2D(t, uv).g, texture2D(t, uv - vec2(k, 0.0)).b);
}
void main() {
  float amp = sin(3.14159265 * uP);
  vec2 q = vec2(n(vUv * 3.0 + uT * 0.25), n(vUv * 3.0 + 5.2 - uT * 0.25)) - 0.5;
  float x = uDir > 0.0 ? vUv.x : 1.0 - vUv.x;
  float edge = uP * 1.9 - 0.3 - (x * 0.75 + (1.0 - vUv.y) * 0.25) + (n(vUv * 4.0) - 0.5) * 0.4;
  float m = smoothstep(0.0, 0.35, edge);
  float split = amp * 0.006;
  vec3 a = rgb(uA, cover(vUv + q * amp * 0.09 * m, uRa), split);
  vec3 b = rgb(uB, cover(vUv - q * amp * 0.09 * (1.0 - m), uRb), split);
  gl_FragColor = vec4(mix(a, b, m), 1.0);
  // Textures are decoded to linear; convert back to the screen colour space
  #include <colorspace_fragment>
}`;

export type HeroApi = { go: (i: number, dir?: number) => void; index: () => number };

/**
 * WebGL slideshow canvas. Loaded lazily (see components/gl/lazy.tsx); the
 * server-rendered first photo underneath is shown until this is ready.
 */
export function HeroCanvas({
  slides,
  onReady,
  onChange,
  interval = 6500,
}: {
  slides: Slide[];
  onReady: (api: HeroApi) => void;
  onChange: (i: number) => void;
  interval?: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState(false);
  const N = slides.length;

  const ok = useGL(
    canvas,
    ({ renderer, reduce, width, height }) => {
      const scene = new THREE.Scene();
      const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const loader = new THREE.TextureLoader();
      const need = Math.max(width, height * 1.6);
      const ratios = slides.map(() => 1.5);
      const blank = new THREE.Texture();
      const tex: THREE.Texture[] = slides.map(() => blank);

      const U = {
        uA: { value: blank as THREE.Texture },
        uB: { value: blank as THREE.Texture },
        uRes: { value: new THREE.Vector2(width, height) },
        uRa: { value: 1.5 },
        uRb: { value: 1.5 },
        uP: { value: 0 },
        uT: { value: 0 },
        uDir: { value: 1 },
      };

      const load = (i: number) =>
        new Promise<void>((res) => {
          if (tex[i] !== blank) return res();
          loader.load(
            optimizedSrc(slides[i].src, need, 90),
            (t) => {
              t.colorSpace = THREE.SRGBColorSpace;
              // Texture is sized to the screen, so plain linear filtering is the
              // sharpest option (mipmaps would blend in a half-size level).
              t.generateMipmaps = false;
              t.minFilter = THREE.LinearFilter;
              t.magFilter = THREE.LinearFilter;
              const im = t.image as HTMLImageElement;
              ratios[i] = im.width / im.height;
              tex[i] = t;
              res();
            },
            undefined,
            () => res(),
          );
        });

      const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG });
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      scene.add(quad);

      let now = 0, next = 0, start = 0, busy = false, lastSwitch = performance.now();
      load(0).then(() => {
        U.uA.value = tex[0];
        U.uRa.value = ratios[0];
        setShown(true);
        slides.forEach((_, i) => i && load(i)); // warm the rest in the background
      });

      const go = (i: number, dir = 1) => {
        i = ((i % N) + N) % N;
        if (busy || i === now) return;
        load(i).then(() => {
          if (tex[i] === blank) return;
          next = i;
          U.uB.value = tex[i];
          U.uRb.value = ratios[i];
          U.uDir.value = dir;
          start = performance.now();
          busy = true;
          onChange(i);
        });
      };
      onReady({ go, index: () => now });

      return {
        resize: (w, h) => U.uRes.value.set(w, h),
        frame: (t) => {
          U.uT.value = t;
          const ms = performance.now();
          if (busy) {
            const k = Math.min(1, (ms - start) / 1600);
            U.uP.value = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
            if (k >= 1) {
              now = next;
              U.uA.value = tex[now];
              U.uRa.value = ratios[now];
              U.uP.value = 0;
              busy = false;
              lastSwitch = ms;
            }
          } else if (!reduce && ms - lastSwitch > interval) {
            lastSwitch = ms;
            go(now + 1, 1);
          }
          renderer.render(scene, cam);
        },
        dispose: () => {
          tex.forEach((t) => t !== blank && t.dispose());
          mat.dispose();
          quad.geometry.dispose();
        },
      };
    },
    [slides],
    { alpha: false, antialias: false },
  );

  if (!ok) return null;
  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={cn("absolute inset-0 h-full w-full transition-opacity duration-700", shown ? "opacity-100" : "opacity-0")}
    />
  );
}
