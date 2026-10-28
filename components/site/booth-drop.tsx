import { Check } from "lucide-react";
import { Deferred, GLPlaceholder, TentDrop } from "@/components/gl/lazy";
import { Btn, Container, Words } from "@/components/site/primitives";

const POINTS = ["Standard 3 x 3 m and premium 6 x 3 m booths", "Themed halls next to buyers in your sector", "Branding, delegate passes and B2B matchmaking"];

/** "Book your booth" call to action with the 3D tents that pop up on scroll. */
export function BoothDrop({ floorPlanHref = "/trade-fair#floor-plan" }: { floorPlanHref?: string }) {
  return (
    <section className="overflow-hidden bg-mint py-24 lg:py-32">
      <Container className="grid items-center gap-10 lg:grid-cols-[.9fr_1.25fr]">
        <div>
          <p className="eyebrow eyebrow-brand" data-reveal="up">Exhibitors</p>
          <Words text="Your booth is waiting." className="display-lg mt-5 text-ink" accent={{ words: ["waiting"], className: "text-brand" }} />
          <p data-reveal="up" className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
            Set up on the fair floor in front of investors, buyers and thousands of visitors. Booths are allocated first come, first served.
          </p>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p, i) => (
              <li key={p} data-reveal="up" style={{ ["--d" as string]: `${i * 90}ms` }} className="flex items-start gap-3 text-ink/80">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3" data-reveal="up">
            <Btn href="/register">Book your booth</Btn>
            <Btn href={floorPlanHref} variant="ghost-dark">See the floor plan</Btn>
          </div>
        </div>
        <Deferred className="relative aspect-[4/3] w-full" rootMargin="300px 0px" fallback={<GLPlaceholder tone="light" />}>
          <TentDrop />
        </Deferred>
      </Container>
    </section>
  );
}
