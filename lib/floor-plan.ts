import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { TAGS } from "@/lib/cache-tags";

export type BoothStatus = "AVAILABLE" | "RESERVED" | "ALLOCATED" | "OCCUPIED";
export type FloorBooth = { number: string; size?: string | null; category?: string | null; status: BoothStatus; price?: string | null };
export type FloorHall = { name: string; booths: FloorBooth[] };

/** Sample halls shown until booths are created in Admin > Booth Management. */
export function demoHalls(): FloorHall[] {
  const pattern: BoothStatus[] = ["AVAILABLE", "AVAILABLE", "RESERVED", "ALLOCATED", "AVAILABLE", "OCCUPIED", "AVAILABLE"];
  const mk = (prefix: string, n: number, cat: string): FloorBooth[] =>
    Array.from({ length: n }, (_, i) => ({
      number: `${prefix}${String(i + 1).padStart(2, "0")}`,
      size: i % 7 === 3 ? "6x3 m" : "3x3 m",
      category: i % 7 === 3 ? "Premium" : cat,
      status: pattern[(i * 3 + prefix.charCodeAt(0)) % pattern.length],
    }));
  return [
    { name: "Hall A  Agribusiness", booths: mk("A", 14, "Standard") },
    { name: "Hall B  Innovation and Trade", booths: mk("B", 14, "Standard") },
  ];
}

const loadHalls = unstable_cache(
  async (): Promise<FloorHall[]> => {
    const halls = await prisma.exhibitionHall.findMany({
      orderBy: { order: "asc" },
      include: { booths: { orderBy: { number: "asc" }, select: { number: true, size: true, category: true, status: true, price: true } } },
    });
    return halls
      .filter((h) => h.booths.length)
      .map((h) => ({
        name: h.name,
        booths: h.booths.map((b) => ({
          number: b.number,
          size: b.size,
          category: b.category,
          status: b.status as BoothStatus,
          price: b.price ? Number(b.price).toLocaleString("en-KE") : null,
        })),
      }));
  },
  ["public-floor-plan"],
  { revalidate: 60, tags: [TAGS.booths] },
);

/** Real halls and booths (public-safe fields only); a sample layout until booths exist. */
export async function getFloorPlan(): Promise<{ halls: FloorHall[]; live: boolean }> {
  try {
    const halls = await loadHalls();
    return halls.length ? { halls, live: true } : { halls: demoHalls(), live: false };
  } catch {
    return { halls: demoHalls(), live: false };
  }
}
