import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Share } from "@/components/site/share";
import { formatDate, getNewsCard, getNewsCards } from "@/lib/content";
import { IMG, fallbackImage } from "@/lib/media";
import { clean, paragraphs } from "@/lib/text";
import { Photo } from "@/components/site/photo";
import { Btn, Container, Words } from "@/components/site/primitives";

export const revalidate = 300; // cached page, refreshed in the background (admin saves refresh it at once)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsCard(slug);
  return { title: item?.title ?? "News", description: item?.excerpt ?? undefined };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, all] = await Promise.all([getNewsCard(slug), getNewsCards()]);

  if (!item) {
    return (
      <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-forest text-white">
        <Photo src={IMG.panel} alt="" sizes="100vw" className="absolute inset-0 -z-10 opacity-40" />
        <Container className="py-40">
          <p className="eyebrow">News</p>
          <h1 className="display-lg mt-4">Article not found</h1>
          <p className="mt-4 max-w-md text-white/70">This article may have been removed or is not yet available.</p>
          <Btn href="/news" className="mt-8">Back to news</Btn>
        </Container>
      </section>
    );
  }

  const idx = all.findIndex((n) => n.slug === item.slug);
  const cover = item.coverImage || fallbackImage(Math.max(0, idx));
  const related = all.filter((n) => n.slug !== item.slug).slice(0, 3);
  const paras = paragraphs(item.content);

  return (
    <article>
      <header className="relative isolate flex min-h-[80svh] items-end overflow-hidden bg-forest text-white">
        <Photo src={cover} alt="" preload quality={90} sizes="100vw" parallax={0.12} className="absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/50 to-forest/30" />
        <Container className="pb-20 pt-40">
          <Link href="/news" className="link-arrow text-sm text-white/70 hover:text-gold">
            <ArrowLeft className="size-4" /> All news
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
            {item.category ? <span className="rounded-full bg-gold px-3 py-1 font-semibold text-ink">{item.category}</span> : null}
            {item.publishedAt ? <span className="text-white/70">{formatDate(item.publishedAt)}</span> : null}
          </div>
          <Words as="h1" text={clean(item.title)} className="display-lg mt-5 max-w-5xl" />
        </Container>
      </header>

      <section className="bg-white py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[1fr_minmax(0,720px)_1fr]">
          <aside className="order-2 lg:order-none">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-ink/50">Share</p>
              <Share title={item.title} />
            </div>
          </aside>
          <div className="space-y-6 text-xl leading-[1.75] text-ink/80">
            {item.excerpt ? <p className="text-2xl leading-relaxed text-ink" data-reveal="up">{clean(item.excerpt)}</p> : null}
            {paras.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Container>
      </section>

      {related.length ? (
        <section className="bg-mint py-24">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="display-md text-ink">More from the newsroom</h2>
              <Btn href="/news" variant="ghost-dark">All news</Btn>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((n) => (
                <Link key={n.slug} href={`/news/${n.slug}`} className="group">
                  <Photo src={n.coverImage || fallbackImage(all.indexOf(n))} alt="" sizes="(min-width:768px) 30vw, 100vw" className="shape-leaf aspect-[4/3] w-full" />
                  <p className="mt-4 text-sm text-ink/50">{formatDate(n.publishedAt)}</p>
                  <h3 className="mt-1 inline-flex items-start gap-2 font-display text-3xl leading-none text-ink transition group-hover:text-brand">
                    {clean(n.title)} <ArrowUpRight className="mt-1 size-5 shrink-0 transition group-hover:rotate-45" />
                  </h3>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </article>
  );
}
