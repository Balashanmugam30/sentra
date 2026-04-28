import { authenticatedFetch } from "@/lib/auth/fetch";
import type {
  AssignRolePayload,
  AssignRoleResponse,
  RbacCheckRequest,
  RbacCheckResponse,
  RbacMeResponse,
  RbacRolesResponse,
  RbacUsersResponse,
  SeedDemoUsersResponse,
} from "@/lib/rbac/types";

const RBAC_API_BASE = "/rbac";

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? `${fallback}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getRbacMe(): Promise<RbacMeResponse> {
  const response = await authenticatedFetch(`${RBAC_API_BASE}/me`);
  return parseResponse(response, "Failed to fetch RBAC identity");
}

export async function getRbacRoles(): Promise<RbacRolesResponse> {
  const response = await authenticatedFetch(`${RBAC_API_BASE}/roles`);
  return parseResponse(response, "Failed to fetch role matrix");
}

export async function postRbacCheck(payload: RbacCheckRequest): Promise<RbacCheckResponse> {
  const response = await authenticatedFetch(`${RBAC_API_BASE}/check`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to check permission");
}

export async function getRbacUsers(): Promise<RbacUsersResponse> {
  const response = await authenticatedFetch(`${RBAC_API_BASE}/users`);
  return parseResponse(response, "Failed to fetch RBAC users");
}

export async function postAssignRole(
  payload: AssignRolePayload,
): Promise<AssignRoleResponse> {
  const response = await authenticatedFetch(`${RBAC_API_BASE}/assign-role`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseResponse(response, "Failed to assign role");
}

export async function postSeedDemoUsers(): Promise<SeedDemoUsersResponse> {
  const response = await authenticatedFetch(`${RBAC_API_BASE}/seed-demo-users`, {
    method: "POST",
  });
  return parseResponse(response, "Failed to seed demo users");
}
