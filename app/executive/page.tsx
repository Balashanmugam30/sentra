"use client";

import { PermissionGate } from "@/components/auth/PermissionGate";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { DashboardExperience } from "@/modules/dashboard/components/dashboard-experience";

export default function ExecutiveIntelligencePage() {
  return (
    <PermissionGate permission="dashboard.view">
      <ProtectedWorkspaceShell>
        <DashboardExperience initialMode="executive" />
      </ProtectedWorkspaceShell>
    </PermissionGate>
  );
}
