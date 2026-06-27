import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/types/property";

interface Props {
  property: Property;
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onPointerEnterPanel?: () => void;
  onPointerLeavePanel?: () => void;
}

const PANEL_W = 720;
const PANEL_H = 360;
const GAP = 18;

export function PropertyHoverPreview({
  property,
  anchorRef,
  open,
  onPointerEnterPanel,
  onPointerLeavePanel,
}: Props) {
  const [pos, setPos] = useState<{ top: number; left: number; placement: "right" | "left" } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const compute = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const spaceRight = vw - r.right;
      const placement: "right" | "left" = spaceRight >= PANEL_W + GAP + 12 ? "right" : "left";
      let left =
        placement === "right" ? r.right + GAP : Math.max(12, r.left - GAP - PANEL_W);
      left = Math.min(Math.max(12, left), vw - PANEL_W - 12);
      let top = r.top + r.height / 2 - PANEL_H / 2;
      top = Math.min(Math.max(12, top), vh - PANEL_H - 12);
      setPos({ top, left, placement });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [open, anchorRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && pos && (
        <motion.aside
          role="dialog"
          aria-label={`${property.name} preview`}
          onPointerEnter={onPointerEnterPanel}
          onPointerLeave={onPointerLeavePanel}
          initial={{ opacity: 0, x: pos.placement === "right" ? 20 : -20, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: pos.placement === "right" ? 20 : -20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto fixed z-[80] hidden md:flex"
          style={{
            top: pos.top,
            left: pos.left,
            width: PANEL_W,
            height: PANEL_H,
            borderRadius: 28,
            background: "rgba(18,18,18,0.82)",
            backdropFilter: "blur(24px) saturate(140%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            overflow: "hidden",
          }}
        >
          <div className="relative h-full" style={{ width: "45%" }}>
            <motion.img
              src={property.image}
              alt={property.name}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ scale: 1 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 9, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[rgba(18,18,18,0.35)]" />
          </div>

          <div className="flex h-full flex-1 flex-col justify-between p-8" style={{ width: "55%" }}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-champagne/90">
                {property.developer}
              </p>
              <h3 className="mt-3 font-display text-[28px] leading-tight text-ivory">
                {property.name}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ivory/65 line-clamp-3">
                {property.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 text-[12px] text-ivory/80">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-champagne" />
                {property.location}
              </span>
              <span className="text-ivory/25">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-champagne" />
                {property.size}
              </span>
              <span className="text-ivory/25">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-champagne" />
                {property.possession}
              </span>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function useHoverIntent(delay = 250) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const enter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open) return;
    openTimer.current = setTimeout(() => setOpen(true), delay);
  };

  const leave = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => clearAll(), []);

  return { open, enter, leave };
}
