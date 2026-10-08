import { PermissionGate } from "@/components/auth/PermissionGate";
import { HyperrealLiveTwin } from "@/modules/live-twin";

export const dynamic = "force-dynamic";

export default function MapPage() {
  return (
    <PermissionGate permission="dashboard.view">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-6 px-4 pb-12 pt-4 md:px-6 lg:px-8">
        <HyperrealLiveTwin />
      </div>
    </PermissionGate>
  );
}
