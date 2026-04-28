"use client";

import { CommandWorkspace as CommandExperience } from "@/modules/dashboard/modes/command-workspace";
import type { ModeWorkspaceProps } from "@/modules/dashboard/modes/types";

export { commandWorkspaceConfig } from "@/modules/workspaces/command/config";

export function CommandWorkspace(props: ModeWorkspaceProps) {
  return <CommandExperience {...props} />;
}
