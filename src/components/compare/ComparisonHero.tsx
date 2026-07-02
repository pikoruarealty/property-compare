import { motion } from "framer-motion";
import type { Property } from "@/types/property";

interface ComparisonHeroProps {
  properties: Property[];
}

export function ComparisonHero({ properties }: ComparisonHeroProps) {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "var(--gradient-radial-gold)" }}
      />
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-6">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--card)]/60 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.24em] text-champagne backdrop-blur-md sm:px-4 sm:text-[10px] sm:tracking-[0.32em]"
        >
          <span className="h-1 w-1 rounded-full bg-champagne" />
          The Comparison Suite
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 flex max-w-5xl flex-wrap items-baseline justify-center gap-x-3 gap-y-1 font-display text-[40px] font-extrabold leading-[0.98] tracking-[-0.04em] text-ivory sm:mt-8 sm:gap-x-6 sm:text-[84px] sm:leading-[0.94] md:text-[104px]"
        >
          {properties.map((p, i) => (
            <span key={p.id} className="inline-flex items-baseline gap-x-3 sm:gap-x-6">
              <span className="gold-text">{p.name}</span>
              {i < properties.length - 1 && (
                <span className="text-[0.42em] font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:text-[0.48em] sm:tracking-[0.32em]">
                  vs
                </span>
              )}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-7 max-w-xl text-[15px] font-medium leading-relaxed text-muted-foreground sm:mt-10 sm:text-[18px]"
        >
          A side-by-side study of design, scale and quiet privilege — curated by Pikorua's
          private-client advisory.
        </motion.p>
      </div>
    </section>
  );
}
