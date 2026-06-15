"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS, MICRO_INTERACTION_VARIANTS, MICRO_INTERACTION_TRANSITION } from "@/lib/motion";
import { ArrowUpRight, Activity, Server, Shield, Globe } from "lucide-react";

const footerGroups = [
  {
    title: "PRODUCT",
    links: [
      { label: "Workspace", href: "/workspace" }, { label: "Features", href: "/#features" }, { label: "Integrations", href: "/#integrations" }, { label: "Pricing", href: "/#pricing" }, { label: "Changelog", href: "#" }, { label: "Roadmap", href: "#" }
    ]
  },
  {
    title: "RESOURCES",
    links: [
      { label: "Documentation", href: "/docs" }, { label: "API Reference", href: "#" }, { label: "FAQ", href: "/#faq" }, { label: "Community", href: "#" }, { label: "Help Center", href: "#" }
    ]
  },
  {
    title: "COMPANY",
    links: [
      { label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#" }, { label: "Status", href: "#" }
    ]
  },
  {
    title: "LEGAL",
    links: [
      { label: "Privacy Policy", href: "#" }, { label: "Terms of Service", href: "#" }, { label: "Cookie Policy", href: "#" }, { label: "GDPR", href: "#" }
    ]
  }
];

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const isExternal = external ?? (href.startsWith("http") && !href.includes("localhost"));
  return (
    <motion.li variants={MICRO_INTERACTION_VARIANTS} whileHover="hover" whileTap="tap" transition={MICRO_INTERACTION_TRANSITION}>
      <Link href={href} className="group relative inline-flex items-center gap-1 text-sm text-aether-text-muted transition-all duration-300 hover:text-aether-text hover:translate-x-1" target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
        <span className="relative">{label}<span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-gradient-to-r from-aether-accent to-aether-cyan transition-all duration-300 group-hover:w-full" /></span>
        {isExternal && <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />}
      </Link>
    </motion.li>
  );
}

const statusMetrics = [
  { icon: Activity, label: "API Latency", value: "12ms", color: "text-aether-success" },
  { icon: Server, label: "Uptime", value: "99.99%", color: "text-aether-success" },
  { icon: Shield, label: "Security", value: "Operational", color: "text-aether-success" },
  { icon: Globe, label: "Regions", value: "12", color: "text-aether-cyan" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-aether-border overflow-hidden">
      {/* Ambient aurora background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-20 w-[600px] h-[400px] bg-aether-aurora-violet/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[350px] bg-aether-aurora-cyan/8 rounded-full blur-[100px]" />
      </div>

      {/* Top glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-aether-accent/30 to-transparent" />

      <Container className="relative z-10 py-16 lg:py-20">
        <motion.div variants={STAGGER_CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <motion.div variants={STAGGER_ITEM_VARIANTS} className="sm:col-span-2 lg:col-span-1">
            <div className="transition-all duration-300 hover:opacity-80"><Logo variant="footer" /></div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-aether-text-muted">{siteConfig.description}</p>
          </motion.div>

          {/* Link groups */}
          {footerGroups.map((group) => (
            <motion.div key={group.title} variants={STAGGER_ITEM_VARIANTS}>
              <h3 className="mb-4 text-[11px] font-semibold tracking-[0.2em] text-aether-text-subtle uppercase">
                <span className="relative">{group.title}<span className="absolute -bottom-1 left-0 h-[1px] w-6 bg-gradient-to-r from-aether-accent/40 to-transparent" /></span>
              </h3>
              <ul className="space-y-2.5">{group.links.map((link) => <FooterLink key={link.label} href={link.href} label={link.label} />)}</ul>
            </motion.div>
          ))}
        </motion.div>

        {/* System Status Bar — cinematic final scene element */}
        <motion.div variants={STAGGER_CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 rounded-aether-xl border border-aether-border/40 bg-aether-surface/20 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-aether-success shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse" />
            <span className="text-xs font-semibold text-aether-text-muted uppercase tracking-widest">System Status</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusMetrics.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <m.icon className="h-4 w-4 text-aether-text-subtle" />
                <div>
                  <p className="text-[10px] text-aether-text-subtle uppercase tracking-wider">{m.label}</p>
                  <p className={`text-sm font-semibold ${m.color}`}>{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-aether-border/50 pt-8 sm:flex-row">
          <p className="text-xs text-aether-text-subtle">&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href={siteConfig.links.github} className="text-xs text-aether-text-subtle transition-all duration-200 hover:text-aether-text hover:underline underline-offset-4" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/docs" className="text-xs text-aether-text-subtle transition-all duration-200 hover:text-aether-text hover:underline underline-offset-4">Documentation</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}