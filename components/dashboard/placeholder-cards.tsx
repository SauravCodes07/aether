import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { moduleThemes } from "@/types/design-system";

const placeholders = [
  {
    title: "Projects",
    description: "Manage spatial experiences and deployments.",
    module: "dashboard" as const,
    status: "Coming soon",
  },
  {
    title: "Workspaces",
    description: "Collaborate in shared 3D environments.",
    module: "workspace3d" as const,
    status: "Coming soon",
  },
  {
    title: "AI Assistant",
    description: "Generate content with multi-model AI.",
    module: "aiAssistant" as const,
    status: "Coming soon",
  },
  {
    title: "Hand Tracking",
    description: "Control spatial UI with natural gestures.",
    module: "handTracking" as const,
    status: "Launch",
    href: "/hand-tracking",
  },
];

export function DashboardPlaceholderCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {placeholders.map((item) => {
        const theme = moduleThemes[item.module];
        return (
          <Card key={item.title} hover className="relative overflow-hidden">
            <div
              className={`pointer-events-none absolute inset-0 opacity-30 ${theme.subtleClass}`}
              aria-hidden="true"
            />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <h3 className={`font-semibold ${theme.accentClass}`}>
                  {item.title}
                </h3>
                {item.href ? (
                  <a href={item.href} className="text-sm font-medium">
                    <Badge variant="outline">{item.status}</Badge>
                  </a>
                ) : (
                  <Badge variant="default">{item.status}</Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed text-aether-text-muted">
                {item.description}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
