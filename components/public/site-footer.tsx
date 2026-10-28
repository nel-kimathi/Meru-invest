import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { EVENT, PARTNERS } from "@/lib/event";
import { IMG } from "@/lib/media";
import { Photo } from "@/components/site/photo";
import { Btn, Container, Words } from "@/components/site/primitives";
import { SpinBadge } from "@/components/site/spin-badge";
import { Newsletter } from "@/components/site/newsletter";

const cols = [
  { title: "Explore", links: [["Home", "/"], ["About", "/about"], ["Programme", "/conference-programme"], ["News", "/news"]] },
  { title: "Participate", links: [["Register", "/register"], ["Investment Opportunities", "/investment-opportunities"], ["Consumer Fair", "/trade-fair"], ["Floor Plan", "/trade-fair#floor-plan"], ["Sponsors & Partners", "/sponsors-partners"]] },
  { title: "Help", links: [["FAQ", "/faq"], ["Contact", "/contact"], ["Login", "/login"]] },
];

export function SiteFooter() {
  return (
    <footer className="bg-forest text-white">
      {/* Image band */}
      <section className="relative isolate overflow-hidden">
        <Photo src={IMG.tradeFair} alt="" sizes="100vw" quality={90} parallax={0.1} className="absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest via-forest/75 to-forest/30" />
        <Container className="grid items-end gap-10 py-24 md:py-32 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">{EVENT.dateLabel}</p>
            <Words text="Invest. Trade. Grow." className="display-xl mt-4" accent={{ words: ["Trade"], className: "text-gold" }} />
            <div className="mt-10 flex flex-wrap gap-3">
              <Btn href="/register">Register now</Btn>
              <Btn href="/sponsors-partners" variant="ghost-light">Become a partner</Btn>
            </div>
          </div>
          <SpinBadge tone="gold" uid="foot" className="hidden size-44 lg:grid" />
        </Container>
      </section>

      <Container className="grid gap-14 py-20 lg:grid-cols-[1.4fr_1fr_1fr_.8fr]">
        <div>
          <p className="font-display text-4xl leading-none">{EVENT.short}</p>
          <p className="mt-4 max-w-sm leading-relaxed text-white/65">
            {EVENT.name}. {EVENT.venue}, {EVENT.dateLabel}.
          </p>
          <a href={EVENT.mapUrl} target="_blank" rel="noreferrer" className="link-arrow mt-4 text-gold">
            <MapPin className="size-4" /> Get directions
          </a>
          <div className="mt-10">
            <p className="font-display text-3xl">Stay in the loop</p>
            <p className="mt-1 text-sm text-white/55">Speaker announcements, programme updates and deadlines.</p>
            <div className="mt-4">
              <Newsletter />
            </div>
          </div>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="font-display text-2xl tracking-wide text-gold">{c.title}</h3>
            <ul className="mt-5 space-y-3">
              {c.links.map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="group inline-flex items-center gap-1.5 text-white/70 transition hover:text-white">
                    {l}
                    <ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      {/* Logos sit on a light band so they show exactly as designed */}
      <div className="bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-x-12 gap-y-8 py-10">
          <Image src={IMG.logo} alt="Meru Invest" width={200} height={143} className="h-16 w-auto object-contain" />
          <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
            <span className="text-xs font-semibold uppercase tracking-[.25em] text-ink/50">Organised by</span>
            {PARTNERS.map((p) => (
              <a key={p.name} href={p.href} target="_blank" rel="noreferrer" className="transition hover:-translate-y-0.5">
                <Image src={p.logo} alt={p.name} width={180} height={120} className="h-16 w-auto object-contain" />
              </a>
            ))}
          </div>
        </Container>
      </div>

      <Container className="flex flex-wrap justify-between gap-3 py-6 text-sm text-white/50">
        <p>© {new Date().getFullYear()} Meru Invest. All rights reserved.</p>
        <p className="flex gap-5">
          <Link href="/faq" className="hover:text-white">FAQ</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </p>
      </Container>
    </footer>
  );
}
