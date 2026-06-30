import { motion } from "framer-motion";
import type { Property } from "@/types/property";

interface ComparisonHeroProps {
  properties: Property[];
}

export function ComparisonHero({ properties }: ComparisonHeroProps) {
  return (
    <section className="relative overflow-hidden pt-32 pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "var(--gradient-radial-gold)" }}
      />
      <div className="mx-auto max-w-7xl px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--card)]/60 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.32em] text-champagne backdrop-blur-md"
        >
          <span className="h-1 w-1 rounded-full bg-champagne" />
          The Comparison Suite
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-5xl font-display text-[44px] font-medium leading-[0.98] tracking-[-0.025em] text-ivory sm:text-[68px] md:text-[84px]"
        >
          {properties.map((p, i) => (
            <span key={p.id} className="inline-block">
              <span className="gold-text">{p.name}</span>
              {i < properties.length - 1 && (
                <span className="mx-3 inline-block align-middle text-[0.55em] font-light tracking-[0.2em] text-muted-foreground sm:mx-5">
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
          className="mx-auto mt-10 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]"
        >
          A side-by-side study of design, scale and quiet privilege — curated by Pikorua's
          private-client advisory.
        </motion.p>
      </div>
    </section>
  );
}
