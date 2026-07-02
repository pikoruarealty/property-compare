import { useEffect, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { MAX_COMPARE, MIN_COMPARE, useCompareStore } from "@/stores/compare-store";
import { getPropertyById } from "@/data/properties";
import { useHydrated } from "@/hooks/use-hydrated";
import type { Property } from "@/types/property";

interface Props {
  /** Ref to a section above the tray's active zone. Tray shows once this scrolls out of view. */
  watchRef: RefObject<HTMLElement | null>;
  /** Optional ref — once this section enters the viewport, the tray hides. */
  hideRef?: RefObject<HTMLElement | null>;
  /** Called when the user clicks Compare with >= MIN_COMPARE slots filled. */
  onCompare?: () => void;
  /** Called when the user clicks an empty "Add a property" slot. */
  onAdd?: () => void;
}

/**
 * Floating, sticky comparison tray. Second visual representation of the
 * existing compare store — does not own any state of its own.
 */
export function StickyCompareTray({ watchRef, hideRef, onCompare }: Props) {
  const hydrated = useHydrated();
  const { selected: rawSelected, remove } = useCompareStore();
  const selected = hydrated ? rawSelected : [];

  const [pastHero, setPastHero] = useState(false);
  const [reachedHide, setReachedHide] = useState(false);

  useEffect(() => {
    const el = watchRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-68px 0px 0px 0px" }, // 68px = navbar height
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [watchRef]);

  useEffect(() => {
    const el = hideRef?.current;
    if (!el) {
      setReachedHide(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setReachedHide(entry.isIntersecting),
      { threshold: 0, rootMargin: "-68px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hideRef]);

  const visible = pastHero && !reachedHide;


  const items = selected
    .map((id) => getPropertyById(id))
    .filter(Boolean) as Property[];
  const slots: (Property | null)[] = Array.from(
    { length: MAX_COMPARE },
    (_, i) => items[i] ?? null,
  );
  const ready = items.length >= MIN_COMPARE;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-compare-tray"
          aria-label="Comparison tray"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 right-0 z-50 border-b border-[color-mix(in_oklab,var(--brand)_30%,transparent)] bg-[var(--glass-bg)] backdrop-blur-xl"
          style={{ top: 68 }}
        >
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="whitespace-nowrap text-[10px] uppercase tracking-luxury text-champagne">
                Comparison Suite · {items.length} / {MAX_COMPARE}
              </p>
              <button
                type="button"
                aria-disabled={!ready}
                disabled={!ready}
                onClick={() => ready && onCompare?.()}
                className={[
                  "whitespace-nowrap rounded-full border px-5 py-2 text-[11px] uppercase tracking-luxury transition",
                  ready
                    ? "border-[var(--brand)] text-[var(--brand)] hover:bg-[color-mix(in_oklab,var(--brand)_12%,transparent)]"
                    : "cursor-not-allowed border-[color-mix(in_oklab,var(--brand)_35%,transparent)] text-[color-mix(in_oklab,var(--brand)_45%,transparent)] opacity-50",
                ].join(" ")}
              >
                Compare
              </button>
            </div>

            <div
              className={`grid gap-3 sm:gap-4 ${
                items.length === 2
                  ? "md:grid-cols-[220px_1fr_1fr]"
                  : "md:grid-cols-[220px_1fr_1fr_1fr]"
              } grid-cols-${MAX_COMPARE}`}
            >
              <div className="hidden md:block text-[10px] uppercase tracking-luxury text-muted-foreground self-center">
                Properties
              </div>
              {slots.map((slot, i) => (
                <SlotPill
                  key={i}
                  slot={slot}
                  onRemove={() => slot && remove(slot.id)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SlotPill({
  slot,
  onRemove,
}: {
  slot: Property | null;
  onRemove: () => void;
}) {
  const base =
    "flex h-14 w-full items-center gap-3 rounded-2xl border px-3 text-sm";

  if (!slot) {
    return (
      <div
        className={`${base} border-dashed border-[color-mix(in_oklab,var(--brand)_45%,transparent)] text-ivory/50`}
        aria-label="Empty comparison slot"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-dashed border-[color-mix(in_oklab,var(--brand)_45%,transparent)]">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <span className="truncate text-[12px] uppercase tracking-luxury">Add a property</span>
      </div>
    );
  }

  return (
    <div
      className={`${base} group border-[color-mix(in_oklab,var(--brand)_60%,transparent)] bg-soft-black/60 text-ivory transition hover:border-[var(--brand)]`}
    >
      <img
        src={slot.image}
        alt=""
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[15px] leading-tight">{slot.name}</p>
        <p className="truncate text-[10px] uppercase tracking-luxury text-muted-foreground">
          &nbsp;
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${slot.name} from comparison`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-champagne/30 text-ivory/70 transition hover:border-champagne hover:text-champagne hover:bg-champagne/10"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
