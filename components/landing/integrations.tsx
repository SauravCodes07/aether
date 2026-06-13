import { integrations } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const statusLabels = {
  ready: { label: "Ready", variant: "cyan" as const },
  planned: { label: "Planned", variant: "default" as const },
  beta: { label: "Beta", variant: "accent" as const },
};

export function Integrations() {
  return (
    <section id="integrations" className="section-padding border-t border-aether-border">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="label-sm mb-4">Integrations</p>
          <h2 className="heading-lg text-gradient-subtle mb-4">
            Architecture ready to scale
          </h2>
          <p className="body-md">
            Service layers are pre-structured for seamless integration with the
            tools that power modern spatial computing.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => {
            const status = statusLabels[integration.status];
            return (
              <Card key={integration.id} hover>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-aether-text">
                    {integration.name}
                  </h3>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="text-sm text-aether-text-muted">
                  {integration.description}
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
