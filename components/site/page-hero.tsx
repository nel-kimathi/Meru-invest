import Link from "next/link";
import { Photo } from "@/components/site/photo";
import { Container, Words } from "@/components/site/primitives";
import { SpinBadge } from "@/components/site/spin-badge";

type Props = {
  title: string;
  subtitle?: string | null;
  eyebrow?: string;
  image: string;
  /** Secondary image used by the split variant. */
  image2?: string;
  crumb: string;
  variant?: "full" | "split";
  children?: React.ReactNode;
  imgPosition?: string;
};


const TOP = "pt-[calc(84px+clamp(2.5rem,7vh,5rem))]";

/** Headline size scales with width and height, so short laptop screens get a smaller title instead of a cramped one. */
const TITLE_FULL = "font-display text-[clamp(52px,min(10vw,14svh),176px)] leading-[.88]"; // leading after size: tailwind-merge drops it otherwise
const TITLE_SPLIT = "font-display text-[clamp(48px,min(6.4vw,13svh),124px)] leading-[.88]";

export function PageHero({ title, subtitle, eyebrow, image, image2, crumb, variant = "full", children, imgPosition = "object-center" }: Props) {
  if (variant === "split") {
    return (
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="grid lg:min-h-[max(640px,86svh)] lg:grid-cols-[1.15fr_1fr]">
          <Container
            className={`relative z-10 flex flex-col justify-center pb-14 lg:mx-0 lg:max-w-none lg:pb-24 lg:pl-[max(2rem,calc((100vw-1320px)/2+2rem))] lg:pr-12 ${TOP}`}
          >
            <Breadcrumb crumb={crumb} />
            {eyebrow ? <p className="eyebrow mt-8" data-reveal="up">{eyebrow}</p> : null}
            <Words as="h1" text={title} className={`mt-4 ${TITLE_SPLIT}`} />
            {subtitle ? (
              <p data-reveal="up" style={{ ["--d" as string]: "250ms" }} className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
                {subtitle}
              </p>
            ) : null}
            {children ? <div data-reveal="up" style={{ ["--d" as string]: "400ms" }} className="mt-8">{children}</div> : null}
          </Container>
          <div className="relative min-h-[380px] lg:min-h-0">
            {/* On desktop the photo starts below the header and stops short of the bottom edge */}
            <div data-reveal="clip" className="absolute inset-0 lg:bottom-16 lg:left-0 lg:right-10 lg:top-[calc(84px+3rem)]">
              <div className="h-full w-full">
                <Photo src={image} alt="" preload quality={90} sizes="(min-width:1024px) 46vw, 100vw" parallax={0.08} className="h-full w-full shape-leaf max-lg:rounded-none" imgClassName={imgPosition} />
              </div>
            </div>
            {image2 ? (
              <div data-reveal="up" style={{ ["--d" as string]: "500ms" }} className="absolute -left-16 bottom-8 hidden w-52 lg:block xl:w-60">
                <Photo src={image2} alt="" sizes="260px" className="shape-circle w-full ring-8 ring-forest" />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    // min-height instead of a fixed height: if the title wraps to more lines,
    // the hero grows downwards rather than pushing text up under the navbar.
    <section className="relative isolate flex min-h-[max(600px,82svh)] items-center overflow-hidden bg-forest text-white md:items-end">
      <Photo src={image} alt="" preload quality={90} sizes="100vw" parallax={0.12} className="absolute inset-0 -z-10" imgClassName={imgPosition} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/40 to-forest/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest/80 via-forest/20 to-transparent" />
      <Container className={`relative pb-16 md:pb-24 ${TOP}`}>
        <Breadcrumb crumb={crumb} />
        {eyebrow ? <p className="eyebrow mt-6" data-reveal="up">{eyebrow}</p> : null}
        <Words as="h1" text={title} className={`mt-4 max-w-5xl ${TITLE_FULL}`} />
        {subtitle ? (
          <p data-reveal="up" style={{ ["--d" as string]: "250ms" }} className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            {subtitle}
          </p>
        ) : null}
        {children ? <div data-reveal="up" style={{ ["--d" as string]: "400ms" }} className="mt-8">{children}</div> : null}
      </Container>
      <div className="absolute bottom-10 right-8 hidden lg:block">
        <SpinBadge />
      </div>
    </section>
  );
}

function Breadcrumb({ crumb }: { crumb: string }) {
  return (
    <nav aria-label="Breadcrumb" data-reveal="fade" className="flex items-center gap-2 text-sm text-white/60">
      <Link href="/" className="transition hover:text-gold">Home</Link>
      <span aria-hidden>/</span>
      <span className="text-white">{crumb}</span>
    </nav>
  );
}