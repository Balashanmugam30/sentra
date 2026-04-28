import { normalizeAppRole } from "@/lib/security/roles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateEmail(value: string) {
  const email = sanitizeEmail(value);
  if (!email) {
    return "Email is required.";
  }
  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid enterprise email address.";
  }
  return "";
}

export function validatePassword(value: string) {
  if (!value) {
    return "Password is required.";
  }
  if (value.length < 10) {
    return "Use at least 10 characters for production passwords.";
  }
  return "";
}

export function validateLoginInput(email: string, password: string) {
  return validateEmail(email) || validatePassword(password);
}

export function normalizeSecureRole(role: string | null | undefined) {
  return normalizeAppRole(role);
}
