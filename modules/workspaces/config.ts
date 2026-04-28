import type { WorkspaceMode } from "@/lib/workspace/useWorkspace";
import { commandWorkspaceConfig } from "@/modules/workspaces/command/config";
import { crisisWorkspaceConfig } from "@/modules/workspaces/crisis/config";
import { demoWorkspaceConfig } from "@/modules/workspaces/demo/config";
import { executiveWorkspaceConfig } from "@/modules/workspaces/executive/config";

type WorkspaceConfig = {
  description: string;
  eyebrow: string;
  mode: WorkspaceMode;
  title: string;
};

export const workspaceConfigs = {
  command: commandWorkspaceConfig,
  crisis: crisisWorkspaceConfig,
  demo: demoWorkspaceConfig,
  executive: executiveWorkspaceConfig,
} satisfies Record<WorkspaceMode, WorkspaceConfig>;
