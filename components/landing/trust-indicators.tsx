
"use client";

import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from "@/lib/motion";

const companies = [
  { name: "Nexus Labs", icon: "N" },
  { name: "Void Studio", icon: "V" },
  { name: "Horizon AI", icon: "H" },
  { name: "CloudForge", icon: "C" },
  { name: "Spatial Inc", icon: "S" },
  { name: "Quantum Dev", icon: "Q" },
];

export function TrustIndicators() {
  return (
    <section className="border-t border-aether-border bg-aether-bg-elevated/30 py-12">
      <Container>
        <p className="mb-8 text-center text-sm font-medium text-aether-text-subtle uppercase tracking-widest">
          Trusted by innovative teams worldwide
        </p>
        <motion.div
          variants={STAGGER_CONTAINER_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8"
        >
          {companies.map((company) => (
            <motion.div
              key={company.name}
              variants={STAGGER_ITEM_VARIANTS}
              className="flex items-center gap-2.5 text-lg font-bold text-aether-text-muted/50 transition-colors duration-300 hover:text-aether-text-muted select-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aether-surface/60 text-xs font-black text-aether-text-muted/60 border border-aether-border/50">
                {company.icon}
              </div>
              {company.name}
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}