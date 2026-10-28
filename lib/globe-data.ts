export const MERU_LL = { lat: 0.05, lon: 37.65 };

/** Sample investor origins shown on the home page globe. */
export const ORIGINS = [
  { city: "London", lat: 51.5, lon: -0.1 },
  { city: "Dubai", lat: 25.2, lon: 55.3 },
  { city: "Mumbai", lat: 19.1, lon: 72.9 },
  { city: "Shanghai", lat: 31.2, lon: 121.5 },
  { city: "New York", lat: 40.7, lon: -74 },
  { city: "Lagos", lat: 6.5, lon: 3.4 },
  { city: "Johannesburg", lat: -26.2, lon: 28 },
  { city: "Toronto", lat: 43.7, lon: -79.4 },
  { city: "Singapore", lat: 1.35, lon: 103.8 },
  { city: "Sydney", lat: -33.9, lon: 151.2 },
] as const;

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = Math.PI / 180;
  const dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)));
}
