import { Container } from "@/components/ui/container";

const metrics = [
  { value: "1M+", label: "Assets Rendered" },
  { value: "0ms", label: "Sync Latency" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "50k+", label: "Active Creators" },
];

export function Metrics() {
  return (
    <section className="border-t border-aether-border bg-aether-bg py-16 sm:py-24">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-aether-border">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center pt-8 sm:pt-0 text-center">
              <p className="text-4xl font-bold text-gradient mb-2">{metric.value}</p>
              <p className="text-sm font-medium text-aether-text-muted uppercase tracking-wider">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
