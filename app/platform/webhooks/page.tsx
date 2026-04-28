"use client";

import { DeliveryFeed } from "@/components/platform/delivery-feed";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { WebhookCenter } from "@/components/platform/webhook-center";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { usePlatform } from "@/lib/platform/use-platform";

export default function PlatformWebhooksPage() {
  const {
    webhooks,
    loading,
    error,
    busyAction,
    lastAction,
    refresh,
    createWebhook,
    testWebhook,
    retryWebhook,
    disableWebhook,
  } = usePlatform();

  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Webhook Infrastructure"
        title="Signed event delivery and replay"
        subtitle="Monitor active hooks, signature posture, retries, failed deliveries, latency, and replayable event evidence for external systems."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Active Hooks" value={webhooks.active} />
          <PlatformKpi label="Degraded" value={webhooks.degraded} />
          <PlatformKpi label="Failed Today" value={webhooks.failed_deliveries} />
          <PlatformKpi label="Avg Latency" value={`${webhooks.avg_latency_ms}ms`} />
        </div>
        <WebhookCenter
          webhooks={webhooks.webhooks}
          busyAction={busyAction}
          onCreate={() => createWebhook()}
          onTest={testWebhook}
          onRetry={retryWebhook}
          onDisable={disableWebhook}
        />
        <DeliveryFeed deliveries={webhooks.deliveries} />
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

