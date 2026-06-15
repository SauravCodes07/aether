import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TelemetryEvent } from "@/lib/validation/schemas";

const TELEMETRY_BUFFER: TelemetryEvent[] = [];
const FLUSH_INTERVAL_MS = 10_000; // 10 seconds
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flushTelemetry(): Promise<void> {
  if (TELEMETRY_BUFFER.length === 0) return;

  const batch = TELEMETRY_BUFFER.splice(0, TELEMETRY_BUFFER.length);
  const supabase = await createClient();

  for (const event of batch) {
    try {
      await supabase.from("audit_logs" as never).insert({
        user_id: event.user_id ?? null,
        workspace_id: event.workspace_id ?? null,
        action: event.event,
        resource: event.category,
        resource_id: event.project_id ?? null,
        metadata: event.properties,
      } as never);
    } catch (err) {
      console.warn("[telemetry] Failed to persist event:", err);
    }
  }
}

/**
 * Phase 11: Analytics & Intelligence — Telemetry Pipeline.
 *
 * POST /api/analytics/telemetry
 * Accepts event-driven telemetry data for product analytics.
 * Batches events and flushes to PostgreSQL analytical clusters.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = (await request.json()) as {
      events: TelemetryEvent[];
    };

    if (!body.events?.length) {
      return NextResponse.json(
        { error: "events array is required." },
        { status: 400 },
      );
    }

    if (body.events.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 events per batch." },
        { status: 400 },
      );
    }

    for (const event of body.events) {
      TELEMETRY_BUFFER.push({
        ...event,
        user_id: event.user_id ?? user?.id ?? undefined,
        properties: event.properties ?? {},
      });
    }

    // Start flush timer if not already running
    if (!flushTimer) {
      flushTimer = setInterval(flushTelemetry, FLUSH_INTERVAL_MS);
    }

    // Flush immediately if buffer exceeds 50 events
    if (TELEMETRY_BUFFER.length >= 50) {
      await flushTelemetry();
    }

    return NextResponse.json({ success: true, buffered: TELEMETRY_BUFFER.length });
  } catch (err) {
    console.error("[analytics/telemetry] Error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/analytics/telemetry
 * Returns current buffered count and system health.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "healthy",
    buffered_events: TELEMETRY_BUFFER.length,
    flush_interval_ms: FLUSH_INTERVAL_MS,
    categories: [
      "page_view",
      "auth",
      "workspace",
      "project",
      "ai",
      "deployment",
      "collaboration",
      "billing",
      "canvas",
      "error",
    ],
  });
}