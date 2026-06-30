import { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { properties } from "@/data/properties";
import { useOnboarding } from "@/context/OnboardingContext";
import {
  matchesPreferences,
  parseBudget,
  allowedConfigKeys,
} from "@/lib/preference-filter";
import type { Property, ConfigKey } from "@/types/property";
import type { QuizAnswers } from "@/context/OnboardingContext";

const parsePrice = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const m = String(s).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
};

/** Lowest price (in Cr) among the user's preferred configs, else any config. */
function minRelevantPrice(p: Property, answers: QuizAnswers): number | null {
  const wanted = allowedConfigKeys(answers);
  const keys = (wanted.length > 0
    ? wanted.filter((k) => p.configurations[k])
    : (Object.keys(p.configurations) as ConfigKey[])) as ConfigKey[];
  let min: number | null = null;
  for (const k of keys) {
    const price = parsePrice(p.configurations[k]?.price);
    if (price === null) continue;
    if (min === null || price < min) min = price;
  }
  return min;
}

/** Same as matchesPreferences but budget-agnostic. */
function matchesNonBudget(p: Property, answers: QuizAnswers): boolean {
  const stripped: QuizAnswers = { ...answers, budgetRange: "", budgetSub: "" };
  return matchesPreferences(p, stripped);
}

function buildBuckets(answers: QuizAnswers) {
  const inPrefs = properties.filter((p) => matchesPreferences(p, answers));

  const band = parseBudget(answers.budgetSub || answers.budgetRange);
  let above: Property[] = [];
  let below: Property[] = [];

  if (band) {
    const [lo, hi] = band;
    const candidates = properties.filter(
      (p) => !inPrefs.includes(p) && matchesNonBudget(p, answers),
    );
    for (const p of candidates) {
      const price = minRelevantPrice(p, answers);
      if (price === null) continue;
      if (price > hi + 0.5) above.push(p);
      else if (price < lo - 0.5) below.push(p);
    }
    // Sort: above ascending (closest first), below descending (closest first).
    above.sort(
      (a, b) => (minRelevantPrice(a, answers) ?? 0) - (minRelevantPrice(b, answers) ?? 0),
    );
    below.sort(
      (a, b) => (minRelevantPrice(b, answers) ?? 0) - (minRelevantPrice(a, answers) ?? 0),
    );
  }

  return { suggested: inPrefs, above, below };
}

const focusProperty = (id: string) => {
  const el = document.getElementById(`property-row-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("row-flash", "row-focus");
  void (el as HTMLElement).offsetWidth;
  el.classList.add("row-flash", "row-focus");
  window.setTimeout(() => el.classList.remove("row-flash"), 2400);
  window.setTimeout(() => el.classList.remove("row-focus"), 3200);
};

export function SuggestedProperties() {
  const { quizAnswers } = useOnboarding();

  const buckets = useMemo(() => {
    if (!quizAnswers) return { suggested: [], above: [], below: [] };
    return buildBuckets(quizAnswers);
  }, [quizAnswers]);

  if (!quizAnswers) return null;
  if (
    buckets.suggested.length === 0 &&
    buckets.above.length === 0 &&
    buckets.below.length === 0
  )
    return null;

  return (
    <section id="suggested" className="relative scroll-mt-28 border-y border-champagne/10 py-12 sm:py-16">
      <Marquee
        anchorId="suggested-in-budget"
        eyebrow="For you"
        eyebrowIcon={<Sparkles className="h-3 w-3" />}
        title={<>Suggested <span className="gold-text">properties</span></>}
        subtitle="In your budget and matched to your preferences."
        list={buckets.suggested}
        chipLabel={null}
      />
      {buckets.above.length > 0 && (
        <div className="mt-14">
          <Marquee
            anchorId="suggested-above-budget"
            eyebrow="Stretch picks"
            eyebrowIcon={<TrendingUp className="h-3 w-3" />}
            title={<>More than <span className="gold-text">your budget</span></>}
            subtitle="A glance just above your range, in case it's worth the stretch."
            list={buckets.above}
            chipLabel="Above budget"
          />
        </div>
      )}
      {buckets.below.length > 0 && (
        <div className="mt-14">
          <Marquee
            anchorId="suggested-below-budget"
            eyebrow="Smart value"
            eyebrowIcon={<TrendingDown className="h-3 w-3" />}
            title={<>Lower than <span className="gold-text">your budget</span></>}
            subtitle="Comfortably under your range, same preferences."
            list={buckets.below}
            chipLabel="Below budget"
          />
        </div>
      )}
    </section>
  );
}

function Marquee({
  anchorId,
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  list,
  chipLabel,
}: {
  anchorId: string;
  eyebrow: string;
  eyebrowIcon: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  list: Property[];
  chipLabel: string | null;
}) {
  if (list.length === 0) return null;
  const loop = [...list, ...list];
  const duration = Math.max(24, list.length * 6);
  return (
    <div id={anchorId} className="scroll-mt-28">
      <div className="container-lux">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-champagne/30 px-3 py-1 text-[10px] tracking-luxury text-champagne">
              {eyebrowIcon} {eyebrow}
            </span>
            <h2 className="mt-3 font-display text-[28px] leading-tight text-ivory sm:text-[36px]">
              {title}
            </h2>
            <p className="mt-1.5 text-[13px] text-muted-foreground">{subtitle}</p>
          </div>
          <span className="text-[10px] tracking-luxury text-muted-foreground">
            {list.length} {list.length === 1 ? "match" : "matches"} · hover to pause
          </span>
        </div>
      </div>
      <div
        className="suggested-marquee mt-7 group"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="suggested-marquee-track">
          {loop.map((p, i) => (
            <SuggestionCard
              key={`${anchorId}-${p.id}-${i}`}
              property={p}
              chipLabel={chipLabel}
              onClick={() => focusProperty(p.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({
  property,
  chipLabel,
  onClick,
}: {
  property: Property;
  chipLabel: string | null;
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
        {chipLabel && (
          <span
            className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-luxury"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
              boxShadow: "0 2px 8px -2px rgba(0,0,0,0.25)",
            }}
          >
            {chipLabel}
          </span>
        )}
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
