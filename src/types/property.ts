export type PropertyStatus = string;

export interface PropertyGallery {
  livingRoom: string;
  pool: string;
  clubhouse: string;
  masterBedroom: string;
}

export interface Property {
  id: string;
  name: string;
  developer: string;
  tagline: string;
  image: string;
  size: string;
  sizeNumeric: number; // sq ft for sort/diff calcs
  location: string;
  status: PropertyStatus;
  configuration: string;
  pricePerSqft: string;
  possession: string;
  amenities: string[];
  advantages: string[];
  gallery: PropertyGallery;
  expertNote: string;
}

export interface ComparisonRow {
  label: string;
  values: string[];
  highlightIndex?: number; // index of the "winning" property
}
