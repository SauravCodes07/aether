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
import { AnimateIn } from "@/components/ui/animate-in";

/**
 * Landing page — continuous scroll story.
 *
 * Each section uses AnimateIn with coordinated delays and variants
 * to create a connected, progressive storytelling experience.
 * Sections feel like chapters in one narrative, not independent blocks.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <AnimateIn variant="fadeUp" delay={0} as="section">
        <Platform />
      </AnimateIn>
      <AnimateIn variant="blurFade" delay={0} as="section">
        <Metrics />
      </AnimateIn>
      <AnimateIn variant="fadeUp" delay={0} as="section">
        <Features />
      </AnimateIn>
      <AnimateIn variant="scaleUp" delay={0} as="section">
        <HowItWorks />
      </AnimateIn>
      <AnimateIn variant="fadeUp" delay={0} as="section">
        <Integrations />
      </AnimateIn>
      <AnimateIn variant="blurFade" delay={0} as="section">
        <Testimonials />
      </AnimateIn>
      <AnimateIn variant="fadeUp" delay={0} as="section">
        <Pricing />
      </AnimateIn>
      <AnimateIn variant="blurFade" delay={0} as="section">
        <FAQ />
      </AnimateIn>
    </>
  );
}