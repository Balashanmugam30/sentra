"use client";

import { DemoWorkspace as DemoExperience } from "@/modules/dashboard/modes/demo-workspace";
import type { ModeWorkspaceProps } from "@/modules/dashboard/modes/types";

export { demoWorkspaceConfig } from "@/modules/workspaces/demo/config";

export function DemoWorkspace(props: ModeWorkspaceProps) {
  return <DemoExperience {...props} />;
}
