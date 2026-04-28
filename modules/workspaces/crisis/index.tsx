"use client";

import { CrisisWorkspace as CrisisExperience } from "@/modules/dashboard/modes/crisis-workspace";
import type { ModeWorkspaceProps } from "@/modules/dashboard/modes/types";

export { crisisWorkspaceConfig } from "@/modules/workspaces/crisis/config";

export function CrisisWorkspace(props: ModeWorkspaceProps) {
  return <CrisisExperience {...props} />;
}
