import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const features = [
  {
    title: "AI Assistant",
    description:
      "Co-create 3D models, textures, and spatial layouts with natural language prompts powered by OpenAI and Gemini.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.813 15.904L9 21l-.813-5.096a.4.4 0 00-.331-.331L2.76 14.76a.4.4 0 000-.753l5.096-.813a.4.4 0 00.331-.331L9 7.76a.4.4 0 00.753 0l.813 5.096a.4.4 0 00.331.331l5.096.813a.4.4 0 000 .753l-5.096.813a.4.4 0 00-.331.331zM19 3v4M21 5h-4"
      />
    ),
  },
  {
    title: "Spatial Engine",
    description:
      "A high-performance real-time 3D rendering engine built on WebGL, delivering responsive, fluid interactions.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
      />
    ),
  },
  {
    title: "Team Collaboration",
    description:
      "Design spatial experiences with your team in real time. Work side-by-side with multiplayer cursors and conflict-free editing.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    ),
  },
  {
    title: "Cloud Rendering",
    description:
      "Compile and compile complex scenes instantly in the cloud, utilizing cloud servers and cutting-edge GPU compute.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
      />
    ),
  },
  {
    title: "3D Workspace",
    description:
      "A complete workspace including a node editor, cameras, layouts, gesture inputs, and real-time inspector.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
      />
    ),
  },
  {
    title: "Real-time Sync",
    description:
      "Instant database and asset sync backed by Supabase. View updates across all devices with zero latency.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} hover className="group overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-aether-glow-accent">
              <div className="absolute inset-0 bg-gradient-to-br from-aether-accent/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-aether-border bg-aether-bg-elevated transition-transform duration-300 group-hover:scale-110 group-hover:border-aether-accent/30 group-hover:bg-aether-accent/10">
                  <svg
                    className="h-6 w-6 text-aether-text-muted transition-colors duration-300 group-hover:text-aether-accent-light"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="mb-3 text-lg font-semibold text-aether-text group-hover:text-aether-accent-light transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-aether-text-muted">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
