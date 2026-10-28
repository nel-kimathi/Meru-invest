import { unstable_cache } from "next/cache";
import { PUBLIC_REVALIDATE_SECONDS, TAGS } from "@/lib/cache-tags";
import {
  getPartnerLogos,
  getSponsorshipSettings,
  type PartnerLogo,
  type SponsorshipSettings,
} from "@/app/admin/settings/actions";

/**
 * Safe wrappers for the public site: the admin getters throw if the database
 * is unreachable, which would take the whole page down. These fall back to
 * the same defaults the Admin Portal starts with.
 */
const FALLBACK_SPONSORSHIP: SponsorshipSettings = {
  sponsorsIntro:
    "MIICCOF is a flagship platform convening investors, businesses, government, development partners, financial institutions, and consumers to unlock investment and commercial opportunities across Meru County and the wider region, showcasing potential in agriculture and agribusiness, avocado and miraa value addition, tourism and hospitality, manufacturing, trade, financial services, technology, SMEs, and Special Economic Zone (SEZ) opportunities.",
  sponsorshipTiers: [
    { name: "Star Partner", amount: "KES 5,000,000", slots: "1 slot", position: "Title Partner" },
    { name: "Platinum Partner", amount: "KES 3,000,000", slots: "3 slots", position: "Co-Powered Partner" },
    { name: "Gold Partner", amount: "KES 2,000,000", slots: "5 slots", position: "Official Gold Partner" },
    { name: "Silver Partner", amount: "KES 1,000,000", slots: "10 slots", position: "Official Silver Partner" },
    { name: "Bronze Partner", amount: "KES 500,000", slots: "15 slots", position: "Official Bronze Partner" },
  ],
  whyPartnerPoints: [
    "Align your brand with a high-level investment and business platform in Meru County",
    "Engage investors, entrepreneurs, consumers, government, and financial institutions",
    "Showcase products through exhibition, activation, and direct customer engagement",
    "Strengthen visibility via event branding, media exposure, and digital marketing",
    "Build strategic relationships through VIP networking and B2B matchmaking",
    "Demonstrate commitment to enterprise growth and regional investment",
  ],
};

const FALLBACK_LOGOS: PartnerLogo[] = [
  { name: "Meru County Government", image: "/images/brands/mcg-logo.png", href: "https://meru.go.ke/" },
  { name: "Meru University of Science and Technology", image: "/images/brands/must-logo.png", href: "https://www.must.ac.ke/" },
  { name: "KNCCI Meru Chapter", image: "/images/brands/kncci-logo.png", href: "https://meruchamber.co.ke/" },
];

const cachedSponsorship = unstable_cache(() => getSponsorshipSettings(), ["public-sponsorship"], {
  revalidate: PUBLIC_REVALIDATE_SECONDS,
  tags: [TAGS.settings],
});
const cachedLogos = unstable_cache(() => getPartnerLogos(), ["public-partner-logos"], {
  revalidate: PUBLIC_REVALIDATE_SECONDS,
  tags: [TAGS.settings],
});

export async function sponsorshipSettings(): Promise<SponsorshipSettings> {
  try {
    return await cachedSponsorship();
  } catch {
    return FALLBACK_SPONSORSHIP;
  }
}

export async function partnerLogos(): Promise<PartnerLogo[]> {
  try {
    return await cachedLogos();
  } catch {
    return FALLBACK_LOGOS;
  }
}
