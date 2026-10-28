import { Check } from "lucide-react";
import { Silk } from "@/components/gl/silk";
import { Photo } from "@/components/site/photo";
import { PassCard } from "@/components/site/pass-card";
import { EVENT } from "@/lib/event";
import { IMG } from "@/lib/media";

type Props = {
  title: string;
  intro: string;
  eyebrow: string;
  children: React.ReactNode;
  visual?: "pass" | "photo";
  points?: string[];
};

/** Split auth layout: flowing WebGL panel on the left, calm form on the right. */
export function AuthShell({ title, intro, eyebrow, children, visual = "photo", points }: Props) {
  return (
    <section className="grid min-h-svh bg-white lg:grid-cols-[1fr_1.05fr]">
      <div className="relative isolate overflow-hidden text-white lg:sticky lg:top-0 lg:h-svh">
        <Silk className="-z-10" />
        <div className="flex h-full flex-col justify-between gap-12 px-6 pb-12 pt-32 sm:px-10 lg:px-14 lg:pt-36">
          <div>
            <p className="eyebrow">{EVENT.dateLabel}</p>
            <p className="display-md mt-4 max-w-md">
              Invest. Trade. <span className="text-gold">Grow.</span>
            </p>
            {points?.length ? (
              <ul className="mt-8 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-white/80">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold text-ink">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {visual === "pass" ? (
            <div className="hidden justify-center lg:flex">
              <PassCard interactive={false} className="max-w-[300px] rotate-[-4deg]" />
            </div>
          ) : (
            <div className="relative hidden lg:block">
              <Photo src={IMG.opening} alt="" sizes="40vw" className="shape-leaf aspect-[16/10] w-full max-w-lg" />
              <Photo src={IMG.tea} alt="" sizes="180px" className="shape-circle absolute -bottom-6 right-6 w-40 ring-8 ring-forest/60" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center px-6 pb-16 pt-12 sm:px-10 lg:px-16 lg:pt-32">
        <div className="mx-auto w-full max-w-xl">
          <p className="eyebrow eyebrow-brand">{eyebrow}</p>
          <h1 className="display-lg mt-4 text-ink">{title}</h1>
          <p className="mt-4 text-lg text-ink/65">{intro}</p>
          <div className="auth-scope mt-10">{children}</div>
        </div>
      </div>
    </section>
  );
}
