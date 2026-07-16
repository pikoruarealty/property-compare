import type { QuizAnswers } from "@/context/OnboardingContext";
import type { ConfigKey, Property, PropertyCategory } from "@/types/property";
import { CONFIG_KEYS } from "@/types/property";
import { propertyMatchesLocation } from "@/lib/locations";

/** Parse a price string like "12.5 Cr" → 12.5. Returns null if unparsable. */
const parsePrice = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const m = String(s).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
};

/** Parse a budget label (range or sub) like "₹ 6 – 10 Cr", "₹ 1 – 2 Cr", "₹ 21 Cr +" → [min, max]. */
export function parseBudget(label: string | undefined): [number, number] | null {
  if (!label) return null;
  const clean = label.replace(/[₹\s,]/g, "");
  if (/\+$/.test(clean)) {
    const n = parseFloat(clean.match(/[\d.]+/)?.[0] ?? "");
    return isNaN(n) ? null : [n, Infinity];
  }
  const nums = clean.match(/[\d.]+/g)?.map(parseFloat) ?? [];
  if (nums.length === 0) return null;
  if (nums.length === 1) return [nums[0], nums[0]];
  return [Math.min(...nums), Math.max(...nums)];
}

/** Config keys the user explicitly asked for. Empty array → no restriction. */
export function allowedConfigKeys(answers: QuizAnswers | null | undefined): ConfigKey[] {
  if (!answers) return [];
  const allow = new Set<ConfigKey>();
  for (const b of answers.bhk ?? []) {
    const k = b.trim() as ConfigKey;
    if ((CONFIG_KEYS as string[]).includes(k)) allow.add(k);
  }
  for (const t of answers.propertyType ?? []) {
    if (t === "Penthouse" || t === "Duplex") allow.add(t as ConfigKey);
  }
  return Array.from(allow);
}

/** Category-level filter from the property-type quiz selection. */
function categoryAllowed(p: Property, answers: QuizAnswers): boolean {
  const types = answers.propertyType ?? [];
  if (types.length === 0) return true;
  const cats = types.filter((t) => ["Apartment", "Bungalow", "Plots"].includes(t)) as PropertyCategory[];
  const wantsConfigOnly = types.some((t) => t === "Penthouse" || t === "Duplex");
  if (cats.length === 0) {
    // Only Penthouse/Duplex picked → require that config in property.
    if (!wantsConfigOnly) return true;
    return ["Penthouse", "Duplex"].some(
      (k) => types.includes(k) && Boolean(p.configurations[k as ConfigKey]),
    );
  }
  return cats.includes(p.category);
}

/** Does property satisfy quiz filters? Used to show only matching residences. */
export function matchesPreferences(
  p: Property,
  answers: QuizAnswers | null | undefined,
): boolean {
  if (!answers) return true;
  if (!propertyMatchesLocation(p, answers.state, answers.city)) return false;
  if (!categoryAllowed(p, answers)) return false;

  const wantedKeys = allowedConfigKeys(answers);
  const budget = parseBudget(answers.budgetSub || answers.budgetRange);

  // If a BHK / sub-type is requested, the property must have at least one of them.
  const candidateKeys: ConfigKey[] =
    wantedKeys.length > 0
      ? wantedKeys.filter((k) => Boolean(p.configurations[k]))
      : (CONFIG_KEYS.filter((k) => p.configurations[k]) as ConfigKey[]);

  if (wantedKeys.length > 0 && candidateKeys.length === 0) return false;

  // Budget: at least one candidate config must fall in range (unknown prices pass).
  if (budget) {
    const [lo, hi] = budget;
    const inRange = candidateKeys.some((k) => {
      const price = parsePrice(p.configurations[k]?.price);
      if (price === null) return true; // unknown → don't exclude
      return price >= lo - 0.5 && price <= hi + 0.5;
    });
    if (!inRange && candidateKeys.length > 0) return false;
  }

  return true;
}
