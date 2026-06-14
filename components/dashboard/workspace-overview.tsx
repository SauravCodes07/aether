"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from "@/lib/motion";

const workspaces = [
  {
    name: "Product Showcase",
    sceneCount: 12,
    lastActive: "2 min ago",
    collaborators: 3,
    status: "active" as const,
    gradient: "from-aether-accent/20 to-aether-cyan/10",
  },
  {
    name: "Architecture Viz",
    sceneCount: 8,
    lastActive: "1 hr ago",
    collaborators: 1,
    status: "active" as const,
    gradient: "from-aether-cyan/20 to-aether-accent/10",
  },
  {
    name: "Brand Environment",
    sceneCount: 5,
    lastActive: "3 days ago",
    collaborators: 2,
    status: "idle" as const,
    gradient: "from-aether-warning/10 to-aether-accent/10",
  },
];

export function WorkspaceOverview() {
  return (
    <Card className="glass-panel">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="heading-sm">Workspaces</h3>
        <button className="text-xs text-aether-text-link hover:text-aether-accent-light transition-colors">
          View all
        </button>
      </div>
      <motion.div
        variants={STAGGER_CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {workspaces.map((ws) => (
          <motion.div
            key={ws.name}
            variants={STAGGER_ITEM_VARIANTS}
            className="group relative overflow-hidden rounded-xl border border-aether-border bg-aether-surface/20 p-4 transition-all duration-300 hover:border-aether-border-strong hover:bg-aether-surface/40 hover:shadow-aether-sm cursor-pointer"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${ws.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-aether-text">
                    {ws.name}
                  </h4>
                  <span className={`h-1.5 w-1.5 rounded-full ${ws.status === "active" ? "bg-aether-success" : "bg-aether-text-subtle"}`} />
                </div>
                <p className="text-xs text-aether-text-muted">
                  {ws.sceneCount} scenes · {ws.collaborators} collaborator{ws.collaborators !== 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-[10px] text-aether-text-subtle">
                {ws.lastActive}
              </span>
            </div>
            {/* Collaborator avatars */}
            {ws.collaborators > 0 && (
              <div className="relative mt-3 flex -space-x-1.5">
                {Array.from({ length: Math.min(ws.collaborators, 3) }).map((_, i) => (
                  <div
                    key={i}
                    className="h-5 w-5 rounded-full border border-aether-bg-elevated bg-gradient-to-br from-aether-accent to-aether-cyan text-[8px] font-bold text-white flex items-center justify-center"
                  >
                    {["S", "M", "K"][i]}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </Card>
  );
}