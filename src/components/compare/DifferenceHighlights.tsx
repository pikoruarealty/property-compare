import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { Property } from "@/types/property";
import { Section } from "./Section";

interface DifferenceHighlightsProps {
  properties: Property[];
}

interface Highlight {
  label: string;
  winnerIndex: number;
  winnerValue: string;
  detail: string;
}

export function DifferenceHighlights({ properties }: DifferenceHighlightsProps) {
  const largest = properties.reduce(
    (best, p, i) => (p.sizeNumeric > properties[best].sizeNumeric ? i : best),
    0,
  );

  const amenityCounts = properties.map((p) => p.amenities.length);
  const mostAmenitiesIdx = amenityCounts.indexOf(Math.max(...amenityCounts));

  const earliestPossessionIdx = properties.reduce((best, p, i) => {
    const order = ["Immediate", "Jun 2026", "Dec 2026", "Mar 2027"];
    return order.indexOf(p.possession) < order.indexOf(properties[best].possession) ? i : best;
  }, 0);

  const exclusiveAmenities = properties.map((p, i) => {
    const others = properties.filter((_, j) => j !== i).flatMap((o) => o.amenities);
    return p.amenities.filter((a) => !others.includes(a));
  });
  const uniquenessIdx = exclusiveAmenities
    .map((arr) => arr.length)
    .indexOf(Math.max(...exclusiveAmenities.map((a) => a.length)));

  const highlights: Highlight[] = [
    {
      label: "Largest footprint",
      winnerIndex: largest,
      winnerValue: properties[largest].size,
      detail: `${properties[largest].name} offers the most expansive living canvas in this comparison.`,
    },
    {
      label: "Richest amenity set",
      winnerIndex: mostAmenitiesIdx,
      winnerValue: `${amenityCounts[mostAmenitiesIdx]} amenities`,
      detail: `${properties[mostAmenitiesIdx].name} leads on curated experiences within the residence.`,
    },
    {
      label: "Earliest possession",
      winnerIndex: earliestPossessionIdx,
      winnerValue: properties[earliestPossessionIdx].possession,
      detail: `${properties[earliestPossessionIdx].name} is the fastest route to keys-in-hand.`,
    },
    {
      label: "Most unique amenities",
      winnerIndex: uniquenessIdx,
      winnerValue: exclusiveAmenities[uniquenessIdx].slice(0, 2).join(", ") || "—",
      detail: `${properties[uniquenessIdx].name} holds the most one-of-one features.`,
    },
  ];

  return (
    <Section
      id="differences"
      eyebrow="04 · Difference Highlights"
      title="Where each residence quietly wins"
      description="Automatic analysis of the most material gaps between your selection."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {highlights.map((h, i) => (
          <motion.div
            key={h.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: i * 0.06 }}
            className="glass rounded-[32px] p-7"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-luxury text-champagne">{h.label}</p>
              <TrendingUp className="h-4 w-4 text-champagne" />
            </div>
            <p className="mt-4 font-display text-2xl text-ivory">
              {properties[h.winnerIndex].name}
            </p>
            <p className="mt-1 gold-text font-display text-lg">{h.winnerValue}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{h.detail}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
