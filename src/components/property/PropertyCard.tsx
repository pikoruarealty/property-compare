import { motion } from "framer-motion";
import { Check, MapPin, Plus, Ruler } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Property } from "@/types/property";
import { useCompareStore, MAX_COMPARE } from "@/stores/compare-store";
import { toast } from "sonner";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { isSelected, toggle, selected } = useCompareStore();
  const selectedFlag = isSelected(property.id);
  const atMax = selected.length >= MAX_COMPARE && !selectedFlag;

  const handleToggle = () => {
    const result = toggle(property.id);
    if (!result.ok && result.reason) toast.error(result.reason);
    else if (!selectedFlag) toast.success(`${property.name} added to compare`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[32px] bg-card hover-lift"
      style={{ border: "1px solid var(--glass-border)" }}
    >
      <Link to="/" className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.image}
            alt={property.name}
            loading="lazy"
            width={1280}
            height={896}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lux-black via-lux-black/30 to-transparent" />
          <div className="absolute top-5 left-5">
            <span className="glass rounded-full px-4 py-1.5 text-[11px] tracking-luxury text-champagne">
              {property.status}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-7">
        <p className="text-[10px] tracking-luxury text-muted-foreground">{property.configuration}</p>
        <h3 className="mt-2 font-display text-2xl text-ivory">{property.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{property.tagline}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ivory/80">
          <span className="inline-flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5 text-champagne" /> {property.size}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-champagne" /> {property.location}
          </span>
        </div>

        <button
          onClick={handleToggle}
          disabled={atMax}
          className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-xs tracking-luxury transition-all duration-300 ${
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
    </motion.article>
  );
}
