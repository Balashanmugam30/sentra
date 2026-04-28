import { PermissionGate } from "@/components/auth/PermissionGate";
import { SectionPlaceholder } from "@/components/app/section-placeholder";

export default function AnalyticsPage() {
  return (
    <PermissionGate permission="analytics.view">
      <SectionPlaceholder
        description="Operational analytics, performance trends, and system intelligence summaries will appear here."
        eyebrow="Analytics"
        title="Operational analytics"
      />
    </PermissionGate>
  );
}
