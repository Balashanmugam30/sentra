import type { LoginPayload } from "@/lib/auth/types";

import { DEMO_AUTH_CREDENTIALS } from "@/lib/security/roles";
import { sanitizeEmail, validateLoginInput } from "@/lib/security/validators";

export function buildLoginPayload(email: string, password: string): LoginPayload {
  return {
    email: sanitizeEmail(email),
    password,
  };
}

export function getLoginValidationError(email: string, password: string) {
  return validateLoginInput(email, password);
}

export function findDemoCredential(email: string) {
  const normalized = sanitizeEmail(email);
  return DEMO_AUTH_CREDENTIALS.find((credential) => credential.email === normalized) ?? null;
}
