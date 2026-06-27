import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, ChevronDown, Sparkles, Check, Minus, TrendingDown, TrendingUp, Equal, GitCompareArrows, Trophy } from "lucide-react";
import { properties as allProperties, getPropertyById } from "@/data/properties";
import { MAX_COMPARE, MIN_COMPARE, useCompareStore } from "@/stores/compare-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ConfigDetail, ConfigKey, Property } from "@/types/property";
import { CONFIG_KEYS } from "@/types/property";
import { toast } from "sonner";
import { PhotoSlideshow } from "@/components/compare/PhotoSlideshow";


const DASH = "-";
const v = (x: string | null | undefined) => (x && String(x).trim() ? String(x) : DASH);

function ConfigCell({ cfg }: { cfg: ConfigDetail | undefined }) {
  if (!cfg) {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Minus className="h-3.5 w-3.5" /> Not Available
      </span>
    );
  }
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-1.5 text-[12px] tracking-luxury text-champagne">
        <Check className="h-3.5 w-3.5" /> Available
      </div>
      <div className="grid grid-cols-1 gap-1 text-[15px] text-ivory">
        {cfg.area && <div><span className="text-muted-foreground">Super:</span> {cfg.area} sq ft (Approx.)</div>}
        {cfg.carpet && <div><span className="text-muted-foreground">Carpet:</span> {cfg.carpet} sq ft (Approx.)</div>}
      </div>
    </div>
  );

}

type RowDef = {
  label: string;
  render: (p: Property) => React.ReactNode;
  emphasis?: boolean;
};

const buildRows = (): RowDef[] => [
  { label: "Developer", render: (p) => v(p.developer) },
  ...CONFIG_KEYS.map<RowDef>((k) => ({
    label: k,
    render: (p) => <ConfigCell cfg={p.configurations[k as ConfigKey]} />,
  })),
  { label: "Location", render: (p) => v(p.location) },
  { label: "Status", render: (p) => v(p.status) },
    { label: "Super Built-up Area", render: (p) => p.superBuiltUpArea ? `${p.superBuiltUpArea} (Approx.)` : DASH },
    { label: "Carpet Area", render: (p) => p.carpetArea ? `${p.carpetArea} (Approx.)` : DASH },
  {
    label: "Amenities",
    render: (p) =>
      p.amenities?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {p.amenities.map((a) => (
            <span
              key={a}
              className="rounded-full border border-champagne/15 bg-graphite/60 px-2.5 py-1 text-[11px] text-ivory/85"
            >
              {a}
            </span>
          ))}
        </div>
      ) : (
        DASH
      ),
  },
  { label: "Possession", render: (p) => v(p.possession) },
  {
    label: "Key Advantages",
    render: (p) =>
      p.advantages?.length ? (
        <ul className="list-disc space-y-1 pl-4 text-[13px] text-ivory/90 marker:text-champagne">
          {p.advantages.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      ) : (
        DASH
      ),
  },
  {
    label: "Expert Verdict",
    emphasis: true,
    render: (p) =>
      p.expertNote ? (
        <div className="rounded-2xl border border-champagne/30 bg-gradient-to-br from-champagne/10 to-transparent p-4 text-[13px] leading-relaxed text-ivory/95">
          {p.expertNote}
        </div>
      ) : (
        DASH
      ),
  },
  {
    label: "Photo",
    render: (p) => <PhotoSlideshow property={p} />,
  },

];

export function ComparisonBoard() {
  const hydrated = useHydrated();
  const { selected: rawSelected, toggle, remove, clear } = useCompareStore();
  const selected = hydrated ? rawSelected : [];
  const items = useMemo(
    () => selected.map((id) => getPropertyById(id)).filter(Boolean) as Property[],
    [selected],
  );
  const slots: (Property | null)[] = Array.from({ length: MAX_COMPARE }, (_, i) => items[i] ?? null);
  const ready = items.length >= MIN_COMPARE;

  return (
    <section className="mx-auto max-w-7xl px-6">
      <div
        className="glass rounded-[32px] p-6 sm:p-8"
        style={{ border: "1px solid var(--glass-border)" }}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-luxury text-champagne">
              Comparison Suite · {items.length} / {MAX_COMPARE}
            </p>
            <h2 className="mt-2 font-display text-3xl text-ivory sm:text-4xl">
              Compose your <span className="gold-text">comparison</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Select {MIN_COMPARE} to {MAX_COMPARE} residences. Each becomes a column. Every row stays
              perfectly aligned across selections.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="text-[11px] tracking-luxury text-muted-foreground hover:text-champagne transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot, idx) => (
            <SlotCard
              key={idx}
              slot={slot}
              index={idx}
              onRemove={(id) => remove(id)}
              onPick={(id) => {
                const r = toggle(id);
                if (!r.ok && r.reason) toast.error(r.reason);
              }}
              currentSelected={selected}
            />
          ))}
        </div>

        <AnimatePresence initial={false}>
          {ready ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8"
            >
              <ComparisonGrid items={items} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex flex-col items-center justify-center rounded-[24px] border border-dashed border-champagne/25 px-6 py-12 text-center"
            >
              <Sparkles className="h-5 w-5 text-champagne" />
              <p className="mt-3 text-sm text-muted-foreground">
                Add at least {MIN_COMPARE} properties to reveal the comparison.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function SlotCard({
  slot,
  index,
  onRemove,
  onPick,
  currentSelected,
}: {
  slot: Property | null;
  index: number;
  onRemove: (id: string) => void;
  onPick: (id: string) => void;
  currentSelected: string[];
}) {
  const [open, setOpen] = useState(false);

  if (slot) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[24px] bg-soft-black"
        style={{ border: "1px solid var(--glass-border)" }}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={slot.image} alt={slot.name} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-lux-black via-lux-black/40 to-transparent" />
          <button
            onClick={() => onRemove(slot.id)}
            aria-label="Remove from comparison"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full glass text-ivory hover:text-champagne transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-[10px] tracking-luxury text-champagne">Slot 0{index + 1}</p>
            <h3 className="mt-0.5 font-display text-lg text-ivory line-clamp-1">{slot.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{slot.developer} · {slot.location}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const available = allProperties.filter((p) => !currentSelected.includes(p.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="group flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-champagne/30 bg-soft-black/40 px-6 py-10 text-center transition-all duration-300 hover:border-champagne hover:bg-soft-black">
          <div className="grid h-12 w-12 place-items-center rounded-full gold-border text-champagne transition-transform duration-300 group-hover:scale-110">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] tracking-luxury text-champagne">Slot 0{index + 1}</p>
            <p className="mt-1 text-sm text-ivory/90">Add a property</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-[320px] rounded-2xl border-champagne/20 bg-soft-black p-2"
      >
        {available.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            All properties already added.
          </p>
        ) : (
          <div className="max-h-[320px] overflow-y-auto">
            {available.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onPick(p.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-graphite"
              >
                <img src={p.image} alt={p.name} className="h-12 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ivory">{p.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {p.developer} · {p.location}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// --- helpers for comparison decoration ---
const parseNum = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const m = String(s).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};
const parseMaxNum = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const nums = String(s).replace(/,/g, "").match(/\d+(\.\d+)?/g);
  if (!nums) return null;
  return Math.max(...nums.map(parseFloat));
};
type Winner = { idx: number; tone: "low" | "high" } | null;
function computeWinner(
  values: (number | null)[],
  prefer: "low" | "high",
): Winner {
  const valid = values
    .map((v, i) => ({ v, i }))
    .filter((x) => x.v !== null) as { v: number; i: number }[];
  if (valid.length < 2) return null;
  const target =
    prefer === "low"
      ? Math.min(...valid.map((x) => x.v))
      : Math.max(...valid.map((x) => x.v));
  const winners = valid.filter((x) => x.v === target);
  if (winners.length === valid.length) return null; // all equal
  return { idx: winners[0].i, tone: prefer };
}

/* =========================================================================
   VARIANT 3 — Split-Pane Showcase
   - Cinematic hero pane on top displaying the currently-focused property
     (large image carousel + identity).
   - Below it, full-height vertical PANELS — one per property — with a
     shared attribute selector (Residences · Spaces · Location · Highlights
     · Amenities · Verdict). Switching attribute slides content with
     smooth Framer Motion transitions.
   - Larger, more confident typography across the board.
   ========================================================================= */

type AttrKey =
  | "residences"
  | "spaces"
  | "location"
  | "highlights"
  | "amenities"
  | "verdict";

const ATTRS: { key: AttrKey; label: string; hint: string }[] = [
  { key: "residences", label: "Residences", hint: "Configurations & areas" },
  { key: "spaces", label: "Spaces", hint: "Super built-up vs carpet" },
  { key: "location", label: "Location & Timeline", hint: "Address · possession · status" },
  { key: "highlights", label: "Highlights", hint: "What sets each apart" },
  { key: "amenities", label: "Amenities", hint: "Lifestyle & wellness" },
  { key: "verdict", label: "Verdict", hint: "The editor's note" },
];

function ComparisonGrid({ items }: { items: Property[] }) {
  const cols = items.length;
  const innerGrid = cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  const [focus, setFocus] = useState(0);
  const [attr, setAttr] = useState<AttrKey>("residences");

  // winners
  const configWinners: Record<string, number | null> = {};
  CONFIG_KEYS.forEach((k) => {
    const areas = items.map((p) => parseMaxNum(p.configurations[k as ConfigKey]?.area ?? null));
    configWinners[k] = computeWinner(areas, "high")?.idx ?? null;
  });
  const superWinner = computeWinner(items.map((p) => parseMaxNum(p.superBuiltUpArea)), "high")?.idx ?? null;
  const carpetWinner = computeWinner(items.map((p) => parseMaxNum(p.carpetArea)), "high")?.idx ?? null;

  // safe-clamp focus when items change
  const focused = items[Math.min(focus, items.length - 1)] ?? items[0];

  return (
    <div className="space-y-7">
      {/* Folio header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3">
          <span className="h-px w-12 bg-champagne/60" />
          <span className="text-[12px] tracking-[0.34em] uppercase text-champagne">
            Split-Pane Showcase
          </span>
          <span className="h-px w-12 bg-champagne/60" />
        </div>
        <h3 className="mt-4 font-display text-[34px] sm:text-[44px] leading-tight text-ivory">
          Step into <span className="gold-text italic">each residence</span>
        </h3>
        <p className="mt-3 text-[15px] text-muted-foreground max-w-2xl mx-auto">
          A cinematic hero pane up top, attribute panels below — switch chapters and watch every property update in step.
        </p>
      </div>

      {/* HERO SHOWCASE */}
      <div className="relative overflow-hidden rounded-[32px] border border-champagne/25 bg-gradient-to-br from-soft-black/80 to-lux-black/60 shadow-[0_40px_120px_-50px_rgba(200,164,93,0.35)]">
        <div className="grid grid-cols-1 lg:grid-cols-[58%_42%]">
          {/* Large image */}
          <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[440px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={focused.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <PhotoSlideshow property={focused} />
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-lux-black/30 via-transparent to-transparent" />
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-lux-black/70 backdrop-blur px-3 py-1 text-[11px] tracking-luxury text-champagne border border-champagne/30">
              Now Viewing · {String.fromCharCode(65 + Math.min(focus, items.length - 1))}
            </div>
          </div>

          {/* Identity */}
          <div className="relative flex flex-col justify-center p-7 sm:p-9 border-t lg:border-t-0 lg:border-l border-champagne/15">
            <AnimatePresence mode="wait">
              <motion.div
                key={focused.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[11px] tracking-[0.34em] uppercase text-champagne/90">
                  {focused.developer || "—"}
                </p>
                <h4 className="mt-3 font-display text-[32px] sm:text-[40px] leading-[1.05] text-ivory italic">
                  {focused.name}
                </h4>
                <p className="mt-3 text-[15px] text-muted-foreground">
                  {focused.location}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-champagne/30 px-3 py-1 text-[11px] tracking-luxury text-champagne">
                    {focused.status}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-champagne/15 px-3 py-1 text-[11px] tracking-luxury text-muted-foreground">
                    Possession · {focused.possession}
                  </span>
                </div>
                {focused.tagline && (
                  <p className="mt-6 text-[16px] leading-relaxed text-ivory/85 italic">
                    "{focused.tagline}"
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Property selector */}
            <div className="mt-7 pt-5 border-t border-champagne/15">
              <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground mb-3">
                Choose pane
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((p, i) => {
                  const active = i === Math.min(focus, items.length - 1);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setFocus(i)}
                      className={`group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-all ${
                        active
                          ? "border-champagne bg-champagne/15 text-ivory"
                          : "border-champagne/20 bg-lux-black/40 text-muted-foreground hover:border-champagne/40 hover:text-ivory"
                      }`}
                    >
                      <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] tracking-luxury ${active ? "bg-champagne text-lux-black" : "border border-champagne/30 text-champagne"}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="max-w-[140px] truncate font-display">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ATTRIBUTE SELECTOR */}
      <div className="overflow-hidden rounded-[20px] border border-champagne/20 bg-soft-black/60 backdrop-blur p-2">
        <div className="flex flex-wrap gap-1.5">
          {ATTRS.map((a) => {
            const active = a.key === attr;
            return (
              <button
                key={a.key}
                onClick={() => setAttr(a.key)}
                className={`relative flex-1 min-w-[140px] rounded-[14px] px-4 py-3 text-left transition-colors ${
                  active ? "bg-champagne/15 text-ivory" : "text-muted-foreground hover:text-ivory hover:bg-lux-black/40"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="attr-pill"
                    className="absolute inset-0 rounded-[14px] ring-1 ring-champagne/50"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative font-display text-[16px] sm:text-[17px]">{a.label}</span>
                <span className="relative block text-[11px] tracking-luxury text-muted-foreground mt-0.5">
                  {a.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PANELS */}
      <div className={`grid grid-cols-1 ${innerGrid} gap-5`}>
        {items.map((p, i) => (
          <PropertyPanel
            key={p.id}
            property={p}
            index={i}
            attr={attr}
            focused={i === Math.min(focus, items.length - 1)}
            onFocus={() => setFocus(i)}
            configWinners={configWinners}
            superWinner={superWinner === i}
            carpetWinner={carpetWinner === i}
          />
        ))}
      </div>
    </div>
  );
}

function PropertyPanel({
  property: p,
  index,
  attr,
  focused,
  onFocus,
  configWinners,
  superWinner,
  carpetWinner,
}: {
  property: Property;
  index: number;
  attr: AttrKey;
  focused: boolean;
  onFocus: () => void;
  configWinners: Record<string, number | null>;
  superWinner: boolean;
  carpetWinner: boolean;
}) {
  const letter = String.fromCharCode(65 + index);
  return (
    <motion.article
      onMouseEnter={onFocus}
      onClick={onFocus}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col overflow-hidden rounded-[24px] border bg-gradient-to-b from-soft-black/80 to-lux-black/50 transition-all duration-500 cursor-pointer ${
        focused
          ? "border-champagne/55 shadow-[0_30px_80px_-40px_rgba(200,164,93,0.45)]"
          : "border-champagne/15 hover:border-champagne/35"
      }`}
    >
      {/* Panel header */}
      <header className="flex items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-champagne/15">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`grid h-9 w-9 place-items-center rounded-full text-[12px] tracking-luxury transition-colors ${focused ? "bg-champagne text-lux-black" : "border border-champagne/30 text-champagne"}`}>
            {letter}
          </div>
          <div className="min-w-0">
            <p className="font-display text-[18px] text-ivory leading-tight truncate">{p.name}</p>
            <p className="text-[11px] tracking-luxury uppercase text-muted-foreground truncate">{p.developer}</p>
          </div>
        </div>
        {focused && (
          <span className="text-[10px] tracking-[0.3em] uppercase text-champagne whitespace-nowrap">In Focus</span>
        )}
      </header>

      {/* Animated body — switches with attribute */}
      <div className="relative px-6 py-6 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={attr}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {attr === "residences" && (
              <dl className="space-y-0">
                {CONFIG_KEYS.map((k) => {
                  const cfg = p.configurations[k as ConfigKey];
                  const isWinner = configWinners[k] === index;
                  return (
                    <div key={k} className="flex items-start justify-between gap-3 py-3 border-b border-dashed border-champagne/12 last:border-b-0">
                      <dt className="text-[13px] tracking-luxury uppercase text-muted-foreground pt-1">{k}</dt>
                      <dd className="text-right">
                        {cfg ? (
                          <>
                            <p className={`font-display text-[22px] leading-tight ${isWinner ? "text-champagne" : "text-ivory"}`}>
                              {cfg.area ?? "—"} <span className="text-[12px] text-muted-foreground">sq ft</span>
                            </p>
                            {cfg.carpet && <p className="text-[12px] text-muted-foreground">carpet {cfg.carpet} sq ft</p>}
                            <p className="text-[10px] tracking-luxury text-champagne/70 mt-0.5">(Approx.)</p>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[13px] text-muted-foreground/60">
                            <Minus className="h-3.5 w-3.5" /> n/a
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}

            {attr === "spaces" && (
              <div className="grid grid-cols-2 gap-4">
                <SpecBlock label="Super Built-up" value={p.superBuiltUpArea} winner={superWinner} />
                <SpecBlock label="Carpet Area" value={p.carpetArea} winner={carpetWinner} />
              </div>
            )}

            {attr === "location" && (
              <ul className="space-y-0">
                <LiRow label="Address" value={p.location} />
                <LiRow label="Possession" value={p.possession} />
                <LiRow label="Project Status" value={p.status} />
              </ul>
            )}

            {attr === "highlights" && (
              p.advantages?.length ? (
                <ul className="space-y-3">
                  {p.advantages.map((a, idx) => (
                    <li key={a} className="flex gap-3 text-[15px] text-ivory/90 leading-relaxed">
                      <span className="text-champagne text-[11px] tracking-luxury pt-1.5 min-w-[22px]">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-muted-foreground italic">No highlights listed.</p>
              )
            )}

            {attr === "amenities" && (
              <p className="text-[15px] italic text-ivory/90 leading-relaxed">
                All luxurious amenities are available — curated for an elevated everyday.
              </p>
            )}

            {attr === "verdict" && (
              p.expertNote ? (
                <blockquote className="relative pl-8 italic text-[15px] leading-relaxed text-ivory/95">
                  <span className="absolute left-0 -top-3 font-display text-5xl text-champagne leading-none">"</span>
                  {p.expertNote}
                </blockquote>
              ) : (
                <p className="text-[14px] text-muted-foreground italic">No verdict provided.</p>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function SpecBlock({
  label,
  value,
  winner,
}: {
  label: string;
  value: string | null | undefined;
  winner?: boolean;
}) {
  return (
    <div className={`rounded-xl px-4 py-4 border ${winner ? "border-champagne/45 bg-champagne/[0.07]" : "border-champagne/15 bg-lux-black/30"}`}>
      <p className="text-[11px] tracking-luxury uppercase text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-[22px] leading-tight ${winner ? "text-champagne" : "text-ivory"}`}>
        {value || "—"}
      </p>
      {value && <p className="mt-1 text-[10px] tracking-luxury text-champagne/70">(Approx.)</p>}
    </div>
  );
}

function LiRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <li className="flex items-start justify-between gap-3 py-3 border-b border-dashed border-champagne/12 last:border-b-0 text-[15px]">
      <span className="text-[12px] tracking-luxury uppercase text-muted-foreground pt-1">{label}</span>
      <span className="text-right text-ivory/90 max-w-[60%]">{v(value)}</span>
    </li>
  );
}




