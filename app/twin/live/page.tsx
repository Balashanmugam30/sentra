import { HyperrealLiveTwin } from "@/modules/live-twin";
import { ProtectedWorkspaceShell } from "@/components/app/protected-workspace-shell";

export default function TwinLivePage() {
  return (
    <ProtectedWorkspaceShell>
      <HyperrealLiveTwin />
    </ProtectedWorkspaceShell>
  );
}
