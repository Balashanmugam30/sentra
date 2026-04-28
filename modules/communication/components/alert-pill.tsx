import { Badge } from "@/components/ui";

export function AlertPill({ label }: { label: string }) {
  return <Badge tone="warning">{label}</Badge>;
}
