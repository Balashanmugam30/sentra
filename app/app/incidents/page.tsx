import { PermissionGate } from "@/components/auth/PermissionGate";
import { IncidentsOperationsWorkspace } from "@/components/incidents/incidents-operations-workspace";

export const dynamic = "force-dynamic";

export default function IncidentsPage() {
  return (
    <PermissionGate permission="dashboard.view">
      <IncidentsOperationsWorkspace />
    </PermissionGate>
  );
}
