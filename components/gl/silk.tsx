"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useGL } from "@/components/gl/use-gl";
import { BRAND } from "@/lib/theme";
import { cn } from "@/lib/utils";

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uT;
uniform vec2 uRes, uM;
uniform vec3 uDeep, uMid, uGreen, uGold;
float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * n(p); p = p * 2.03 + 11.7; a *= .5; } return v; }
void main(){
  vec2 uv = vUv; uv.x *= uRes.x / uRes.y;
  float t = uT * .045;
  vec2 q = vec2(fbm(uv * 1.6 + t), fbm(uv * 1.6 - t + 4.2));
  vec2 r = vec2(fbm(uv * 1.4 + 2.4 * q + vec2(1.7, 9.2) + t * 1.3 + uM * .25), fbm(uv * 1.4 + 2.4 * q + vec2(8.3, 2.8) - t));
  float f = fbm(uv * 1.2 + 2.2 * r);
  vec3 c = mix(uDeep, uMid, smoothstep(.2, .75, f));
  c = mix(c, uGreen, smoothstep(.45, .9, length(q)) * .7);
  c = mix(c, uGold, smoothstep(.72, .98, f * r.x) * .45);
  float sheen = smoothstep(.55, .62, fbm(uv * 3. + r * 2.)) * .06;
  gl_FragColor = vec4(c + sheen, 1.);
  #include <colorspace_fragment>
}`;

/** Slow, flowing silk in brand colours. Decorative background. */
export function Silk({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const ok = useGL(
    canvas,
    ({ renderer, width, height, reduce, canvas: cv }) => {
      const scene = new THREE.Scene();
      const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const U = {
        uT: { value: 12 },
        uRes: { value: new THREE.Vector2(width, height) },
        uM: { value: new THREE.Vector2() },
        uDeep: { value: new THREE.Color(BRAND.forestDeep) },
        uMid: { value: new THREE.Color(BRAND.forest) },
        uGreen: { value: new THREE.Color(BRAND.green) },
        uGold: { value: new THREE.Color(BRAND.gold) },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms: U,
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
        fragmentShader: FRAG,
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
      const m = new THREE.Vector2();
      const host = cv.parentElement ?? cv;
      const move = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        m.set((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
      };
      host.addEventListener("pointermove", move as EventListener);
      return {
        resize: (w, h) => U.uRes.value.set(w, h),
        frame: (t) => {
          if (!reduce) U.uT.value = 12 + t;
          U.uM.value.lerp(m, 0.03);
          renderer.render(scene, cam);
        },
        dispose: () => {
          host.removeEventListener("pointermove", move as EventListener);
          mat.dispose();
        },
      };
    },
    [],
    { alpha: false, antialias: false, maxDpr: 1 },
  );
  return (
    <div className={cn("absolute inset-0", className)}>
      {ok ? <canvas ref={canvas} aria-hidden className="h-full w-full" /> : null}
    </div>
  );
}
