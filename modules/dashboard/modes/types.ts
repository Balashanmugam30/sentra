import type { ModeSwitcherValue } from "@/components/ui/mode-switcher";
import type { Incident } from "@/lib/api/incident";
import type { UseEnvironmentResult } from "@/lib/environment/use-environment";
import type { UseGeospatialResult } from "@/lib/geospatial/use-geospatial";
import type { UseOsintResult } from "@/lib/osint/use-osint";
import type { UsePublicSafetyResult } from "@/lib/public-safety/use-public-safety";
import type { UseSocResult } from "@/lib/soc/use-soc";

export type WorkspaceMode = ModeSwitcherValue;

export type WorkspacePermissions = {
  canExportReports: boolean;
  canManageOperations: boolean;
  canViewEnvironment: boolean;
  canViewGeo: boolean;
  canViewOsint: boolean;
  canViewPublicSafety: boolean;
  canViewSoc: boolean;
};

export type WorkspaceMetrics = {
  activeIncidents: number;
  aiConfidence: number;
  blockedRoutes: number;
  criticalIncidents: number;
  devicesOnline: number;
  financialExposure: string;
  readinessScore: number;
  reputationRisk: number;
  responderCount: number;
  systemHealth: number;
  threatScore: number;
};

export type ModeWorkspaceProps = {
  environment: UseEnvironmentResult;
  geo: UseGeospatialResult;
  incidents: Incident[];
  metrics: WorkspaceMetrics;
  onModeChange: (mode: WorkspaceMode) => void;
  onOpenCommand: () => void;
  osint: UseOsintResult;
  permissions: WorkspacePermissions;
  publicSafety: UsePublicSafetyResult;
  soc: UseSocResult;
};
