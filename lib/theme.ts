
export const BRAND = {
  green: "#196c44",
  greenDeep: "#0f4a2e",
  forest: "#0b3a25",
  forestDeep: "#072818",
  ink: "#0a2619",
  mint: "#edf5ef",
  leaf: "#2f9a63",
  gold: "#dba600",
  sand: "#f8f4ea",
  navy: "#1d426e",
} as const;

/** Same colours as numbers, for THREE.Color / material constructors. */
export const hex = (c: string) => parseInt(c.slice(1), 16);
