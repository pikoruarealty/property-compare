import { motion } from "framer-motion";
import { Diamond } from "lucide-react";
import type { Property } from "@/types/property";
import { Section } from "./Section";

export function AdvantagesSection({ properties }: { properties: Property[] }) {
  return (
    <Section
      id="advantages"
      eyebrow="Advantages"
      title="What sets each residence apart"
    >
      <div
        className="grid gap-2 sm:gap-6"
        style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(0, 1fr))` }}
      >
        {properties.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="gold-border rounded-2xl p-3 sm:rounded-[32px] sm:p-6"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-champagne sm:text-[10px] sm:tracking-luxury">Defining strengths</p>
            <h3 className="mt-2 font-display text-[14px] font-bold leading-tight tracking-[-0.02em] text-ivory sm:mt-3 sm:text-[28px]">{p.name}</h3>
            <ul className="mt-3 space-y-2.5 sm:mt-5 sm:space-y-4">
              {p.advantages.map((adv, idx) => (
                <li key={idx} className="flex gap-2 sm:gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-champagne/30 to-transparent text-champagne ring-1 ring-champagne/40 sm:mt-1 sm:h-8 sm:w-8">
                    <Diamond className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                  </span>
                  <p className="text-[11px] leading-relaxed text-ivory/85 sm:text-sm">{adv}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
