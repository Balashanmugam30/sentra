import { Badge, Card, Container } from "@/components/ui";

export function InitializingScreen() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Container className="flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-3xl">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
              <Badge tone="primary">Sentra Core</Badge>
              <span className="text-sm text-muted">Realtime orchestration baseline</span>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">
                Crisis Intelligence Platform
              </p>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground">
                Sentra System Initializing
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted">
                Frontend infrastructure is ready for incident operations, realtime telemetry, route
                orchestration, and operator workflows.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4">
                <p className="text-sm font-medium text-foreground">App Router</p>
                <p className="mt-2 text-sm text-muted">Server-first shell with typed client boundaries.</p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4">
                <p className="text-sm font-medium text-foreground">Realtime Ready</p>
                <p className="mt-2 text-sm text-muted">WebSocket infrastructure and state containers prepared.</p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4">
                <p className="text-sm font-medium text-foreground">Operational UI</p>
                <p className="mt-2 text-sm text-muted">Minimal floating surfaces designed for future map views.</p>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </main>
  );
}
