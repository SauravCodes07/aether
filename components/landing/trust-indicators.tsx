import { Container } from "@/components/ui/container";

const companies = [
  { name: "Acme Corp", icon: "A" },
  { name: "Globex", icon: "G" },
  { name: "Soylent", icon: "S" },
  { name: "Initech", icon: "I" },
  { name: "Umbrella", icon: "U" },
  { name: "Massive Dynamic", icon: "M" },
];

export function TrustIndicators() {
  return (
    <section className="border-t border-aether-border bg-aether-bg-elevated/30 py-12">
      <Container>
        <p className="mb-8 text-center text-sm font-medium text-aether-text-subtle uppercase tracking-widest">
          Trusted by innovative teams worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-60 grayscale transition-all hover:grayscale-0">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-2 text-xl font-bold text-aether-text-muted transition-colors hover:text-aether-text"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-aether-surface text-sm font-black text-aether-text shadow-aether-inner">
                {company.icon}
              </div>
              {company.name}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
