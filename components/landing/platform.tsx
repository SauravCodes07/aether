import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Platform() {
  return (
    <section id="platform" className="section-padding border-t border-aether-border bg-aether-bg">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-aether-border bg-aether-surface/30 p-10 sm:p-16">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-aether-accent/10 via-transparent to-aether-cyan/10"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl text-center mb-16">
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

          {/* Rich Workspace Preview */}
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-aether-border bg-aether-bg-elevated shadow-aether-2xl ring-1 ring-white/10">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-aether-border bg-aether-surface px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="ml-4 h-5 w-48 rounded bg-aether-border/50"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded bg-aether-border/50"></div>
                <div className="h-6 w-6 rounded bg-aether-border/50"></div>
                <div className="h-6 w-16 rounded bg-aether-accent/80"></div>
              </div>
            </div>
            {/* Main Area */}
            <div className="flex h-[400px] w-full">
              {/* Left Sidebar */}
              <div className="hidden w-64 flex-col border-r border-aether-border bg-aether-surface/30 p-4 sm:flex">
                <div className="mb-4 h-4 w-24 rounded bg-aether-border/50"></div>
                <div className="space-y-3">
                  <div className="h-8 w-full rounded bg-aether-border/30"></div>
                  <div className="h-8 w-full rounded bg-aether-border/30"></div>
                  <div className="h-8 w-full rounded bg-aether-border/30"></div>
                  <div className="h-8 w-3/4 rounded bg-aether-border/30"></div>
                </div>
              </div>
              {/* Canvas Area */}
              <div className="relative flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-aether-accent/5 via-aether-bg to-aether-bg p-8">
                {/* 3D Wireframe Mockup */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <svg className="h-64 w-64 text-aether-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
                {/* Floating Panels */}
                <div className="absolute bottom-6 right-6 h-32 w-48 rounded-lg border border-aether-border bg-aether-bg-elevated/80 p-4 shadow-aether-lg backdrop-blur-md">
                  <div className="mb-2 h-3 w-16 rounded bg-aether-border/50"></div>
                  <div className="space-y-2">
                    <div className="flex justify-between"><div className="h-2 w-8 rounded bg-aether-border/30"></div><div className="h-2 w-12 rounded bg-aether-border/30"></div></div>
                    <div className="flex justify-between"><div className="h-2 w-8 rounded bg-aether-border/30"></div><div className="h-2 w-12 rounded bg-aether-border/30"></div></div>
                    <div className="flex justify-between"><div className="h-2 w-8 rounded bg-aether-border/30"></div><div className="h-2 w-12 rounded bg-aether-border/30"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
