import Link from "next/link";
import { Photo } from "@/components/site/photo";
import { Container, Words } from "@/components/site/primitives";
import { SpinBadge } from "@/components/site/spin-badge";
import { cn } from "@/lib/utils";

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

export function PageHero({ title, subtitle, eyebrow, image, image2, crumb, variant = "full", children, imgPosition = "object-center" }: Props) {
  if (variant === "split") {
    return (
      <section className="relative overflow-hidden bg-forest pt-28 text-white lg:pt-0">
        <div className="grid min-h-[86svh] lg:grid-cols-[1.15fr_1fr]">
          <Container className="relative z-10 flex flex-col justify-center py-16 lg:mx-0 lg:max-w-none lg:py-32 lg:pl-[max(2rem,calc((100vw-1320px)/2+2rem))] lg:pr-12">
            <Breadcrumb crumb={crumb} />
            {eyebrow ? <p className="eyebrow mt-10" data-reveal="up">{eyebrow}</p> : null}
            <Words as="h1" text={title} className="mt-4 font-display text-[clamp(56px,6.6vw,124px)] leading-[.88]" />
            {subtitle ? (
              <p data-reveal="up" style={{ ["--d" as string]: "250ms" }} className="mt-8 max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
                {subtitle}
              </p>
            ) : null}
            {children ? <div data-reveal="up" style={{ ["--d" as string]: "400ms" }} className="mt-10">{children}</div> : null}
          </Container>
          <div className="relative min-h-[420px] lg:min-h-0">
            <div data-reveal="clip" className="absolute inset-0 lg:inset-y-24 lg:left-0 lg:right-10">
              <Photo src={image} alt="" preload quality={90} sizes="(min-width:1024px) 46vw, 100vw" parallax={0.08} className="h-full w-full shape-leaf max-lg:rounded-none" imgClassName={imgPosition} />
            </div>
            {image2 ? (
              <div data-reveal="up" style={{ ["--d" as string]: "500ms" }} className="absolute -left-16 bottom-10 hidden w-56 lg:block xl:w-64">
                <Photo src={image2} alt="" sizes="260px" className="shape-circle w-full ring-8 ring-forest" />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate flex min-h-[640px] items-end overflow-hidden bg-forest text-white h-[88svh]">
      <Photo src={image} alt="" preload quality={90} sizes="100vw" parallax={0.12} className="absolute inset-0 -z-10" imgClassName={imgPosition} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/40 to-forest/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest/80 via-forest/20 to-transparent" />
      <Container className="relative pb-20 pt-36 md:pb-28">
        <Breadcrumb crumb={crumb} />
        {eyebrow ? <p className="eyebrow mt-8" data-reveal="up">{eyebrow}</p> : null}
        <Words as="h1" text={title} className={cn("display-xl mt-4 max-w-6xl")} />
        {subtitle ? (
          <p data-reveal="up" style={{ ["--d" as string]: "250ms" }} className="mt-7 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            {subtitle}
          </p>
        ) : null}
        {children ? <div data-reveal="up" style={{ ["--d" as string]: "400ms" }} className="mt-10">{children}</div> : null}
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
