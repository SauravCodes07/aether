import { Hero } from "@/components/landing/hero";
import { Platform } from "@/components/landing/platform";
import { Features } from "@/components/landing/features";
import { Integrations } from "@/components/landing/integrations";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Platform />
      <Features />
      <Integrations />
    </>
  );
}
