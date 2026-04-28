export function nextRole(requiredRole: string): string {
  const orderedRoles = ["commander", "executive", "facility_admin", "security_lead"];
  if (requiredRole === "commander_or_executive") {
    return "executive";
  }
  const index = orderedRoles.indexOf(requiredRole);
  if (index === -1) {
    return "executive";
  }
  return orderedRoles[(index + 1) % orderedRoles.length] ?? "executive";
}
