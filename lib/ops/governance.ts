export const opsGovernanceModes = ["advisory", "approval_required", "semi_auto", "full_auto"] as const;

export function canCloseIncident(gates: Record<string, boolean> | undefined) {
  if (!gates) {
    return false;
  }
  return Object.values(gates).every(Boolean);
}
