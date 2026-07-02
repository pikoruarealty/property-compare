import { motion } from "framer-motion";
import type { Property } from "@/types/property";
import { Section } from "./Section";

const CATEGORIES = [
  { key: "livingRoom", label: "Living Room" },
  { key: "pool", label: "Pool" },
  { key: "clubhouse", label: "Clubhouse" },
  { key: "masterBedroom", label: "Master Bedroom" },
] as const;

export function GalleryComparison({ properties }: { properties: Property[] }) {
  return (
    <Section
      id="gallery"
      eyebrow="05 · Gallery Comparison"
      title="A walk through each residence"
      description="Identical vantage points, distinctly different worlds."
    >
      <div className="space-y-12">
        {CATEGORIES.map((cat, cIdx) => (
          <div key={cat.key}>
            <div className="mb-5 flex items-center gap-4">
              <p className="font-display text-xl font-bold tracking-[-0.015em] text-ivory sm:text-2xl">{cat.label}</p>
              <div className="h-px flex-1 bg-gradient-to-r from-champagne/40 to-transparent" />
            </div>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(0, 1fr))` }}
            >
              {properties.map((p, i) => (
                <motion.figure
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: cIdx * 0.05 + i * 0.08 }}
                  className="group overflow-hidden rounded-[32px]"
                  style={{ border: "1px solid var(--glass-border)" }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={p.gallery[cat.key]}
                      alt={`${p.name} — ${cat.label}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-lux-black/80 via-transparent" />
                    <figcaption className="absolute bottom-4 left-5 right-5 text-xs tracking-luxury text-ivory">
                      {p.name}
                    </figcaption>
                  </div>
                </motion.figure>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
