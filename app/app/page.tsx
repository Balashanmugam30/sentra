import { PermissionGate } from "@/components/auth/PermissionGate";
import { DashboardExperience } from "@/modules/dashboard/components/dashboard-experience";

export const dynamic = "force-dynamic";

export default function AppHomePage() {
  return (
    <PermissionGate permission="dashboard.view">
      <DashboardExperience />
    </PermissionGate>
  );
}
