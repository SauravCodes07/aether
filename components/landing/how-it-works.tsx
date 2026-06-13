import { Container } from "@/components/ui/container";

export function HowItWorks() {
  const steps = [
    { title: "Create", description: "Design your 3D scenes, import assets, and define spatial logic." },
    { title: "Build", description: "Leverage AI assistance, real‑time collaboration, and cloud rendering." },
    { title: "Deploy", description: "Publish instantly to the web with Vercel integration." },
  ];

  return (
    <section id="how-it-works" className="section-padding bg-aether-bg-elevated">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="label-sm mb-4">How it works</p>
          <h2 className="heading-lg text-gradient-subtle mb-4">From idea to launch</h2>
          <p className="body-md">Three simple steps to turn your imagination into a live spatial experience.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex flex-col items-center text-center p-6 rounded-xl border border-aether-border bg-aether-surface/30 hover:shadow-aether-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aether-accent text-aether-bg-elevated mb-4 text-xl font-bold">
                {idx + 1}
              </div>
              <h3 className="mb-2 text-base font-semibold text-aether-text">{step.title}</h3>
              <p className="text-sm text-aether-text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
