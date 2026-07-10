import { motion } from "framer-motion";
import type { Property, ComparisonRow } from "@/types/property";
import { Section } from "./Section";

interface OverviewSectionProps {
  properties: Property[];
}

export function OverviewSection({ properties }: OverviewSectionProps) {
  const rows: ComparisonRow[] = [
    { label: "Configuration", values: properties.map((p) => p.configuration) },
    {
      label: "Size",
      values: properties.map((p) => p.size),
      highlightIndex: properties.reduce(
        (best, p, i) => (p.sizeNumeric > properties[best].sizeNumeric ? i : best),
        0,
      ),
    },
    { label: "Location", values: properties.map((p) => p.location) },
    { label: "Status", values: properties.map((p) => p.status) },
    { label: "Possession", values: properties.map((p) => p.possession) },
  ];

  return (
    <Section
      id="overview"
      eyebrow="Overview"
      title="The essentials, side by side"
      description="A quiet read of what defines each residence."
    >
      <div className="space-y-2 sm:space-y-3">
        {rows.map((row, rowIdx) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: rowIdx * 0.05 }}
            className="grid items-center gap-2 rounded-2xl bg-card/60 p-3 sm:gap-3 sm:rounded-3xl sm:p-6"
            style={{
              gridTemplateColumns: `minmax(64px, 90px) repeat(${properties.length}, minmax(0, 1fr))`,
              border: "1px solid var(--glass-border)",
            }}
          >
            <p className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground sm:text-[11px] sm:tracking-luxury">
              {row.label}
            </p>
            {row.values.map((val, i) => (
              <div
                key={i}
                className={`rounded-lg px-2 py-2 text-[11px] leading-snug transition-colors sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base ${
                  row.highlightIndex === i
                    ? "bg-gradient-to-br from-champagne/20 to-transparent text-ivory ring-1 ring-champagne/40"
                    : "text-ivory/85"
                }`}
              >
                {val}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
