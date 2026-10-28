import type { Metadata } from "next";
import { getBlocks, pick } from "@/lib/content";
import { EVENT } from "@/lib/event";
import { IMG, fallbackImage } from "@/lib/media";
import { clean } from "@/lib/text";
import { PageHero } from "@/components/site/page-hero";
import { Btn, Container, SectionHead } from "@/components/site/primitives";
import { ProgrammeTabs } from "@/components/site/programme-tabs";
import { CtaBand } from "@/components/site/cta-band";
import { MiniCalendar } from "@/components/home/sections";
import { SectionRenderer } from "@/components/public/sections";

export const revalidate = 300; // cached page, refreshed in the background (admin saves refresh it at once)
export const metadata: Metadata = { title: "Conference Programme" };

type Ev = { title: string; time?: string; description?: string; image?: string };

function eventDates() {
  const s = new Date(EVENT.start), e = new Date(EVENT.end);
  const out: string[] = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }));
  }
  return out;
}

export default async function ProgrammePage() {
  const blocks = await getBlocks("conference-programme");
  const hero = pick(blocks, "hero");
  const schedule = pick(blocks, "schedule");
  const events: Ev[] = schedule?.meta.events ?? [];

  return (
    <>
      <PageHero
        title={clean(hero?.title) || "Conference programme"}
        subtitle={clean(hero?.subtitle)}
        eyebrow={EVENT.dateLabel}
        image={hero?.imageUrl || IMG.panel}
        crumb="Programme"
      />

      <section className="bg-white py-28 lg:py-32">
        <Container>
          <SectionHead eyebrow="Three days" title={clean(schedule?.title) || "Programme outline"} intro={clean(schedule?.body)} />
          <div className="mt-14 grid gap-10 lg:grid-cols-[320px_1fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start" data-reveal="up">
              <MiniCalendar />
              <div className="mt-4 rounded-[2rem] bg-sand p-7">
                <p className="font-display text-3xl leading-none text-ink">Want the full agenda?</p>
                <p className="mt-2 text-ink/70">Registered delegates receive the detailed programme and session updates by email.</p>
                <Btn href="/register" variant="forest" className="mt-5 w-full">Register</Btn>
              </div>
            </aside>
            <ProgrammeTabs
              dates={eventDates()}
              items={events.map((e, i) => ({ title: clean(e.title), time: clean(e.time), description: clean(e.description), image: e.image || fallbackImage(i + 1) }))}
            />
          </div>
        </Container>
      </section>

      {blocks.filter((b) => !["hero", "schedule"].includes(b.key)).map((b, i) => (
        <SectionRenderer key={b.key + i} block={b} slug="conference-programme" index={i} />
      ))}

      <CtaBand
        title="Save your seat in the hall."
        body="Sessions fill up. Register now to receive your delegate pass and programme updates."
        image={IMG.opening}
        eyebrow="Delegates"
      />
    </>
  );
}
