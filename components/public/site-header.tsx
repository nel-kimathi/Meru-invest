"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { EVENT, NAV } from "@/lib/event";
import { IMG } from "@/lib/media";
import { Photo } from "@/components/site/photo";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const f = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 320 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  // Close the menu when the route changes (adjust state during render, no effect needed)
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setOpen(false);
  }
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href.split("#")[0]));

  return (
    <>
      <header
        className={cn(
          // A light bar so the logo always shows exactly as designed.
          "fixed inset-x-0 top-0 z-50 bg-white/95 text-ink backdrop-blur-xl transition-[transform,box-shadow] duration-500",
          solid && "shadow-[0_12px_40px_-24px_rgba(10,38,25,.45)]",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="mx-auto flex h-[84px] max-w-[1320px] items-center gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="Meru Invest home" className="flex h-16 shrink-0 items-center">
            <Image src={IMG.logo} alt="Meru Invest" width={180} height={129} priority className="h-[60px] w-auto object-contain" />
          </Link>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 xl:flex">
            {NAV.map((n) =>
              n.children ? (
                <div key={n.label} className="group relative">
                  <button
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[15px] font-medium transition hover:bg-mint",
                      n.children.some((c) => active(c.href)) ? "text-brand" : "text-ink/80",
                    )}
                  >
                    {n.label}
                    <ChevronDown className="size-4 transition group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-1/2 top-full w-[620px] -translate-x-1/2 pt-3 opacity-0 transition duration-300 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <div className="grid grid-cols-[220px_1fr] overflow-hidden rounded-3xl bg-white text-ink shadow-2xl shadow-forest/40">
                      <div className="relative">
                        <Photo src={IMG.tradeFair} alt="" sizes="220px" className="absolute inset-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 to-transparent" />
                        <p className="absolute inset-x-5 bottom-5 font-display text-3xl leading-none text-white">Take your place on the floor</p>
                      </div>
                      <div className="p-3">
                        {n.children.map((c) => (
                          <Link key={c.href} href={c.href} className="group/item flex items-center justify-between gap-4 rounded-2xl px-4 py-3.5 transition hover:bg-mint">
                            <span>
                              <span className="block font-semibold">{c.label}</span>
                              {c.note ? <span className="block text-sm text-ink/60">{c.note}</span> : null}
                            </span>
                            <ArrowRight className="size-4 -translate-x-2 text-brand opacity-0 transition group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-full px-4 py-2.5 text-[15px] font-medium transition hover:bg-mint",
                    active(n.href) ? "bg-mint text-brand" : "text-ink/80",
                  )}
                >
                  {n.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 xl:ml-4">
            <Link href="/login" className="hidden rounded-full px-4 py-2.5 text-[15px] font-medium text-ink/80 transition hover:bg-mint sm:inline-flex">
              Login
            </Link>
            <Link href="/register" className="btn btn-gold hidden !py-3 sm:inline-flex">
              Register <ArrowRight className="size-4" />
            </Link>
            <button
              className="grid size-12 place-items-center rounded-full bg-mint text-ink transition hover:bg-brand hover:text-white xl:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 overflow-y-auto bg-forest text-white transition-[clip-path] duration-700 ease-[cubic-bezier(.7,0,.2,1)] xl:hidden",
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
        data-lenis-prevent
      >
        <div className="mx-auto flex min-h-full max-w-[1320px] flex-col px-5 pb-10 pt-28 sm:px-8">
          <nav className="flex flex-col">
            {NAV.flatMap((n) => (n.children ? n.children : [n])).map((n, i) => (
              <Link
                key={n.href + n.label}
                href={n.href}
                className={cn(
                  "flex items-center justify-between py-3 font-display text-[clamp(34px,8vw,56px)] leading-none transition-[opacity,transform,color] duration-700 hover:text-gold",
                  open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                )}
                style={{ transitionDelay: open ? `${150 + i * 45}ms` : "0ms" }}
              >
                {n.label}
                <ArrowUpRight className="size-6 text-white/40" />
              </Link>
            ))}
          </nav>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Link href="/register" className="btn btn-gold">Register now</Link>
            <Link href="/login" className="btn btn-ghost-light">Login</Link>
          </div>
          <p className="mt-10 text-white/60">{EVENT.dateLabel} / {EVENT.venue}, {EVENT.place}</p>
        </div>
      </div>
    </>
  );
}
