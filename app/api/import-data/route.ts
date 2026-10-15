import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const TEMP_SECRET = "miiccof-import-2026";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") !== TEMP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Clear existing CMS / config data before importing.
    await prisma.$transaction([
      prisma.section.deleteMany({}),
      prisma.page.deleteMany({}),
      prisma.siteSetting.deleteMany({}),
      prisma.news.deleteMany({}),
      prisma.booth.deleteMany({}),
      prisma.exhibitionHall.deleteMany({}),
      prisma.systemLog.deleteMany({}),
    ]);

    // Import pages and sections.
    if (Array.isArray(data.pages)) {
      for (const page of data.pages) {
        const { sections, ...pageData } = page;
        await prisma.page.create({
          data: {
            id: pageData.id,
            slug: pageData.slug,
            title: pageData.title,
            createdAt: new Date(pageData.createdAt),
            updatedAt: new Date(pageData.updatedAt),
            sections: {
              create: Array.isArray(sections)
                ? sections.map((section: Record<string, unknown>) => ({
                    id: section.id as string,
                    key: section.key as string,
                    order: (section.order as number) ?? 0,
                    title: (section.title as string | null) ?? null,
                    subtitle: (section.subtitle as string | null) ?? null,
                    body: (section.body as string | null) ?? null,
                    imageUrl: (section.imageUrl as string | null) ?? null,
                    metadata: section.metadata as any,
                    createdAt: new Date(section.createdAt as string),
                    updatedAt: new Date(section.updatedAt as string),
                  }))
                : [],
            },
          },
        });
      }
    }

    // Import site settings.
    if (Array.isArray(data.settings)) {
      await prisma.siteSetting.createMany({
        data: data.settings.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          key: s.key as string,
          value: s.value as string,
          updatedAt: new Date(s.updatedAt as string),
        })),
      });
    }

    // Import news.
    if (Array.isArray(data.news)) {
      await prisma.news.createMany({
        data: data.news.map((n: Record<string, unknown>) => ({
          id: n.id as string,
          title: n.title as string,
          slug: n.slug as string,
          excerpt: (n.excerpt as string | null) ?? null,
          content: n.content as string,
          coverImage: (n.coverImage as string | null) ?? null,
          category: (n.category as string | null) ?? null,
          status: n.status as string,
          publishedAt: n.publishedAt ? new Date(n.publishedAt as string) : null,
          createdAt: new Date(n.createdAt as string),
          updatedAt: new Date(n.updatedAt as string),
        })),
      });
    }

    // Import exhibition halls.
    if (Array.isArray(data.halls)) {
      await prisma.exhibitionHall.createMany({
        data: data.halls.map((h: Record<string, unknown>) => ({
          id: h.id as string,
          name: h.name as string,
          description: (h.description as string | null) ?? null,
          order: (h.order as number) ?? 0,
          createdAt: new Date(h.createdAt as string),
          updatedAt: new Date(h.updatedAt as string),
        })),
      });
    }

    // Import booths.
    if (Array.isArray(data.booths)) {
      await prisma.booth.createMany({
        data: data.booths.map((b: Record<string, unknown>) => ({
          id: b.id as string,
          hallId: b.hallId as string,
          number: b.number as string,
          size: (b.size as string | null) ?? null,
          category: (b.category as string | null) ?? null,
          status: b.status as string,
          price: b.price ? Number(b.price) : null,
          exhibitorId: (b.exhibitorId as string | null) ?? null,
          notes: (b.notes as string | null) ?? null,
          createdAt: new Date(b.createdAt as string),
          updatedAt: new Date(b.updatedAt as string),
        })),
      });
    }

    // Import system logs.
    if (Array.isArray(data.logs)) {
      await prisma.systemLog.createMany({
        data: data.logs.map((l: Record<string, unknown>) => ({
          id: l.id as string,
          userId: (l.userId as string | null) ?? null,
          action: l.action as string,
          entityType: l.entityType as string,
          entityId: (l.entityId as string | null) ?? null,
          details: (l.details as any) ?? undefined,
          createdAt: new Date(l.createdAt as string),
        })),
      });
    }

    return NextResponse.json({
      message: "Import completed",
      pages: data.pages?.length ?? 0,
      settings: data.settings?.length ?? 0,
      news: data.news?.length ?? 0,
      halls: data.halls?.length ?? 0,
      booths: data.booths?.length ?? 0,
      logs: data.logs?.length ?? 0,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
