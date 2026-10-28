"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "@/components/site/photo";
import { cn } from "@/lib/utils";

export type NewsItem = { slug: string; title: string; excerpt: string; category: string | null; date: string | null; image: string };

export function NewsGrid({ items }: { items: NewsItem[] }) {
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[], [items]);
  const [cat, setCat] = useState<string | null>(null);
  const list = cat ? items.filter((i) => i.category === cat) : items;
  const [first, ...rest] = list;

  return (
    <div>
      {cats.length > 1 ? (
        <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto pb-2">
          {[null, ...cats].map((c) => (
            <button
              key={c ?? "all"}
              onClick={() => setCat(c)}
              className={cn("shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition", cat === c ? "bg-forest text-white" : "bg-mint text-ink hover:bg-[#e8edf4]")}
            >
              {c ?? "All news"}
            </button>
          ))}
        </div>
      ) : null}

      {first ? (
        <Link href={`/news/${first.slug}`} className="group grid overflow-hidden rounded-[2.5rem] bg-forest text-white lg:grid-cols-[1.35fr_1fr]">
          <Photo src={first.image} alt="" sizes="(min-width:1024px) 58vw, 100vw" quality={90} className="min-h-[340px] w-full lg:min-h-[480px]" />
          <div className="flex flex-col p-8 lg:p-12">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-gold px-3 py-1 font-semibold text-ink">Latest</span>
              {first.category ? <span className="text-white/70">{first.category}</span> : null}
              {first.date ? <span className="text-white/50">{first.date}</span> : null}
            </div>
            <h2 className="mt-8 font-display text-[clamp(44px,4.5vw,72px)] leading-[.92]">{first.title}</h2>
            <p className="mt-5 text-lg text-white/70">{first.excerpt}</p>
            <span className="link-arrow mt-auto pt-10 text-gold">
              Read the story <ArrowUpRight className="size-4 transition group-hover:rotate-45" />
            </span>
          </div>
        </Link>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((n, i) => (
          <Link key={n.slug} href={`/news/${n.slug}`} className="group animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="relative">
              <Photo src={n.image} alt="" sizes="(min-width:1024px) 30vw, (min-width:768px) 46vw, 100vw" className={cn("aspect-[4/3] w-full", ["shape-leaf", "shape-tab", "shape-leaf-alt"][i % 3])} />
              <span className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-white text-ink opacity-0 transition duration-500 group-hover:rotate-45 group-hover:opacity-100">
                <ArrowUpRight className="size-5" />
              </span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              {n.category ? <span className="rounded-full bg-brand/10 px-3 py-1 font-semibold text-brand">{n.category}</span> : null}
              {n.date ? <span className="text-ink/50">{n.date}</span> : null}
            </div>
            <h3 className="mt-3 font-display text-4xl leading-[.95] text-ink transition group-hover:text-brand">{n.title}</h3>
            <p className="mt-3 line-clamp-3 text-ink/65">{n.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
