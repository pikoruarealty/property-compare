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

function ComparisonGrid({ items }: { items: Property[] }) {
  const cols = items.length;
  const rows = buildRows();
  const gridCols =
    cols === 2 ? "md:grid-cols-[220px_1fr_1fr]" : "md:grid-cols-[220px_1fr_1fr_1fr]";

  return (
    <div className="overflow-hidden rounded-[24px] border border-champagne/15 bg-lux-black/40">
      {/* Header — Project Name */}
      <div className={`hidden md:grid ${gridCols} border-b border-champagne/15 bg-soft-black/60`}>
        <div className="px-5 py-5 text-[10px] tracking-luxury text-muted-foreground">
          Project Name
        </div>
        {items.map((p) => (
          <div key={p.id} className="px-5 py-5">
            <p className="text-[10px] tracking-luxury text-champagne">{p.status}</p>
            <p className="mt-1 font-display text-xl text-ivory line-clamp-1">{p.name}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{p.location}</p>
          </div>
        ))}
      </div>

      {rows.map((row, ri) => (
        <div
          key={row.label}
          className={`grid grid-cols-1 ${gridCols} ${
            ri % 2 === 0 ? "bg-soft-black/40" : ""
          } border-b border-champagne/5 last:border-b-0`}
        >
          <div className="px-5 py-4 text-[11px] tracking-luxury text-champagne md:border-r md:border-champagne/10">
            {row.label}
          </div>
          {items.map((p) => (
            <div
              key={p.id}
              className={`px-5 py-4 text-sm text-ivory/90 ${row.emphasis ? "" : ""}`}
            >
              <div className="md:hidden mb-1 text-[10px] tracking-luxury text-muted-foreground">
                {p.name}
              </div>
              {row.render(p)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
