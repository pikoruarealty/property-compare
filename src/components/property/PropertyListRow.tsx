import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MapPin, Plus, Ruler, Calendar } from "lucide-react";
import type { Property } from "@/types/property";
import { MAX_COMPARE, useCompareStore } from "@/stores/compare-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useImagePrewarm } from "@/hooks/use-image-prewarm";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import {
  PropertyHoverCard,
  useHoverIntent,
} from "@/components/property/PropertyHoverCard";

interface Props {
  property: Property;
  index?: number;
}

export function PropertyListRow({ property, index = 0 }: Props) {
  const hydrated = useHydrated();
  const { isSelected, toggle, selected } = useCompareStore();
  const selectedFlag = hydrated && isSelected(property.id);
  const atMax = hydrated && selected.length >= MAX_COMPARE && !selectedFlag;

  const handleToggle = () => {
    const result = toggle(property.id);
    if (!result.ok && result.reason) toast.error(result.reason);
    else if (!selectedFlag) toast.success(`${property.name} added to compare`);
  };

  const slides = useMemo(() => {
    const g = property.gallery ?? ({} as Record<string, string>);
    const list = [
      property.image,
      g.livingRoom,
      g.masterBedroom,
      g.pool,
      g.clubhouse,
    ].filter((src): src is string => Boolean(src));
    return Array.from(new Set(list));
  }, [property]);

  const [slideIdx, setSlideIdx] = useState(0);
  const articleRef = useRef<HTMLElement>(null);
  const { open: hoverOpen, enter, leave } = useHoverIntent(220);
  useImagePrewarm(slides);

  useEffect(() => {
    if (slides.length <= 1 || hoverOpen) return;
    const id = setInterval(() => {
      setSlideIdx((i) => (i + 1) % slides.length);
    }, 2000);
    return () => clearInterval(id);
  }, [slides.length, hoverOpen]);

  return (
    <>
      <motion.article
        ref={articleRef as React.RefObject<HTMLElement>}
        onPointerEnter={enter}
        onPointerLeave={leave}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
        animate={{ opacity: hoverOpen ? 0.35 : 1 }}
        className="group grid grid-cols-1 gap-5 overflow-hidden rounded-2xl bg-card p-4 shadow-[var(--shadow-glass)] sm:grid-cols-[300px_minmax(0,1fr)_auto] sm:items-center sm:gap-7 sm:p-5"
        style={{ border: "1px solid var(--glass-border)", contentVisibility: "auto", containIntrinsicSize: "240px", transition: "opacity 0.3s ease" }}
      >
        <div className="media-frame relative aspect-[16/10] overflow-hidden rounded-xl sm:aspect-[5/3]">
          <AnimatePresence initial={false} mode="sync">
            <motion.img
              key={slides[slideIdx]}
              src={slides[slideIdx]}
              alt={property.name}
              loading="lazy"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <span className="glass absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] tracking-luxury text-foreground">
            {property.status}
          </span>
          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton propertyId={property.id} propertyName={property.name} propertyImage={property.image} />
          </div>
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-[3px] rounded-full transition-all duration-500 ${
                    i === slideIdx ? "w-4 bg-champagne" : "w-1 bg-ivory/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

          <div className="min-w-0 sm:border-l sm:border-border sm:pl-7">
          <p className="text-[10px] tracking-luxury text-muted-foreground">{property.configuration}</p>
          <h3 className="mt-2 font-display text-[28px] leading-tight text-ivory sm:text-[32px]">
            {property.name}
          </h3>
          <p className="mt-1 text-[11px] tracking-luxury text-muted-foreground">{property.developer}</p>
          <p className="mt-2 text-[14px] text-muted-foreground line-clamp-1">{property.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-foreground/85">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-foreground" /> {property.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5 text-foreground" /> {property.size}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-foreground" /> {property.possession}
            </span>
          </div>
        </div>


        <div className="flex sm:justify-end">
          <button
            onClick={handleToggle}
            disabled={atMax}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs tracking-luxury transition-all duration-300 ${
              selectedFlag
                ? "bg-champagne text-lux-black shadow-[0_10px_30px_-10px_rgba(200,164,93,0.6)]"
                : atMax
                  ? "cursor-not-allowed bg-graphite text-muted-foreground"
                  : "gold-border text-champagne hover:bg-champagne hover:text-lux-black"
            }`}
          >
            {selectedFlag ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add to Compare
              </>
            )}
          </button>
        </div>
      </motion.article>

      <PropertyHoverCard
        property={property}
        anchorRef={articleRef}
        open={hoverOpen}
        slides={slides}
        slideIdx={slideIdx}
        onSlideChange={setSlideIdx}
        selectedFlag={selectedFlag}
        atMax={atMax}
        onToggleCompare={handleToggle}
        onPointerEnter={enter}
        onPointerLeave={leave}
      />
    </>
  );
}
