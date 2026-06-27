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
   VARIANT 2 — Stacked Attribute Cards (with split summary header)
   - Top: a single split-summary panel per property (image + identity card)
   - Below: each attribute (Residences, Spaces, Location, Possession,
     Highlights, Amenities, Verdict) is its OWN horizontal card,
     containing all selected properties side-by-side.
   - Apple-keynote feel: generous whitespace, hairline gold rules,
     champagne accent for the "best" cell.
   ========================================================================= */

function ComparisonGrid({ items }: { items: Property[] }) {
  const cols = items.length;
  const innerGrid = cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  // winners
  const configWinners: Record<string, number | null> = {};
  CONFIG_KEYS.forEach((k) => {
    const areas = items.map((p) => parseMaxNum(p.configurations[k as ConfigKey]?.area ?? null));
    configWinners[k] = computeWinner(areas, "high")?.idx ?? null;
  });
  const superWinner = computeWinner(items.map((p) => parseMaxNum(p.superBuiltUpArea)), "high")?.idx ?? null;
  const carpetWinner = computeWinner(items.map((p) => parseMaxNum(p.carpetArea)), "high")?.idx ?? null;

  return (
    <div className="space-y-6">
      {/* Folio header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3">
          <span className="h-px w-10 bg-champagne/60" />
          <span className="text-[10px] tracking-[0.32em] uppercase text-champagne">
            The Comparison Folio
          </span>
          <span className="h-px w-10 bg-champagne/60" />
        </div>
        <h3 className="mt-3 font-display text-3xl sm:text-4xl text-ivory">
          Side-by-side, <span className="gold-text italic">attribute by attribute</span>
        </h3>
      </div>

      {/* Split summary headers (one per property) */}
      <div className={`grid grid-cols-1 ${innerGrid} gap-5`}>
        {items.map((p, i) => (
          <SummaryCard key={p.id} property={p} index={i} />
        ))}
      </div>

      {/* Attribute cards */}
      <AttributeCard title="The Residences" eyebrow="Chapter I" hint="Configurations & areas">
        <div className={`grid grid-cols-1 ${innerGrid} divide-y md:divide-y-0 md:divide-x divide-champagne/12`}>
          {items.map((p, i) => (
            <div key={p.id} className="p-5 sm:p-6">
              <SummaryChip property={p} index={i} compact />
              <dl className="mt-4 space-y-0">
                {CONFIG_KEYS.map((k) => {
                  const cfg = p.configurations[k as ConfigKey];
                  const isWinner = configWinners[k] === i;
                  return (
                    <div key={k} className="flex items-start justify-between gap-3 py-2.5 border-b border-dashed border-champagne/12 last:border-b-0">
                      <dt className="text-[11px] tracking-luxury uppercase text-muted-foreground pt-1">{k}</dt>
                      <dd className="text-right">
                        {cfg ? (
                          <>
                            <p className={`font-display text-[17px] leading-tight ${isWinner ? "text-champagne" : "text-ivory"}`}>
                              {cfg.area ?? "—"} <span className="text-[10px] text-muted-foreground">sq ft</span>
                            </p>
                            {cfg.carpet && <p className="text-[10px] text-muted-foreground">carpet {cfg.carpet} sq ft</p>}
                            <p className="text-[9px] tracking-luxury text-champagne/70">(Approx.)</p>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                            <Minus className="h-3 w-3" /> n/a
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>
      </AttributeCard>

      <AttributeCard title="Spaces & Scale" eyebrow="Chapter II" hint="Super built-up vs carpet area">
        <div className={`grid grid-cols-1 ${innerGrid} divide-y md:divide-y-0 md:divide-x divide-champagne/12`}>
          {items.map((p, i) => (
            <div key={p.id} className="p-5 sm:p-6">
              <SummaryChip property={p} index={i} compact />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <SpecBlock label="Super Built-up" value={p.superBuiltUpArea} winner={superWinner === i} />
                <SpecBlock label="Carpet Area" value={p.carpetArea} winner={carpetWinner === i} />
              </div>
            </div>
          ))}
        </div>
      </AttributeCard>

      <AttributeCard title="Location & Timeline" eyebrow="Chapter III" hint="Address, possession & status">
        <div className={`grid grid-cols-1 ${innerGrid} divide-y md:divide-y-0 md:divide-x divide-champagne/12`}>
          {items.map((p, i) => (
            <div key={p.id} className="p-5 sm:p-6">
              <SummaryChip property={p} index={i} compact />
              <ul className="mt-4 space-y-0">
                <LiRow label="Address" value={p.location} />
                <LiRow label="Possession" value={p.possession} />
                <LiRow label="Project Status" value={p.status} />
              </ul>
            </div>
          ))}
        </div>
      </AttributeCard>

      <AttributeCard title="Considered Highlights" eyebrow="Chapter IV" hint="What sets each apart">
        <div className={`grid grid-cols-1 ${innerGrid} divide-y md:divide-y-0 md:divide-x divide-champagne/12`}>
          {items.map((p, i) => (
            <div key={p.id} className="p-5 sm:p-6">
              <SummaryChip property={p} index={i} compact />
              {p.advantages?.length ? (
                <ul className="mt-4 space-y-2.5">
                  {p.advantages.map((a, idx) => (
                    <li key={a} className="flex gap-3 text-[13px] text-ivory/85 leading-relaxed">
                      <span className="text-champagne text-[10px] tracking-luxury pt-1 min-w-[20px]">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[12px] text-muted-foreground">—</p>
              )}
            </div>
          ))}
        </div>
      </AttributeCard>

      <AttributeCard title="Amenities" eyebrow="Chapter V" hint="Lifestyle & wellness">
        <div className={`grid grid-cols-1 ${innerGrid} divide-y md:divide-y-0 md:divide-x divide-champagne/12`}>
          {items.map((p, i) => (
            <div key={p.id} className="p-5 sm:p-6">
              <SummaryChip property={p} index={i} compact />
              <p className="mt-4 text-[13px] italic text-ivory/85 leading-relaxed">
                All luxurious amenities are available — curated for an elevated everyday.
              </p>
            </div>
          ))}
        </div>
      </AttributeCard>

      <AttributeCard title="Editor's Verdict" eyebrow="Chapter VI" hint="The closing note">
        <div className={`grid grid-cols-1 ${innerGrid} divide-y md:divide-y-0 md:divide-x divide-champagne/12`}>
          {items.map((p, i) => (
            <div key={p.id} className="p-5 sm:p-6">
              <SummaryChip property={p} index={i} compact />
              {p.expertNote ? (
                <blockquote className="mt-4 relative pl-7 italic text-[13px] leading-relaxed text-ivory/95">
                  <span className="absolute left-0 -top-2 font-display text-4xl text-champagne leading-none">"</span>
                  {p.expertNote}
                </blockquote>
              ) : (
                <p className="mt-4 text-[12px] text-muted-foreground">—</p>
              )}
            </div>
          ))}
        </div>
      </AttributeCard>
    </div>
  );
}

/* ---------- Summary header (split panel) ---------- */
function SummaryCard({ property: p, index }: { property: Property; index: number }) {
  const letter = String.fromCharCode(65 + index);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[24px] border border-champagne/25 bg-gradient-to-br from-soft-black/80 to-lux-black/60 shadow-[0_30px_80px_-50px_rgba(200,164,93,0.35)]"
    >
      <div className="grid grid-cols-[42%_58%]">
        {/* LEFT — image */}
        <div className="relative h-full min-h-[180px]">
          <PhotoSlideshow property={p} />
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-lux-black/70 backdrop-blur px-2.5 py-0.5 text-[10px] tracking-luxury text-champagne border border-champagne/30">
            {letter}
          </div>
        </div>
        {/* RIGHT — identity */}
        <div className="flex flex-col justify-center px-5 py-4 border-l border-champagne/15">
          <p className="text-[9px] tracking-[0.32em] uppercase text-champagne/90 truncate">
            {p.developer || "—"}
          </p>
          <h4 className="mt-1 font-display text-[20px] leading-tight text-ivory italic line-clamp-2">
            {p.name}
          </h4>
          <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-1">{p.location}</p>
          <div className="mt-3 inline-flex items-center gap-2 self-start rounded-full border border-champagne/25 px-2.5 py-0.5 text-[9px] tracking-luxury text-champagne">
            {p.status}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Compact chip used at top of every attribute card column ---------- */
function SummaryChip({ property: p, index, compact }: { property: Property; index: number; compact?: boolean }) {
  const letter = String.fromCharCode(65 + index);
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-champagne/12">
      <div className="grid h-7 w-7 place-items-center rounded-full border border-champagne/30 text-[10px] tracking-luxury text-champagne">
        {letter}
      </div>
      <div className="min-w-0">
        <p className={`font-display text-ivory leading-tight truncate ${compact ? "text-[14px]" : "text-[16px]"}`}>
          {p.name}
        </p>
        <p className="text-[10px] tracking-luxury uppercase text-muted-foreground truncate">
          {p.developer}
        </p>
      </div>
    </div>
  );
}

/* ---------- Attribute card wrapper ---------- */
function AttributeCard({
  title,
  eyebrow,
  hint,
  children,
}: {
  title: string;
  eyebrow: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[24px] border border-champagne/20 bg-soft-black/40 backdrop-blur"
    >
      <header className="flex flex-wrap items-end justify-between gap-2 px-5 sm:px-6 pt-5 pb-4 border-b border-champagne/15">
        <div>
          <p className="text-[10px] tracking-[0.32em] uppercase text-champagne">{eyebrow}</p>
          <h4 className="mt-1 font-display text-[22px] sm:text-[24px] text-ivory">{title}</h4>
        </div>
        {hint && (
          <p className="text-[11px] tracking-luxury text-muted-foreground">{hint}</p>
        )}
      </header>
      {children}
    </motion.section>
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
    <div className={`rounded-lg px-3 py-3 border ${winner ? "border-champagne/40 bg-champagne/[0.06]" : "border-champagne/12 bg-lux-black/30"}`}>
      <p className="text-[10px] tracking-luxury uppercase text-muted-foreground">{label}</p>
      <p className={`mt-1.5 font-display text-[17px] leading-tight ${winner ? "text-champagne" : "text-ivory"}`}>
        {value || "—"}
      </p>
      {value && <p className="mt-0.5 text-[9px] tracking-luxury text-champagne/70">(Approx.)</p>}
    </div>
  );
}

function LiRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2.5 border-b border-dashed border-champagne/12 last:border-b-0 text-[13px]">
      <span className="text-[10px] tracking-luxury uppercase text-muted-foreground pt-1">{label}</span>
      <span className="text-right text-ivory/90 max-w-[60%]">{v(value)}</span>
    </li>
  );
}



