import { properties } from "@/data/properties";
import type { Property } from "@/types/property";

/**
 * Derive available State → City options from the property catalog.
 * Today every property is in Gujarat / Ahmedabad, so we default to that
 * when a property has no explicit city/state metadata. When new properties
 * from other states or cities are added to `src/data/properties.ts` (either
 * via explicit `city`/`state` fields or by mentioning them in `location`),
 * the pickers below grow automatically — no quiz code changes required.
 */

const DEFAULT_STATE = "Gujarat";
const DEFAULT_CITY = "Ahmedabad";

// Add more entries as the catalog expands to new cities.
const CITY_TO_STATE: Record<string, string> = {
  Ahmedabad: "Gujarat",
  Surat: "Gujarat",
  Vadodara: "Gujarat",
  Rajkot: "Gujarat",
  Gandhinagar: "Gujarat",
  Mumbai: "Maharashtra",
  Pune: "Maharashtra",
  Bengaluru: "Karnataka",
  Bangalore: "Karnataka",
  Hyderabad: "Telangana",
  Delhi: "Delhi",
  Gurgaon: "Haryana",
  Gurugram: "Haryana",
  Noida: "Uttar Pradesh",
  Chennai: "Tamil Nadu",
  Kolkata: "West Bengal",
  Jaipur: "Rajasthan",
  Goa: "Goa",
};

type WithLocMeta = Property & { city?: string; state?: string };

function cityFor(p: WithLocMeta): string {
  if (p.city) return p.city;
  // Fallback: scan the free-text `location` for a known city name.
  const loc = p.location ?? "";
  for (const city of Object.keys(CITY_TO_STATE)) {
    const re = new RegExp(`\\b${city}\\b`, "i");
    if (re.test(loc)) return city;
  }
  return DEFAULT_CITY;
}

function stateFor(p: WithLocMeta): string {
  if (p.state) return p.state;
  const c = cityFor(p);
  return CITY_TO_STATE[c] ?? DEFAULT_STATE;
}

export interface LocationGroup {
  state: string;
  cities: string[];
}

/** Grouped list of every state present in the catalog with its cities. */
export function getAvailableLocations(): LocationGroup[] {
  const map = new Map<string, Set<string>>();
  for (const p of properties as WithLocMeta[]) {
    const s = stateFor(p);
    const c = cityFor(p);
    if (!map.has(s)) map.set(s, new Set());
    map.get(s)!.add(c);
  }
  return Array.from(map.entries())
    .map(([state, cities]) => ({
      state,
      cities: Array.from(cities).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.state.localeCompare(b.state));
}

export function getStates(): string[] {
  return getAvailableLocations().map((g) => g.state);
}

export function getCitiesForState(state: string): string[] {
  return getAvailableLocations().find((g) => g.state === state)?.cities ?? [];
}

/** True if the property matches the chosen state/city (loose match). */
export function propertyMatchesLocation(
  p: Property,
  state: string | undefined,
  city: string | undefined,
): boolean {
  const wp = p as WithLocMeta;
  if (state && stateFor(wp) !== state) return false;
  if (city && cityFor(wp) !== city) return false;
  return true;
}
