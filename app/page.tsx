import { motion, useScroll, useTransform } from "framer-motion";
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
 */
export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <main className="relative perspective-container">
      {/* Cinematic Background Parallax */}
      <motion.div style={{ y: backgroundY }} className="ambient-bg">
        <div className="aurora-bg h-full w-full">
          <div className="aurora-layer-3" />
          <div className="aurora-layer-4" />
        </div>
        <div className="depth-fog" />
      </motion.div>

      <Hero />
      
      <div className="relative z-10 bg-aether-bg">
        <TrustIndicators />
        
        <AnimateIn variant="fadeUp" delay={0.1} as="section">
          <Platform />
        </AnimateIn>

        <AnimateIn variant="blurFade" delay={0.1} as="section">
          <Metrics />
        </AnimateIn>

        <AnimateIn variant="fadeUp" delay={0.1} as="section" className="mesh-bg">
          <Features />
        </AnimateIn>

        <AnimateIn variant="scaleUp" delay={0.1} as="section">
          <HowItWorks />
        </AnimateIn>

        <AnimateIn variant="fadeUp" delay={0.1} as="section">
          <Integrations />
        </AnimateIn>

        <AnimateIn variant="blurFade" delay={0.1} as="section">
          <Testimonials />
        </AnimateIn>

        <AnimateIn variant="fadeUp" delay={0.1} as="section">
          <Pricing />
        </AnimateIn>

        <AnimateIn variant="blurFade" delay={0.1} as="section">
          <FAQ />
        </AnimateIn>
      </div>
    </main>
  );
}