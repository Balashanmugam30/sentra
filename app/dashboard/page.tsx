import { PermissionGate } from "@/components/auth/PermissionGate";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { DashboardExperience } from "@/modules/dashboard/components/dashboard-experience";

export const dynamic = "force-dynamic";

export default function DashboardWorkspacePage() {
  return (
    <ProtectedWorkspaceShell>
      <PermissionGate permission="dashboard.view">
        <DashboardExperience />
      </PermissionGate>
    </ProtectedWorkspaceShell>
  );
}
