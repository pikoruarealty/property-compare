import { motion } from "framer-motion";
import { Check, MapPin, Plus, Ruler, Calendar } from "lucide-react";
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

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group grid grid-cols-1 gap-5 overflow-hidden rounded-[28px] bg-card p-4 sm:grid-cols-[260px_1fr_auto] sm:items-center sm:gap-7 sm:p-5"
      style={{ border: "1px solid var(--glass-border)", contentVisibility: "auto", containIntrinsicSize: "240px" }}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] sm:aspect-[5/3]">
        <img
          src={property.image}
          alt={property.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <span className="glass absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] tracking-luxury text-champagne">
          {property.status}
        </span>
        <div className="absolute right-3 top-3">
          <FavoriteButton propertyId={property.id} propertyName={property.name} propertyImage={property.image} />
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] tracking-luxury text-muted-foreground">
          {property.configuration}
        </p>
        <h3 className="mt-1.5 font-display text-2xl text-ivory">{property.name}</h3>
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
          <span className="text-champagne">Price on Request</span>
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
