import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, GitCompareArrows, LayoutList, Search } from "lucide-react";
import { properties } from "@/data/properties";
import { PropertyListRow } from "@/components/property/PropertyListRow";
import { SiteHeader } from "@/components/SiteHeader";
import { ComparisonBoard } from "@/components/compare/ComparisonBoard";
import { StickyCompareTray } from "@/components/compare/StickyCompareTray";
import { PreferenceBanner } from "@/components/PreferenceBanner";
import { PreferencePanel } from "@/components/PreferencePanel";
import { SuggestedProperties } from "@/components/SuggestedProperties";
import { SuggestedComparisons } from "@/components/SuggestedComparisons";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { EarthGlobe, type PinScreenPos } from "@/components/EarthGlobe";
import { EarthPropertyPopups } from "@/components/EarthPropertyPopups";
import { LiveGridBackdrop } from "@/components/LiveGridBackdrop";
import { useOnboarding } from "@/context/OnboardingContext";
import { matchesPreferences } from "@/lib/preference-filter";
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
  const [heroIdx, setHeroIdx] = useState(0);
  const { quizAnswers } = useOnboarding();

  useEffect(() => {
    if (properties.length <= 1) return;
    const id = window.setInterval(
      () => setHeroIdx((i) => (i + 1) % properties.length),
      2500,
    );

    return () => window.clearInterval(id);
  }, []);

  const heroProperty = properties[heroIdx] ?? properties[0];

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
    const matched = properties.filter((p) => matchesPreferences(p, quizAnswers));
    const others = properties.filter((p) => !matched.includes(p));
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
      <StickyCompareTray watchRef={comparisonRef} hideRef={collectionRef} onCompare={() => scrollToId("suite")} onAdd={() => scrollToId("collection")} />


      {/* ============ HERO — Editorial Split ============ */}
      <section
        id="hero"
        ref={heroRef}
        className="relative pt-28 pb-16 scroll-mt-28"
      >
        {/* Ambient decor */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(71,85,105,0.035),transparent_78%)]" style={{ filter: "blur(72px)" }} />
          <div className="absolute top-10 right-[-180px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(224,242,254,0.28),transparent_78%)]" style={{ filter: "blur(80px)" }} />
        </div>
        <LiveGridBackdrop />

        <div className="container-lux relative z-10">
          <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            {/* LEFT — copy */}
            <div className="relative z-20">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="inline-flex items-center gap-3 rounded-full border border-foreground/10 bg-card/70 px-4 py-1.5 text-[10px] font-semibold tracking-[0.28em] uppercase backdrop-blur"
                style={{ color: "var(--brand-accent, var(--brand))" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-accent, var(--brand))" }} />
                Curated Residences · 2026
                <span className="h-3 w-px bg-foreground/15" />
                <span className="text-foreground/60 tracking-[0.22em]">Vol. XII</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="mt-7 font-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-[58px] lg:text-[66px]"
              >
                India's <span className="gold-text">Smartest</span>
                <br />
                Property Comparison
                <br />
                Platform.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25 }}
                className="mt-7 max-w-lg text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]"
              >
                {"\n"}
              </motion.p>

              {/* Pill search */}
              <motion.form
                onSubmit={(e) => {
                  e.preventDefault();
                  scrollToId("collection");
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4 }}
                className="mt-9 flex w-full max-w-xl items-center gap-2 rounded-full border border-foreground/10 bg-card/85 p-1.5 backdrop-blur-md shadow-[var(--shadow-deep)]"
              >
                <div className="flex flex-1 items-center gap-3 px-5">
                  <Search className="h-4 w-4" style={{ color: "var(--brand-accent, var(--brand))" }} />
                  <input
                    type="text"
                    placeholder="Location, lifestyle, or architect…"
                    className="w-full bg-transparent py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full px-7 py-3 text-[12px] font-semibold tracking-luxury text-[var(--brand-ink)] transition hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-soft) 100%)" }}
                >
                  Explore
                </button>
              </motion.form>

              {/* Secondary CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.55 }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                <button
                  onClick={() => scrollToId("suite")}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-5 py-2.5 text-[12px] font-medium text-foreground transition hover:border-foreground/40"
                >
                  <GitCompareArrows className="h-3.5 w-3.5" /> Start a comparison
                </button>
                <button
                  onClick={() => scrollToId("collection")}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-medium text-muted-foreground transition hover:text-foreground"
                >
                  <LayoutList className="h-3.5 w-3.5" /> Browse the collection
                </button>
              </motion.div>

            </div>

            {/* RIGHT — 3D Earth globe with cycling property popups */}
            <EarthHero />

          </div>

          {/* scroll cue */}
          <motion.button
            onClick={() => scrollToId("suite")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mx-auto mt-20 flex items-center gap-2 text-[10px] tracking-luxury text-muted-foreground transition-colors hover:text-foreground"
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
        className="relative scroll-mt-28"
      >
        <ContainerScroll
          titleComponent={
            <>
              <div className="text-[10px] font-semibold tracking-[0.32em] uppercase text-champagne">
                COMPARISON SUITE
              </div>
              <h2 className="mt-4 font-display text-[36px] font-bold leading-tight text-ivory sm:text-[52px]">
                Compose your <span className="gold-text">comparison</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[14px] text-muted-foreground sm:text-[15px]">
                Select 2 to 3 residences. Each becomes a column. Pikorua highlights what distinguishes them.
              </p>
            </>
          }
        >
          <ComparisonBoard />
        </ContainerScroll>
      </section>

      {/* ============ SUGGESTED (prefs-driven marquee) ============ */}
      <SuggestedProperties />

      {/* ============ SUGGESTED COMPARISONS ============ */}
      <SuggestedComparisons />


      {/* ============ COLLECTION ============ */}
      <section id="collection" ref={collectionRef} className="relative scroll-mt-28 py-16 sm:py-24">
        <div className="container-lux">

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-b border-champagne/15 pb-6">
            <div>
              <h2 className="font-display text-[36px] leading-tight text-ivory sm:text-[48px]">
                Residences in <span className="gold-text">focus</span>
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

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
            <div className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2 pref-scroll">
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
                  </div>

                  {matched.map((p, i) => (
                    <div key={p.id} id={`property-row-${p.id}`} className="group/row scroll-mt-32">
                      <PropertyListRow property={p} index={i} />
                      {i < matched.length - 1 && <RowDivider n={i + 2} />}
                    </div>
                  ))}
                </>
              ) : (
                others.map((p, i) => (
                  <div key={p.id} id={`property-row-${p.id}`} className="group/row scroll-mt-32">
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





function RowDivider({ n: _n }: { n: number }) {
  return (
    <div className="my-1 flex items-center gap-4 px-2 opacity-60">
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

function EarthHero() {
  const pinPositionsRef = useRef<PinScreenPos[]>([]);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const globeEl = el.querySelector("[data-earth-mount]") as HTMLElement | null;
      if (!globeEl) return;
      const wr = el.getBoundingClientRect();
      const gr = globeEl.getBoundingClientRect();
      setOffset({ left: gr.left - wr.left, top: gr.top - wr.top });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <motion.div
      ref={wrapRef}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 mx-auto w-full max-w-[540px] overflow-visible lg:mx-0 lg:justify-self-end"
      style={{ minHeight: 460 }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "160vmax",
          height: "160vmax",
          background:
            "radial-gradient(closest-side, rgba(96,165,250,0.22) 0%, rgba(147,197,253,0.12) 18%, rgba(186,230,253,0.05) 36%, rgba(186,230,253,0.015) 58%, transparent 78%)",
          filter: "blur(80px)",
          zIndex: -1,
        }}
      />


      <div className="relative flex items-center justify-center" data-earth-mount-wrap>
        <div data-earth-mount>
          <EarthGlobe size={420} pinPositionsRef={pinPositionsRef} />
        </div>
      </div>
      <EarthPropertyPopups pinPositionsRef={pinPositionsRef} offset={offset} />
    </motion.div>
  );
}
