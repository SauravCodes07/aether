import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const features = [
  {
    title: "Spatial Canvas",
    description:
      "Design immersive 3D environments with an intuitive spatial editor powered by real-time rendering.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
      />
    ),
  },
  {
    title: "AI Co-Creation",
    description:
      "Generate models, textures, and layouts with multi-model AI — OpenAI and Gemini working in harmony.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    ),
  },
  {
    title: "Gesture Control",
    description:
      "Interact naturally with hand tracking and pose estimation via MediaPipe for hands-free spatial input.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
      />
    ),
  },
  {
    title: "Real-time Sync",
    description:
      "Collaborate with your team in real time. Auth, storage, and live updates powered by Supabase.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="section-padding">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="label-sm mb-4">Features</p>
          <h2 className="heading-lg text-gradient-subtle mb-4">
            Built for the next dimension
          </h2>
          <p className="body-md">
            Everything you need to create, collaborate, and deploy spatial
            experiences — from concept to production.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} hover>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-aether-border bg-aether-bg-elevated">
                <svg
                  className="h-5 w-5 text-aether-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-aether-text">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-aether-text-muted">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
