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
   VARIANT 4 — Diff-Highlight Matrix
   - True comparison matrix: rows = attributes, columns = properties.
   - Identical values across the row are MUTED (gray, italic, "matches").
   - Unique / best values POP in champagne gold with a soft glow ring.
   - Large typography, prominent highlight chips, subtle motion on scan.
   ========================================================================= */

function ComparisonGrid({ items }: { items: Property[] }) {
  const cols = items.length;
  const gridTpl =
    cols === 2 ? "md:grid-cols-[260px_1fr_1fr]" : "md:grid-cols-[260px_1fr_1fr_1fr]";

  // Configuration area winners
  const configWinners: Record<string, number | null> = {};
  CONFIG_KEYS.forEach((k) => {
    const areas = items.map((p) => parseMaxNum(p.configurations[k as ConfigKey]?.area ?? null));
    configWinners[k] = computeWinner(areas, "high")?.idx ?? null;
  });
  const superWinner = computeWinner(items.map((p) => parseMaxNum(p.superBuiltUpArea)), "high")?.idx ?? null;
  const carpetWinner = computeWinner(items.map((p) => parseMaxNum(p.carpetArea)), "high")?.idx ?? null;

  // Diff helpers — true if all string values are equal (case-insensitive)
  const allSame = (vals: (string | null | undefined)[]) => {
    const cleaned = vals.map((x) => (x ?? "").trim().toLowerCase());
    return cleaned.every((x) => x.length > 0) && cleaned.every((x) => x === cleaned[0]);
  };
  const locSame = allSame(items.map((p) => p.location));
  const possSame = allSame(items.map((p) => p.possession));
  const statSame = allSame(items.map((p) => p.status));
  const devSame = allSame(items.map((p) => p.developer));

  // Diff counts for top-line summary
  const diffStats = (() => {
    let differs = 0;
    let identical = 0;
    let bests = 0;
    if (!locSame) differs++; else identical++;
    if (!possSame) differs++; else identical++;
    if (!statSame) differs++; else identical++;
    if (!devSame) differs++; else identical++;
    CONFIG_KEYS.forEach((k) => {
      if (configWinners[k] !== null) bests++;
    });
    if (superWinner !== null) bests++;
    if (carpetWinner !== null) bests++;
    return { differs, identical, bests };
  })();

  return (
    <div className="space-y-6">
      {/* Folio header + diff legend */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3">
          <span className="h-px w-12 bg-champagne/60" />
          <span className="text-[12px] tracking-[0.34em] uppercase text-champagne">
            Diff-Highlight Matrix
          </span>
          <span className="h-px w-12 bg-champagne/60" />
        </div>
        <h3 className="mt-4 font-display text-[36px] sm:text-[48px] leading-[1.05] text-ivory">
          Only the <span className="gold-text italic">differences</span> shine
        </h3>
        <p className="mt-3 text-[16px] text-muted-foreground max-w-2xl mx-auto">
          Identical values fade into the background. Unique and best-in-row values light up in gold so the choice writes itself.
        </p>

        {/* legend chips */}
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2.5">
          <LegendChip tone="best" icon={<Trophy className="h-3.5 w-3.5" />}>
            {diffStats.bests} best-in-row
          </LegendChip>
          <LegendChip tone="diff" icon={<GitCompareArrows className="h-3.5 w-3.5" />}>
            {diffStats.differs} differences
          </LegendChip>
          <LegendChip tone="same" icon={<Equal className="h-3.5 w-3.5" />}>
            {diffStats.identical} identical
          </LegendChip>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-hidden rounded-[28px] border border-champagne/25 bg-gradient-to-b from-soft-black/85 via-lux-black/55 to-soft-black/85 shadow-[0_40px_120px_-50px_rgba(200,164,93,0.35)]">
        {/* Sticky column headers */}
        <div className={`hidden md:grid ${gridTpl} border-b border-champagne/25 bg-soft-black/70 backdrop-blur`}>
          <div className="px-7 py-6 flex items-center">
            <span className="text-[12px] tracking-[0.34em] uppercase text-muted-foreground">Attribute</span>
          </div>
          {items.map((p, i) => (
            <div
              key={p.id}
              className={`relative px-6 py-6 ${i > 0 ? "border-l border-champagne/15" : ""}`}
            >
              <div className="absolute left-6 right-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-champagne to-transparent opacity-70" />
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-champagne text-lux-black font-display text-[16px]">
                  {String.fromCharCode(65 + i)}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[22px] sm:text-[24px] leading-tight text-ivory line-clamp-1">
                    {p.name}
                  </p>
                  <p className="text-[12px] tracking-luxury uppercase text-champagne/90 truncate">
                    {p.developer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile column headers — pills */}
        <div className="md:hidden flex flex-wrap gap-2 px-5 py-4 border-b border-champagne/20 bg-soft-black/60">
          {items.map((p, i) => (
            <span key={p.id} className="inline-flex items-center gap-2 rounded-full border border-champagne/30 px-3 py-1.5 text-[12px] text-ivory">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-champagne text-lux-black text-[10px] font-display">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-display truncate max-w-[120px]">{p.name}</span>
            </span>
          ))}
        </div>

        {/* === Section: Identity === */}
        <SectionLabel title="Identity" />
        <MatrixRow
          label="Developer"
          items={items}
          gridTpl={gridTpl}
          allSame={devSame}
          render={(p) => <PlainCell value={p.developer} muted={devSame} />}
        />

        {/* === Section: Residences === */}
        <SectionLabel title="Residences & Configurations" />
        {CONFIG_KEYS.map((k) => {
          const winnerIdx = configWinners[k];
          // identical if all configs have the same area string
          const areas = items.map((p) => p.configurations[k as ConfigKey]?.area ?? null);
          const same = areas.every((x) => x !== null) && areas.every((x) => x === areas[0]);
          const allMissing = areas.every((x) => x === null);
          return (
            <MatrixRow
              key={k}
              label={k}
              items={items}
              gridTpl={gridTpl}
              allSame={same}
              noneAvailable={allMissing}
              render={(p, i) => {
                const cfg = p.configurations[k as ConfigKey];
                if (!cfg) return <UnavailableCell />;
                const isWinner = winnerIdx === i;
                return (
                  <NumericCell
                    primary={cfg.area ?? "—"}
                    unit="sq ft"
                    secondary={cfg.carpet ? `carpet ${cfg.carpet} sq ft` : undefined}
                    isBest={isWinner}
                    isSame={same}
                    propertyId={p.id}
                  />
                );
              }}

            />
          );
        })}

        {/* === Section: Spaces & Scale === */}
        <SectionLabel title="Spaces & Scale" />
        <MatrixRow
          label="Super Built-up"
          items={items}
          gridTpl={gridTpl}
          allSame={allSame(items.map((p) => p.superBuiltUpArea))}
          render={(p, i) => (
            <NumericCell
              primary={p.superBuiltUpArea ?? "—"}
              isBest={superWinner === i}
              isSame={allSame(items.map((x) => x.superBuiltUpArea))}
              propertyId={p.id}
            />
          )}
        />
        <MatrixRow
          label="Carpet Area"
          items={items}
          gridTpl={gridTpl}
          allSame={allSame(items.map((p) => p.carpetArea))}
          render={(p, i) => (
            <NumericCell
              primary={p.carpetArea ?? "—"}
              isBest={carpetWinner === i}
              isSame={allSame(items.map((x) => x.carpetArea))}
              propertyId={p.id}
            />
          )}
        />


        {/* === Section: Location & Timeline === */}
        <SectionLabel title="Location & Timeline" />
        <MatrixRow
          label="Address"
          items={items}
          gridTpl={gridTpl}
          allSame={locSame}
          render={(p) => <PlainCell value={p.location} muted={locSame} />}
        />
        <MatrixRow
          label="Possession"
          items={items}
          gridTpl={gridTpl}
          allSame={possSame}
          render={(p) => <PlainCell value={p.possession} muted={possSame} highlight={!possSame} />}
        />
        <MatrixRow
          label="Project Status"
          items={items}
          gridTpl={gridTpl}
          allSame={statSame}
          render={(p) => <StatusCell value={p.status} muted={statSame} />}
        />

        {/* === Section: Distinctions === */}
        <SectionLabel title="Distinctions" />
        <MatrixRow
          label="Highlights"
          items={items}
          gridTpl={gridTpl}
          render={(p) =>
            p.advantages?.length ? (
              <ul className="space-y-2.5">
                {p.advantages.slice(0, 5).map((a, idx) => (
                  <li key={a} className="flex gap-3 text-[15px] text-ivory/90 leading-relaxed">
                    <span className="text-champagne text-[11px] tracking-luxury pt-1.5 min-w-[22px]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-[14px] text-muted-foreground italic">—</span>
            )
          }
        />
        <MatrixRow
          label="Amenities"
          items={items}
          gridTpl={gridTpl}
          allSame
          render={() => (
            <PlainCell value="All luxurious amenities available" muted italic />
          )}
        />
        <MatrixRow
          label="Editor's Verdict"
          items={items}
          gridTpl={gridTpl}
          render={(p) =>
            p.expertNote ? (
              <blockquote className="relative pl-7 italic text-[15px] leading-relaxed text-ivory/95">
                <span className="absolute left-0 -top-2 font-display text-4xl text-champagne leading-none">"</span>
                {p.expertNote}
              </blockquote>
            ) : (
              <span className="text-[14px] text-muted-foreground italic">—</span>
            )
          }
        />

        {/* === Section: Gallery === */}
        <SectionLabel title="Gallery" final />
        <div className={`grid grid-cols-1 ${gridTpl}`}>
          <div className="hidden md:flex items-center px-7 py-5 text-[13px] tracking-[0.32em] uppercase text-champagne border-r border-champagne/12">
            Photo
          </div>
          {items.map((p, i) => (
            <div
              key={p.id}
              id={`gallery-${p.id}`}
              className={`p-3 scroll-mt-32 ${i > 0 ? "md:border-l md:border-champagne/12" : ""}`}
            >
              <div className="overflow-hidden rounded-2xl aspect-[16/10] ring-1 ring-champagne/10 transition-shadow [&.flash]:ring-2 [&.flash]:ring-champagne [&.flash]:shadow-[0_0_60px_-10px_rgba(200,164,93,0.7)]">
                <PhotoSlideshow property={p} />
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

/* ---------------- Matrix primitives ---------------- */

function SectionLabel({ title, final }: { title: string; final?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-6 sm:px-7 py-4 bg-gradient-to-r from-champagne/10 via-champagne/5 to-transparent border-y border-champagne/20 ${
        final ? "" : ""
      }`}
    >
      <span className="text-[13px] tracking-[0.34em] uppercase text-champagne font-medium">
        {title}
      </span>
      <span className="h-px flex-1 bg-champagne/20" />
    </div>
  );
}

function MatrixRow({
  label,
  items,
  gridTpl,
  render,
  allSame,
  noneAvailable,
}: {
  label: string;
  items: Property[];
  gridTpl: string;
  render: (p: Property, i: number) => React.ReactNode;
  allSame?: boolean;
  noneAvailable?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      className={`grid grid-cols-1 ${gridTpl} border-b border-champagne/10 last:border-b-0 hover:bg-champagne/[0.02] transition-colors`}
    >
      <div className="flex items-center justify-between gap-2 px-6 sm:px-7 py-5 md:border-r md:border-champagne/12">
        <span className="text-[14px] sm:text-[15px] tracking-luxury uppercase text-ivory/95 font-medium">
          {label}
        </span>
        {allSame && !noneAvailable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ivory/5 border border-ivory/15 px-2.5 py-1 text-[10px] tracking-luxury text-muted-foreground">
            <Equal className="h-2.5 w-2.5" /> same
          </span>
        )}
        {!allSame && !noneAvailable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-champagne/10 border border-champagne/30 px-2.5 py-1 text-[10px] tracking-luxury text-champagne">
            <GitCompareArrows className="h-2.5 w-2.5" /> diff
          </span>
        )}
      </div>
      {items.map((p, i) => (
        <div key={p.id} className={`px-6 sm:px-7 py-5 ${i > 0 ? "md:border-l md:border-champagne/10" : ""}`}>
          <div className="md:hidden mb-2 text-[11px] tracking-luxury uppercase text-champagne/80">
            {String.fromCharCode(65 + i)} · {p.name}
          </div>
          {render(p, i)}
        </div>
      ))}
    </motion.div>
  );
}

function PlainCell({
  value,
  muted,
  italic,
  highlight,
}: {
  value: string | null | undefined;
  muted?: boolean;
  italic?: boolean;
  highlight?: boolean;
}) {
  const text = value ?? "—";
  if (highlight) {
    return (
      <span className="inline-flex items-center rounded-lg bg-champagne/10 ring-1 ring-champagne/35 px-3 py-1.5 text-[16px] text-ivory font-medium">
        {text}
      </span>
    );
  }
  return (
    <p className={`text-[16px] leading-relaxed ${muted ? "text-muted-foreground/80 italic" : "text-ivory"} ${italic ? "italic" : ""}`}>
      {text}
    </p>
  );
}

function StatusCell({ value, muted }: { value: string | null | undefined; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] tracking-luxury ${
        muted
          ? "bg-ivory/5 border border-ivory/15 text-muted-foreground"
          : "bg-champagne/15 border border-champagne/40 text-champagne"
      }`}
    >
      {value ?? "—"}
    </span>
  );
}

function NumericCell({
  primary,
  unit,
  secondary,
  isBest,
  isSame,
  propertyId,
}: {
  primary: string;
  unit?: string;
  secondary?: string;
  isBest?: boolean;
  isSame?: boolean;
  propertyId?: string;
}) {
  const jumpToGallery = () => {
    if (!propertyId) return;
    const el = document.getElementById(`gallery-${propertyId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const target = el.querySelector(":scope > div");
    if (target) {
      target.classList.add("flash");
      window.setTimeout(() => target.classList.remove("flash"), 1600);
    }
  };
  return (
    <div
      className={`relative inline-block rounded-xl px-4 py-3 ${
        isBest
          ? "bg-champagne/12 ring-1 ring-champagne/45 shadow-[0_0_30px_-10px_rgba(200,164,93,0.6)]"
          : isSame
          ? "bg-ivory/[0.03] ring-1 ring-ivory/10"
          : ""
      }`}
    >
      <p
        className={`font-display leading-tight ${
          isBest
            ? "text-champagne text-[26px] sm:text-[28px]"
            : isSame
            ? "text-muted-foreground italic text-[22px]"
            : "text-ivory text-[24px] sm:text-[26px]"
        }`}
      >
        {primary}
        {unit && <span className="ml-1.5 text-[12px] text-muted-foreground tracking-luxury">{unit}</span>}
      </p>
      {secondary && (
        <p className="mt-0.5 text-[12px] text-muted-foreground">{secondary}</p>
      )}
      <p className="mt-1 text-[10px] tracking-luxury text-champagne/70">(Approx.)</p>
      {isBest && (
        <button
          type="button"
          onClick={jumpToGallery}
          title="View gallery"
          aria-label="Jump to gallery for this property"
          className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full bg-champagne text-lux-black px-2 py-0.5 text-[10px] tracking-luxury font-medium shadow-md transition-transform hover:scale-105 hover:shadow-[0_0_20px_-2px_rgba(200,164,93,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-lux-black cursor-pointer"
        >
          <Trophy className="h-2.5 w-2.5" /> Best
        </button>
      )}
    </div>
  );
}


function UnavailableCell() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-ivory/[0.03] border border-ivory/10 px-3 py-1.5 text-[13px] text-muted-foreground/70 italic">
      <Minus className="h-3.5 w-3.5" /> Not Available
    </span>
  );
}

function LegendChip({
  tone,
  icon,
  children,
}: {
  tone: "best" | "diff" | "same";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const styles =
    tone === "best"
      ? "bg-champagne text-lux-black border-champagne"
      : tone === "diff"
      ? "bg-champagne/10 text-champagne border-champagne/40"
      : "bg-ivory/5 text-muted-foreground border-ivory/15";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] tracking-luxury ${styles}`}>
      {icon}
      {children}
    </span>
  );
}





