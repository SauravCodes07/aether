import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center pt-16">
      <div className="grid-pattern absolute inset-0" aria-hidden="true" />

      <Container className="relative z-10 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-3xl">
          <Badge variant="accent" className="mb-6">
            AI-Powered Spatial Computing
          </Badge>

          <h1 className="heading-xl text-gradient mb-6">
            {siteConfig.tagline}
          </h1>

          <p className="body-lg mx-auto mb-10 max-w-2xl">
            {siteConfig.description}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" href={siteConfig.links.workspace}>
              Launch Workspace
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
            <Button variant="outline" size="lg" href="#features">
              Explore Features
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-4xl">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-aether-accent/20 via-transparent to-aether-cyan/10 blur-sm" />
          <div className="glass-strong relative overflow-hidden rounded-2xl p-1">
            <div className="rounded-xl bg-aether-bg-elevated p-8 sm:p-12">
              <div className="flex items-center gap-2 border-b border-aether-border pb-4">
                <span className="h-3 w-3 rounded-full bg-red-500/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <span className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-4 text-xs text-aether-text-subtle">
                  aether — workspace
                </span>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {["Scene Graph", "AI Assistant", "Spatial Input"].map(
                  (label) => (
                    <div
                      key={label}
                      className="rounded-lg border border-aether-border bg-aether-surface/60 p-4 text-left"
                    >
                      <div className="mb-3 h-20 rounded-md bg-gradient-to-br from-aether-accent/10 to-aether-cyan/5" />
                      <p className="text-sm font-medium text-aether-text">
                        {label}
                      </p>
                      <p className="mt-1 text-xs text-aether-text-subtle">
                        Ready for integration
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
