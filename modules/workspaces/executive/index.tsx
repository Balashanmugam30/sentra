"use client";

import { ExecutiveWorkspace as ExecutiveExperience } from "@/modules/dashboard/modes/executive-workspace";
import type { ModeWorkspaceProps } from "@/modules/dashboard/modes/types";

export { executiveWorkspaceConfig } from "@/modules/workspaces/executive/config";

export function ExecutiveWorkspace(props: ModeWorkspaceProps) {
  return <ExecutiveExperience {...props} />;
}
