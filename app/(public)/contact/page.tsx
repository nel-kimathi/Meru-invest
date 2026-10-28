import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getBlocks, pick } from "@/lib/content";
import { EVENT } from "@/lib/event";
import { IMG } from "@/lib/media";
import { clean } from "@/lib/text";
import { PageHero } from "@/components/site/page-hero";
import { Container } from "@/components/site/primitives";
import { ContactForm } from "@/components/public/contact-form";
import { SectionRenderer } from "@/components/public/sections";

export const revalidate = 300; // cached page, refreshed in the background (admin saves refresh it at once)
export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const blocks = await getBlocks("contact");
  const hero = pick(blocks, "hero");
  const details = pick(blocks, "details");
  const m = details?.meta ?? {};
  const rows = [
    m.email ? { icon: Mail, label: "Email", value: m.email as string, href: `mailto:${m.email}` } : null,
    m.phone ? { icon: Phone, label: "Phone", value: m.phone as string, href: `tel:${String(m.phone).replace(/\s/g, "")}` } : null,
    { icon: MapPin, label: "Venue", value: `${EVENT.venue}, ${m.location || EVENT.place}`, href: EVENT.mapUrl },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string }[];

  return (
    <>
      <PageHero
        variant="split"
        title={clean(hero?.title) || "Contact us"}
        subtitle={clean(hero?.subtitle)}
        eyebrow="Secretariat"
        image={hero?.imageUrl || IMG.aboutHero}
        image2={IMG.tea}
        crumb="Contact"
      />

      <section className="bg-mint py-24 lg:py-32">
        <Container className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_30px_60px_-40px_rgba(13,34,64,.5)] md:p-12" data-reveal="up">
            <p className="eyebrow eyebrow-brand">Write to us</p>
            <h2 className="display-md mt-3 text-ink">Send a message</h2>
            <p className="mt-3 max-w-md text-ink/65">Questions about registration, booths, sponsorship or media. We usually reply within one working day.</p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {rows.map((r, i) => (
              <a
                key={r.label}
                href={r.href}
                target={r.label === "Venue" ? "_blank" : undefined}
                rel="noreferrer"
                data-reveal="up"
                style={{ ["--d" as string]: `${i * 90}ms` }}
                className="group flex items-center gap-5 rounded-[2rem] bg-white p-6 transition duration-500 hover:bg-forest hover:text-white"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-white transition group-hover:bg-gold group-hover:text-ink">
                  <r.icon className="size-6" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[.2em] text-ink/45 group-hover:text-white/50">{r.label}</span>
                  <span className="mt-0.5 block text-lg font-semibold">{r.value}</span>
                </span>
              </a>
            ))}
            <div className="shape-leaf relative min-h-[320px] flex-1 overflow-hidden bg-white" data-reveal="up">
              <iframe
                title="Map to Meru University"
                src={EVENT.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 grayscale-[30%]"
              />
            </div>
          </div>
        </Container>
      </section>

      {blocks.filter((b) => !["hero", "details"].includes(b.key)).map((b, i) => (
        <SectionRenderer key={b.key + i} block={b} slug="contact" index={i} />
      ))}
    </>
  );
}
