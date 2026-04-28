import { PermissionGate } from "@/components/auth/PermissionGate";
import { Card } from "@/components/ui";

export default function MapPage() {
  return (
    <PermissionGate permission="dashboard.view">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">Map</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">Map</h1>
        </div>

        <Card className="flex min-h-[420px] items-center justify-center p-6">
          <p className="text-lg font-medium text-foreground">Map loading...</p>
        </Card>
      </div>
    </PermissionGate>
  );
}
