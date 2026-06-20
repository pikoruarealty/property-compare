import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { properties } from "@/data/properties";
import { PropertyCard } from "@/components/property/PropertyCard";
import { CompareBar } from "@/components/property/CompareBar";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pikorua — Luxury Residences" },
      {
        name: "description",
        content:
          "Browse and compare a curated collection of ultra-luxury residences across the world.",
      },
      { property: "og:title", content: "Pikorua — Luxury Residences" },
      {
        property: "og:description",
        content: "Browse and compare ultra-luxury residences worldwide.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen pb-40">
      <SiteHeader />

      <section className="relative overflow-hidden pt-40 pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-radial-gold)" }}
        />
        <div className="mx-auto max-w-7xl px-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[11px] tracking-luxury text-champagne"
          >
            Curated Residences · 2026 Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] text-ivory sm:text-7xl"
          >
            Compare residences with the eye of a <span className="gold-text">collector</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Select two to three properties from the collection below. Pikorua's comparison suite
            will reveal what numbers alone cannot.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
      </section>

      <CompareBar />
    </div>
  );
}
