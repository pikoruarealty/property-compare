import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles, ArrowUpRight } from "lucide-react";
import { properties } from "@/data/properties";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  matchesPreferences,
  parseBudget,
  allowedConfigKeys,
} from "@/lib/preference-filter";
import type { Property } from "@/types/property";
import type { QuizAnswers } from "@/context/OnboardingContext";

const parsePrice = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const m = String(s).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
};

/** Build the list of suggestions strictly from preferences, with a graceful
 *  fallback to the next budget band when there's almost nothing matching. */
function buildSuggestions(answers: QuizAnswers): Property[] {
  const matched = properties.filter((p) => matchesPreferences(p, answers));

  // Find the user's budget band and the *next* one (±2 Cr upward).
  const band = parseBudget(answers.budgetSub || answers.budgetRange);
  const wantedKeys = allowedConfigKeys(answers);

  let nextBand: Property[] = [];
  if (band && isFinite(band[1])) {
    const nextLo = band[1];
    const nextHi = band[1] + 4; // one band up
    nextBand = properties.filter((p) => {
      if (matched.includes(p)) return false;
      // Same category / BHK preference still applies, only budget shifts.
      const stepAnswers: QuizAnswers = {
        ...answers,
        budgetRange: "",
        budgetSub: "",
      };
      if (!matchesPreferences(p, stepAnswers)) return false;
      const candidateKeys =
        wantedKeys.length > 0
          ? wantedKeys.filter((k) => p.configurations[k])
          : (Object.keys(p.configurations) as Array<keyof typeof p.configurations>);
      return candidateKeys.some((k) => {
        const price = parsePrice(p.configurations[k]?.price);
        if (price === null) return false;
        return price >= nextLo - 0.5 && price <= nextHi + 0.5;
      });
    });
  }

  const merged = [...matched, ...nextBand];
  // Deduplicate, keep first occurrence.
  const seen = new Set<string>();
  return merged.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}

export function SuggestedProperties() {
  const { quizAnswers } = useOnboarding();

  const list = useMemo(() => {
    if (!quizAnswers) return [];
    return buildSuggestions(quizAnswers);
  }, [quizAnswers]);

  if (!quizAnswers || list.length === 0) return null;

  // Duplicate for seamless marquee loop.
  const loop = [...list, ...list];

  const focusProperty = (id: string) => {
    const el = document.getElementById(`property-row-${id}`);
    if (!el) return;
    // Centre the row in the viewport for a clean "open" feel.
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // Remove any prior flash so re-clicks always re-trigger animation.
    el.classList.remove("row-flash", "row-focus");
    // Force reflow so the animation restarts even on rapid re-clicks.
    void (el as HTMLElement).offsetWidth;
    el.classList.add("row-flash", "row-focus");
    window.setTimeout(() => {
      el.classList.remove("row-flash");
    }, 2400);
    window.setTimeout(() => {
      el.classList.remove("row-focus");
    }, 3200);
  };

  // Animation duration scales with item count for a steady speed.
  const duration = Math.max(24, list.length * 6);

  return (
    <section
      id="suggested"
      className="relative scroll-mt-28 border-y border-champagne/10 py-12 sm:py-16"
    >
      <div className="container-lux">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-champagne/30 px-3 py-1 text-[10px] tracking-luxury text-champagne">
              <Sparkles className="h-3 w-3" /> For you
            </span>
            <h2 className="mt-3 font-display text-[30px] leading-tight text-ivory sm:text-[40px]">
              Suggested <span className="gold-text">properties</span>
            </h2>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Curated from your preferences, with a glance at the next budget band.
            </p>
          </div>
          <span className="text-[10px] tracking-luxury text-muted-foreground">
            {list.length} matches · hover to pause
          </span>
        </div>
      </div>

      <div
        className="suggested-marquee mt-8 group"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="suggested-marquee-track">
          {loop.map((p, i) => (
            <SuggestionCard
              key={`${p.id}-${i}`}
              property={p}
              onClick={() => focusProperty(p.id)}
            />
          ))}
        </div>
        {/* edge fades */}
        <div className="suggested-fade-left" />
        <div className="suggested-fade-right" />
      </div>
    </section>
  );
}

function SuggestionCard({
  property,
  onClick,
}: {
  property: Property;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="suggested-card group/card relative shrink-0 overflow-hidden rounded-2xl text-left"
      style={{
        background: "var(--card)",
        border: "1px solid var(--glass-border)",
        boxShadow:
          "0 1px 0 0 color-mix(in oklab, var(--foreground) 6%, transparent) inset, 0 18px 40px -24px color-mix(in oklab, var(--foreground) 28%, transparent), 0 4px 12px -6px color-mix(in oklab, var(--foreground) 14%, transparent)",
      }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover/card:scale-105"
        />
        {/* subtle vignette so the status chip stays readable, lighter touch */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, color-mix(in oklab, #000 28%, transparent) 0%, transparent 38%)",
          }}
        />
        <span
          className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-luxury backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.92)",
            color: "#0a0a0a",
            border: "1px solid rgba(8,8,8,0.08)",
            boxShadow: "0 2px 8px -2px rgba(0,0,0,0.18)",
          }}
        >
          {property.status}
        </span>
        <span
          className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold tracking-luxury opacity-0 transition-opacity group-hover/card:opacity-100"
          style={{ background: "var(--foreground)", color: "var(--background)" }}
        >
          View <ArrowUpRight className="h-2.5 w-2.5" />
        </span>
      </div>
      <div className="p-4">
        <p className="text-[9px] font-semibold tracking-luxury text-muted-foreground">
          {property.developer}
        </p>
        <h3 className="mt-1 truncate font-display text-[18px] font-medium text-foreground">
          {property.name}
        </h3>
        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" /> {property.location}
        </p>
      </div>
    </motion.button>
  );
}
