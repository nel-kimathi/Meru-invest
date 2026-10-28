import { cn } from "@/lib/utils";

/**
 * Circular rotating text badge with a mountain emblem in the centre.
 * Layers are stacked explicitly (disc, spinning text, emblem on top) and the
 * emblem sits on its own solid disc, so it stays visible on any background.
 */
export function SpinBadge({
  text = "Meru Invest  /  Invest  Trade  Grow  /  2027  /  ",
  className,
  tone = "light",
  uid = "spin",
}: {
  text?: string;
  className?: string;
  tone?: "light" | "gold";
  /** Unique per page: used for the SVG text path id. */
  uid?: string;
}) {
  const gold = tone === "gold";
  const ring = gold ? "#0b3a25" : "#ffffff";
  return (
    <div className={cn("relative isolate grid size-36 place-items-center", className)} aria-hidden>
      {gold ? <span className="absolute inset-0 -z-10 rounded-full bg-gold" /> : null}
      <svg viewBox="0 0 200 200" className="absolute inset-0 animate-spin-slow">
        <defs>
          <path id={`${uid}-circle`} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
        </defs>
        <text fill={ring} style={{ fontFamily: "var(--font-bebas)", fontSize: 20, letterSpacing: 4 }}>
          <textPath href={`#${uid}-circle`}>{text}</textPath>
        </text>
      </svg>
      <span className={cn("relative z-10 grid size-[42%] place-items-center rounded-full shadow-lg", gold ? "bg-forest" : "bg-gold")}>
        <svg viewBox="0 0 48 48" className="size-[62%]" fill={gold ? "#dba600" : "#0b3a25"}>
          <path d="M4 38 L17 15 L24 27 L30 19 L44 38 Z" />
          <path d="M17 15 L13.5 21 L17 19.5 L20.5 21 Z" fill={gold ? "#0b3a25" : "#ffffff"} opacity=".9" />
        </svg>
      </span>
    </div>
  );
}
