import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Phase 10: Billing & Subscriptions — Stripe Webhook Handler.
 *
 * POST /api/billing/webhook
 * Processes Stripe webhook events:
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const body = await request.text();

    // In production, verify webhook signature:
    // const event = stripe.webhooks.constructEvent(
    //   body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? ""
    // );

    let event: { type: string; data: { object: Record<string, unknown> } };
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const supabase = await createClient();

    switch (event.type) {
      case "customer.subscription.updated": {
        const subscription = event.data.object as {
          id: string;
          customer: string;
          status: string;
          items: { data: { price: { id: string; product: string } }[] };
          current_period_end: number;
          cancel_at_period_end: boolean;
        };

        // Update user tier in database
        const tier = mapPlanToTier(subscription.items.data[0]?.price?.product ?? "free");
        await supabase.from("profiles" as never).update({
          subscription_tier: tier,
          subscription_status: subscription.status,
          subscription_id: subscription.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        } as never).eq("stripe_customer_id", subscription.customer);

        // Log event
        await supabase.from("audit_logs" as never).insert({
          user_id: null,
          action: "billing.subscription.updated",
          resource: "subscription",
          resource_id: subscription.id,
          metadata: { status: subscription.status, tier },
        } as never);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as { id: string; customer: string };

        // Downgrade user to free tier
        await supabase.from("profiles" as never).update({
          subscription_tier: "free",
          subscription_status: "canceled",
          subscription_id: null,
          cancel_at_period_end: false,
        } as never).eq("stripe_customer_id", subscription.customer);

        await supabase.from("audit_logs" as never).insert({
          user_id: null,
          action: "billing.subscription.deleted",
          resource: "subscription",
          resource_id: subscription.id,
          metadata: { tier: "free" },
        } as never);

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as { id: string; customer: string; amount_paid: number; currency: string };

        await supabase.from("audit_logs" as never).insert({
          user_id: null,
          action: "billing.invoice.paid",
          resource: "invoice",
          resource_id: invoice.id,
          metadata: { amount: invoice.amount_paid, currency: invoice.currency },
        } as never);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as { id: string; customer: string };

        await supabase.from("audit_logs" as never).insert({
          user_id: null,
          action: "billing.invoice.failed",
          resource: "invoice",
          resource_id: invoice.id,
          metadata: { status: "failed" },
        } as never);

        break;
      }

      default:
        console.log(`[billing/webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[billing/webhook] Error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

function mapPlanToTier(productId: string): string {
  const productMap: Record<string, string> = {
    prod_free: "free",
    prod_pro: "pro",
    prod_team: "team",
    prod_enterprise: "enterprise",
  };
  return productMap[productId] ?? "free";
}