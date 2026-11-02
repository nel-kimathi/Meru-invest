import { Check, MapPin, CalendarDays } from "lucide-react";
import { Photo } from "@/components/site/photo";
import { EVENT } from "@/lib/event";

type Props = {
  title: string;
  intro: string;
  eyebrow: string;
  
  image: string;

  headline?: string;
  points?: string[];
  children: React.ReactNode;
};



export function AuthShell({ title, intro, eyebrow, image, headline = "Invest. Trade. Grow.", points, children }: Props) {
  return (
    <section className="bg-mint pb-16 pt-[calc(84px+1.25rem)] lg:pb-20 lg:pt-[calc(84px+2rem)]">
      <div className="mx-auto grid w-full max-w-[1320px] gap-6 px-4 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
        {/* Photo panel */}
        <aside className="relative isolate overflow-hidden rounded-[2rem] text-white max-lg:min-h-[260px] lg:sticky lg:top-[calc(84px+2rem)] lg:h-[calc(100svh-84px-4rem)] lg:min-h-[560px]">
          <Photo src={image} alt="" preload quality={90} sizes="(min-width:1024px) 46vw, 100vw" className="absolute inset-0 -z-10" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/55 to-forest/10" />

          <div className="flex h-full flex-col justify-between gap-8 p-7 sm:p-9 lg:p-11">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium backdrop-blur">
                <CalendarDays className="size-4 text-gold" /> {EVENT.dateLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium backdrop-blur">
                <MapPin className="size-4 text-gold" /> {EVENT.venue}
              </span>
            </div>

            <div>
              <p className="font-display text-[clamp(44px,5vw,84px)] leading-[.9]">
                {headline.split(" ").map((w, i, all) => (
                  <span key={i} className={i === all.length - 1 ? "text-gold" : undefined}>
                    {w}{i < all.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
              {points?.length ? (
                <ul className="mt-6 hidden space-y-3 sm:block">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-white/85">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold text-forest">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </aside>

        {/* Form card */}
        <div className="flex items-start lg:items-center">
          <div className="w-full rounded-[2rem] bg-white p-7 shadow-[0_30px_70px_-45px_rgba(10,38,25,.45)] sm:p-10 lg:p-12">
            <p className="eyebrow eyebrow-brand">{eyebrow}</p>
            <h1 className="mt-3 font-display text-[clamp(44px,4.4vw,72px)] leading-[.92] text-ink">{title}</h1>
            <p className="mt-3 max-w-lg text-lg text-ink/65">{intro}</p>
            <div className="auth-scope mt-8">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}