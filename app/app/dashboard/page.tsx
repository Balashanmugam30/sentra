import { PermissionGate } from "@/components/auth/PermissionGate";
import { DashboardExperience } from "@/modules/dashboard/components/dashboard-experience";

export default function DashboardPage() {
  return (
    <PermissionGate permission="dashboard.view">
      <DashboardExperience />
    </PermissionGate>
  );
}
