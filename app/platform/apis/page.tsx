"use client";

import { ApiKeyTable } from "@/components/platform/api-key-table";
import { CreateKeyPanel } from "@/components/platform/create-key-panel";
import { LogStream } from "@/components/platform/log-stream";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { RateLimitBoard } from "@/components/platform/rate-limit-board";
import { UsageChart } from "@/components/platform/usage-chart";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { usePlatform } from "@/lib/platform/use-platform";

export default function PlatformApisPage() {
  const {
    apiKeys,
    usage,
    rateLimits,
    logs,
    loading,
    error,
    busyAction,
    lastAction,
    refresh,
    createKey,
    revokeKey,
    rotateKey,
  } = usePlatform();

  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Public APIs"
        title="Secure API key and usage control"
        subtitle="Create, rotate, revoke, and monitor tenant-scoped API keys with scopes, rate limits, abuse signals, and audit-ready platform logs."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Active Keys" value={apiKeys.active} />
          <PlatformKpi label="Revoked" value={apiKeys.revoked} />
          <PlatformKpi label="Daily Calls" value={usage.daily_requests.toLocaleString()} />
          <PlatformKpi label="P95 Latency" value={`${usage.p95_latency_ms}ms`} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <CreateKeyPanel busyAction={busyAction} onCreate={createKey} scopeCatalog={apiKeys.scope_catalog} />
          <UsageChart usage={usage} />
        </div>
        <ApiKeyTable keys={apiKeys.keys} busyAction={busyAction} onRotate={rotateKey} onRevoke={revokeKey} />
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <RateLimitBoard rateLimits={rateLimits} />
          <LogStream logs={logs} />
        </div>
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

