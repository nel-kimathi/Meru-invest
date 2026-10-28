import type { Metadata } from "next";
import { formatDate, getBlocks, getNewsCards, pick } from "@/lib/content";
import { IMG, fallbackImage } from "@/lib/media";
import { clean } from "@/lib/text";
import { PageHero } from "@/components/site/page-hero";
import { Container } from "@/components/site/primitives";
import { NewsGrid } from "@/components/site/news-grid";
import { Newsletter } from "@/components/site/newsletter";
import { SectionRenderer } from "@/components/public/sections";

export const revalidate = 300; // cached page, refreshed in the background (admin saves refresh it at once)
export const metadata: Metadata = { title: "News & Updates" };

export default async function NewsPage() {
  const [blocks, news] = await Promise.all([getBlocks("news"), getNewsCards()]);
  const hero = pick(blocks, "hero");

  return (
    <>
      <PageHero
        title={clean(hero?.title) || "News & updates"}
        subtitle={clean(hero?.subtitle)}
        eyebrow="Newsroom"
        image={hero?.imageUrl || IMG.panel}
        crumb="News"
      />

      <section className="bg-white py-24 lg:py-28">
        <Container>
          {news.length ? (
            <NewsGrid
              items={news.map((n, i) => ({
                slug: n.slug,
                title: clean(n.title),
                excerpt: clean(n.excerpt) || clean(n.content).slice(0, 180),
                category: n.category,
                date: formatDate(n.publishedAt),
                image: n.coverImage || fallbackImage(i),
              }))}
            />
          ) : (
            <div className="rounded-[2.5rem] bg-mint p-12 text-center">
              <p className="font-display text-5xl text-ink">No news yet</p>
              <p className="mt-3 text-ink/60">Announcements from the secretariat will appear here. Subscribe below to hear first.</p>
            </div>
          )}
        </Container>
      </section>

      {blocks.filter((b) => b.key !== "hero").map((b, i) => (
        <SectionRenderer key={b.key + i} block={b} slug="news" index={i} />
      ))}

      <section className="bg-forest py-20 text-white">
        <Container className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">Newsletter</p>
            <h2 className="display-md mt-3">Get every announcement first.</h2>
          </div>
          <div className="lg:justify-self-end">
            <Newsletter />
          </div>
        </Container>
      </section>
    </>
  );
}
