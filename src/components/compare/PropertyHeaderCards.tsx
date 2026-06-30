import { motion } from "framer-motion";
import { MapPin, Ruler } from "lucide-react";
import type { Property } from "@/types/property";

interface PropertyHeaderCardsProps {
  properties: Property[];
}

export function PropertyHeaderCards({ properties }: PropertyHeaderCardsProps) {
  return (
    <div className="sticky top-[68px] z-30 -mx-6 border-y border-[var(--glass-border)] bg-lux-black/70 px-6 py-5 backdrop-blur-2xl">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(0, 1fr))` }}
      >
        {properties.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="group overflow-hidden rounded-3xl gold-border"
          >
            <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/7]">
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-soft-black via-soft-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="glass rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-champagne">
                  {p.status}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="truncate font-display text-[18px] font-medium leading-tight tracking-[-0.01em] text-ivory sm:text-[22px]">
                {p.name}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Ruler className="h-3 w-3 text-champagne" /> {p.size}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0 text-champagne" />
                  <span className="truncate">{p.location}</span>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
