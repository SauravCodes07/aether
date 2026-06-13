import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Platform() {
  return (
    <section id="platform" className="section-padding border-t border-aether-border">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-aether-border bg-aether-surface/30 p-10 sm:p-16">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-aether-accent/5 via-transparent to-aether-cyan/5"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="label-sm mb-4">Platform</p>
            <h2 className="heading-lg text-gradient-subtle mb-4">
              From imagination to immersion
            </h2>
            <p className="body-md mb-8">
              Aether unifies 3D rendering, AI generation, and spatial input into
              a single workspace — so you can focus on creating, not configuring.
            </p>
            <Button size="lg" href={siteConfig.links.workspace}>
              Launch Workspace
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
