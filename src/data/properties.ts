import type {
  Property,
  PropertyCategory,
  PropertyConfigurations,
  ConfigDetail,
  ConfigKey,
} from "@/types/property";
import { CONFIG_KEYS } from "@/types/property";
import raw from "./_raw.json";
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import p4 from "@/assets/property-4.jpg";
import gLiving from "@/assets/gallery-living.jpg";
import gPool from "@/assets/gallery-pool.jpg";
import gClub from "@/assets/gallery-clubhouse.jpg";
import gBed from "@/assets/gallery-bedroom.jpg";
import anamikaCover from "@/assets/anamika-cover.jpg.asset.json";
import anamikaExterior from "@/assets/anamika-exterior.jpg.asset.json";
import anamikaHall from "@/assets/anamika-hall.png.asset.json";
import anamikaBedroom from "@/assets/anamika-bedroom.jpg.asset.json";
import anuritaCover from "@/assets/anurita-cover.jpg.asset.json";
import anuritaExterior from "@/assets/anurita-exterior.jpg.asset.json";
import anuritaLiving from "@/assets/anurita-living.jpg.asset.json";
import anuritaBedroom from "@/assets/anurita-bedroom.jpg.asset.json";

const sharedGallery = {
  livingRoom: gLiving,
  pool: gPool,
  clubhouse: gClub,
  masterBedroom: gBed,
};

const images = [p1, p2, p3, p4];

// Per-property image overrides (cover + gallery), keyed by slug.
const imageOverrides: Record<
  string,
  { cover?: string; gallery?: Partial<typeof sharedGallery> }
> = {
  anamika: {
    cover: anamikaCover.url,
    gallery: {
      livingRoom: anamikaHall.url,
      masterBedroom: anamikaBedroom.url,
      pool: anamikaExterior.url,
      clubhouse: anamikaCover.url,
    },
  },
  anurita: {
    cover: anuritaCover.url,
    gallery: {
      livingRoom: anuritaLiving.url,
      masterBedroom: anuritaBedroom.url,
      pool: anuritaExterior.url,
      clubhouse: anuritaCover.url,
    },
  },
};


interface RawRow {
  name: string;
  type: string;
  developer: string;
  status: string;
  location: string;
  configs: Record<string, ConfigDetail | null>;
  plotSuper: string | null;
  plotCarpet: string | null;
  possession: string;
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const amenitiesFor = (type: PropertyCategory): string[] => {
  if (type === "Plots")
    return [
      "Gated Community",
      "Landscaped Avenues",
      "24/7 Security",
      "Underground Utilities",
      "Clubhouse Access",
      "Jogging Track",
    ];
  if (type === "Bungalow")
    return [
      "Private Garden",
      "Plunge Pool",
      "Home Automation",
      "Driver & Staff Quarters",
      "Private Elevator",
      "24/7 Concierge",
      "EV Charging",
      "Landscaped Forecourt",
    ];
  return [
    "Infinity Pool",
    "Sky Lounge",
    "Spa & Wellness",
    "Concierge 24/7",
    "Banquet Hall",
    "Cinema Lounge",
    "Fitness Studio",
    "EV Charging",
  ];
};

const advantagesFor = (r: RawRow): string[] => {
  const a: string[] = [];
  a.push(`${r.location} — premium West Ahmedabad address`);
  if (r.type === "Apartment") a.push("Curated luxury apartment living");
  if (r.type === "Bungalow") a.push("Standalone bungalow with private grounds");
  if (r.type === "Plots") a.push("Build-to-suit plotted development");
  if (/Pre-Launch/i.test(r.status)) a.push("Early-bird pricing window open");
  if (/Ready/i.test(r.status)) a.push("Move-in ready, zero wait");
  if (/Near Possession/i.test(r.status)) a.push("Handover within months");
  return a;
};

const expertNoteFor = (r: RawRow): string =>
  `${r.name} by ${r.developer || "a reputed developer"} on ${r.location} offers ${r.type.toLowerCase()} living in a tightly held micro-market — a considered pick for discerning buyers in Ahmedabad's luxury corridor.`;

const taglineFor = (r: RawRow): string => {
  if (r.type === "Plots") return `Plotted enclave at ${r.location}.`;
  if (r.type === "Bungalow") return `Private bungalow address in ${r.location}.`;
  return `Luxury residences on ${r.location}.`;
};

const summariseConfiguration = (cfgs: PropertyConfigurations, type: PropertyCategory): string => {
  if (type === "Plots") return "Residential Plot";
  const bhk: string[] = [];
  const extras: string[] = [];
  for (const k of CONFIG_KEYS) {
    if (!cfgs[k]) continue;
    if (k === "Penthouse" || k === "Duplex") extras.push(k);
    else bhk.push(k.replace(" BHK", ""));
  }
  const bhkStr = bhk.length ? `${bhk.join(", ")} BHK` : "";
  const tail = extras.length ? ` · ${extras.join(" · ")}` : "";
  const prefix = type === "Bungalow" ? "Bungalow · " : "";
  const out = `${prefix}${bhkStr}${tail}`.trim();
  return out || type;
};

const parseNumeric = (s: string | null | undefined): number => {
  if (!s) return 0;
  const m = String(s).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
};

const aggregateArea = (cfgs: PropertyConfigurations, field: "area" | "carpet"): string => {
  const vals = CONFIG_KEYS.map((k) => cfgs[k]?.[field]).filter((v): v is string => !!v);
  if (vals.length === 0) return "-";
  const nums = vals.flatMap((v) => v.split(/[-–]/).map((x) => parseFloat(x.replace(/[^\d.]/g, ""))))
    .filter((n) => !isNaN(n) && n > 0);
  if (nums.length === 0) return vals[0];
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  const fmt = (n: number) => n.toLocaleString("en-IN");
  return lo === hi ? `${fmt(lo)} sq ft` : `${fmt(lo)} – ${fmt(hi)} sq ft`;
};

const buildPriceSummary = (cfgs: PropertyConfigurations): string => {
  const prices = CONFIG_KEYS.map((k) => cfgs[k]?.price).filter((v): v is string => !!v);
  if (prices.length === 0) return "Price on Request";
  return `${prices[0]} Cr onwards`;
};

const rawRows = raw as RawRow[];

export const properties: Property[] = rawRows.map((r, i) => {
  const cfgs: PropertyConfigurations = {};
  for (const k of CONFIG_KEYS) {
    const c = r.configs[k];
    if (c) cfgs[k as ConfigKey] = c;
  }
  const category = (r.type as PropertyCategory) || "Apartment";
  const isPlot = category === "Plots" || category === "Bungalow";

  const superBuiltUpArea = isPlot
    ? r.plotSuper
      ? `${r.plotSuper} Plot`
      : "-"
    : aggregateArea(cfgs, "area");
  const carpetArea = isPlot
    ? r.plotCarpet
      ? `${r.plotCarpet} Built-up`
      : "-"
    : aggregateArea(cfgs, "carpet");

  const sizeDisplay =
    superBuiltUpArea !== "-" && carpetArea !== "-"
      ? superBuiltUpArea
      : superBuiltUpArea !== "-"
        ? superBuiltUpArea
        : carpetArea;

  const id = slug(r.name);
  const ov = imageOverrides[id];

  return {
    id,
    name: r.name,
    developer: r.developer || "-",
    category,
    tagline: taglineFor(r),
    image: ov?.cover ?? images[i % images.length],
    size: sizeDisplay,
    sizeNumeric: parseNumeric(superBuiltUpArea),
    superBuiltUpArea,
    carpetArea,
    location: r.location || "-",
    status: r.status || "-",
    configuration: summariseConfiguration(cfgs, category),
    configurations: cfgs,
    pricePerSqft: buildPriceSummary(cfgs),
    possession: r.possession || "-",
    amenities: amenitiesFor(category),
    advantages: advantagesFor(r),
    gallery: { ...sharedGallery, ...(ov?.gallery ?? {}) },
    expertNote: expertNoteFor(r),
  };

});

export const getPropertyById = (id: string): Property | undefined =>
  properties.find((p) => p.id === id);
