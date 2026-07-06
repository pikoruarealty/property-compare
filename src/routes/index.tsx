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
          <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(201,162,77,0.28),transparent_70%)] blur-3xl" />
          <div className="absolute top-10 right-[-160px] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(59,111,214,0.18),transparent_70%)] blur-3xl" />
        </div>

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
                An editorial suite for comparing ultra-luxury homes. Compose up to three
                residences side by side and let the differences speak for themselves.
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
                className="mt-9 flex w-full max-w-xl items-center gap-2 rounded-full border border-foreground/10 bg-card/85 p-1.5 backdrop-blur-md shadow-[0_24px_60px_-34px_rgba(10,31,77,0.4)]"
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
                  className="rounded-full px-7 py-3 text-[12px] font-semibold tracking-luxury text-white transition hover:brightness-110"
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

            {/* RIGHT — Featured residence composition */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-0 mx-auto w-full max-w-[540px] lg:mx-0 lg:justify-self-end"
            >
              {/* Frame accent */}
              <div
                aria-hidden
                className="absolute -inset-6 rounded-[36px] border border-foreground/10"
                style={{ background: "linear-gradient(160deg, rgba(201,162,77,0.10), rgba(59,111,214,0.05))" }}
              />
              <div
                aria-hidden
                className="absolute -top-4 -left-4 h-24 w-24 rounded-tl-[36px] border-l-2 border-t-2"
                style={{ borderColor: "var(--brand-accent, var(--brand))" }}
              />
              <div
                aria-hidden
                className="absolute -bottom-4 -right-4 h-24 w-24 rounded-br-[36px] border-b-2 border-r-2"
                style={{ borderColor: "var(--brand-accent, var(--brand))" }}
              />

              {/* Main image — animated loop across the page */}
              <div className="relative rounded-[28px]">
                <div className="relative aspect-[4/5] w-full [perspective:1400px]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={heroProperty.id}
                      initial={{ x: "-110vw", y: "42vh", scale: 0.18, opacity: 0, rotate: -480 }}
                      animate={{ x: "0vw", y: "0vh", scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ x: "110vw", y: "-42vh", scale: 0.18, opacity: 0, rotate: 480 }}
                      transition={{
                        x: { duration: 2.2, ease: [0.16, 0.84, 0.24, 1] },
                        y: { duration: 2.2, ease: [0.22, 1, 0.36, 1] },
                        scale: { duration: 2.2, ease: [0.34, 1.15, 0.5, 1] },
                        rotate: { duration: 2.2, ease: [0.19, 1, 0.22, 1] },
                        opacity: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
                      }}


                      className="absolute inset-0 overflow-hidden rounded-[28px] shadow-[0_50px_120px_-40px_rgba(10,31,77,0.45)]"
                    >
                      <img
                        src={heroProperty.image}
                        alt={heroProperty.name}
                        className="h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                      />
                      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[10px] tracking-luxury text-white">
                        <span className="rounded-full bg-black/40 px-3 py-1 backdrop-blur">Featured · {heroProperty.location}</span>
                        <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">Vol. XII</span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-6 text-white">
                        <div className="text-[10px] tracking-luxury opacity-80">Editor's choice</div>
                        <div className="mt-1 font-display text-2xl font-bold leading-tight sm:text-[28px]">
                          {heroProperty.name}
                        </div>
                        <div className="mt-1 text-[12px] opacity-80">
                          {heroProperty.configuration}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating comparison card */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: -3 }}
                transition={{ duration: 1, delay: 0.55 }}
                className="absolute -left-8 bottom-10 hidden w-[220px] rounded-2xl border border-foreground/10 bg-card p-4 shadow-[0_30px_60px_-30px_rgba(10,31,77,0.45)] backdrop-blur sm:block"
              >
                <div className="flex items-center gap-2 text-[10px] tracking-luxury text-muted-foreground">
                  <span
                    className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: "var(--brand-accent, var(--brand))" }}
                  >
                    VS
                  </span>
                  Live comparison
                </div>
                <div className="mt-3 space-y-2">
                  {properties.slice(0, 2).map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg">
                        <img src={p.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12px] font-semibold text-foreground">{p.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{p.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => scrollToId("suite")}
                  className="mt-3 w-full rounded-full py-2 text-[10px] font-semibold tracking-luxury text-white transition hover:brightness-110"
                  style={{ background: "var(--brand)" }}
                >
                  Compare now
                </button>
              </motion.div>
            </motion.div>
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
