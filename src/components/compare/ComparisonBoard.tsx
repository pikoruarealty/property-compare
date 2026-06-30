import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, ChevronDown, Sparkles, Minus, Trophy, Info } from "lucide-react";
import { properties as allProperties, getPropertyById } from "@/data/properties";
import { MAX_COMPARE, MIN_COMPARE, useCompareStore } from "@/stores/compare-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { ConfigKey, Property } from "@/types/property";
import { CONFIG_KEYS } from "@/types/property";
import { toast } from "sonner";
import { PhotoSlideshow } from "@/components/compare/PhotoSlideshow";
import { useOnboarding } from "@/context/OnboardingContext";
import { allowedConfigKeys, matchesPreferences } from "@/lib/preference-filter";

const TERM_INFO: Record<string, { title: string; body: string }> = {
  Developer: {
    title: "Developer",
    body: "The real-estate company or builder responsible for designing, constructing, and delivering the project. The developer's track record influences build quality, on-time possession, and after-sales service.",
  },
  "Super Built-up": {
    title: "Super Built-up Area",
    body: "The total area you are charged for. It includes your carpet area, the thickness of walls, plus a proportionate share of common spaces such as lobbies, staircases, lifts, and clubhouse. Typically 20–35% larger than carpet area.",
  },
  Carpet: {
    title: "Carpet Area",
    body: "The actual usable floor area inside your apartment — measured wall-to-wall, excluding the thickness of outer walls. This is the space you can physically lay a carpet on. RERA mandates carpet area disclosure.",
  },
  Possession: {
    title: "Possession Date",
    body: "The committed date by which the developer will hand over the keys to the unit, ready for fit-out or move-in. Dates may shift based on construction progress, approvals, and RERA timelines.",
  },
  Status: {
    title: "Project Status",
    body: "Indicates the current construction stage — for example Under Construction, Nearing Possession, or Ready to Move. Ready projects offer immediate occupancy; under-construction projects often offer better pricing and customisation.",
  },
};

const DASH = "—";

export function ComparisonBoard() {
  const hydrated = useHydrated();
  const { quizAnswers } = useOnboarding();
  const { selected: rawSelected, toggle, remove, clear } = useCompareStore();
  const selected = hydrated ? rawSelected : [];
  const items = useMemo(
    () => selected.map((id) => getPropertyById(id)).filter(Boolean) as Property[],
    [selected],
  );
  const visibleConfigKeys = useMemo<ConfigKey[]>(() => {
    const allowed = allowedConfigKeys(quizAnswers);
    return allowed.length > 0 ? allowed : CONFIG_KEYS;
  }, [quizAnswers]);
  const pickable = useMemo(
    () => allProperties.filter((p) => matchesPreferences(p, quizAnswers)),
    [quizAnswers],
  );
  const slots: (Property | null)[] = Array.from({ length: MAX_COMPARE }, (_, i) => items[i] ?? null);
  const ready = items.length >= MIN_COMPARE;

  return (
    <section className="container-lux">
      <div className="rounded-2xl border border-border bg-card/40 p-5 sm:p-7">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Comparison · {items.length} / {MAX_COMPARE}
            </p>
            <h2 className="mt-1.5 font-display text-[24px] sm:text-[28px] leading-tight text-foreground">
              Compare residences
            </h2>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[11px] tracking-wide text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              <X className="h-3 w-3" /> Reset
            </button>
          )}
        </div>

        {/* Slot picker */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              pickable={pickable}
            />
          ))}
        </div>

        <AnimatePresence initial={false}>
          {ready ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <ComparisonGrid items={items} visibleConfigKeys={visibleConfigKeys} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center"
            >
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <p className="mt-2 text-[13px] text-muted-foreground">
                Add at least {MIN_COMPARE} properties to compare.
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
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={slot.image} alt={slot.name} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            onClick={() => onRemove(slot.id)}
            aria-label="Remove"
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-2.5 left-3 right-3 text-white">
            <p className="text-[9px] uppercase tracking-[0.24em] opacity-80">
              {String.fromCharCode(65 + index)}
            </p>
            <h3 className="mt-0.5 font-display text-[15px] leading-tight line-clamp-1">{slot.name}</h3>
            <p className="text-[11px] opacity-80 line-clamp-1">{slot.developer}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const available = allProperties.filter((p) => !currentSelected.includes(p.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="group flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-transparent px-6 py-8 text-center transition-colors hover:border-foreground/40 hover:bg-muted/30">
          <div className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground group-hover:text-foreground group-hover:border-foreground/40 transition-colors">
            <Plus className="h-4 w-4" />
          </div>
          <p className="text-[12px] text-foreground/80">Add property {String.fromCharCode(65 + index)}</p>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-[300px] rounded-xl border-border bg-popover p-1.5">
        {available.length === 0 ? (
          <p className="px-3 py-5 text-center text-xs text-muted-foreground">All properties added.</p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {available.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onPick(p.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
              >
                <img src={p.image} alt={p.name} className="h-10 w-14 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-foreground">{p.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{p.developer}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/* ---------------- helpers ---------------- */
const parseMaxNum = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const nums = String(s).replace(/,/g, "").match(/\d+(\.\d+)?/g);
  if (!nums) return null;
  return Math.max(...nums.map(parseFloat));
};
function bestIndex(values: (number | null)[]): number | null {
  const valid = values.map((v, i) => ({ v, i })).filter((x) => x.v !== null) as { v: number; i: number }[];
  if (valid.length < 2) return null;
  const max = Math.max(...valid.map((x) => x.v));
  const winners = valid.filter((x) => x.v === max);
  if (winners.length === valid.length) return null;
  return winners[0].i;
}

/* ---------------- grid ---------------- */
function ComparisonGrid({ items }: { items: Property[] }) {
  const cols = items.length;
  const gridTpl = cols === 2 ? "md:grid-cols-[200px_1fr_1fr]" : "md:grid-cols-[200px_1fr_1fr_1fr]";

  const configWinners: Record<string, number | null> = {};
  CONFIG_KEYS.forEach((k) => {
    configWinners[k] = bestIndex(items.map((p) => parseMaxNum(p.configurations[k as ConfigKey]?.area ?? null)));
  });
  const superWinner = bestIndex(items.map((p) => parseMaxNum(p.superBuiltUpArea)));
  const carpetWinner = bestIndex(items.map((p) => parseMaxNum(p.carpetArea)));

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background/40">
      {/* Header row */}
      <div className={`hidden md:grid ${gridTpl} border-b border-border bg-muted/30`}>
        <div className="px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          Attribute
        </div>
        {items.map((p, i) => (
          <div key={p.id} className={`px-4 py-3 ${i > 0 ? "border-l border-border" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-background text-[10px] font-medium">
                {String.fromCharCode(65 + i)}
              </span>
              <div className="min-w-0">
                <p className="font-display text-[14px] leading-tight text-foreground line-clamp-1">
                  {p.name}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">
                  {p.developer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile pills */}
      <div className="md:hidden flex flex-wrap gap-1.5 px-3 py-2.5 border-b border-border bg-muted/30">
        {items.map((p, i) => (
          <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-[11px]">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-foreground text-background text-[9px]">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="truncate max-w-[100px]">{p.name}</span>
          </span>
        ))}
      </div>

      <SectionLabel title="Identity" />
      <Row label="Developer" items={items} gridTpl={gridTpl} render={(p) => <Plain value={p.developer} />} />

      <SectionLabel title="Configurations" />
      {CONFIG_KEYS.map((k) => {
        const winnerIdx = configWinners[k];
        return (
          <Row
            key={k}
            label={k}
            items={items}
            gridTpl={gridTpl}
            render={(p, i) => {
              const cfg = p.configurations[k as ConfigKey];
              if (!cfg) return <NotAvail />;
              return (
                <Numeric
                  primary={cfg.area ?? DASH}
                  unit="sq ft"
                  secondary={cfg.carpet ? `carpet ${cfg.carpet}` : undefined}
                  isBest={winnerIdx === i}
                  propertyId={p.id}
                />
              );
            }}
          />
        );
      })}

      <SectionLabel title="Area" />
      <Row
        label="Super Built-up"
        items={items}
        gridTpl={gridTpl}
        render={(p, i) => <Numeric primary={p.superBuiltUpArea ?? DASH} isBest={superWinner === i} propertyId={p.id} />}
      />
      <Row
        label="Carpet"
        items={items}
        gridTpl={gridTpl}
        render={(p, i) => <Numeric primary={p.carpetArea ?? DASH} isBest={carpetWinner === i} propertyId={p.id} />}
      />

      <SectionLabel title="Location & Timeline" />
      <Row label="Address" items={items} gridTpl={gridTpl} render={(p) => <Plain value={p.location} />} />
      <Row label="Possession" items={items} gridTpl={gridTpl} render={(p) => <Plain value={p.possession} />} />
      <Row label="Status" items={items} gridTpl={gridTpl} render={(p) => <Plain value={p.status} />} />

      <SectionLabel title="Distinctions" />
      <Row
        label="Highlights"
        items={items}
        gridTpl={gridTpl}
        render={(p) =>
          p.advantages?.length ? (
            <ul className="space-y-1.5">
              {p.advantages.slice(0, 5).map((a, idx) => (
                <li key={a} className="flex gap-2 text-[13px] text-foreground/85 leading-snug">
                  <span className="text-muted-foreground text-[11px] pt-0.5 min-w-[16px]">
                    {idx + 1}.
                  </span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Plain value={null} />
          )
        }
      />
      <Row
        label="Amenities"
        items={items}
        gridTpl={gridTpl}
        render={() => <Plain value="All luxurious amenities available" italic />}
      />
      <Row
        label="Verdict"
        items={items}
        gridTpl={gridTpl}
        render={(p) =>
          p.expertNote ? (
            <p className="text-[13px] leading-relaxed text-foreground/85">"{p.expertNote}"</p>
          ) : (
            <Plain value={null} />
          )
        }
      />

      <SectionLabel title="Gallery" />
      <div className={`grid grid-cols-1 ${gridTpl}`}>
        <div className="hidden md:flex items-center px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground border-r border-border">
          Photo
        </div>
        {items.map((p, i) => (
          <div
            key={p.id}
            id={`gallery-${p.id}`}
            className={`p-2.5 scroll-mt-32 ${i > 0 ? "md:border-l md:border-border" : ""}`}
          >
            <div className="overflow-hidden rounded-lg aspect-[16/10] ring-1 ring-border transition-shadow [&.flash]:ring-2 [&.flash]:ring-foreground [&.flash]:shadow-lg">
              <PhotoSlideshow property={p} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- primitives ---------------- */
function SectionLabel({ title }: { title: string }) {
  return (
    <div className="px-4 py-2 bg-muted/40 border-y border-border">
      <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-medium">
        {title}
      </span>
    </div>
  );
}

function Row({
  label,
  items,
  gridTpl,
  render,
}: {
  label: string;
  items: Property[];
  gridTpl: string;
  render: (p: Property, i: number) => React.ReactNode;
}) {
  const info = TERM_INFO[label];
  const [open, setOpen] = useState(false);
  return (
    <div className={`grid grid-cols-1 ${gridTpl} border-b border-border last:border-b-0`}>
      <div className="px-4 py-3 md:border-r md:border-border bg-muted/10 flex flex-col items-start gap-2">
        <span className="font-display text-[14px] font-medium tracking-tight text-foreground">{label}</span>
        {info && (
          <>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] uppercase hover:opacity-85 transition-opacity shadow-sm"
              aria-label={`View more about ${label}`}
            >
              <Info className="h-3 w-3" />
              View more
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">{info.title}</DialogTitle>
                  <DialogDescription className="pt-2 text-[14px] leading-relaxed text-foreground/80">
                    {info.body}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
      {items.map((p, i) => (
        <div key={p.id} className={`px-4 py-2.5 ${i > 0 ? "md:border-l md:border-border" : ""}`}>
          <div className="md:hidden mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            {String.fromCharCode(65 + i)} · {p.name}
          </div>
          {render(p, i)}
        </div>
      ))}
    </div>
  );
}

function Plain({ value, italic }: { value: string | null | undefined; italic?: boolean }) {
  return (
    <p className={`text-[14px] leading-snug text-foreground ${italic ? "text-foreground/75" : ""}`}>
      {value ?? DASH}
    </p>
  );
}

function NotAvail() {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
      <Minus className="h-3 w-3" /> Not available
    </span>
  );
}

function Numeric({
  primary,
  unit,
  secondary,
  isBest,
  propertyId,
}: {
  primary: string;
  unit?: string;
  secondary?: string;
  isBest?: boolean;
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
      window.setTimeout(() => target.classList.remove("flash"), 1400);
    }
  };
  return (
    <div className="flex items-baseline gap-2">
      <p className={`font-display leading-tight ${isBest ? "text-foreground text-[18px]" : "text-foreground/90 text-[16px]"}`}>
        {primary}
        {unit && <span className="ml-1 text-[10px] text-muted-foreground tracking-wide">{unit}</span>}
      </p>
      {secondary && <span className="text-[11px] text-muted-foreground">· {secondary}</span>}
      <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wide">approx.</span>
      {isBest && (
        <button
          type="button"
          onClick={jumpToGallery}
          title="View gallery"
          className="ml-1 inline-flex items-center gap-1 rounded-full bg-foreground text-background px-1.5 py-0.5 text-[9px] tracking-wide font-medium hover:opacity-85 transition-opacity"
        >
          <Trophy className="h-2.5 w-2.5" /> Best
        </button>
      )}
    </div>
  );
}
