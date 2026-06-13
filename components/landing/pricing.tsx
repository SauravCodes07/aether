import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring Aether and personal projects.",
    features: [
      "1 workspace",
      "Basic 3D editor",
      "Community support",
      "5 AI generations / day",
      "1 GB storage",
    ],
    cta: "Get Started",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For professionals and growing teams building spatial experiences.",
    features: [
      "Unlimited workspaces",
      "Advanced 3D editor",
      "Real-time collaboration",
      "Unlimited AI generations",
      "100 GB storage",
      "Priority support",
      "Custom domains",
      "Version history",
    ],
    cta: "Start Free Trial",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per year",
    description: "For organizations requiring advanced security and scale.",
    features: [
      "Everything in Pro",
      "SSO & SAML",
      "Dedicated infrastructure",
      "Unlimited storage",
      "Custom SLA",
      "Dedicated support",
      "On-premise option",
      "Advanced analytics",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "#",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="section-padding border-t border-aether-border">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="label-sm mb-4">Pricing</p>
          <h2 className="heading-lg text-gradient-subtle mb-4">
            Simple, transparent pricing
          </h2>
          <p className="body-md">
            Start free. Scale when you&apos;re ready. No hidden fees.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:shadow-aether-lg ${
                plan.popular
                  ? "border-aether-accent/50 bg-aether-surface/30 shadow-aether-md"
                  : "border-aether-border bg-aether-surface/10 hover:border-aether-border-strong"
              }`}
            >
              {/* Most Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-aether-accent to-aether-cyan px-4 py-1 text-xs font-semibold text-white shadow-aether-sm">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="mb-2 text-lg font-semibold text-aether-text">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-aether-text">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-sm text-aether-text-muted">/ {plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-aether-text-muted">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-aether-text-muted">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-aether-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                href={plan.href}
                className="w-full"
                size="lg"
                variant={plan.popular ? "primary" : "outline"}
              >
                {plan.cta}
              </Button>

              {/* Hover glow for popular */}
              {plan.popular && (
                <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-b from-aether-accent/10 via-transparent to-aether-cyan/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              )}
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-24 hidden md:block">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h3 className="heading-md text-aether-text mb-4">Compare plans in detail</h3>
            <p className="body-md">Find the perfect plan for your spatial computing needs.</p>
          </div>
          
          <div className="overflow-hidden rounded-2xl border border-aether-border bg-aether-bg-elevated/50">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-aether-border bg-aether-surface/40">
                  <th className="p-6 font-semibold text-aether-text w-1/4">Feature</th>
                  <th className="p-6 font-semibold text-aether-text w-1/4 text-center">Free</th>
                  <th className="p-6 font-semibold text-aether-accent-light w-1/4 text-center">Pro</th>
                  <th className="p-6 font-semibold text-aether-text w-1/4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aether-border/50">
                <tr className="bg-aether-surface/20">
                  <td colSpan={4} className="p-4 font-medium text-aether-text-muted">Usage & Limits</td>
                </tr>
                <tr className="hover:bg-aether-surface/30 transition-colors">
                  <td className="p-4 pl-6 text-aether-text-muted">Workspaces</td>
                  <td className="p-4 text-center text-aether-text">1</td>
                  <td className="p-4 text-center text-aether-text">Unlimited</td>
                  <td className="p-4 text-center text-aether-text">Unlimited</td>
                </tr>
                <tr className="hover:bg-aether-surface/30 transition-colors">
                  <td className="p-4 pl-6 text-aether-text-muted">Cloud Storage</td>
                  <td className="p-4 text-center text-aether-text">1 GB</td>
                  <td className="p-4 text-center text-aether-text">100 GB</td>
                  <td className="p-4 text-center text-aether-text">Unlimited</td>
                </tr>
                <tr className="bg-aether-surface/20">
                  <td colSpan={4} className="p-4 font-medium text-aether-text-muted">Spatial Editor</td>
                </tr>
                <tr className="hover:bg-aether-surface/30 transition-colors">
                  <td className="p-4 pl-6 text-aether-text-muted">Real-time Collaboration</td>
                  <td className="p-4 text-center text-aether-text-muted">-</td>
                  <td className="p-4 text-center text-aether-text"><span className="text-aether-accent">✓</span></td>
                  <td className="p-4 text-center text-aether-text"><span className="text-aether-accent">✓</span></td>
                </tr>
                <tr className="hover:bg-aether-surface/30 transition-colors">
                  <td className="p-4 pl-6 text-aether-text-muted">Version History</td>
                  <td className="p-4 text-center text-aether-text">7 days</td>
                  <td className="p-4 text-center text-aether-text">Unlimited</td>
                  <td className="p-4 text-center text-aether-text">Unlimited</td>
                </tr>
                <tr className="bg-aether-surface/20">
                  <td colSpan={4} className="p-4 font-medium text-aether-text-muted">AI Features</td>
                </tr>
                <tr className="hover:bg-aether-surface/30 transition-colors">
                  <td className="p-4 pl-6 text-aether-text-muted">Daily AI Generations</td>
                  <td className="p-4 text-center text-aether-text">5</td>
                  <td className="p-4 text-center text-aether-text">Unlimited</td>
                  <td className="p-4 text-center text-aether-text">Unlimited</td>
                </tr>
                <tr className="hover:bg-aether-surface/30 transition-colors">
                  <td className="p-4 pl-6 text-aether-text-muted">Custom AI Models</td>
                  <td className="p-4 text-center text-aether-text-muted">-</td>
                  <td className="p-4 text-center text-aether-text-muted">-</td>
                  <td className="p-4 text-center text-aether-text"><span className="text-aether-accent">✓</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
