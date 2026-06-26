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
    <div className="space-y-1">
      <div className="inline-flex items-center gap-1.5 text-[11px] tracking-luxury text-champagne">
        <Check className="h-3.5 w-3.5" /> Available
      </div>
      <div className="grid grid-cols-1 gap-0.5 text-[12.5px] text-ivory/85">
        {cfg.area && <div>Super: {cfg.area} sq ft</div>}
        {cfg.carpet && <div>Carpet: {cfg.carpet} sq ft</div>}
        {cfg.price && <div className="text-ivory">Price: ₹ {cfg.price} Cr</div>}
        {cfg.rate && <div className="text-muted-foreground">Rate: ₹ {cfg.rate}/sq ft</div>}
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
  { label: "Super Built-up Area", render: (p) => v(p.superBuiltUpArea) },
  { label: "Carpet Area", render: (p) => v(p.carpetArea) },
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
    render: (p) => (
      <div className="overflow-hidden rounded-2xl border border-champagne/15">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
    ),
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

function ComparisonGrid({ items }: { items: Property[] }) {
  const cols = items.length;
  const rows = buildRows();
  const gridCols =
    cols === 2 ? "md:grid-cols-[200px_1fr_1fr]" : "md:grid-cols-[200px_1fr_1fr_1fr]";

  // pre-compute per-row meta (winners + sameness)
  const rowMeta = rows.map((row) => {
    const label = row.label;
    const isConfig = (CONFIG_KEYS as string[]).includes(label);
    if (isConfig) {
      const key = label as ConfigKey;
      const cfgs = items.map((p) => p.configurations[key]);
      const areaWin = computeWinner(
        cfgs.map((c) => parseMaxNum(c?.area ?? null)),
        "high",
      );
      return { type: "config" as const, areaWin };
    }

    if (["Location", "Status", "Possession", "Developer", "Super Built-up Area", "Carpet Area"].includes(label)) {
      const vals = items.map((p) => {
        const r = row.render(p);
        return typeof r === "string" ? r.toLowerCase().trim() : null;
      });
      const allSame =
        vals.every((x) => x !== null) && vals.every((x) => x === vals[0]);
      return { type: "text" as const, allSame };
    }
    return { type: "other" as const };
  });

  return (
    <div className="overflow-hidden rounded-[24px] border border-champagne/20 bg-lux-black/40 shadow-[0_30px_80px_-40px_rgba(200,164,93,0.25)]">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-champagne/15 bg-soft-black/70 px-5 py-3 text-[10px] tracking-luxury text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 text-champagne">
          <GitCompareArrows className="h-3 w-3" /> Comparison Matrix
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Trophy className="h-3 w-3 text-champagne" /> Best in row
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TrendingDown className="h-3 w-3" /> Lower is better
        </span>
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3" /> Higher is better
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Equal className="h-3 w-3" /> Identical
        </span>
      </div>

      {/* Header — Project Name */}
      <div className={`hidden md:grid ${gridCols} border-b border-champagne/20 bg-gradient-to-b from-soft-black/80 to-soft-black/30`}>
        <div className="px-5 py-5 text-[10px] tracking-luxury text-muted-foreground">
          vs.
        </div>
        {items.map((p, i) => (
          <div
            key={p.id}
            className={`relative px-5 py-5 ${i > 0 ? "md:border-l md:border-champagne/15" : ""}`}
          >
            <div className="absolute left-0 right-0 top-0 mx-5 h-0.5 bg-gradient-to-r from-transparent via-champagne to-transparent opacity-60" />
            <p className="text-[10px] tracking-luxury text-champagne">
              Option {String.fromCharCode(65 + i)} · {p.status}
            </p>
            <p className="mt-1 font-display text-xl text-ivory line-clamp-1">{p.name}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{p.location}</p>
          </div>
        ))}
      </div>

      {rows.map((row, ri) => {
        const meta = rowMeta[ri];
        return (
          <div
            key={row.label}
            className={`grid grid-cols-1 ${gridCols} ${
              ri % 2 === 0 ? "bg-soft-black/40" : "bg-transparent"
            } border-b border-champagne/10 last:border-b-0`}
          >
            <div className="flex items-center justify-between gap-2 px-5 py-4 text-[11px] tracking-luxury text-champagne md:border-r md:border-champagne/15">
              <span className="uppercase">{row.label}</span>
              {meta.type === "text" && meta.allSame && (
                <span className="inline-flex items-center gap-1 rounded-full border border-ivory/15 px-2 py-0.5 text-[9px] text-muted-foreground">
                  <Equal className="h-2.5 w-2.5" /> Same
                </span>
              )}
              {meta.type === "config" && (
                <span className="text-[9px] text-muted-foreground normal-case tracking-normal">
                  comparing
                </span>
              )}
            </div>
            {items.map((p, ci) => {
              const isConfig = meta.type === "config";
              const cfg = isConfig ? p.configurations[row.label as ConfigKey] : undefined;
              return (
                <div
                  key={p.id}
                  className={`relative px-5 py-4 text-sm text-ivory/90 ${
                    ci > 0 ? "md:border-l md:border-champagne/10" : ""
                  }`}
                >
                  <div className="md:hidden mb-1 text-[10px] tracking-luxury text-muted-foreground">
                    Option {String.fromCharCode(65 + ci)} · {p.name}
                  </div>

                  {isConfig && cfg ? (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 text-[10px] tracking-luxury text-champagne">
                        <Check className="h-3 w-3" /> Available
                      </div>
                      <dl className="grid grid-cols-1 gap-1 text-[12.5px]">
                        {cfg.area && (
                          <StatRow
                            label="Super"
                            value={`${cfg.area} sq ft`}
                            isWinner={meta.areaWin?.idx === ci}
                            tone="high"
                          />
                        )}
                        {cfg.carpet && (
                          <StatRow label="Carpet" value={`${cfg.carpet} sq ft`} />
                        )}
                        {cfg.price && (
                          <StatRow
                            label="Price"
                            value={`₹ ${cfg.price} Cr`}
                            isWinner={meta.priceWin?.idx === ci}
                            tone="low"
                            emphasis
                          />
                        )}
                        {cfg.rate && (
                          <StatRow
                            label="Rate"
                            value={`₹ ${cfg.rate}/sq ft`}
                            isWinner={meta.rateWin?.idx === ci}
                            tone="low"
                            muted
                          />
                        )}
                      </dl>
                    </div>
                  ) : isConfig ? (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground/70">
                      <Minus className="h-3.5 w-3.5" /> Not Available
                    </span>
                  ) : (
                    row.render(p)
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function StatRow({
  label,
  value,
  isWinner,
  tone,
  emphasis,
  muted,
}: {
  label: string;
  value: string;
  isWinner?: boolean;
  tone?: "low" | "high";
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 -mx-2 ${
        isWinner
          ? "bg-champagne/10 ring-1 ring-champagne/40"
          : "ring-1 ring-transparent"
      }`}
    >
      <dt className="text-[10px] uppercase tracking-luxury text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`inline-flex items-center gap-1.5 ${
          muted ? "text-muted-foreground" : emphasis ? "text-ivory font-medium" : "text-ivory/90"
        }`}
      >
        {value}
        {isWinner && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-champagne/20 px-1.5 py-0.5 text-[9px] tracking-luxury text-champagne">
            {tone === "low" ? <TrendingDown className="h-2.5 w-2.5" /> : <TrendingUp className="h-2.5 w-2.5" />}
            Best
          </span>
        )}
      </dd>
    </div>
  );
}

