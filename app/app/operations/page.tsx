import { PermissionGate } from "@/components/auth/PermissionGate";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";
import { OperationsCommandCenter } from "@/components/operations/operations-command-center";

export const dynamic = "force-dynamic";

export default function OperationsPage() {
  return (
    <PermissionGate permission="dashboard.view">
      <ProtectedWorkspaceShell>
        <main className="px-4 py-6 text-white md:px-8">
          <div className="mx-auto max-w-7xl">
            <OperationsCommandCenter />
          </div>
        </main>
      </ProtectedWorkspaceShell>
    </PermissionGate>
  );
}
