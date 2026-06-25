import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { properties } from "@/data/properties";
import { PropertyListRow } from "@/components/property/PropertyListRow";
import { SiteHeader } from "@/components/SiteHeader";
import { ComparisonBoard } from "@/components/compare/ComparisonBoard";
import { StickyCompareTray } from "@/components/compare/StickyCompareTray";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pikorua — Luxury Residences" },
      {
        name: "description",
        content:
          "Compose a side-by-side comparison of ultra-luxury residences with Pikorua's curated comparison suite.",
      },
      { property: "og:title", content: "Pikorua — Luxury Residences" },
      {
        property: "og:description",
        content: "Compare ultra-luxury residences side by side.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const comparisonRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="min-h-screen pb-32">
      <SiteHeader />
      <StickyCompareTray watchRef={comparisonRef} />

      <section className="relative overflow-hidden pt-36 pb-12">
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
        </div>
      </section>

      <div ref={comparisonRef}>
        <ComparisonBoard />
      </div>

      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="flex items-end justify-between border-b border-champagne/15 pb-5">
          <div>
            <p className="text-[11px] tracking-luxury text-champagne">The Collection</p>
            <h2 className="mt-2 font-display text-3xl text-ivory sm:text-4xl">Properties</h2>
          </div>
          <p className="hidden text-xs tracking-luxury text-muted-foreground sm:block">
            {properties.length} residences
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-5">
          {properties.map((p, i) => (
            <PropertyListRow key={p.id} property={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
