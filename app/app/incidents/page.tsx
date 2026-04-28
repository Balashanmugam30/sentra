import { PermissionGate } from "@/components/auth/PermissionGate";
import { IncidentIntelligenceDashboard } from "@/components/analytics/premium-charts";

export default function IncidentsPage() {
  return (
    <PermissionGate permission="dashboard.view">
      <IncidentIntelligenceDashboard />
    </PermissionGate>
  );
}
