"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals exploring spatial computing.",
    cta: "Get Started",
    href: "/signup",
    popular: false,
    features: [
      "1 workspace",
      "3 projects per workspace",
      "1 GB storage",
      "50 AI generations/month",
      "10 deployments/month",
      "Basic canvas tools",
      "Community support",
    ],
    missing: ["Custom domain", "SSO", "Priority support", "Team collaboration"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professional developers building production applications.",
    cta: "Start Pro Trial",
    href: "/signup?plan=pro",
    popular: true,
    features: [
      "5 workspaces",
      "20 projects per workspace",
      "25 GB storage",
      "500 AI generations/month",
      "100 deployments/month",
      "Full canvas tools",
      "Real-time collaboration",
      "Priority support",
      "Custom domain",
      "Analytics dashboard",
    ],
    missing: ["SSO"],
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    description: "For teams that need collaboration and advanced features.",
    cta: "Start Team Trial",
    href: "/signup?plan=team",
    popular: false,
    features: [
      "20 workspaces",
      "Unlimited projects",
      "100 GB storage",
      "2,000 AI generations/month",
      "500 deployments/month",
      "Full canvas + 3D tools",
      "Real-time collaboration",
      "Team management",
      "Priority support",
      "Custom domain",
      "SSO (SAML/OIDC)",
      "Audit logs",
      "Analytics + Cost matrix",
    ],
    missing: [],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Dedicated infrastructure, SLA, and enterprise compliance.",
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
    features: [
      "Unlimited workspaces",
      "Unlimited projects",
      "500 GB storage",
      "10,000 AI generations/month",
      "Unlimited deployments",
      "Full canvas + 3D + AR tools",
      "Real-time collaboration",
      "Team + Role management (RBAC)",
      "Dedicated support (24/7)",
      "Custom domain",
      "SSO (SAML/OIDC)",
      "Audit logs",
      "Advanced analytics",
      "Custom integrations",
      "SLA (99.9% uptime)",
      "On-premise option",
    ],
    missing: [],
  },
];

const featuresComparison = [
  { label: "Workspaces", starter: "1", pro: "5", team: "20", enterprise: "Unlimited" },
  { label: "Projects / Workspace", starter: "3", pro: "20", team: "Unlimited", enterprise: "Unlimited" },
  { label: "Storage", starter: "1 GB", pro: "25 GB", team: "100 GB", enterprise: "500 GB" },
  { label: "AI Generations", starter: "50/mo", pro: "500/mo", team: "2,000/mo", enterprise: "10,000/mo" },
  { label: "Deployments", starter: "10/mo", pro: "100/mo", team: "500/mo", enterprise: "Unlimited" },
  { label: "Canvas Tools", starter: "Basic", pro: "Full", team: "Full + 3D", enterprise: "Full + 3D + AR" },
  { label: "Collaboration", starter: "✗", pro: "✔", team: "✔", enterprise: "✔" },
  { label: "Custom Domain", starter: "✗", pro: "✔", team: "✔", enterprise: "✔" },
  { label: "SSO", starter: "✗", pro: "✗", team: "✔", enterprise: "✔" },
  { label: "Audit Logs", starter: "✗", pro: "✗", team: "✔", enterprise: "✔" },
  { label: "Support", starter: "Community", pro: "Priority", team: "Priority", enterprise: "Dedicated 24/7" },
  { label: "SLA", starter: "✗", pro: "✗", team: "✗", enterprise: "99.9%" },
];

export function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <div>
      {/* Billing toggle */}
      <motion.div
        className="flex items-center justify-center gap-3 mb-12"
        variants={FADE_UP_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        <span className={cn("text-sm", billingCycle === "monthly" ? "text-aether-text" : "text-aether-text-muted")}>
          Monthly
        </span>
        <button
          type="button"
          className="relative h-7 w-12 rounded-full bg-aether-surface border border-aether-border transition-colors hover:border-aether-border-strong"
          onClick={() => setBillingCycle((p) => (p === "monthly" ? "annual" : "monthly"))}
          aria-label={`Switch to ${billingCycle === "monthly" ? "annual" : "monthly"} billing`}
        >
          <motion.span
            className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-gradient-to-r from-aether-accent to-aether-cyan shadow-aether-sm"
            animate={{ x: billingCycle === "annual" ? 22 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </button>
        <span className={cn("text-sm", billingCycle === "annual" ? "text-aether-text" : "text-aether-text-muted")}>
          Annual <span className="text-xs text-aether-success font-medium">Save 20%</span>
        </span>
      </motion.div>

      {/* Pricing cards */}
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
              "relative flex flex-col rounded-aether-2xl border p-8 transition-all duration-300",
              plan.popular
                ? "border-aether-accent/40 bg-aether-surface shadow-aether-lg shadow-aether-accent/5"
                : "border-aether-border bg-aether-surface/40 hover:border-aether-border-strong hover:bg-aether-surface hover:shadow-aether-md",
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
                <span className="heading-xl">{plan.price}</span>
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
              <Link href={plan.href}>
                <Button
                  className={cn(
                    "w-full font-semibold",
                    plan.popular
                      ? "bg-gradient-to-r from-aether-accent to-aether-cyan border-none text-white shadow-aether-glow-accent"
                      : plan.name === "Enterprise"
                        ? "border-aether-accent/30 text-aether-accent hover:bg-aether-accent/10"
                        : "",
                  )}
                  variant={plan.popular ? "primary" : plan.name === "Enterprise" ? "outline" : "secondary"}
                  size="lg"
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
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
        <h2 className="heading-lg text-center mb-10">Compare Plans</h2>
        <div className="overflow-x-auto rounded-aether-xl border border-aether-border bg-aether-surface/30">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-aether-border">
                <th className="px-6 py-4 text-left font-semibold">Feature</th>
                <th className="px-6 py-4 text-center font-semibold">Starter</th>
                <th className="px-6 py-4 text-center font-semibold">Pro</th>
                <th className="px-6 py-4 text-center font-semibold">Team</th>
                <th className="px-6 py-4 text-center font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {featuresComparison.map((row, i) => (
                <tr key={row.label} className={cn("border-b border-aether-border/50", i % 2 === 0 && "bg-aether-surface/20")}>
                  <td className="px-6 py-3.5 text-aether-text-muted">{row.label}</td>
                  <td className="px-6 py-3.5 text-center">{row.starter}</td>
                  <td className="px-6 py-3.5 text-center">{row.pro}</td>
                  <td className="px-6 py-3.5 text-center">{row.team}</td>
                  <td className="px-6 py-3.5 text-center">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}