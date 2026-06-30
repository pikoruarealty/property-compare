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
        className="mb-14 max-w-3xl"
      >
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-champagne/60" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-champagne">
            {eyebrow}
          </p>
        </div>
        <h2 className="mt-5 font-display text-[34px] font-medium leading-[1.02] tracking-[-0.02em] text-ivory sm:text-[48px]">
          {title}
        </h2>
        {description && (
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">
            {description}
          </p>
        )}
      </motion.header>
      {children}
    </section>
  );
}
