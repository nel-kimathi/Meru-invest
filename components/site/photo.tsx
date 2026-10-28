"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type PhotoProps = Omit<ImageProps, "className" | "fill" | "width" | "height"> & {
  /** Classes for the frame (size, shape, position). */
  className?: string;
  /** Classes for the <img> (object-position etc). */
  imgClassName?: string;
  /** Background tone shown while the photo loads. */
  tone?: "dark" | "light";
  /** Wrap the image in a parallax layer (0 = off, 0.1 to 0.25 is subtle). */
  parallax?: number;
};

/**
 * Crisp, responsive photo.
 *  - next/image serves AVIF/WebP at the exact width each screen needs (srcset + sizes)
 *  - quality 85 by default, 90 for heroes (pass quality={90})
 *  - fades in on a brand-coloured base at its natural size: no blur-up, no
 *    scale-in, so the frame you end on is pixel-sharp
 *  - handles images that were already cached before hydration
 */
export function Photo({
  className,
  imgClassName,
  tone = "dark",
  parallax = 0,
  alt,
  sizes = "100vw",
  quality = 85,
  ...props
}: PhotoProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
    const t = window.setTimeout(() => setLoaded(true), 3000); // never leave a photo hidden
    return () => window.clearTimeout(t);
  }, []);

  const image = failed ? null : (
    <Image
      ref={ref}
      {...props}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      draggable={false}
      className={cn("select-none object-cover", imgClassName)}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );

  return (
    <div className={cn("photo relative overflow-hidden", tone === "light" && "photo-light", className)} data-loaded={loaded}>
      {parallax ? (
        <div data-parallax={parallax} className="absolute inset-x-0 -inset-y-[12%] will-change-transform">
          {image}
        </div>
      ) : (
        image
      )}
    </div>
  );
}
