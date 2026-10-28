import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Headline that rises word by word when scrolled into view. */
export function Words({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  accent,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  /** Words (exact match) to colour with the accent class. */
  accent?: { words: string[]; className: string };
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={cn("words", className)} style={{ ["--d" as string]: `${delay}ms` }} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="w" aria-hidden>
          <span
            style={{ ["--i" as string]: i }}
            className={accent?.words.includes(w.replace(/[.,!?]/g, "")) ? accent.className : undefined}
          >
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function SectionHead({
  eyebrow,
  title,
  intro,
  dark,
  center,
  className,
  size = "lg",
}: {
  eyebrow?: string;
  title: string;
  intro?: string | null;
  dark?: boolean;
  center?: boolean;
  className?: string;
  size?: "lg" | "md";
}) {
  return (
    <div className={cn(center && "mx-auto text-center", "max-w-4xl", className)}>
      {eyebrow ? <Eyebrow className={cn(!dark && "eyebrow-brand")}>{eyebrow}</Eyebrow> : null}
      <Words
        text={title}
        className={cn(size === "lg" ? "display-lg" : "display-md", "mt-4", dark ? "text-white" : "text-ink")}
      />
      {intro ? (
        <p
          data-reveal="up"
          style={{ ["--d" as string]: "200ms" }}
          className={cn("mt-6 max-w-2xl text-lg leading-relaxed", center && "mx-auto", dark ? "text-white/70" : "text-ink/70")}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

type BtnVariant = "gold" | "forest" | "brand" | "light" | "ghost-light" | "ghost-dark";

export function Btn({
  href,
  children,
  variant = "gold",
  className,
  external,
  icon = "arrow",
}: {
  href: string;
  children: React.ReactNode;
  variant?: BtnVariant;
  className?: string;
  external?: boolean;
  icon?: "arrow" | "out" | "none";
}) {
  const Icon = icon === "out" ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span>{children}</span>
      {icon !== "none" ? <Icon className="size-4" strokeWidth={2.2} /> : null}
    </>
  );
  const cls = cn("btn", `btn-${variant}`, className);
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {content}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}

/** Rolling-digit number. Pure CSS animation, triggered by the reveal observer. */
export function Odometer({
  value,
  prefix,
  suffix,
  className,
  delay = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}) {
  const text = Number.isInteger(value) ? value.toLocaleString("en-US") : String(value);
  let digitIndex = 0;
  return (
    <span data-reveal="fade" className={cn("odo tabular-nums", className)} aria-label={`${prefix ?? ""}${text}${suffix ?? ""}`}>
      {prefix ? <span aria-hidden>{prefix}</span> : null}
      {text.split("").map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} aria-hidden>{ch}</span>;
        const d = Number(ch);
        const di = digitIndex++;
        return (
          <span key={i} className="odo-col" aria-hidden>
            <span className="odo-strip" style={{ ["--n" as string]: 10 + d, ["--d" as string]: `${delay + di * 90}ms` }}>
              {Array.from({ length: 20 }, (_, k) => (
                <span key={k}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix ? <span aria-hidden>{suffix}</span> : null}
    </span>
  );
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-5 sm:px-8", className)}>{children}</div>;
}
