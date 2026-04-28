import type {
  RoleCommunicationsResponse,
  RoleTestRequest,
  RoleTestResponse,
} from "@/lib/communications/types";

export async function getRoleCommunications(): Promise<RoleCommunicationsResponse> {
  const response = await fetch("/api/communications/roles");

  if (!response.ok) {
    throw new Error(`Failed to fetch role messaging state: ${response.status}`);
  }

  return response.json() as Promise<RoleCommunicationsResponse>;
}

export async function sendRoleTest(payload: RoleTestRequest): Promise<RoleTestResponse> {
  const response = await fetch("/api/communications/send-role-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to send role test: ${response.status}`);
  }

  return response.json() as Promise<RoleTestResponse>;
}

