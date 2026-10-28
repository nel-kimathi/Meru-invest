import { Building2, Landmark, Leaf, Mountain, Route, School, Sun } from "lucide-react";
import type { Sector } from "@/lib/event";
import { cn } from "@/lib/utils";

const ICONS = { leaf: Leaf, mountain: Mountain, sun: Sun, building: Building2, school: School, bank: Landmark, road: Route };
const TONES = [
  "from-brand to-brand-deep",
  "from-brand-deep to-forest-deep",
  "from-[#1f7a52] to-forest-deep",
  "from-[#1f7a52] to-forest",
];

/** Branded artwork for a sector that has no photo yet. */
export function SectorArt({ sector, index = 0, className }: { sector: Pick<Sector, "icon">; index?: number; className?: string }) {
  const Icon = ICONS[sector.icon];
  return (
    <div className={cn("grain absolute inset-0 overflow-hidden bg-gradient-to-br", TONES[index % TONES.length], className)}>
      <div className="absolute -right-[18%] -top-[10%] aspect-square w-[85%] rounded-full bg-white/[.06]" />
      <div className="absolute -bottom-[25%] -left-[20%] aspect-square w-[70%] rounded-full bg-gold/[.12]" />
      <Icon className="absolute right-[10%] top-[16%] size-[38%] max-h-56 text-white/15" strokeWidth={1} />
    </div>
  );
}
