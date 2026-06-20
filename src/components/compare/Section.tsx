import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ id, eyebrow, title, description, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-[260px] py-20 sm:py-24">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 max-w-2xl"
      >
        <p className="text-[10px] tracking-luxury text-champagne">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl text-ivory sm:text-4xl">{title}</h2>
        {description && (
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">{description}</p>
        )}
      </motion.header>
      {children}
    </section>
  );
}
