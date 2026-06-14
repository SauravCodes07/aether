"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from "@/lib/motion";

const activities = [
  {
    type: "ai" as const,
    action: "Generated 3D model",
    detail: "Modern chair with organic curves",
    time: "2 min ago",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096a.4.4 0 00-.331-.331L2.76 14.76a.4.4 0 000-.753l5.096-.813a.4.4 0 00.331-.331L9 7.76a.4.4 0 00.753 0l.813 5.096a.4.4 0 00.331.331l5.096.813a.4.4 0 000 .753l-5.096.813a.4.4 0 00-.331.331z" />
      </svg>
    ),
    color: "text-aether-accent",
    bgColor: "bg-aether-accent/10",
  },
  {
    type: "deploy" as const,
    action: "Deployed to production",
    detail: "v2.4.1 — us-east-1",
    time: "15 min ago",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
      </svg>
    ),
    color: "text-aether-success",
    bgColor: "bg-aether-success/10",
  },
  {
    type: "collab" as const,
    action: "Sarah joined workspace",
    detail: "Real-time collaboration started",
    time: "32 min ago",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    color: "text-aether-cyan",
    bgColor: "bg-aether-cyan/10",
  },
  {
    type: "ai" as const,
    action: "Texture generated",
    detail: "PBR material: brushed metal",
    time: "1 hr ago",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096a.4.4 0 00-.331-.331L2.76 14.76a.4.4 0 000-.753l5.096-.813a.4.4 0 00.331-.331L9 7.76a.4.4 0 00.753 0l.813 5.096a.4.4 0 00.331.331l5.096.813a.4.4 0 000 .753l-5.096.813a.4.4 0 00-.331.331z" />
      </svg>
    ),
    color: "text-aether-accent",
    bgColor: "bg-aether-accent/10",
  },
  {
    type: "deploy" as const,
    action: "Build completed",
    detail: "v2.4.0 — 12ms latency",
    time: "3 hrs ago",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
      </svg>
    ),
    color: "text-aether-success",
    bgColor: "bg-aether-success/10",
  },
];

export function ActivityFeed() {
  return (
    <Card className="glass-panel">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="heading-sm">Activity</h3>
        <span className="text-xs text-aether-text-subtle">Recent</span>
      </div>
      <motion.div
        variants={STAGGER_CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        className="space-y-1"
      >
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            variants={STAGGER_ITEM_VARIANTS}
            className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-aether-surface/40"
          >
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${activity.bgColor} ${activity.color}`}>
              {activity.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-aether-text truncate">
                {activity.action}
              </p>
              <p className="text-xs text-aether-text-muted truncate">
                {activity.detail}
              </p>
            </div>
            <span className="shrink-0 text-[10px] text-aether-text-subtle mt-0.5">
              {activity.time}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </Card>
  );
}