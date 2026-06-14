export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import {
  DashboardHeader,
  UserInfoCard,
} from "@/components/dashboard/dashboard-header";
import { DashboardMetrics, DEFAULT_METRICS } from "@/components/dashboard/dashboard-metrics";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { WorkspaceOverview } from "@/components/dashboard/workspace-overview";
import { DeploymentStatus } from "@/components/dashboard/deployment-status";
import { DashboardPlaceholderCards } from "@/components/dashboard/placeholder-cards";
import { requireAuth } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Aether workspace dashboard",
};

export default async function DashboardPage() {
  const { user } = await requireAuth();

  // Real data fetching logic would reside here. 
  // Using DEFAULT_METRICS as the initial 'real' data source structure.
  const metrics = DEFAULT_METRICS;

  return (
    <section className="section-padding pt-28">
      <Container>
        <DashboardHeader user={user} />

        {/* ── Metrics Row ───────────────────────────────────────── */}
        <div className="mb-8">
          <DashboardMetrics data={metrics} />
        </div>

        {/* ── Bento Grid: Activity + Workspaces ─────────────────── */}
        <div className="mb-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ActivityFeed />
          </div>
          <div className="lg:col-span-2">
            <WorkspaceOverview />
          </div>
        </div>

        {/* ── Deployments + Profile ─────────────────────────────── */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DeploymentStatus />
          </div>
          <div className="lg:col-span-1">
            <UserInfoCard user={user} />
          </div>
        </div>

        {/* ── Modules ───────────────────────────────────────────── */}
        <div className="mb-6">
          <h2 className="heading-sm mb-2">Modules</h2>
          <p className="body-sm">
            Upcoming Aether capabilities — launching soon.
          </p>
        </div>

        <DashboardPlaceholderCards />
      </Container>
    </section>
  );
}