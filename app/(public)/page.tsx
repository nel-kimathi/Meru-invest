import { getBlocks, pick } from "@/lib/content";
import { partnerLogos } from "@/lib/public-settings";
import { HERO_SLIDES } from "@/lib/media";
import { clean } from "@/lib/text";
import { Hero } from "@/components/home/hero";
import { EventBar } from "@/components/home/event-bar";
import { Stats } from "@/components/home/stats";
import { BoothDrop } from "@/components/site/booth-drop";
import {
  GlobeSection,
  Leadership,
  MeruReveal,
  Opportunities,
  Partners,
  ProgrammePreview,
  RegisterCta,
  Sectors,
  Statement,
  Voices,
} from "@/components/home/sections";

// Static with incremental regeneration: served from cache, refreshed in the
// background at most every 5 minutes (admin saves revalidate immediately).
export const revalidate = 300;
export const metadata = {
  title: "Meru Invest | Invest. Trade. Grow.",
  description: "Meru International Investment Conference and Consumer Fair, 25 to 27 February 2027, Meru University.",
};

export default async function HomePage() {
  const [blocks, logos] = await Promise.all([getBlocks("home"), partnerLogos()]);
  const hero = pick(blocks, "hero");
  const leadership = pick(blocks, "leadership");

  // A hero photo set in the Admin Portal becomes the first slide.
  const slides = hero?.imageUrl && !HERO_SLIDES.some((s) => s.src === hero.imageUrl)
    ? [{ src: hero.imageUrl, caption: clean(hero.subtitle) || "Meru" }, ...HERO_SLIDES]
    : HERO_SLIDES;

  return (
    <>
      <Hero slides={slides} body={clean(hero?.body) || undefined} />
      <EventBar />
      <Statement />
      <Stats />
      <Sectors />
      <Leadership block={leadership} />
      <MeruReveal block={pick(blocks, "meru-county")} />
      <Opportunities block={pick(blocks, "opportunities-teaser")} />
      <BoothDrop />
      <GlobeSection />
      <ProgrammePreview block={pick(blocks, "events-preview")} />
      <Voices leaders={leadership?.meta.cards ?? []} />
      <Partners logos={logos} />
      <RegisterCta />
    </>
  );
}
