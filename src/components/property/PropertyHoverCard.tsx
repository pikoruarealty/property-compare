import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Ruler,
} from "lucide-react";
import type { Property } from "@/types/property";
import { FavoriteButton } from "@/components/property/FavoriteButton";

interface Props {
  property: Property;
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  slides: string[];
  slideIdx: number;
  onSlideChange: (i: number) => void;
  selectedFlag: boolean;
  atMax: boolean;
  onToggleCompare: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

const EXPANDED_HEIGHT = 460;
const EXTRA_WIDTH = 80; // px wider than row on each side combined
const EXTRA_LIFT = 12;

export function PropertyHoverCard({
  property,
  anchorRef,
  open,
  slides,
  slideIdx,
  onSlideChange,
  selectedFlag,
  atMax,
  onToggleCompare,
  onPointerEnter,
  onPointerLeave,
}: Props) {
  const [box, setBox] = useState<{
    top: number;
    left: number;
    width: number;
    originX: number;
    originY: number;
    initialScale: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const compute = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const width = Math.min(r.width + EXTRA_WIDTH, vw - 24);
      let left = r.left - (width - r.width) / 2;
      left = Math.min(Math.max(12, left), vw - width - 12);
      let top = r.top + r.height / 2 - EXPANDED_HEIGHT / 2 - EXTRA_LIFT;
      top = Math.min(Math.max(12, top), vh - EXPANDED_HEIGHT - 12);
      // anchor scale origin to the row's centre so the card grows out of it
      const anchorCx = r.left + r.width / 2;
      const anchorCy = r.top + r.height / 2;
      const originX = Math.min(100, Math.max(0, ((anchorCx - left) / width) * 100));
      const originY = Math.min(100, Math.max(0, ((anchorCy - top) / EXPANDED_HEIGHT) * 100));
      // proportional starting scale (uniform — no stretch)
      const initialScale = Math.max(
        0.82,
        Math.min(r.width / width, r.height / EXPANDED_HEIGHT),
      );
      setBox({ top, left, width, originX, originY, initialScale });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [open, anchorRef]);

  const go = (dir: 1 | -1) => {
    onSlideChange((slideIdx + dir + slides.length) % slides.length);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && box && (
        <motion.div
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          initial={{ opacity: 0, scale: box.initialScale }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: box.initialScale }}
          transition={{
            opacity: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            scale: { type: "spring", stiffness: 260, damping: 32, mass: 0.9 },
          }}
          className="pointer-events-auto fixed z-[80] hidden md:block"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: EXPANDED_HEIGHT,
            transformOrigin: `${box.originX}% ${box.originY}%`,
            willChange: "transform, opacity",
            borderRadius: 32,
            background: "var(--card)",
            backdropFilter: "blur(28px) saturate(140%)",
            border: "1px solid var(--glass-border)",
            boxShadow: "0 40px 100px -20px color-mix(in oklab, var(--foreground) 35%, transparent)",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "55% 45%",
            backfaceVisibility: "hidden",
            transform: "translateZ(0)",
            color: "var(--foreground)",
          }}
        >

          {/* LEFT — Image carousel */}
          <div className="relative h-full overflow-hidden">
            <AnimatePresence initial={false} mode="sync">
              <motion.img
                key={slides[slideIdx]}
                src={slides[slideIdx]}
                alt={property.name}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 40%, color-mix(in oklab, var(--card) 70%, transparent))" }} />

            <span className="glass absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] tracking-luxury text-champagne">
              {property.status}
            </span>
            <div className="absolute right-4 top-4 z-10">
              <FavoriteButton
                propertyId={property.id}
                propertyName={property.name}
                propertyImage={property.image}
              />
            </div>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-lux-black/60 p-2.5 text-ivory backdrop-blur-md transition hover:bg-champagne hover:text-lux-black"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-lux-black/60 p-2.5 text-ivory backdrop-blur-md transition hover:bg-champagne hover:text-lux-black"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to image ${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSlideChange(i);
                      }}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === slideIdx
                          ? "w-6 bg-champagne"
                          : "w-1.5 bg-ivory/40 hover:bg-ivory/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT — Details */}
          <div className="flex h-full flex-col justify-between p-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-champagne/90">
                {property.developer}
              </p>
              <h3 className="mt-3 font-display text-[34px] leading-tight text-ivory">
                {property.name}
              </h3>
              <p className="mt-2 text-[11px] tracking-luxury text-ivory/55">
                {property.configuration}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-ivory/70 line-clamp-3">
                {property.tagline}
              </p>
            </div>

            <div className="space-y-3 pt-6 text-sm text-ivory/85">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-champagne" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-champagne" />
                <span>{property.size}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-champagne" />
                <span>{property.possession}</span>
              </div>
            </div>

            <button
              onClick={onToggleCompare}
              disabled={atMax}
              className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs tracking-luxury transition-all duration-300 ${
                selectedFlag
                  ? "bg-champagne text-lux-black shadow-[0_10px_30px_-10px_rgba(200,164,93,0.6)]"
                  : atMax
                    ? "cursor-not-allowed bg-graphite text-muted-foreground"
                    : "gold-border text-champagne hover:bg-champagne hover:text-lux-black"
              }`}
            >
              {selectedFlag ? (
                <>
                  <Check className="h-4 w-4" /> Added to Compare
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add to Compare
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function useHoverIntent(delay = 220) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const enter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open || openTimer.current) return;
    openTimer.current = setTimeout(() => {
      setOpen(true);
      openTimer.current = null;
    }, delay);
  };

  const leave = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) return;
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, 140);
  };

  const closeNow = () => {
    clearTimers();
    setOpen(false);
  };

  useEffect(() => () => clearTimers(), []);

  // Close the hover card on any scroll/wheel/touchmove so it doesn't
  // float over the list while the user is browsing.
  useEffect(() => {
    if (!open) return;
    const handler = () => closeNow();
    window.addEventListener("scroll", handler, { passive: true, capture: true });
    window.addEventListener("wheel", handler, { passive: true });
    window.addEventListener("touchmove", handler, { passive: true });
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("wheel", handler);
      window.removeEventListener("touchmove", handler);
    };
  }, [open]);

  return { open, enter, leave, close: closeNow };
}
