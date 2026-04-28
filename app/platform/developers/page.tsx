"use client";

import { DeveloperScore } from "@/components/platform/developer-score";
import { OAuthAppGrid } from "@/components/platform/oauth-app-grid";
import { PlatformKpi, PlatformShell } from "@/components/platform/platform-shell";
import { SandboxLab } from "@/components/platform/sandbox-lab";
import { SdkPanel } from "@/components/platform/sdk-panel";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { usePlatform } from "@/lib/platform/use-platform";

export default function PlatformDevelopersPage() {
  const { summary, apps, sdks, docs, sandbox, loading, error, busyAction, lastAction, refresh, createApp, updateApp, revokeApp } = usePlatform();
  return (
    <ProtectedWorkspaceShell>
      <PlatformShell
        eyebrow="Developer Platform"
        title="Builder-ready Sentra ecosystem"
        subtitle="API consumers, OAuth apps, docs readiness, SDK packages, sandbox mode, and developer growth in one tenant-scoped command center."
        loading={loading}
        error={error}
        lastAction={lastAction}
        onRefresh={refresh}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <PlatformKpi label="Active Developers" value={summary.active_developers} />
          <PlatformKpi label="Apps Created" value={summary.apps_created} />
          <PlatformKpi label="Docs Usage" value={summary.docs_usage.toLocaleString()} />
          <PlatformKpi label="Builder Growth" value={`${summary.builder_growth_percent}%`} />
        </div>
        <DeveloperScore summary={summary} />
        <OAuthAppGrid apps={apps.apps} busyAction={busyAction} onCreate={() => createApp()} onUpdate={updateApp} onRevoke={revokeApp} />
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SdkPanel sdks={sdks} docs={docs} />
          <SandboxLab sandbox={sandbox} />
        </div>
      </PlatformShell>
    </ProtectedWorkspaceShell>
  );
}

