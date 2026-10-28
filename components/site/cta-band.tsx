import { Photo } from "@/components/site/photo";
import { Btn, Container, Words } from "@/components/site/primitives";
import { IMG } from "@/lib/media";
import { clean } from "@/lib/text";
import type { Block } from "@/lib/content";

type Cta = { label: string; href: string };

/** Full-bleed photo call to action with the text on a 60/40 split. */
export function CtaBand({
  block,
  title,
  body,
  cta,
  image = IMG.opening,
  eyebrow = "Next step",
}: {
  block?: Block;
  title?: string;
  body?: string;
  cta?: Cta[];
  image?: string;
  eyebrow?: string;
}) {
  const t = clean(block?.title) || title || "Ready when you are";
  const b = clean(block?.body) || body;
  const links: Cta[] = (block?.meta.cta as Cta[] | undefined) ?? cta ?? [{ label: "Register now", href: "/register" }];
  return (
    <section className="relative isolate overflow-hidden bg-forest text-white">
      <div className="grid min-h-[560px] lg:grid-cols-[1.25fr_1fr]">
        <Container className="flex flex-col justify-center py-24 lg:mx-0 lg:max-w-none lg:pl-[max(2rem,calc((100vw-1320px)/2+2rem))] lg:pr-16">
          <p className="eyebrow" data-reveal="up">{eyebrow}</p>
          <Words text={t} className="display-lg mt-5" />
          {b ? <p data-reveal="up" className="mt-6 max-w-lg text-lg text-white/75">{b}</p> : null}
          <div className="mt-10 flex flex-wrap gap-3" data-reveal="up">
            {links.map((c, i) => (
              <Btn key={c.href + c.label} href={c.href} variant={i === 0 ? "gold" : "ghost-light"}>
                {c.label}
              </Btn>
            ))}
            {links.length === 1 ? <Btn href="/contact" variant="ghost-light">Talk to the secretariat</Btn> : null}
          </div>
        </Container>
        <div className="relative min-h-[360px]" data-reveal="clip-x">
          <div className="absolute inset-0">
            <Photo src={block?.imageUrl || image} alt="" sizes="(min-width:1024px) 45vw, 100vw" parallax={0.1} className="shape-wedge absolute inset-0 max-lg:[clip-path:none]" />
          </div>
        </div>
      </div>
    </section>
  );
}
