import { IMG } from "@/lib/media";

export const EVENT = {
  name: "Meru International Investment Conference and Consumer Fair",
  short: "Meru Invest",
  acronym: "MIICCOF",
  start: "2027-02-25T09:00:00+03:00", // TODO confirm opening time
  end: "2027-02-27T18:00:00+03:00",
  dateLabel: "25 to 27 February 2027",
  dateShort: "25 / 26 / 27 Feb 2027",
  days: "Thursday to Saturday",
  venue: "Meru University",
  place: "Meru, Kenya",
  tagline: "Invest. Trade. Grow.",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Meru+University+of+Science+and+Technology",
  mapEmbed: "https://www.google.com/maps?q=Meru+University+of+Science+and+Technology&output=embed",
};

export type NavItem = { label: string; href: string; children?: { label: string; href: string; note?: string }[] };

// Every link points at a page that exists in app/(public).
export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Participate",
    href: "/investment-opportunities",
    children: [
      { label: "Investment Opportunities", href: "/investment-opportunities", note: "Priority sectors open for capital" },
      { label: "Consumer Fair", href: "/trade-fair", note: "Exhibit, sell and meet buyers" },
      { label: "Floor Plan", href: "/trade-fair#floor-plan", note: "Explore the halls in 3D" },
      { label: "Sponsors & Partners", href: "/sponsors-partners", note: "Packages and visibility" },
    ],
  },
  { label: "Programme", href: "/conference-programme" },
  { label: "News", href: "/news" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

/**
 * image: a photo path. Sectors without a photo yet show branded artwork
 * (gradient + icon) until you add one, e.g. image: "/images/sectors/tourism.jpg".
 */
export type Sector = { name: string; blurb: string; image?: string; icon: "leaf" | "mountain" | "sun" | "building" | "school" | "bank" | "road" };

export const SECTORS: Sector[] = [
  { name: "Agriculture", blurb: "Tea, coffee, macadamia, avocado and dairy value chains ready for processing and export.", image: IMG.tea, icon: "leaf" },
  { name: "Tourism", blurb: "Mount Kenya slopes, Meru National Park and eco-lodges for hospitality investors.", icon: "mountain" },
  { name: "Energy", blurb: "Solar, small hydro and biomass projects powering farms and towns.", icon: "sun" },
  { name: "Real Estate", blurb: "Affordable housing, commercial space and urban renewal in fast growing towns.", icon: "building" },
  { name: "Education", blurb: "Research partnerships and skills programmes anchored by MUST.", image: IMG.panel, icon: "school" },
  { name: "Finance", blurb: "SACCOs, digital finance and capital for SMEs and cooperatives.", image: IMG.opening, icon: "bank" },
  { name: "Infrastructure", blurb: "Roads, logistics hubs and industrial parks on the northern corridor.", image: IMG.tradeFair, icon: "road" },
];

export const PARTNERS = [
  { name: "KNCCI Meru Chapter", pillar: "Business", logo: "/logos/clean/kncci.png", href: "https://meruchamber.co.ke/" },
  { name: "Meru University of Science and Technology", pillar: "Research", logo: "/logos/clean/must.png", href: "https://www.must.ac.ke/" },
  { name: "County Government of Meru", pillar: "Government", logo: "/logos/clean/county-government.png", href: "https://meru.go.ke/" },
];

/** Picks a photo (or artwork icon) for a CMS sector card by matching its title. */
export function visualFor(title: string): { image?: string; icon: Sector["icon"] } {
  const t = title.toLowerCase();
  const by = (n: string) => SECTORS.find((s) => s.name === n) ?? { icon: "leaf" as const };
  if (/agri|farm|dairy|tea|coffee/.test(t)) return by("Agriculture");
  if (/energy|solar|power/.test(t)) return by("Energy");
  if (/hous|real estate|property/.test(t)) return by("Real Estate");
  if (/touris|hospitality|hotel/.test(t)) return by("Tourism");
  if (/industr|manufactur|logistic|infrastructure/.test(t)) return by("Infrastructure");
  if (/financ|bank|sacco/.test(t)) return by("Finance");
  if (/ict|digital|tech|educat|research/.test(t)) return by("Education");
  return { icon: "leaf" };
}

export type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  note: string;
  /** Optional mini-visual shown in the stats bento. */
  visual?: "partners" | "sectors" | "days" | "booths";
};

// Home page headline numbers. Edit freely; the stats section animates whatever is here.
export const STATS: Stat[] = [
  { value: 3, visual: "partners", label: "Partner institutions", note: "KNCCI Meru, MUST and the County Government" },
  { value: 7, visual: "sectors", label: "Sectors on show", note: "From agriculture to infrastructure" },
  { value: 3, visual: "days", label: "Days of connecting", note: "25 to 27 February 2027" },
  { value: 28, visual: "booths", label: "Exhibition booths", note: "Initial floor plan, more to open" },
];

export const MERU_FACTS: Stat[] = [
  { value: 7003, suffix: " km²", label: "County area", note: "On the slopes of Mount Kenya" },
  { value: 1.5, suffix: "M", label: "Residents", note: "A young, educated workforce" },
  { value: 9, label: "Sub-counties", note: "Each with its own growth story" },
  { value: 1, prefix: "#", label: "Miraa and macadamia", note: "A global leader in both" },
];
