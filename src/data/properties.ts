import type { Property, PropertyStatus } from "@/types/property";
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import p4 from "@/assets/property-4.jpg";
import gLiving from "@/assets/gallery-living.jpg";
import gPool from "@/assets/gallery-pool.jpg";
import gClub from "@/assets/gallery-clubhouse.jpg";
import gBed from "@/assets/gallery-bedroom.jpg";

const sharedGallery = {
  livingRoom: gLiving,
  pool: gPool,
  clubhouse: gClub,
  masterBedroom: gBed,
};

const images = [p1, p2, p3, p4];

type UnitToken = string | number;

interface Raw {
  name: string;
  type: "Apartment" | "Bungalow" | "Plots";
  units: UnitToken[] | null;
  size: string;
  location: string;
  status: PropertyStatus;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const formatConfiguration = (type: Raw["type"], units: UnitToken[] | null): string => {
  if (type === "Plots") return "Residential Plot";
  if (!units || units.length === 0) return type;
  const bhk: string[] = [];
  const extras: string[] = [];
  for (const u of units) {
    const s = String(u).trim();
    if (s.toUpperCase() === "P") extras.push("Penthouse");
    else if (s.toUpperCase() === "D") extras.push("Duplex");
    else bhk.push(s);
  }
  const bhkStr = bhk.length ? `${bhk.join(", ")} BHK` : "";
  const tail = extras.length ? ` · ${extras.join(" · ")}` : "";
  const prefix = type === "Bungalow" ? "Bungalow · " : "";
  return `${prefix}${bhkStr}${tail}`.trim();
};

const parseSizeNumeric = (size: string): number => {
  const m = size.match(/[\d,]+/g);
  if (!m) return 0;
  return parseInt(m[0].replace(/,/g, ""), 10) || 0;
};

const possessionFromStatus = (s: PropertyStatus): string => {
  switch (s) {
    case "Ready to Move in":
      return "Immediate";
    case "Near Possession":
      return "Within 6 months";
    case "Under Construction":
      return "On Schedule";
    case "Pre-Launch":
      return "Announcing Soon";
    default:
      return "On Request";
  }
};

const amenitiesFor = (type: Raw["type"]): string[] => {
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

const advantagesFor = (r: Raw): string[] => {
  const a: string[] = [];
  a.push(`${r.location} — premium West Ahmedabad address`);
  if (r.type === "Apartment") a.push("Curated luxury apartment living");
  if (r.type === "Bungalow") a.push("Standalone bungalow with private grounds");
  if (r.type === "Plots") a.push("Build-to-suit plotted development");
  if (r.status === "Pre-Launch") a.push("Early-bird pricing window open");
  if (r.status === "Ready to Move in") a.push("Move-in ready, zero wait");
  if (r.status === "Near Possession") a.push("Handover within months");
  return a;
};

const expertNoteFor = (r: Raw): string =>
  `${r.name} on ${r.location} offers ${r.type.toLowerCase()} living in a tightly held micro-market — a considered pick for discerning buyers in Ahmedabad's luxury corridor.`;

const raw: Raw[] = [
  { name: "Ikebana", type: "Apartment", units: ["4", "5", "P", "D"], size: "7,300 - 15,500 sq ft", location: "Sindhu Bhavan Road", status: "Near Possession" },
  { name: "Maruti 360", type: "Apartment", units: ["4", "5", "D"], size: "5,700 - 7,500 sq ft", location: "Iskon Ambli Road", status: "Under Construction" },
  { name: "Pashmina", type: "Apartment", units: ["4", "5", "P"], size: "5,200 - 7,500 sq ft", location: "Sindhu Bhavan Road", status: "Ready to Move in" },
  { name: "Triveni 84", type: "Apartment", units: ["4", "P", "D"], size: "3,700 - 6,500 sq ft", location: "Iskon Ambli Road", status: "Under Construction" },
  { name: "Anamika", type: "Apartment", units: ["4", "5", "D"], size: "3,200 - 10,000 sq ft", location: "Sindhu Bhavan Road", status: "Under Construction" },
  { name: "Swati Senor", type: "Apartment", units: ["5"], size: "8,000 - 10,000 sq ft", location: "Iskon Ambli Road", status: "Ready to Move in" },
  { name: "Rashmi", type: "Apartment", units: ["4", "P", "D"], size: "3,200 - 6,500 sq ft", location: "Thaltej", status: "Pre-Launch" },
  { name: "Avant", type: "Apartment", units: ["4", "D"], size: "4,500 - 8,000 sq ft", location: "Sindhu Bhavan Road", status: "Ready to Move in" },
  { name: "Capstone", type: "Apartment", units: ["4", "P", "D"], size: "5,200 - 9,000 sq ft", location: "Thaltej", status: "Under Construction" },
  { name: "Eminence 96", type: "Apartment", units: ["4", "D"], size: "3,800 - 7,000 sq ft", location: "Thaltej", status: "Ready to Move in" },
  { name: "Belrosa", type: "Apartment", units: ["4", "5", "D", "P"], size: "5,500 - 11,000 sq ft", location: "Vaishnodevi", status: "Pre-Launch" },
  { name: "Anurita", type: "Bungalow", units: ["4"], size: "950 sqy Plot / 700 sqy Built-up", location: "Sindhu Bhavan Road", status: "Ready to Move in" },
  { name: "Vaikunth", type: "Bungalow", units: ["4"], size: "390 sqy Plot / 440 sqy Built-up", location: "Shilaj", status: "Near Possession" },
  { name: "Kalrav Alpines", type: "Plots", units: null, size: "1,100 - 2,000 sqy Plot", location: "Shilaj", status: "Under Construction" },
  { name: "Northpark", type: "Bungalow", units: ["4"], size: "500 sqy Plot / 550 sqy Built-up", location: "Vaishnodevi", status: "Under Construction" },
  { name: "Westpark", type: "Plots", units: null, size: "700 - 2,500 sqy Plot", location: "Vaishnodevi", status: "Under Construction" },
  { name: "Atman", type: "Apartment", units: ["4"], size: "5,000 sq ft", location: "Iskon Ambli Road", status: "Ready to Move in" },
  { name: "Shaligram Luxuria", type: "Apartment", units: ["4", "P"], size: "3,800 - 7,500 sq ft", location: "Iskon Ambli Road", status: "Near Possession" },
  { name: "Kimana", type: "Apartment", units: ["4.5"], size: "6,000 - 8,000 sq ft", location: "Iskon Ambli Road", status: "Near Possession" },
  { name: "Belagio", type: "Apartment", units: ["4.5"], size: "6,100 - 8,500 sq ft", location: "Iskon Ambli Road", status: "Under Construction" },
  { name: "HN 8800", type: "Apartment", units: ["4.5"], size: "8,800 - 17,000 sq ft", location: "Iskon Ambli Road", status: "Under Construction" },
  { name: "Satyamev 4200", type: "Apartment", units: ["4.5"], size: "4,200 - 8,000 sq ft", location: "Iskon Ambli Road", status: "Under Construction" },
  { name: "Goyal", type: "Apartment", units: ["4.5"], size: "6,900 - 9,600 sq ft", location: "Iskon Ambli Road", status: "Under Construction" },
];

const taglineFor = (r: Raw): string => {
  if (r.type === "Plots") return `Plotted enclave at ${r.location}.`;
  if (r.type === "Bungalow") return `Private bungalow address in ${r.location}.`;
  return `Luxury residences on ${r.location}.`;
};

export const properties: Property[] = raw.map((r, i) => ({
  id: slug(r.name),
  name: r.name,
  tagline: taglineFor(r),
  image: images[i % images.length],
  size: r.size,
  sizeNumeric: parseSizeNumeric(r.size),
  location: r.location,
  status: r.status,
  configuration: formatConfiguration(r.type, r.units),
  pricePerSqft: "Price on Request",
  possession: possessionFromStatus(r.status),
  amenities: amenitiesFor(r.type),
  advantages: advantagesFor(r),
  gallery: sharedGallery,
  expertNote: expertNoteFor(r),
}));

export const getPropertyById = (id: string): Property | undefined =>
  properties.find((p) => p.id === id);
