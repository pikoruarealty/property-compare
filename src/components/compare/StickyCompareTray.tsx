import { useEffect, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { MAX_COMPARE, MIN_COMPARE, useCompareStore } from "@/stores/compare-store";
import { getPropertyById } from "@/data/properties";
import { useHydrated } from "@/hooks/use-hydrated";
import type { Property } from "@/types/property";

interface Props {
  /** Ref to the existing Comparison Suite section. The tray shows once this scrolls out of view. */
  watchRef: RefObject<HTMLElement | null>;
}

/**
 * Floating, sticky comparison tray. Second visual representation of the
 * existing compare store — does not own any state of its own.
 */
export function StickyCompareTray({ watchRef }: Props) {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const { selected: rawSelected, remove } = useCompareStore();
  const selected = hydrated ? rawSelected : [];

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = watchRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-68px 0px 0px 0px" }, // 68px = navbar height
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [watchRef]);

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
          className="fixed left-0 right-0 z-50 border-b border-[#C8A45D]/20 bg-[#121416]/90 backdrop-blur-xl"
          style={{ top: 68 }}
        >
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
            {/* Left label */}
            <p className="hidden whitespace-nowrap text-[10px] uppercase tracking-luxury text-champagne md:block">
              Comparison Suite · {items.length} / {MAX_COMPARE}
            </p>

            {/* Slots */}
            <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3">
              {slots.map((slot, i) => (
                <SlotPill
                  key={i}
                  slot={slot}
                  onRemove={() => slot && remove(slot.id)}
                />
              ))}
            </div>

            {/* Compare button */}
            <button
              type="button"
              aria-disabled={!ready}
              disabled={!ready}
              onClick={() => ready && navigate({ to: "/compare" })}
              className={[
                "whitespace-nowrap rounded-full border px-4 py-2 text-[10px] uppercase tracking-luxury transition",
                ready
                  ? "border-[#C8A45D] text-[#C8A45D] hover:bg-[#C8A45D]/10"
                  : "cursor-not-allowed border-[#C8A45D]/30 text-[#C8A45D]/40 opacity-50",
              ].join(" ")}
            >
              Compare
            </button>
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
    "flex h-9 w-[140px] items-center gap-2 rounded-full border border-dashed px-2 text-[11px] sm:w-[160px]";

  if (!slot) {
    return (
      <div
        className={`${base} border-[#C8A45D]/40 text-ivory/50`}
        aria-label="Empty comparison slot"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="truncate">Add a property</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${slot.name} from comparison`}
      className={`${base} group border-[#C8A45D]/60 text-ivory transition hover:border-[#C8A45D]`}
    >
      <img
        src={slot.image}
        alt=""
        className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
      />
      <span className="truncate text-left">{slot.name}</span>
    </button>
  );
}
