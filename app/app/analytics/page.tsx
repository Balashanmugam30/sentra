import { PermissionGate } from "@/components/auth/PermissionGate";
import { OperationalAnalyticsWorkspace } from "@/components/analytics/operational-analytics-workspace";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <PermissionGate permission="analytics.view">
      <OperationalAnalyticsWorkspace />
    </PermissionGate>
  );
}
