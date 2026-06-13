import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

const integrationsList = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Generative AI capabilities for custom asset creation, texture generation, and script helper.",
    status: "ready",
    brandStyle: {
      textHover: "group-hover:text-[#10A37F]",
      iconHover: "group-hover:text-[#10A37F]",
      glow: "from-[#10A37F]/20",
      borderHover: "group-hover:border-[#10A37F]/40",
    },
    icon: (
      <svg className="h-6 w-6 text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.73 11.23c.25-.62.37-1.27.37-1.92 0-.75-.16-1.5-.48-2.19-.32-.69-.79-1.3-1.38-1.78-.59-.48-1.28-.83-2.02-1.02-.74-.19-1.52-.22-2.27-.1l-.11.02-.02-.11c-.13-.75-.44-1.46-.9-2.08-.47-.62-1.07-1.12-1.76-1.47-.69-.35-1.46-.53-2.23-.53-.78 0-1.55.18-2.24.53-.69.35-1.29.85-1.76 1.47s-.77 1.33-.9 2.08l-.02.11-.11-.02c-.75-.12-1.53-.09-2.27.1-.74.19-1.43.54-2.02 1.02-.59.48-1.06 1.09-1.38 1.78-.32.69-.48 1.44-.48 2.19 0 .65.12 1.3.37 1.92l.04.1-.1.04c-.74.32-1.39.81-1.9 1.42s-.88 1.34-1.07 2.13c-.19.78-.2 1.6-.04 2.38.16.78.5 1.51.98 2.14.48.63 1.1 1.13 1.8 1.48.71.35 1.49.52 2.27.51.15 0 .31-.01.46-.03l.11-.01v.11c.02.76.2 1.5.54 2.18.34.68.83 1.28 1.43 1.74s1.3.8 2.04.99c.74.19 1.52.22 2.27.1l.1-.01.02.1c.13.75.44 1.46.9 2.08.47.62 1.07 1.12 1.76 1.47.69.35 1.46.53 2.23.53s1.54-.18 2.23-.53c.69-.35 1.29-.85 1.76-1.47.47-.62.77-1.33.9-2.08l.02-.1.1.01c.75.12 1.53.09 2.27-.1.74-.19 1.43-.54 2.02-1.02s1.06-1.09 1.38-1.78c.32-.69.48-1.44.48-2.19 0-.65-.12-1.3-.37-1.92l-.04-.1.1-.04c.74-.32 1.39-.81 1.9-1.42s.88-1.34 1.07-2.13c.19-.78.2-1.6.04-2.38a6.31 6.31 0 00-.98-2.14c-.48-.63-1.1-1.13-1.8-1.48s-1.49-.52-2.27-.51c-.15 0-.31.01-.46.03l-.11.01v-.11c-.02-.76-.2-1.5-.54-2.18-.34-.68-.83-1.28-1.43-1.74a6.22 6.22 0 00-2.04-.99c-.74-.19-1.52-.22-2.27-.1l-.1.01-.02-.1zm-8.8 8.87c.21-.36.52-.65.89-.83s.78-.26 1.19-.23c.41.03.8.19 1.11.45.31.26.53.61.63 1.01l.03.11c-.07.03-.13.06-.2.08L12 12.3l-2.04 1.18c-.36.21-.78.3-1.19.26-.41-.04-.8-.21-1.11-.47-.31-.27-.53-.62-.62-1.02a3.02 3.02 0 01.12-1.5c.2-.37.5-.66.88-.85s.8-.25 1.21-.2c.41.05.79.23 1.09.5l.09.09v-2.36l2.04 1.18c.36.21.65.52.83.89s.26.79.23 1.2c-.03.41-.19.8-.45 1.11a3 3 0 01-1.12.63l-.1.03c-.03-.07-.06-.13-.08-.2l-.65-1.13c-.21-.36-.3-.78-.26-1.19.04-.41.21-.8.47-1.11.27-.31.62-.53 1.02-.62a3.02 3.02 0 011.5.12c.37.2.66.5.85.88s.25.8.2 1.21c-.05.41-.23.79-.5 1.09l-.09.09h2.36l-1.18-2.04a2.97 2.97 0 00-.89-.83 3.04 3.04 0 00-1.2-.23c-.41.03-.8.19-1.11.45a3 3 0 00-.63 1.12l-.03.1c.07-.03.13-.06.2-.08l1.13-.65a3.02 3.02 0 011.19-.26c.41.04.8.21 1.11.47.31.27.53.62.62 1.02.09.4.05.82-.12 1.19a3.02 3.02 0 01-.88.85 3.04 3.04 0 01-1.21.2c-.41-.05-.79-.23-1.09-.5l-.09-.09v2.36l-2.04-1.18c-.36-.21-.65-.52-.83-.89a2.97 2.97 0 01-.23-1.2c.03-.41.19-.8.45-1.11.26-.31.61-.53 1.01-.63l.11-.03c.03.07.06.13.08.2l.65 1.13c.21.36.3.78.26 1.19a3.02 3.02 0 01-.47 1.11c-.27.31-.62.53-1.02.62a3.02 3.02 0 01-1.5-.12 2.97 2.97 0 01-.85-.88c-.2-.37-.25-.8-.2-1.21s.23-.79.5-1.09l.09-.09H4.82l1.18 2.04c.21.36.52.65.89.83s.79.26 1.2.23c.41-.03.8-.19 1.11-.45s.53-.61.63-1.01l.03-.11c-.07-.03-.13-.06-.2-.08L8.48 11.7a3.02 3.02 0 01-1.19.26c-.41-.04-.8-.21-1.11-.47a3.02 3.02 0 01-.62-1.02 3.02 3.02 0 01.12-1.5c.2-.37.5-.66.88-.85s.8-.25 1.21-.2c.41.05.79.23 1.09.5l.09.09v-2.36z"/>
      </svg>
    ),
  },
  {
    id: "google",
    name: "Google Cloud",
    description: "Application hosting, Gemini vision APIs, and OAuth Single Sign-on directly integrated.",
    status: "ready",
    brandStyle: {
      textHover: "group-hover:text-[#4285F4]",
      iconHover: "",
      glow: "from-[#4285F4]/20",
      borderHover: "group-hover:border-[#4285F4]/40",
    },
    icon: (
      <svg className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Database, file storage, and real-time multiplayer syncing powered by postgres-realtime.",
    status: "ready",
    brandStyle: {
      textHover: "group-hover:text-[#3ECF8E]",
      iconHover: "",
      glow: "from-[#3ECF8E]/20",
      borderHover: "group-hover:border-[#3ECF8E]/40",
    },
    icon: (
      <svg className="h-6 w-6 text-[#3ECF8E] transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.36 10.96a1.27 1.27 0 0 0-1.15-.82h-6.73v-7.6a1.26 1.26 0 0 0-2.18-.86L2.64 12.3a1.27 1.27 0 0 0 1.05 2.14h6.73v-7.6a1.26 1.26 0 0 0 2.18.86l8.67-10.6a1.27 1.27 0 0 0 .09-1.34z" />
      </svg>
    ),
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "One-click build, global CDN hosting, edge functions, and rapid project deployments.",
    status: "ready",
    brandStyle: {
      textHover: "group-hover:text-white",
      iconHover: "group-hover:text-white",
      glow: "from-white/10",
      borderHover: "group-hover:border-white/40",
    },
    icon: (
      <svg className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 22.525H0L12 .475l12 22.05z" />
      </svg>
    ),
  },
];

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
            Built on standard, reliable cloud providers. Aether integrations connect with the tools you already know and trust.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {integrationsList.map((integration) => {
            const status = statusLabels[integration.status as keyof typeof statusLabels];
            const { textHover, borderHover, glow, iconHover } = integration.brandStyle;
            return (
              <Card key={integration.id} hover={false} className={`group relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${borderHover}`}>
                {/* Custom glow background for each brand */}
                <div className={`absolute inset-0 bg-gradient-to-br ${glow} via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                
                <div className="relative z-10">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-aether-border bg-aether-bg-elevated transition-colors duration-300 ${borderHover} ${iconHover}`}>
                    {integration.icon}
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={`font-semibold text-aether-text transition-colors duration-300 ${textHover}`}>
                      {integration.name}
                    </h3>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="text-sm text-aether-text-muted leading-relaxed">
                    {integration.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
