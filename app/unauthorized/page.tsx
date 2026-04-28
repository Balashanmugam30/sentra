import { AccessGate } from "@/components/ui/access-gate";

export default function UnauthorizedPage() {
  return <AccessGate reason="This route requires elevated Sentra permissions for the selected organization." />;
}
