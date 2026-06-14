"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { STAGGER_CONTAINER_VARIANTS, STAGGER_ITEM_VARIANTS } from "@/lib/motion";

export type MetricData = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

export const DEFAULT_METRICS: MetricData[] = [
  {
    label: "Workspaces",
    value: "3",
    change: "+1 this week",
    trend: "up" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    color: "text-aether-accent",
    bgColor: "bg-aether-accent/10",
  },
  {
    label: "AI Generations",
    value: "147",
    change: "23 today",
    trend: "up" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096a.4.4 0 00-.331-.331L2.76 14.76a.4.4 0 000-.753l5.096-.813a.4.4 0 00.331-.331L9 7.76a.4.4 0 00.753 0l.813 5.096a.4.4 0 00.331.331l5.096.813a.4.4 0 000 .753l-5.096.813a.4.4 0 00-.331.331z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 3v4M21 5h-4" />
      </svg>
    ),
    color: "text-aether-cyan",
    bgColor: "bg-aether-cyan/10",
  },
  {
    label: "Storage Used",
    value: "12.4 GB",
    change: "of 100 GB",
    trend: "neutral" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    color: "text-aether-success",
    bgColor: "bg-aether-success/10",
  },
  {
    label: "Deployments",
    value: "8",
    change: "2 this week",
    trend: "up" as const,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
      </svg>
    ),
    color: "text-aether-warning",
    bgColor: "bg-aether-warning/10",
  },
];

interface DashboardMetricsProps {
  data?: MetricData[];
}

export function DashboardMetrics({ data = DEFAULT_METRICS }: DashboardMetricsProps) {
  return (
    <motion.div
      variants={STAGGER_CONTAINER_VARIANTS}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {data.map((metric) => (
        <motion.div key={metric.label} variants={STAGGER_ITEM_VARIANTS}>
          <Card hover className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-aether-accent/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.bgColor} ${metric.color} transition-transform duration-300 group-hover:scale-110`}>
                  {metric.icon}
                </div>
                <span className="text-[10px] font-medium text-aether-success">
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-aether-text tracking-tight">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-aether-text-muted">
                {metric.label}
              </p>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}