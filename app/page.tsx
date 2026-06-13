import { Hero } from "@/components/landing/hero";
import { TrustIndicators } from "@/components/landing/trust-indicators";
import { Platform } from "@/components/landing/platform";
import { Metrics } from "@/components/landing/metrics";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Integrations } from "@/components/landing/integrations";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <Platform />
      <Metrics />
      <Features />
      <HowItWorks />
      <Integrations />
      <Testimonials />
      <Pricing />
      <FAQ />
    </>
  );
}
