export default function AuthLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center pt-24">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-aether-border border-t-aether-accent" />
        <p className="text-sm text-aether-text-muted">Loading…</p>
      </div>
    </div>
  );
}
