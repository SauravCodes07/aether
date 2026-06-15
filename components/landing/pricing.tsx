"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FADE_UP_VARIANTS,
  STAGGER_CONTAINER_SLOW,
  STAGGER_ITEM_VARIANTS,
  MICRO_INTERACTION_VARIANTS,
  MICRO_INTERACTION_TRANSITION,
} from "@/lib/motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals exploring Aether and personal projects.",
    features: ["1 workspace", "5 AI generations / day", "1 GB storage", "Basic 3D editor", "Community support"],
    missing: ["Real-time collaboration", "Custom domains", "Priority support", "SSO"],
    cta: "Get Started",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "For professionals building production spatial experiences.",
    features: ["20 workspaces", "500 AI generations / day", "100 GB storage", "Real-time collaboration", "Custom domains", "Version history", "Priority support"],
    missing: ["SSO"],
    cta: "Start Free Trial",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$79",
    period: "/ month",
    description: "For teams shipping spatial products at scale.",
    features: ["100 workspaces", "5,000 AI generations / day", "1 TB storage", "Real-time collaboration", "SSO (SAML/OIDC)", "Audit logs", "Dedicated support", "Advanced analytics"],
    missing: ["On-premise"],
    cta: "Start Team Trial",
    href: "/signup?plan=team",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Dedicated infrastructure, custom SLAs, and enterprise compliance.",
    features: ["Custom workspaces", "Unlimited AI generations", "Custom storage", "SSO (SAML/OIDC)", "Audit logs", "Dedicated support 24/7", "On-premise option", "Custom integrations", "99.9% SLA"],
    missing: [],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
];

const comparisonRows = [
  { label: "Workspaces", free: "1", pro: "20", team: "100", enterprise: "Custom" },
  { label: "AI Generations / Day", free: "5", pro: "500", team: "5,000", enterprise: "Unlimited" },
  { label: "Storage", free: "1 GB", pro: "100 GB", team: "1 TB", enterprise: "Custom" },
  { label: "Real-time Collaboration", free: "\u2717", pro: "\u2713", team: "\u2713", enterprise: "\u2713" },
  { label: "Custom Domains", free: "\u2717", pro: "\u2713", team: "\u2713", enterprise: "\u2713" },
  { label: "Version History", free: "7 days", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
  { label: "SSO", free: "\u2717", pro: "\u2717", team: "\u2713", enterprise: "\u2713" },
  { label: "Audit Logs", free: "\u2717", pro: "\u2717", team: "\u2713", enterprise: "\u2713" },
  { label: "Support", free: "Community", pro: "Priority", team: "Dedicated", enterprise: "24/7" },
  { label: "SLA", free: "\u2717", pro: "\u2717", team: "\u2717", enterprise: "99.9%" },
];

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <section id="pricing" className="relative section-padding border-t border-aether-border overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.04),transparent_50%)] pointer-events-none" />

      <Container className="relative z-10">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          variants={FADE_UP_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p className="label-sm mb-4">Pricing</p>
          <h2 className="heading-lg text-gradient-subtle mb-4">Simple, transparent pricing</h2>
          <p className="body-md">Start free. Scale when you are ready. No hidden fees, no surprises.</p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-10"
          variants={FADE_UP_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <span className={cn("text-sm", billing === "monthly" ? "text-aether-text" : "text-aether-text-muted")}>Monthly</span>
          <button
            type="button"
            className="relative h-7 w-12 rounded-full bg-aether-surface border border-aether-border transition-colors hover:border-aether-border-strong"
            onClick={() => setBilling((p) => (p === "monthly" ? "annual" : "monthly"))}
            aria-label={`Switch to ${billing === "monthly" ? "annual" : "monthly"} billing`}
          >
            <motion.span
              className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-gradient-to-r from-aether-accent to-aether-cyan shadow-aether-sm"
              animate={{ x: billing === "annual" ? 22 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </button>
          <span className={cn("text-sm", billing === "annual" ? "text-aether-text" : "text-aether-text-muted")}>
            Annual <span className="text-xs text-aether-success font-medium">Save 20%</span>
          </span>
        </motion.div>

        {/* Plan cards */}
        <motion.div
          className="grid gap-6 lg:grid-cols-4"
          variants={STAGGER_CONTAINER_SLOW}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={STAGGER_ITEM_VARIANTS}
              className={cn(
                "group relative flex flex-col rounded-aether-2xl border p-7 transition-all duration-500",
                plan.popular
                  ? "border-aether-accent/50 bg-aether-surface shadow-aether-lg shadow-aether-accent/5"
                  : "border-aether-border bg-aether-surface/30 hover:border-aether-border-strong hover:bg-aether-surface hover:shadow-aether-md",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-aether-accent to-aether-cyan px-4 py-1 text-xs font-semibold text-white shadow-aether-glow-accent">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="heading-md mb-1">{plan.name}</h3>
                <p className="body-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="heading-xl">{billing === "annual" && plan.price !== "$0" && plan.price !== "Custom" ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}` : plan.price}</span>
                  {plan.period && <span className="text-sm text-aether-text-muted">{plan.period}</span>}
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-aether-text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-aether-success" />
                    {f}
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-aether-text-subtle line-through opacity-50">
                    <X className="mt-0.5 h-4 w-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <motion.div variants={MICRO_INTERACTION_VARIANTS} whileHover="hover" whileTap="tap" transition={MICRO_INTERACTION_TRANSITION}>
                <Button
                  href={plan.href}
                  className={cn("w-full font-semibold", plan.popular && "bg-gradient-to-r from-aether-accent to-aether-cyan border-none text-white shadow-aether-glow-accent")}
                  size="lg"
                  variant={plan.popular ? "primary" : plan.name === "Enterprise" ? "outline" : "secondary"}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>

              <div className="absolute -inset-px -z-10 rounded-aether-2xl bg-gradient-to-b from-aether-accent/10 via-transparent to-aether-cyan/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>

        {/* Feature comparison table */}
        <motion.div
          className="mt-20"
          variants={FADE_UP_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h3 className="heading-md text-center mb-8">Compare plans in detail</h3>
          <div className="overflow-x-auto rounded-aether-xl border border-aether-border bg-aether-surface/20">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-aether-border">
                  <th className="px-5 py-4 text-left font-semibold text-aether-text">Feature</th>
                  <th className="px-5 py-4 text-center font-semibold">Free</th>
                  <th className="px-5 py-4 text-center font-semibold text-aether-accent-light">Pro</th>
                  <th className="px-5 py-4 text-center font-semibold">Team</th>
                  <th className="px-5 py-4 text-center font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.label} className={cn("border-b border-aether-border/50 transition-colors hover:bg-aether-surface/30", i % 2 === 0 && "bg-aether-surface/10")}>
                    <td className="px-5 py-3 text-aether-text-muted font-medium">{row.label}</td>
                    <td className="px-5 py-3 text-center">{row.free}</td>
                    <td className="px-5 py-3 text-center text-aether-accent-light">{row.pro}</td>
                    <td className="px-5 py-3 text-center">{row.team}</td>
                    <td className="px-5 py-3 text-center">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}