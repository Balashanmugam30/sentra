import type { FirebaseError } from "firebase/app";

import type { ApiError } from "@/types/api";

interface AuthErrorContext {
  signInMethods?: string[];
}

const authErrorMap: Record<string, Pick<ApiError, "title" | "detail" | "code" | "status">> = {
  "auth/invalid-credential": {
    title: "Invalid login details",
    detail: "Invalid login details.",
    code: "AUTH_INVALID_CREDENTIALS",
    status: 401,
  },
  "auth/user-not-found": {
    title: "Account not found",
    detail: "We could not find an account for those details.",
    code: "AUTH_USER_NOT_FOUND",
    status: 404,
  },
  "auth/wrong-password": {
    title: "Invalid login details",
    detail: "Invalid login details.",
    code: "AUTH_WRONG_PASSWORD",
    status: 401,
  },
  "auth/invalid-verification-code": {
    title: "Incorrect OTP",
    detail: "Incorrect OTP.",
    code: "AUTH_INVALID_OTP",
    status: 401,
  },
  "auth/invalid-app-credential": {
    title: "Phone sign-in unavailable",
    detail: "Phone verification could not be started. Check your Firebase phone auth setup and allowed domains.",
    code: "AUTH_INVALID_APP_CREDENTIAL",
    status: 400,
  },
  "auth/captcha-check-failed": {
    title: "Verification check failed",
    detail: "Phone verification could not be completed. Try again.",
    code: "AUTH_CAPTCHA_CHECK_FAILED",
    status: 400,
  },
  "auth/operation-not-allowed": {
    title: "Sign-in method unavailable",
    detail: "This sign-in method is not enabled for the current Firebase project.",
    code: "AUTH_OPERATION_NOT_ALLOWED",
    status: 400,
  },
  "auth/network-request-failed": {
    title: "Network issue, try again",
    detail: "Network issue, try again.",
    code: "AUTH_NETWORK_FAILURE",
    status: 503,
  },
  "auth/too-many-requests": {
    title: "Too many attempts, please wait",
    detail: "Too many attempts, please wait.",
    code: "AUTH_RATE_LIMITED",
    status: 429,
  },
  "auth/account-exists-with-different-credential": {
    title: "Existing account detected",
    detail: "This account already exists. Continue with the existing sign-in method to merge access.",
    code: "AUTH_PROVIDER_CONFLICT",
    status: 409,
  },
  "auth/credential-already-in-use": {
    title: "Credential already in use",
    detail: "This sign-in method is already linked to another account.",
    code: "AUTH_CREDENTIAL_IN_USE",
    status: 409,
  },
  "auth/email-already-in-use": {
    title: "Email already in use",
    detail: "This email is already linked to another account.",
    code: "AUTH_EMAIL_IN_USE",
    status: 409,
  },
  "auth/provider-already-linked": {
    title: "Provider already linked",
    detail: "This sign-in method is already connected to your account.",
    code: "AUTH_PROVIDER_ALREADY_LINKED",
    status: 409,
  },
  "auth/popup-closed-by-user": {
    title: "Sign-in cancelled",
    detail: "The sign-in popup was closed before completion.",
    code: "AUTH_POPUP_CLOSED",
    status: 400,
  },
  "auth/user-token-expired": {
    title: "Session expired",
    detail: "Secure session expired. Sign in again.",
    code: "AUTH_SESSION_EXPIRED",
    status: 401,
  },
};

export function mapAuthError(error: unknown, context?: AuthErrorContext): ApiError {
  const firebaseError = error as FirebaseError | undefined;
  const mapped = (firebaseError?.code && authErrorMap[firebaseError.code]) || {
    title: "Authentication failed",
    detail: "Authentication could not be completed.",
    code: "AUTH_UNKNOWN",
    status: 401,
  };

  const metadata: Record<string, unknown> = {};

  if (firebaseError?.code) {
    metadata.firebase_code = firebaseError.code;
  }

  if (context?.signInMethods?.length) {
    metadata.sign_in_methods = context.signInMethods;
  }

  return {
    type: "about:blank",
    title: mapped.title,
    detail:
      firebaseError?.code === "auth/account-exists-with-different-credential" &&
      context?.signInMethods?.length
        ? `${mapped.detail} Available methods: ${context.signInMethods.join(", ")}.`
        : mapped.detail,
    code: mapped.code,
    status: mapped.status,
    retryable: firebaseError?.code === "auth/network-request-failed",
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}
