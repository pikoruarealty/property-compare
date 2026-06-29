import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowDown, GitCompareArrows, LayoutList } from "lucide-react";
import { properties } from "@/data/properties";
import { PropertyListRow } from "@/components/property/PropertyListRow";
import { SiteHeader } from "@/components/SiteHeader";
import { ComparisonBoard } from "@/components/compare/ComparisonBoard";
import { StickyCompareTray } from "@/components/compare/StickyCompareTray";
import { PreferenceBanner } from "@/components/PreferenceBanner";
import { PreferencePanel } from "@/components/PreferencePanel";
import { useOnboarding } from "@/context/OnboardingContext";
import type { Property } from "@/types/property";

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

const CHAPTERS = [
  { id: "hero", label: "Foreword" },
  { id: "suite", label: "The Suite" },
  { id: "collection", label: "The Collection" },
];

function Index() {
  const heroRef = useRef<HTMLElement | null>(null);
  const comparisonRef = useRef<HTMLDivElement | null>(null);
  const collectionRef = useRef<HTMLElement | null>(null);
  const [activeChapter, setActiveChapter] = useState("hero");
  const { quizAnswers } = useOnboarding();

  const { matched, others } = useMemo(() => {
    if (!quizAnswers) return { matched: [] as Property[], others: properties };
    const types = (quizAnswers.propertyType ?? []).map((t) => t.toLowerCase());
    const bhks = (quizAnswers.bhk ?? []).map((b) =>
      b.replace(/\s*BHK$/i, "").trim(),
    );
    const score = (p: Property) => {
      let s = 0;
      const config = p.configuration?.toLowerCase() ?? "";
      const cat = p.category.toLowerCase();
      for (const t of types) {
        if (cat === t) s += 2;
        else if (config.includes(t)) s += 2;
      }
      for (const b of bhks) {
        if (config.includes(`${b} bhk`) || config.includes(`${b},`)) s += 1;
      }
      return s;
    };
    const matched: Property[] = [];
    const others: Property[] = [];
    for (const p of properties) {
      if (score(p) > 0) matched.push(p);
      else others.push(p);
    }
    matched.sort((a, b) => score(b) - score(a));
    return { matched, others };
  }, [quizAnswers]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveChapter(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    CHAPTERS.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen pb-32">
      <SiteHeader />
      <StickyCompareTray watchRef={heroRef} onCompare={() => scrollToId("suite")} />


      {/* ============ HERO ============ */}
      <section
        id="hero"
        ref={heroRef}
        className="relative overflow-hidden pt-36 pb-20 scroll-mt-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "var(--gradient-radial-gold)" }}
        />
        <div className="container-lux relative">
          <ChapterMark index={1} label="Foreword" />

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:gap-16">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="font-display text-[44px] leading-[1.02] text-ivory sm:text-[68px] lg:text-[78px]"
                style={{ maxWidth: "18ch" }}
              >
                Compare residences with the eye of a{" "}
                <span className="gold-text italic">collector</span>.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25 }}
                className="mt-6 max-w-xl text-[16px] leading-relaxed text-muted-foreground"
              >
                A curated, editorial comparison suite for ultra-luxury homes. Compose
                up to three residences side by side and let the differences speak.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4 }}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <button
                  onClick={() => scrollToId("suite")}
                  className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 text-[12px] tracking-luxury text-lux-black hover:bg-muted-gold transition-colors shadow-[0_18px_40px_-14px_rgba(200,164,93,0.55)]"
                >
                  <GitCompareArrows className="h-3.5 w-3.5" /> Start a comparison
                </button>
                <button
                  onClick={() => scrollToId("collection")}
                  className="inline-flex items-center gap-2 rounded-full gold-border px-6 py-3 text-[12px] tracking-luxury text-champagne hover:bg-champagne/10 transition-colors"
                >
                  <LayoutList className="h-3.5 w-3.5" /> Browse the collection
                </button>
              </motion.div>
            </div>

            {/* Right: mini-index */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="relative rounded-[24px] border border-champagne/20 bg-soft-black/40 p-6 backdrop-blur-md"
            >
              <p className="text-[10px] tracking-luxury text-champagne/80">Inside</p>
              <h2 className="mt-2 font-display text-xl text-ivory">What this folio contains</h2>
              <ul className="mt-5 divide-y divide-champagne/12">
                <MiniIndexRow num="01" label="The Suite" sub="Side-by-side diff matrix" onClick={() => scrollToId("suite")} />
                <MiniIndexRow num="02" label="The Collection" sub={`${properties.length} curated residences`} onClick={() => scrollToId("collection")} />
                <MiniIndexRow num="03" label="Editorial Verdicts" sub="Author's notes per residence" onClick={() => scrollToId("collection")} />
              </ul>
            </motion.aside>
          </div>

          {/* scroll cue */}
          <motion.button
            onClick={() => scrollToId("suite")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-16 inline-flex items-center gap-2 text-[10px] tracking-luxury text-muted-foreground hover:text-champagne transition-colors"
          >
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </motion.span>
            Scroll to compare
          </motion.button>
        </div>
      </section>

      {/* ============ COMPARISON SUITE ============ */}
      <section
        id="suite"
        ref={comparisonRef as React.RefObject<HTMLDivElement>}
        className="relative scroll-mt-28 py-12 sm:py-16"
      >
        <div className="container-lux">
          <ChapterMark index={2} label="The Suite" />
        </div>
        <div className="mt-8">
          <ComparisonBoard />
        </div>
      </section>

      {/* ============ COLLECTION ============ */}
      <section id="collection" className="relative scroll-mt-28 py-16 sm:py-24">
        <div className="container-lux">
          <ChapterMark index={3} label="The Collection" />

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-b border-champagne/15 pb-6">
            <div>
              <h2 className="font-display text-[36px] leading-tight text-ivory sm:text-[48px]">
                Residences in <span className="gold-text italic">focus</span>
              </h2>
              <p className="mt-2 max-w-lg text-[15px] text-muted-foreground">
                Hover any residence for the expanded card. Tap "Add to Compare" to bring it into the Suite above.
              </p>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-[40px] text-champagne leading-none">{properties.length}</span>
              <span className="text-[11px] tracking-luxury text-muted-foreground">curated residences</span>
            </div>
          </div>

          <div className="mt-6">
            <PreferenceBanner />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <PreferencePanel />
            </div>

            <div className="flex flex-col gap-6">
              {quizAnswers && matched.length > 0 ? (
                <>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-[10px] tracking-luxury text-champagne">
                      Matched to your preferences
                    </span>
                    <span className="h-px flex-1 bg-champagne/15" />
                    <span className="text-[10px] tracking-luxury text-champagne/60">
                      {String(matched.length).padStart(2, "0")}
                    </span>
                  </div>
                  {matched.map((p, i) => (
                    <div key={p.id} className="group/row">
                      <PropertyListRow property={p} index={i} />
                      {i < matched.length - 1 && <RowDivider n={i + 2} />}
                    </div>
                  ))}
                </>
              ) : (
                others.map((p, i) => (
                  <div key={p.id} className="group/row">
                    <PropertyListRow property={p} index={i} />
                    {i < others.length - 1 && <RowDivider n={i + 2} />}
                  </div>
                ))
              )}
            </div>
          </div>



        </div>
      </section>
    </div>
  );
}

function ChapterMark({ index, label }: { index: number; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-display text-[28px] text-champagne leading-none tabular-nums">
        {String(index).padStart(2, "0")}
      </span>
      <span className="h-px w-12 bg-champagne/50" />
      <span className="text-[11px] tracking-luxury text-champagne">{label}</span>
    </div>
  );
}

function RowDivider({ n }: { n: number }) {
  return (
    <div className="my-1 flex items-center gap-4 px-2 opacity-60">
      <span className="h-px flex-1 bg-champagne/12" />
      <span className="text-[10px] tracking-luxury text-champagne/60">
        {String(n).padStart(2, "0")}
      </span>
      <span className="h-px flex-1 bg-champagne/12" />
    </div>
  );
}

function MiniIndexRow({
  num,
  label,
  sub,
  onClick,
}: {
  num: string;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="group flex w-full items-center gap-4 py-3.5 text-left transition-colors hover:text-champagne"
      >
        <span className="font-display text-[14px] text-champagne/70 tabular-nums w-8">
          {num}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] text-ivory group-hover:text-champagne transition-colors">{label}</p>
          <p className="text-[11px] tracking-luxury text-muted-foreground">{sub}</p>
        </div>
        <ArrowDown className="h-3.5 w-3.5 -rotate-90 text-champagne/40 transition-all group-hover:text-champagne group-hover:translate-x-1" />
      </button>
    </li>
  );
}
