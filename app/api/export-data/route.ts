import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const TEMP_SECRET = "miiccof-export-2026";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") !== TEMP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pages = await prisma.page.findMany({
      include: { sections: true },
    });

    const settings = await prisma.siteSetting.findMany();
    const news = await prisma.news.findMany();
    const halls = await prisma.exhibitionHall.findMany();
    const booths = await prisma.booth.findMany();
    const logs = await prisma.systemLog.findMany();

    // Exclude sensitive user data; include roles/status for test accounts.
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        phone: true,
        organization: true,
        country: true,
        category: true,
        role: true,
        registrationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      pages,
      settings,
      news,
      halls,
      booths,
      logs,
      users,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
