import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Property } from "@/types/property";
import { Section } from "./Section";

export function AmenitiesSection({ properties }: { properties: Property[] }) {
  return (
    <Section
      id="amenities"
      eyebrow="Amenities"
      title="A vocabulary of indulgence"
      description="Every chip is a curated experience inside the residence."
    >
      <div
        className="grid gap-2 sm:gap-6"
        style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(0, 1fr))` }}
      >
        {properties.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="glass rounded-2xl p-3 sm:rounded-[32px] sm:p-6"
          >
            <h3 className="font-display text-[14px] font-bold leading-tight tracking-[-0.02em] text-ivory sm:text-[28px]">{p.name}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
              {p.amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-full bg-graphite/70 px-2 py-1 text-[10px] text-ivory/85 ring-1 ring-[var(--glass-border)] transition-colors hover:bg-champagne hover:text-lux-black sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs"
                >
                  <Sparkles className="h-2.5 w-2.5 text-champagne sm:h-3 sm:w-3 group-hover:text-lux-black" />
                  {a}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
