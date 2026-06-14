export default function DashboardLoading() {
  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-6xl">
        {/* Header skeleton */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar skeleton */}
            <div className="h-14 w-14 shrink-0 rounded-xl bg-aether-surface/50 animate-pulse" />
            <div className="space-y-3">
              <div className="h-4 w-20 rounded bg-aether-surface/40 animate-pulse" />
              <div className="h-7 w-64 rounded bg-aether-surface/40 animate-pulse" />
              <div className="h-4 w-80 rounded bg-aether-surface/30 animate-pulse" />
            </div>
          </div>
          <div className="h-9 w-24 rounded-lg bg-aether-surface/50 animate-pulse" />
        </div>

        {/* Profile card skeleton */}
        <div className="mb-8 rounded-2xl border border-aether-border bg-aether-surface/20 p-6">
          <div className="h-5 w-16 rounded bg-aether-surface/40 animate-pulse mb-6" />
          <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div className="h-20 w-20 rounded-2xl bg-aether-surface/50 animate-pulse" />
              <div className="h-4 w-24 rounded bg-aether-surface/30 animate-pulse" />
              <div className="h-3 w-32 rounded bg-aether-surface/20 animate-pulse" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 rounded bg-aether-surface/30 animate-pulse" />
                  <div className="h-4 w-48 rounded bg-aether-surface/40 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Placeholder cards skeleton */}
        <div className="mb-6">
          <div className="h-5 w-20 rounded bg-aether-surface/40 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded bg-aether-surface/30 animate-pulse" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-aether-border bg-aether-surface/10 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-24 rounded bg-aether-surface/40 animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-aether-surface/30 animate-pulse" />
              </div>
              <div className="h-4 w-full rounded bg-aether-surface/20 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}