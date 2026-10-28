import Image from "next/image";
import { cn } from "@/lib/utils";

export type Logo = { name: string; image?: string; href?: string };

/** Infinite logo marquee. Logos appear exactly as supplied: no cards, no filters. Pauses on hover. */
export function LogoMarquee({ logos, className }: { logos: Logo[]; className?: string }) {
  if (!logos.length) return null;
  const reps = Math.max(2, Math.ceil(8 / logos.length));
  const row = Array.from({ length: reps }, () => logos).flat();
  const doubled = [...row, ...row];
  return (
    <div className={cn("group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]", className)}>
      <div className="flex w-max animate-scroll items-center gap-20 px-10 group-hover:[animation-play-state:paused]">
        {doubled.map((l, i) => {
          const hidden = i >= row.length;
          const inner = l.image ? (
            <Image src={l.image} alt={hidden ? "" : l.name} width={320} height={160} className="h-20 w-auto max-w-[260px] object-contain" />
          ) : (
            <span className="font-display text-3xl text-ink/70">{l.name}</span>
          );
          const cls = "flex h-24 shrink-0 items-center transition duration-300 hover:-translate-y-1";
          return l.href ? (
            <a key={i} href={l.href} target="_blank" rel="noreferrer" className={cls} aria-hidden={hidden || undefined} tabIndex={hidden ? -1 : undefined}>
              {inner}
            </a>
          ) : (
            <div key={i} className={cls} aria-hidden={hidden || undefined}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}

/** Big scrolling words, used as a section divider. */
export function WordMarquee({ words, className }: { words: string[]; className?: string }) {
  const row = [...words, ...words];
  return (
    <div className={cn("overflow-hidden py-6", className)} aria-hidden>
      <div className="flex w-max animate-scroll items-center gap-10 [animation-duration:55s]">
        {[...row, ...row].map((w, i) => (
          <span key={i} className={cn("font-display text-[clamp(56px,8vw,128px)] leading-none", i % 2 ? "[-webkit-text-fill-color:transparent] [-webkit-text-stroke:1.5px_currentColor]" : "")}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
