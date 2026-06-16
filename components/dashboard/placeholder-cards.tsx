"use client";

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
];

export function DashboardPlaceholderCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Hand Tracking Card — Active Module */}
      <a href="/hand-tracking">
        <Card hover className="relative overflow-hidden group">
          <div
            className={`pointer-events-none absolute inset-0 opacity-30 ${moduleThemes.handTracking.subtleClass}`}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-aether-module-tracking/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`font-semibold ${moduleThemes.handTracking.accentClass}`}>
                Hand Tracking
              </h3>
              <Badge variant="accent">Active</Badge>
            </div>
            <p className="text-sm leading-relaxed text-aether-text-muted mb-4">
              Control spatial UI with natural gestures.
            </p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-aether-text-muted">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-aether-success animate-pulse" />
                Camera Ready
              </span>
              <span>60 FPS</span>
              <span>{"<16ms"} Latency</span>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-aether-accent group-hover:underline">
            Open Workspace →
          </div>
        </Card>
      </a>

      {/* Other placeholder cards */}
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
                <Badge variant="default">{item.status}</Badge>
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