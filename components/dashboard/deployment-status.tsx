"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from "@/lib/motion";

const deployments = [
  {
    version: "v2.4.1",
    branch: "main",
    status: "live" as const,
    region: "us-east-1",
    latency: "12ms",
    time: "15 min ago",
  },
  {
    version: "v2.4.0",
    branch: "main",
    status: "live" as const,
    region: "eu-west-1",
    latency: "18ms",
    time: "3 hrs ago",
  },
  {
    version: "v2.3.9",
    branch: "staging",
    status: "archived" as const,
    region: "us-east-1",
    latency: "14ms",
    time: "2 days ago",
  },
];

const statusConfig = {
  live: { label: "Live", variant: "cyan" as const },
  archived: { label: "Archived", variant: "default" as const },
};

export function DeploymentStatus() {
  return (
    <Card className="glass-panel">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="heading-sm">Deployments</h3>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aether-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-aether-success" />
          </span>
          <span className="text-xs text-aether-success font-medium">All systems operational</span>
        </div>
      </div>
      <motion.div
        variants={STAGGER_CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        {deployments.map((deploy) => {
          const status = statusConfig[deploy.status];
          return (
            <motion.div
              key={deploy.version}
              variants={STAGGER_ITEM_VARIANTS}
              className="group flex items-center justify-between rounded-xl border border-aether-border bg-aether-surface/10 px-4 py-3 transition-all duration-200 hover:border-aether-border-strong hover:bg-aether-surface/30"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${deploy.status === "live" ? "bg-aether-success" : "bg-aether-text-subtle"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-aether-text font-mono">
                      {deploy.version}
                    </span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="text-[10px] text-aether-text-subtle mt-0.5">
                    {deploy.branch} · {deploy.region}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-aether-text-muted font-mono">
                  {deploy.latency}
                </p>
                <p className="text-[10px] text-aether-text-subtle">
                  {deploy.time}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </Card>
  );
}