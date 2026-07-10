import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Minus, Trophy, Info, MapPin, Check, Ruler, CalendarDays, Wallet, TrendingUp } from "lucide-react";
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
import { allowedConfigKeys, matchesPreferences, parseBudget } from "@/lib/preference-filter";

const TERM_INFO: Record<string, { title: string; body: string }> = {
  Developer: {
    title: "Developer",
    body: "A developer is a person or company that plans, builds, and sells projects such as residential apartments, commercial buildings, or townships.",
  },
  "Super Built-up": {
    title: "Super Built-up Area",
    body: "Super Built-up Area is the total area of a property, including the carpet area plus the proportionate share of common spaces such as lobbies, staircases, lifts, and amenities.",
  },
  Carpet: {
    title: "Carpet Area",
    body: "Carpet Area is the actual usable space inside your home—the area where you can walk, place furniture, and live. It does not include the thickness of walls or common areas like corridors, lifts, or staircases.",
  },
  Possession: {
    title: "Possession Date",
    body: "Possession is the date when the developer hands over the property to the buyer, allowing them to move in or start interior work.",
  },
  Status: {
    title: "Project Status",
    body: "Project Status shows the current stage of the property's construction, such as Under Construction, Nearing Possession, or Ready to Move.",
  },
};

const DASH = "—";

type RoomKey = "livingArea" | "kitchen" | "bedroom1" | "bedroom2" | "bedroom3" | "bedroom4" | "bedroom5";

function roomFieldsFor(k: ConfigKey): { key: RoomKey; label: string }[] {
  const bedroomCount: Record<ConfigKey, number> = {
    "4 BHK": 4,
    "5 BHK": 5,
    Penthouse: 5,
    Duplex: 4,
  };
  const n = bedroomCount[k] ?? 4;
  const bedroomKeys: RoomKey[] = ["bedroom1", "bedroom2", "bedroom3", "bedroom4", "bedroom5"];
  const bedrooms = bedroomKeys.slice(0, n).map((key, i) => ({
    key,
    label:
      i === 0
        ? "Master Bedroom 1"
        : i === 1
          ? "Master Bedroom 2"
          : `Bedroom ${i + 1}${n >= 4 && i === n - 1 ? " (Kids)" : ""}`,
  }));
  return [
    { key: "livingArea", label: "Living Area" },
    { key: "kitchen", label: "Kitchen" },
    ...bedrooms,
  ];
}

export function ComparisonBoard() {
  const hydrated = useHydrated();
  const { quizAnswers } = useOnboarding();
  const { selected: rawSelected, toggle, remove, clear } = useCompareStore();
  const selected = hydrated ? rawSelected : [];
  const items = useMemo(
    () => selected.map((id) => getPropertyById(id)).filter(Boolean) as Property[],
    [selected],
  );
  const filtered = useMemo(
    () => allProperties.filter((p) => matchesPreferences(p, quizAnswers)),
    [quizAnswers],
  );
  // Fallback to the full catalogue when preferences yield zero matches so
  // the picker is never empty — the user can still compare.
  const noMatches = Boolean(quizAnswers) && filtered.length === 0;
  const pickable = filtered.length > 0 ? filtered : allProperties;
  const { visibleConfigKeys, budgetStatus } = useMemo<{
    visibleConfigKeys: ConfigKey[];
    budgetStatus: Record<string, "in" | "above">;
  }>(() => {
    const allowed = allowedConfigKeys(quizAnswers);
    const budget = parseBudget(quizAnswers?.budgetSub || quizAnswers?.budgetRange);
    const allowedSet = new Set<ConfigKey>(allowed);

    // Include user's picked configs + every config the selected items offer.
    const set = new Set<ConfigKey>(allowed);
    for (const p of items) {
      for (const k of CONFIG_KEYS) {
        if (p.configurations[k]) set.add(k);
      }
    }
    const keys = (allowed.length === 0 || noMatches
      ? CONFIG_KEYS
      : CONFIG_KEYS.filter((k) => set.has(k))) as ConfigKey[];

    const status: Record<string, "in" | "above"> = {};
    for (const k of keys) {
      if (!budget || noMatches || allowed.length === 0) {
        status[k] = "in";
        continue;
      }
      if (allowedSet.has(k)) {
        status[k] = "in";
        continue;
      }
      const [, hi] = budget;
      let anyKnown = false;
      let anyInBudget = false;
      for (const p of items) {
        const priceStr = p.configurations[k]?.price ?? "";
        const m = priceStr.match(/[\d.]+/);
        const price = m ? parseFloat(m[0]) : null;
        if (price === null) continue;
        anyKnown = true;
        if (price <= hi + 0.5) {
          anyInBudget = true;
          break;
        }
      }
      status[k] = !anyKnown || anyInBudget ? "in" : "above";
    }
    return { visibleConfigKeys: keys, budgetStatus: status };
  }, [quizAnswers, noMatches, items]);
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

        {noMatches && (
          <div className="mb-4 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-[12px] text-muted-foreground">
            No residences match your current preferences — showing the full catalogue so you can still compare.
          </div>
        )}

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
              <ComparisonGrid items={items} visibleConfigKeys={visibleConfigKeys} budgetStatus={budgetStatus} />
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
  pickable,
}: {
  slot: Property | null;
  index: number;
  onRemove: (id: string) => void;
  onPick: (id: string) => void;
  currentSelected: string[];
  pickable: Property[];
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
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
          <button
            onClick={() => onRemove(slot.id)}
            aria-label="Remove"
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-foreground/55 text-background hover:bg-foreground/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-2.5 left-3 right-3 text-background">
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

  const available = pickable.filter((p) => !currentSelected.includes(p.id));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-transparent px-6 py-8 text-center transition-colors hover:border-foreground/40 hover:bg-muted/30"
      >
        <div className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground group-hover:text-foreground group-hover:border-foreground/40 transition-colors">
          <Plus className="h-4 w-4" />
        </div>
        <p className="text-[12px] text-foreground/80">Add property {String.fromCharCode(65 + index)}</p>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl border-border bg-popover p-0 sm:rounded-2xl overflow-visible max-h-[85vh]">
          <PropertyPicker
            available={available}
            indexLabel={String.fromCharCode(65 + index)}
            onPick={(id) => {
              onPick(id);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function PropertyPicker({
  available,
  indexLabel,
  onPick,
}: {
  available: Property[];
  indexLabel: string;
  onPick: (id: string) => void;
}) {
  if (available.length === 0) {
    return (
      <>
        <DialogHeader className="border-b border-border/60 px-6 pb-4 pt-6">
          <DialogTitle className="font-display text-[22px] text-foreground">All properties added</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            Remove one from your comparison to swap it out.
          </DialogDescription>
        </DialogHeader>
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">Nothing left to add.</p>
      </>
    );
  }

  return (
    <>
      <DialogHeader className="border-b border-border/60 px-6 pb-3 pt-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Select property {indexLabel}
            </p>
            <DialogTitle className="mt-1 font-display text-[20px] text-foreground">
              Choose from your matched residences
            </DialogTitle>
          </div>
          <p className="text-[11px] text-muted-foreground">{available.length} residences</p>
        </div>
        <DialogDescription className="sr-only">
          Scroll to browse residences and add one to your comparison.
        </DialogDescription>
      </DialogHeader>

      <div className="overflow-y-auto max-h-[calc(85vh-88px)] px-5 py-5 snap-y snap-mandatory scroll-smooth">
        <div className="flex flex-col gap-5">
          {available.map((p) => (
            <div key={p.id} className="snap-start">
              <PickerCard property={p} onPick={onPick} />
            </div>
          ))}
        </div>
      </div>

    </>
  );
}

function propertyImages(p: Property): string[] {
  const g = (p.gallery ?? {}) as unknown as Record<string, string>;
  const list = [p.image, g.livingRoom, g.masterBedroom, g.pool, g.clubhouse].filter(
    (s): s is string => Boolean(s),
  );
  return Array.from(new Set(list));
}

function PickerCard({ property: p, onPick }: { property: Property; onPick: (id: string) => void }) {
  const images = useMemo(() => propertyImages(p), [p]);
  const [idx, setIdx] = useState(0);
  const total = images.length;
  const go = (dir: 1 | -1) => setIdx((i) => (i + dir + total) % total);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg sm:flex-row sm:min-h-[48vh]">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:w-[55%]">
        <AnimatePresence initial={false} mode="sync">
          <motion.img

            key={images[idx]}
            src={images[idx]}
            alt={p.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </AnimatePresence>
        <span
          className="absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[8px] font-semibold tracking-luxury backdrop-blur-md"
          style={{ background: "var(--card)", color: "var(--foreground)" }}
        >
          {p.status}
        </span>
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-foreground/55 text-background transition hover:bg-foreground/80"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-foreground/55 text-background transition hover:bg-foreground/80"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Image ${i + 1}`}
                  className={`h-1 rounded-full transition-all ${
                    i === idx ? "w-4 bg-background" : "w-1.5 bg-background/50 hover:bg-background/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            <span className="inline-block h-px w-5 bg-champagne" /> {p.developer}
          </p>
          <h3 className="mt-2 font-display text-[22px] leading-[1.05] tracking-[-0.01em] text-foreground sm:text-[26px]">

            {p.name}
          </h3>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {p.configuration}
          </p>
        </div>

        <div className="space-y-2.5">
          <DetailRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={p.location} />
          <DetailRow icon={<Ruler className="h-3.5 w-3.5" />} label="Size" value={p.size} />
          <DetailRow icon={<CalendarDays className="h-3.5 w-3.5" />} label="Possession" value={p.possession} />
        </div>

        <button
          type="button"
          onClick={() => onPick(p.id)}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-3.5 text-[11px] font-semibold tracking-[0.26em] text-foreground transition hover:border-champagne hover:bg-champagne hover:text-lux-black"
        >
          <Plus className="h-3.5 w-3.5" /> ADD TO COMPARE
        </button>
      </div>

    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[12px] font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
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
function ComparisonGrid({
  items,
  visibleConfigKeys,
  budgetStatus,
}: {
  items: Property[];
  visibleConfigKeys: ConfigKey[];
  budgetStatus: Record<string, "in" | "above">;
}) {
  const cols = items.length;
  const gridTpl = cols === 2 ? "md:grid-cols-[200px_1fr_1fr]" : "md:grid-cols-[200px_1fr_1fr_1fr]";

  const configWinners: Record<string, number | null> = {};
  visibleConfigKeys.forEach((k) => {
    configWinners[k] = bestIndex(items.map((p) => parseMaxNum(p.configurations[k]?.area ?? null)));
  });
  const superWinner = bestIndex(items.map((p) => parseMaxNum(p.superBuiltUpArea)));
  const carpetWinner = bestIndex(items.map((p) => parseMaxNum(p.carpetArea)));

  const hasAnyStatus = Object.values(budgetStatus).some((v) => v === "above" || v === "in") &&
    visibleConfigKeys.some((k) => budgetStatus[k]);

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
      {visibleConfigKeys.map((k) => {
        const winnerIdx = configWinners[k];
        const status = budgetStatus[k];
        return (
          <Row
            key={k}
            label={k}
            sublabel={hasAnyStatus ? <BudgetTag status={status} /> : undefined}
            items={items}
            gridTpl={gridTpl}
            render={(p, i) => {
              const cfg = p.configurations[k as ConfigKey];
              if (!cfg) return <NotAvail />;
              return (
                <Numeric
                  primary={cfg.area ?? DASH}
                  unit="sq ft"
                  isBest={winnerIdx === i}
                  propertyId={p.id}
                />
              );
            }}
          />
        );
      })}

      <SectionLabel title="Room Dimensions" />
      {visibleConfigKeys.map((k) => (
        <RoomBlock
          key={`rooms-${k}`}
          configKey={k}
          items={items}
          gridTpl={gridTpl}
          status={budgetStatus[k] ?? "in"}
          showStatus={hasAnyStatus}
        />
      ))}

      <SectionLabel title="Total Area" />
      <Row
        label="Super Built-up"
        items={items}
        gridTpl={gridTpl}
        render={(p, i) => <Numeric primary={p.superBuiltUpArea ?? DASH} isBest={superWinner === i} propertyId={p.id} />}
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
  sublabel,
  items,
  gridTpl,
  render,
}: {
  label: string;
  sublabel?: React.ReactNode;
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
        {sublabel}
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
      <p className="font-display leading-tight text-foreground/90 text-[16px]">
        {primary}
        {unit && <span className="ml-1 text-[10px] text-muted-foreground tracking-wide">{unit}</span>}
      </p>
      {secondary && <span className="text-[11px] text-muted-foreground">· {secondary}</span>}
      <span className="text-[9px] text-muted-foreground/70 uppercase tracking-wide">approx.</span>
    </div>
  );
}
