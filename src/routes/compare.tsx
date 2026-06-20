import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { getPropertyById } from "@/data/properties";
import { SiteHeader } from "@/components/SiteHeader";
import { ComparisonHero } from "@/components/compare/ComparisonHero";
import { PropertyHeaderCards } from "@/components/compare/PropertyHeaderCards";
import { SectionNav } from "@/components/compare/SectionNav";
import { OverviewSection } from "@/components/compare/OverviewSection";
import { AmenitiesSection } from "@/components/compare/AmenitiesSection";
import { AdvantagesSection } from "@/components/compare/AdvantagesSection";
import { DifferenceHighlights } from "@/components/compare/DifferenceHighlights";
import { GalleryComparison } from "@/components/compare/GalleryComparison";
import { ExpertVerdict } from "@/components/compare/ExpertVerdict";

const searchSchema = z.object({
  ids: z.string().optional().default(""),
});

export const Route = createFileRoute("/compare")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Comparison Suite — Pikorua" },
      {
        name: "description",
        content: "Side-by-side comparison of luxury residences from the Pikorua collection.",
      },
      { property: "og:title", content: "Comparison Suite — Pikorua" },
      {
        property: "og:description",
        content: "Side-by-side comparison of luxury residences.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids } = Route.useSearch();
  const properties = useMemo(
    () =>
      ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .map((id) => getPropertyById(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .slice(0, 3),
    [ids],
  );

  if (properties.length < 2) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] tracking-luxury text-champagne">Comparison unavailable</p>
          <h1 className="mt-4 font-display text-4xl text-ivory sm:text-5xl">
            Select at least <span className="gold-text">two residences</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Return to the collection and add 2–3 properties to begin comparison.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full gold-border px-6 py-3 text-xs tracking-luxury text-champagne hover:bg-champagne hover:text-lux-black"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Residences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-6">
        <ComparisonHero properties={properties} />
        <PropertyHeaderCards properties={properties} />
        <div className="mt-6">
          <SectionNav />
        </div>
        <OverviewSection properties={properties} />
        <AmenitiesSection properties={properties} />
        <AdvantagesSection properties={properties} />
        <DifferenceHighlights properties={properties} />
        <GalleryComparison properties={properties} />
        <ExpertVerdict properties={properties} />

        <div className="mt-20 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full gold-border px-6 py-3 text-xs tracking-luxury text-champagne hover:bg-champagne hover:text-lux-black"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Residences
          </Link>
        </div>
      </div>
    </div>
  );
}
