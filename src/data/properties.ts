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
import atmanExterior from "@/assets/atman-exterior.jpg.asset.json";
import atmanLobby from "@/assets/atman-lobby.jpg.asset.json";
import avantExterior from "@/assets/avant-exterior.png.asset.json";
import avantHall from "@/assets/avant-hall.jpg.asset.json";
import avantPark from "@/assets/avant-park.avif.asset.json";
import belagioExterior from "@/assets/belagio-exterior.jpg.asset.json";
import belagioTower from "@/assets/belagio-tower.jpg.asset.json";
import belagioLibrary from "@/assets/belagio-library.jpg.asset.json";
import belagioPool from "@/assets/belagio-pool.jpg.asset.json";
import belrosaExterior from "@/assets/belrosa-exterior.jpg.asset.json";
import belrosaHall from "@/assets/belrosa-hall.jpg.asset.json";
import belrosaView from "@/assets/belrosa-view.jpg.asset.json";
import belrosaDining from "@/assets/belrosa-dining.jpg.asset.json";
import capstoneCourtyard from "@/assets/capstone-courtyard.jpg.asset.json";
import capstoneLiving from "@/assets/capstone-living.jpg.asset.json";
import capstoneAerial from "@/assets/capstone-aerial.jpg.asset.json";
import capstoneGameRoom from "@/assets/capstone-gameroom.jpg.asset.json";
import capstoneHomeTheater from "@/assets/capstone-hometheater.jpg.asset.json";
import capstoneKidsPlay from "@/assets/capstone-kidsplay.jpg.asset.json";
import eminence96Exterior from "@/assets/eminence-96-exterior.png.asset.json";
import eminence96Gym from "@/assets/eminence-96-gym.webp.asset.json";
import eminence96Pool from "@/assets/eminence-96-pool.webp.asset.json";
import eminence96Lounge from "@/assets/eminence-96-lounge.webp.asset.json";
import ikebanaExterior from "@/assets/ikebana-exterior.png.asset.json";
import ikebanaWardrobe from "@/assets/ikebana-wardrobe.png.asset.json";
import ikebanaBedroom from "@/assets/ikebana-bedroom.png.asset.json";
import ikebanaLiving from "@/assets/ikebana-living.png.asset.json";
import kalravAlpinesExterior from "@/assets/kalrav-alpines-exterior.jpg.asset.json";
import kimanaTowers from "@/assets/kimana-towers.jpg.asset.json";
import kimanaLobby from "@/assets/kimana-lobby.jpg.asset.json";
import kimanaDusk from "@/assets/kimana-tower-dusk.jpg.asset.json";
import maruti360Exterior from "@/assets/maruti-360-exterior.jpeg.asset.json";
import maruti360Bedroom from "@/assets/maruti-360-bedroom.png.asset.json";
import maruti360PlayArea from "@/assets/maruti-360-play-area.png.asset.json";
import maruti360Pool from "@/assets/maruti-360-pool.png.asset.json";
import maruti360View from "@/assets/maruti-360-view.jpg.asset.json";
import venusUniverse1 from "@/assets/venus-universe-1.jpeg.asset.json";
import venusUniverse2 from "@/assets/venus-universe-2.jpeg.asset.json";
import venusUniverse3 from "@/assets/venus-universe-3.jpeg.asset.json";
import venusUniverse4 from "@/assets/venus-universe-4.jpeg.asset.json";
import northparkExterior from "@/assets/northpark-exterior.jpg.asset.json";
import northparkBungalow from "@/assets/northpark-bungalow.jpg.asset.json";
import northparkHall from "@/assets/northpark-hall.jpg.asset.json";
import northparkDining from "@/assets/northpark-dining.jpg.asset.json";
import northparkBedroom from "@/assets/northpark-bedroom.jpg.asset.json";
import pashminaCover from "@/assets/pashmina-cover.jpg.asset.json";
import pashminaBedroom from "@/assets/pashmina-bedroom.jpeg.asset.json";
import pashminaDining from "@/assets/pashmina-dining.jpg.asset.json";
import pashminaLiving from "@/assets/pashmina-living.png.asset.json";
import shaligramExterior from "@/assets/shaligram-luxuria-1.jpg.asset.json";
import shaligramGym from "@/assets/shaligram-luxuria-2-gym.jpg.asset.json";
import shaligramAerial from "@/assets/shaligram-luxuria-3.jpg.asset.json";
import swatiHall from "@/assets/swati-senor-hall.jpg.asset.json";
import swatiDining from "@/assets/swati-senor-dining.jpg.asset.json";
import swatiGallery from "@/assets/swati-senor-gallery.jpg.asset.json";
import swatiBedroom from "@/assets/swati-senor-bedroom.jpg.asset.json";
import swatiPool from "@/assets/swati-senor-pool.jpg.asset.json";
import triveniExterior from "@/assets/triveni-84-exterior.jpg.asset.json";
import triveniKids from "@/assets/triveni-84-kids.jpeg.asset.json";
import triveniYoga from "@/assets/triveni-84-yoga.jpeg.asset.json";
import triveniGym from "@/assets/triveni-84-gym.jpeg.asset.json";
import triveniBanquet from "@/assets/triveni-84-banquet.jpeg.asset.json";
import vaikunthExterior from "@/assets/vaikunth-exterior.png.asset.json";
import vaikunthPool from "@/assets/vaikunth-pool.png.asset.json";
import vaikunthBungalow from "@/assets/vaikunth-bungalow.png.asset.json";
import godrejAltusBalcony from "@/assets/godrej-altus-balcony.jpg.asset.json";
import godrejAltusPool from "@/assets/godrej-altus-pool.jpg.asset.json";
import godrejAltusFacade from "@/assets/godrej-altus-facade.jpg.asset.json";

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
  atman: {
    cover: atmanExterior.url,
    gallery: {
      livingRoom: atmanLobby.url,
      masterBedroom: atmanLobby.url,
      pool: atmanExterior.url,
      clubhouse: atmanLobby.url,
    },
  },
  avant: {
    cover: avantExterior.url,
    gallery: {
      livingRoom: avantHall.url,
      masterBedroom: avantHall.url,
      pool: avantPark.url,
      clubhouse: avantPark.url,
    },
  },
  belagio: {
    cover: belagioExterior.url,
    gallery: {
      livingRoom: belagioLibrary.url,
      masterBedroom: belagioTower.url,
      pool: belagioPool.url,
      clubhouse: belagioLibrary.url,
    },
  },
  belrosa: {
    cover: belrosaExterior.url,
    gallery: {
      livingRoom: belrosaHall.url,
      masterBedroom: belrosaDining.url,
      pool: belrosaView.url,
      clubhouse: belrosaView.url,
    },
  },
  capstone: {
    cover: capstoneAerial.url,
    gallery: {
      livingRoom: capstoneLiving.url,
      masterBedroom: capstoneCourtyard.url,
      pool: capstoneCourtyard.url,
      clubhouse: capstoneGameRoom.url,
    },
  },
  "eminence-96": {
    cover: eminence96Exterior.url,
    gallery: {
      livingRoom: eminence96Lounge.url,
      masterBedroom: eminence96Lounge.url,
      pool: eminence96Pool.url,
      clubhouse: eminence96Gym.url,
    },
  },
  ikebana: {
    cover: ikebanaExterior.url,
    gallery: {
      livingRoom: ikebanaLiving.url,
      masterBedroom: ikebanaBedroom.url,
      pool: ikebanaExterior.url,
      clubhouse: ikebanaWardrobe.url,
    },
  },
  "kalrav-alpines": {
    cover: kalravAlpinesExterior.url,
    gallery: {
      pool: kalravAlpinesExterior.url,
      clubhouse: kalravAlpinesExterior.url,
    },
  },
  kimana: {
    cover: kimanaTowers.url,
    gallery: {
      livingRoom: kimanaLobby.url,
      masterBedroom: kimanaDusk.url,
      pool: kimanaTowers.url,
      clubhouse: kimanaLobby.url,
    },
  },
  "maruti-360": {
    cover: maruti360Exterior.url,
    gallery: {
      livingRoom: maruti360View.url,
      masterBedroom: maruti360Bedroom.url,
      pool: maruti360Pool.url,
      clubhouse: maruti360PlayArea.url,
    },
  },
  "venus-universe": {
    cover: venusUniverse1.url,
    gallery: {
      livingRoom: venusUniverse3.url,
      masterBedroom: venusUniverse3.url,
      pool: venusUniverse2.url,
      clubhouse: venusUniverse4.url,
    },
  },
  northpark: {
    cover: northparkExterior.url,
    gallery: {
      livingRoom: northparkHall.url,
      masterBedroom: northparkBedroom.url,
      pool: northparkBungalow.url,
      clubhouse: northparkDining.url,
    },
  },
  pashmina: {
    cover: pashminaCover.url,
    gallery: {
      livingRoom: pashminaLiving.url,
      masterBedroom: pashminaBedroom.url,
      pool: pashminaDining.url,
      clubhouse: pashminaDining.url,
    },
  },
  "shaligram-luxuria": {
    cover: shaligramExterior.url,
    gallery: {
      livingRoom: shaligramExterior.url,
      masterBedroom: shaligramGym.url,
      pool: shaligramAerial.url,
      clubhouse: shaligramGym.url,
    },
  },
  "swati-senor": {
    cover: swatiGallery.url,
    gallery: {
      livingRoom: swatiHall.url,
      masterBedroom: swatiBedroom.url,
      pool: swatiPool.url,
      clubhouse: swatiDining.url,
    },
  },
  "triveni-84": {
    cover: triveniExterior.url,
    gallery: {
      livingRoom: triveniBanquet.url,
      masterBedroom: triveniYoga.url,
      pool: triveniGym.url,
      clubhouse: triveniKids.url,
    },
  },
  vaikunth: {
    cover: vaikunthExterior.url,
    gallery: {
      livingRoom: vaikunthBungalow.url,
      masterBedroom: vaikunthBungalow.url,
      pool: vaikunthPool.url,
      clubhouse: vaikunthPool.url,
    },
  },
  "godrej-altus": {
    cover: godrejAltusFacade.url,
    gallery: {
      livingRoom: godrejAltusBalcony.url,
      masterBedroom: godrejAltusBalcony.url,
      pool: godrejAltusPool.url,
      clubhouse: godrejAltusFacade.url,
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
