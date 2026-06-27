import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, MapPin, Plus, Ruler, Calendar } from "lucide-react";
import type { Property } from "@/types/property";
import { MAX_COMPARE, useCompareStore } from "@/stores/compare-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/property/FavoriteButton";

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
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || hovered) return;
    const id = setInterval(() => {
      setSlideIdx((i) => (i + 1) % slides.length);
    }, 2000);
    return () => clearInterval(id);
  }, [slides.length, hovered]);

  const go = (dir: 1 | -1) => {
    setSlideIdx((i) => (i + dir + slides.length) % slides.length);
  };

  return (
    <motion.article
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      animate={{
        scale: hovered ? 1.025 : 1,
        y: hovered ? -4 : 0,
        boxShadow: hovered
          ? "0 30px 70px -20px rgba(0,0,0,0.55)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
      className="group relative grid grid-cols-1 gap-5 rounded-[28px] bg-card p-4 sm:grid-cols-[260px_1fr_auto] sm:items-center sm:gap-7 sm:p-5"
      style={{
        border: "1px solid var(--glass-border)",
        contentVisibility: "auto",
        containIntrinsicSize: "240px",
        transformOrigin: "center",
        transition: "border-color 0.4s ease",
        zIndex: hovered ? 5 : 1,
      }}
    >
      <motion.div
        animate={{ width: hovered ? 360 : 260 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative aspect-[16/10] overflow-hidden rounded-[20px] sm:aspect-[5/3]"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.img
            key={slides[slideIdx]}
            src={slides[slideIdx]}
            alt={property.name}
            loading="lazy"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: hovered ? 1.08 : 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }, scale: { duration: 0.9, ease: "easeOut" } }}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: hovered ? "brightness(1.06)" : "brightness(1)" }}
          />
        </AnimatePresence>

        <span className="glass absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] tracking-luxury text-champagne">
          {property.status}
        </span>
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton propertyId={property.id} propertyName={property.name} propertyImage={property.image} />
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
              className={`absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-lux-black/55 p-2 text-ivory backdrop-blur-md transition-all duration-300 ${
                hovered ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 -translate-x-1"
              } hover:bg-champagne hover:text-lux-black`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className={`absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-lux-black/55 p-2 text-ivory backdrop-blur-md transition-all duration-300 ${
                hovered ? "opacity-100 translate-x-0" : "pointer-events-none opacity-0 translate-x-1"
              } hover:bg-champagne hover:text-lux-black`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideIdx(i);
                  }}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === slideIdx ? "w-5 bg-champagne" : "w-1.5 bg-ivory/40 hover:bg-ivory/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>

      <div className="min-w-0">
        <p className="text-[10px] tracking-luxury text-muted-foreground">
          {property.configuration}
        </p>
        <motion.h3
          animate={{ scale: hovered ? 1.03 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left center" }}
          className="mt-1.5 font-display text-2xl text-ivory"
        >
          {property.name}
        </motion.h3>
        <p className="mt-0.5 text-[11px] tracking-luxury text-champagne">{property.developer}</p>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{property.tagline}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ivory/80">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-champagne" /> {property.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-champagne" /> {property.size}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-champagne" /> {property.possession}
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
  );
}
