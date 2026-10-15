import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Role, RegistrationStatus } from "@/lib/generated/prisma/client";

const TEMP_SECRET = "miiccof-hostinger-seed-2026";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") !== TEMP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const adminEmail = body.adminEmail ? String(body.adminEmail).trim() : null;

    // 1. Ensure all public pages exist.
    const pages = [
      { slug: "home", title: "Home" },
      { slug: "about", title: "About MIICCOF" },
      { slug: "investment-opportunities", title: "Investment Opportunities" },
      { slug: "trade-fair", title: "Consumer Fair" },
      { slug: "conference-programme", title: "Conference Programme" },
      { slug: "sponsors-partners", title: "Sponsors & Partners" },
      { slug: "news", title: "News & Updates" },
      { slug: "faq", title: "FAQ" },
      { slug: "contact", title: "Contact" },
    ];

    for (const p of pages) {
      await prisma.page.upsert({
        where: { slug: p.slug },
        update: {},
        create: { id: crypto.randomUUID(), slug: p.slug, title: p.title },
      });
    }

    // 2. Add default home-page sections if none exist.
    const homePage = await prisma.page.findUnique({ where: { slug: "home" } });
    if (homePage) {
      const existing = await prisma.section.count({ where: { pageId: homePage.id } });
      if (existing === 0) {
        const now = new Date();
        await prisma.section.createMany({
          data: [
            {
              id: crypto.randomUUID(),
              pageId: homePage.id,
              key: "hero",
              order: 0,
              title: "Meru International Investment Conference & Consumer Fair",
              subtitle: "Connecting investors, government and business to opportunities in Meru",
              body: "Join us for three days of investment conversations, exhibitions, and networking in Meru County.",
              imageUrl: "/images/hero/hero-bg.jpg",
              metadata: JSON.stringify({
                badge: "December 3rd, 4th, & 5th 2026",
                ctaPrimary: { label: "Register Now", href: "/register" },
                ctaSecondary: { label: "Learn More", href: "/about" },
              }),
              createdAt: now,
              updatedAt: now,
            },
            {
              id: crypto.randomUUID(),
              pageId: homePage.id,
              key: "intro",
              order: 1,
              title: "About MIICCOF",
              subtitle: "A flagship platform for investment and trade",
              body: "MIICCOF convenes investors, businesses, government, development partners, financial institutions, and consumers to unlock investment and commercial opportunities across Meru County and the wider region.",
              createdAt: now,
              updatedAt: now,
            },
            {
              id: crypto.randomUUID(),
              pageId: homePage.id,
              key: "opportunities-teaser",
              order: 2,
              title: "Investment Opportunities",
              subtitle: "Explore key sectors in Meru County",
              metadata: JSON.stringify({
                items: [
                  { title: "Agriculture & Agribusiness", description: "Avocado, miraa, dairy, and value addition" },
                  { title: "Tourism & Hospitality", description: "Eco-tourism, hotels, and cultural sites" },
                  { title: "Manufacturing & Trade", description: "SEZ opportunities and local enterprise" },
                  { title: "Technology & SMEs", description: "Innovation hubs and startup support" },
                ],
              }),
              createdAt: now,
              updatedAt: now,
            },
            {
              id: crypto.randomUUID(),
              pageId: homePage.id,
              key: "sponsorship-teaser",
              order: 3,
              title: "Sponsorship Packages",
              subtitle: "Partner with MIICCOF 2026",
              metadata: JSON.stringify({
                cta: { label: "Become a Sponsor", href: "/sponsors-partners" },
              }),
              createdAt: now,
              updatedAt: now,
            },
            {
              id: crypto.randomUUID(),
              pageId: homePage.id,
              key: "cta",
              order: 4,
              title: "Ready to Participate?",
              subtitle: "Register as a delegate, sponsor, or exhibitor today.",
              metadata: JSON.stringify({
                cta: { label: "Register Now", href: "/register" },
              }),
              createdAt: now,
              updatedAt: now,
            },
          ],
        });
      }
    }

    // 3. Ensure default site settings exist.
    const defaultSettings: Record<string, string> = {
      siteName: "MIICCOF",
      siteTagline: "Meru International Investment Conference & Consumer Fair",
      contactEmail: "noreply@meruinvest.co.ke",
      supportPhone: "",
      eventStartDate: "2026-12-03",
      eventEndDate: "2026-12-05",
      eventLocation: "Meru, Kenya",
      socialFacebook: "",
      socialTwitter: "",
      socialLinkedIn: "",
      sponsorsIntro:
        "MIICCOF is a flagship platform convening investors, businesses, government, development partners, financial institutions, and consumers to unlock investment and commercial opportunities across Meru County and the wider region.",
      sponsorshipTiers: JSON.stringify([
        { name: "Star Partner", amount: "KES 5,000,000", slots: "1 slot", position: "Title Partner" },
        { name: "Platinum Partner", amount: "KES 3,000,000", slots: "3 slots", position: "Co-Powered Partner" },
        { name: "Gold Partner", amount: "KES 2,000,000", slots: "5 slots", position: "Official Gold Partner" },
        { name: "Silver Partner", amount: "KES 1,000,000", slots: "10 slots", position: "Official Silver Partner" },
        { name: "Bronze Partner", amount: "KES 500,000", slots: "15 slots", position: "Official Bronze Partner" },
      ]),
      whyPartnerPoints: JSON.stringify([
        "Align your brand with a high-level investment and business platform in Meru County",
        "Engage investors, entrepreneurs, consumers, government, and financial institutions",
        "Showcase products through exhibition, activation, and direct customer engagement",
        "Strengthen visibility via event branding, media exposure, and digital marketing",
        "Build strategic relationships through VIP networking and B2B matchmaking",
        "Demonstrate commitment to enterprise growth and regional investment",
      ]),
      partnerLogos: JSON.stringify([
        { name: "Meru County Government", image: "/images/brands/mcg-logo.png", href: "https://meru.go.ke/" },
        { name: "Meru University of Science and Technology", image: "/images/brands/must-logo.png", href: "https://www.must.ac.ke/" },
        { name: "KNCCI Meru Chapter", image: "/images/brands/kncci-logo.png", href: "https://meruchamber.co.ke/" },
      ]),
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: {},
        create: { id: crypto.randomUUID(), key, value, updatedAt: new Date() },
      });
    }

    // 4. Promote registered user to Super Admin if email provided.
    let adminUpdate = null;
    if (adminEmail) {
      const user = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: Role.SUPER_ADMIN,
            emailVerified: true,
            registrationStatus: RegistrationStatus.APPROVED,
          },
        });
        adminUpdate = adminEmail;
      }
    }

    return NextResponse.json({
      message: "Seed completed",
      adminUpdated: adminUpdate,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
