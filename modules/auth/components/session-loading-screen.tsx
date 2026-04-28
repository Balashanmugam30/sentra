"use client";

import { Card, Container } from "@/components/ui";

export function SessionLoadingScreen() {
  return (
    <main className="min-h-screen bg-canvas">
      <Container className="flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">Secure Access</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Initializing Secure Session...
            </h1>
            <p className="text-sm leading-6 text-muted">
              Sentra is verifying your access and restoring the protected workspace.
            </p>
          </div>
        </Card>
      </Container>
    </main>
  );
}
