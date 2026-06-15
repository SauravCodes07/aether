import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageEffects } from "@/components/landing/page-effects";
import { PricingClient } from "./pricing-client";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for teams of all sizes. Start free, scale as you grow.",
};

export default function PricingPage() {
  return (
    <main className="relative min-h-screen">
      <PageEffects />
      <Container className="relative z-10 pt-32 pb-20">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="label-sm mb-4">PRICING</p>
          <h1 className="heading-xl text-gradient mb-6">
            Simple, transparent pricing
          </h1>
          <p className="body-lg max-w-xl mx-auto">
            Start building for free. Upgrade when you need more power, AI credits, and team collaboration features.
          </p>
        </div>
        <PricingClient />
      </Container>
    </main>
  );
}