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
        <div className="relative mt-16">
          {/* Connecting line for desktop */}
          <div className="absolute left-[16.66%] right-[16.66%] top-6 hidden h-0.5 bg-gradient-to-r from-aether-accent via-aether-cyan to-aether-accent opacity-30 md:block" />
          
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, idx) => (
              <div key={step.title} className="group relative flex flex-col items-center text-center">
                {/* Step number with glow */}
                <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-aether-bg-elevated border-2 border-aether-accent shadow-aether-glow-accent transition-transform duration-300 group-hover:scale-110">
                  <span className="text-lg font-bold text-gradient">{idx + 1}</span>
                  <div className="absolute inset-0 rounded-full bg-aether-accent/20 blur-md" />
                </div>
                
                <h3 className="mb-3 text-xl font-semibold text-aether-text group-hover:text-aether-accent-light transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-aether-text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
