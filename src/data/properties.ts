import type { Property } from "@/types/property";
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

export const properties: Property[] = [
  {
    id: "aurelia-bay",
    name: "Aurelia Bay Villas",
    tagline: "Glasswork architecture cradled by the Arabian Sea.",
    image: p1,
    size: "6,200 sq ft",
    sizeNumeric: 6200,
    location: "Palm Jumeirah, Dubai",
    status: "Ready to Move",
    configuration: "5 BHK Signature Villa",
    pricePerSqft: "₹ 78,000 / sq ft",
    possession: "Immediate",
    amenities: [
      "Private Beach",
      "Infinity Pool",
      "Wine Cellar",
      "Concierge 24/7",
      "Helipad Access",
      "Spa & Hammam",
      "Cinema Lounge",
      "Private Marina",
    ],
    advantages: [
      "Direct beachfront access",
      "Smart-home automation by Crestron",
      "Italian Carrara marble interiors",
    ],
    gallery: { ...sharedGallery, livingRoom: gLiving, pool: gPool },
    expertNote:
      "A waterfront masterpiece for collectors of sunsets and silence. Holds value through generations.",
  },
  {
    id: "noctis-tower",
    name: "Noctis Sky Residences",
    tagline: "A penthouse skyline reserved for the few.",
    image: p2,
    size: "4,800 sq ft",
    sizeNumeric: 4800,
    location: "BKC, Mumbai",
    status: "New Launch",
    configuration: "4 BHK Sky Penthouse",
    pricePerSqft: "₹ 1,12,000 / sq ft",
    possession: "Dec 2026",
    amenities: [
      "Sky Lounge",
      "Infinity Pool",
      "Private Elevator",
      "Concierge 24/7",
      "Cigar Room",
      "Spa & Sauna",
      "Wine Cellar",
      "EV Charging",
    ],
    advantages: [
      "Unobstructed sea & skyline views",
      "Designed by Foster + Partners",
      "Private elevator to each floor",
    ],
    gallery: { ...sharedGallery, masterBedroom: gBed, clubhouse: gClub },
    expertNote:
      "Mumbai's most architecturally significant tower. Scarcity and altitude define its premium.",
  },
  {
    id: "monterra-hills",
    name: "Monterra Hills Estate",
    tagline: "Cantilevered serenity above the valley.",
    image: p3,
    size: "8,400 sq ft",
    sizeNumeric: 8400,
    location: "Aldea de Tossal, Spain",
    status: "Under Construction",
    configuration: "6 BHK Hillside Mansion",
    pricePerSqft: "₹ 64,000 / sq ft",
    possession: "Mar 2027",
    amenities: [
      "Helipad",
      "Infinity Pool",
      "Vineyard",
      "Spa & Hammam",
      "Cinema Lounge",
      "Wine Cellar",
      "Equestrian Stable",
      "Concierge 24/7",
    ],
    advantages: [
      "Largest plot in the comparison",
      "Private vineyard and orchard",
      "Geo-thermal sustainable design",
    ],
    gallery: sharedGallery,
    expertNote:
      "An estate for legacy living. Unmatched land, but a longer horizon to possession.",
  },
  {
    id: "celesteia-shores",
    name: "Celesteia Shores",
    tagline: "Where the ocean meets the morning gold.",
    image: p4,
    size: "5,500 sq ft",
    sizeNumeric: 5500,
    location: "Maldives Atoll, Maldives",
    status: "Limited Edition",
    configuration: "4 BHK Oceanfront Villa",
    pricePerSqft: "₹ 96,000 / sq ft",
    possession: "Jun 2026",
    amenities: [
      "Private Beach",
      "Infinity Pool",
      "Yacht Berth",
      "Spa & Hammam",
      "Cinema Lounge",
      "Concierge 24/7",
      "Sunset Deck",
      "Snorkel Lagoon",
    ],
    advantages: [
      "Branded residence with hotel services",
      "Only 12 villas in the collection",
      "Includes private yacht berth",
    ],
    gallery: sharedGallery,
    expertNote:
      "Ultra-limited inventory and hospitality-grade service make this a trophy asset.",
  },
];

export const getPropertyById = (id: string): Property | undefined =>
  properties.find((p) => p.id === id);
