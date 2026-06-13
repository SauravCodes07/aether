export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import {
  DashboardHeader,
  UserInfoCard,
} from "@/components/dashboard/dashboard-header";
import { DashboardPlaceholderCards } from "@/components/dashboard/placeholder-cards";
import { requireAuth } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Aether workspace dashboard",
};

export default async function DashboardPage() {
  const { user } = await requireAuth();

  return (
    <section className="section-padding pt-28">
      <Container>
        <DashboardHeader user={user} />
        <UserInfoCard user={user} />

        <div className="mb-6">
          <h2 className="heading-sm mb-2">Modules</h2>
          <p className="body-sm">
            Placeholder cards for upcoming Aether capabilities.
          </p>
        </div>

        <DashboardPlaceholderCards />
      </Container>
    </section>
  );
}
