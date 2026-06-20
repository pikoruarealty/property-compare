import { motion } from "framer-motion";
import type { Property } from "@/types/property";

interface ComparisonHeroProps {
  properties: Property[];
}

export function ComparisonHero({ properties }: ComparisonHeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "var(--gradient-radial-gold)" }}
      />
      <div className="mx-auto max-w-7xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[11px] tracking-luxury text-champagne"
        >
          Pikorua · The Comparison Suite
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-display text-4xl leading-[1.05] text-ivory sm:text-6xl md:text-7xl"
        >
          {properties.map((p, i) => (
            <span key={p.id} className="inline-block">
              <span className="gold-text">{p.name}</span>
              {i < properties.length - 1 && (
                <span className="mx-3 font-display text-ivory/40 sm:mx-6">vs</span>
              )}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-8 max-w-2xl text-base text-muted-foreground sm:text-lg"
        >
          A side-by-side study of design, scale and quiet privilege — curated by Pikorua's
          private-client advisory.
        </motion.p>
      </div>
    </section>
  );
}
