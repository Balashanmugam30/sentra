"use client";

import {
  EmailAuthProvider,
  GoogleAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  getRedirectResult,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from "firebase/auth";

import { clearClientAuthSessionCookie, clearLocalAuthSession } from "@/lib/auth-session";
import { firebaseAuth, googleAuthProvider } from "@/lib/firebase";
import { normalizeApiError, normalizeApiSuccess, type ApiResponse } from "@/services/api/response";
import type { AppRole } from "@/types/rbac";

import type { AuthResult } from "../types/auth";
import { mapFirebaseUserToAuthUser } from "../types/auth";

let recaptchaVerifier: RecaptchaVerifier | null = null;

declare global {
  interface Window {
    __sentraRecaptchaVerifier?: RecaptchaVerifier | null;
  }
}

function normalizeAuthUnavailable(action: string) {
  console.warn("Firebase Authentication is unavailable", { action });

  return normalizeApiError({
    type: "about:blank",
    title: "Authentication unavailable",
    detail: "Firebase Authentication is not configured.",
    code: "AUTH_UNAVAILABLE",
    status: 503,
    message: "Something went wrong. Try again.",
  });
}

function toFirebaseCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code;
  }

  return null;
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "Unknown Firebase auth error";
}

function logFirebaseAuthError(context: string, error: unknown) {
  const code = toFirebaseCode(error);
  const message = toErrorMessage(error);
  const details = {
    code,
    message,
  };

  if (typeof console !== "undefined") {
    if (code?.startsWith("auth/")) {
      console.warn(`[Sentra Auth] ${context}`, details);
      return;
    }

    console.error(`[Sentra Auth] ${context}`, details);
  }
}

function normalizeFriendlyAuthError(error: unknown, flow: "general" | "google" | "phone" = "general") {
  const code = toFirebaseCode(error);

  if (flow === "google") {
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return normalizeApiError({
        type: "about:blank",
        title: "Google sign-in cancelled",
        detail: "Google sign-in was closed before it finished.",
        message: "Google sign-in was closed before it finished.",
        code: "AUTH_GOOGLE_CANCELLED",
        status: 400,
      });
    }

    if (code === "auth/popup-blocked" || code === "auth/popup-redirect-cancelled") {
      return normalizeApiError({
        type: "about:blank",
        title: "Popup blocked",
        detail: "Your browser blocked the Google sign-in popup. Redirect sign-in will start automatically.",
        message: "Your browser blocked the Google sign-in popup. Redirect sign-in will start automatically.",
        code: "AUTH_GOOGLE_POPUP_BLOCKED",
        status: 400,
        retryable: true,
      });
    }

    if (code === "auth/unauthorized-domain") {
      const hostname = typeof window !== "undefined" ? window.location.hostname : "this domain";
      return normalizeApiError({
        type: "about:blank",
        title: "Google sign-in domain not authorized",
        detail: `Add ${hostname} to Firebase Authentication > Settings > Authorized domains for project sentra-01.`,
        message: `Add ${hostname} to Firebase authorized domains, then try Google sign-in again.`,
        code: "AUTH_GOOGLE_UNAUTHORIZED_DOMAIN",
        status: 400,
      });
    }

    if (code === "auth/operation-not-allowed") {
      return normalizeApiError({
        type: "about:blank",
        title: "Google sign-in is not enabled",
        detail: "Enable Google as a sign-in provider in Firebase Authentication for project sentra-01.",
        message: "Enable Google sign-in in Firebase Authentication, then try again.",
        code: "AUTH_GOOGLE_PROVIDER_DISABLED",
        status: 400,
      });
    }
  }

  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return normalizeApiError({
      type: "about:blank",
      title: "Invalid login details",
      detail: "Invalid login details.",
      message: "Invalid login details.",
      code: "AUTH_INVALID_CREDENTIALS",
      status: 401,
    });
  }

  if (code === "auth/network-request-failed") {
    return normalizeApiError({
      type: "about:blank",
      title: "Connection issue",
      detail: "Check your connection.",
      message: "Check your connection.",
      code: "AUTH_NETWORK_FAILURE",
      status: 503,
      retryable: true,
    });
  }

  if (code === "auth/account-exists-with-different-credential" || code === "auth/email-already-in-use") {
    return normalizeApiError({
      type: "about:blank",
      title: "Account linked elsewhere",
      detail: "This account is linked with another sign-in method.",
      message: "This account is linked with another sign-in method.",
      code: "AUTH_PROVIDER_CONFLICT",
      status: 409,
    });
  }

  if (code === "auth/invalid-phone-number") {
    return normalizeApiError({
      type: "about:blank",
      title: "Invalid phone number",
      detail: "Enter a valid phone number in +91XXXXXXXXXX format.",
      message: "Enter a valid phone number in +91XXXXXXXXXX format.",
      code: "AUTH_INVALID_PHONE_NUMBER",
      status: 400,
    });
  }

  if (
    flow === "phone" &&
    (code === "auth/invalid-app-credential" ||
      code === "auth/captcha-check-failed" ||
      code === "auth/operation-not-allowed")
  ) {
    return normalizeApiError({
      type: "about:blank",
      title: "Phone sign-in unavailable",
      detail: "Phone verification could not be started. Try again.",
      message: "Phone verification could not be started. Try again.",
      code: "AUTH_PHONE_UNAVAILABLE",
      status: 400,
    });
  }

  if (code === "auth/operation-not-allowed") {
    return normalizeApiError({
      type: "about:blank",
      title: "Sign-in method unavailable",
      detail: "This sign-in method is not enabled for the current Firebase project.",
      message: "This sign-in method is not enabled for the current Firebase project.",
      code: "AUTH_OPERATION_NOT_ALLOWED",
      status: 400,
    });
  }

  if (code === "auth/invalid-verification-code") {
    return normalizeApiError({
      type: "about:blank",
      title: "Incorrect OTP",
      detail: "Incorrect OTP.",
      message: "Incorrect OTP.",
      code: "AUTH_INVALID_OTP",
      status: 401,
    });
  }

  if (code === "auth/internal-error") {
    return normalizeApiError({
      type: "about:blank",
      title: "Authentication failed",
      detail: "Authentication failed. Try again.",
      message: "Authentication failed. Try again.",
      code: "AUTH_INTERNAL_ERROR",
      status: 400,
    });
  }

  if (code === "auth/missing-verification-code") {
    return normalizeApiError({
      type: "about:blank",
      title: "Missing OTP",
      detail: "Enter the verification code.",
      message: "Enter the verification code.",
      code: "AUTH_MISSING_OTP",
      status: 400,
    });
  }

  if (code === "auth/code-expired") {
    return normalizeApiError({
      type: "about:blank",
      title: "OTP expired",
      detail: "The verification code expired. Request a new one.",
      message: "The verification code expired. Request a new one.",
      code: "AUTH_OTP_EXPIRED",
      status: 400,
    });
  }

  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    return normalizeApiError({
      type: "about:blank",
      title: "Authentication failed",
      detail: toErrorMessage(error),
      message: toErrorMessage(error),
      code: code ?? "AUTH_UNKNOWN",
      status: 400,
    });
  }

  return normalizeApiError({
    type: "about:blank",
    title: "Authentication failed",
    detail: "Something went wrong. Try again.",
    message: "Something went wrong. Try again.",
    code: code ?? "AUTH_UNKNOWN",
    status: 400,
  });
}

function shouldFallbackToGoogleRedirect(error: unknown) {
  const code = toFirebaseCode(error);

  return (
    code === "auth/popup-blocked" ||
    code === "auth/popup-redirect-cancelled" ||
    code === "auth/cancelled-popup-request"
  );
}

async function finishProviderSignIn() {
  return await buildAuthResult();
}

async function buildAuthResult(role: AppRole = "guest"): Promise<ApiResponse<AuthResult>> {
  if (!firebaseAuth) {
    return normalizeAuthUnavailable("buildAuthResult");
  }

  const user = firebaseAuth.currentUser;

  if (!user) {
    return normalizeApiError({
      type: "about:blank",
      title: "No session",
      detail: "Something went wrong. Try again.",
      message: "Something went wrong. Try again.",
      code: "AUTH_NO_SESSION",
      status: 401,
    });
  }

  const tokenResult = await user.getIdTokenResult();

  return normalizeApiSuccess({
    token: tokenResult.token,
    refreshToken: "",
    expiresIn: Math.max(
      0,
      Math.round(
        (new Date(tokenResult.expirationTime).getTime() - new Date(tokenResult.issuedAtTime).getTime()) /
          1000,
      ),
    ),
    tokenExpiresAt: tokenResult.expirationTime,
    tokenIssuedAt: tokenResult.issuedAtTime,
    tokenRefreshedAt: new Date().toISOString(),
    user: mapFirebaseUserToAuthUser(user, role),
  });
}

async function buildRequiredAuthResult(role: AppRole = "guest"): Promise<AuthResult> {
  const session = await buildAuthResult(role);

  if (!session.success || !session.data) {
    throw new Error(session.error?.message || "Authentication failed");
  }

  return session.data;
}

function resetRecaptchaVerifier(containerId = "firebase-recaptcha") {
  if (recaptchaVerifier) {
    try {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
      }

      if (typeof window !== "undefined") {
        window.__sentraRecaptchaVerifier = null;
      }
    } catch {
      console.warn("Recaptcha clear skipped");
    }
  }
}

function createRecaptchaVerifier(containerId = "firebase-recaptcha") {
  if (!firebaseAuth) {
    throw new Error("Firebase Authentication unavailable");
  }

  if (typeof document === "undefined") {
    throw new Error("Window not available");
  }

  if (typeof window !== "undefined" && window.__sentraRecaptchaVerifier) {
    return window.__sentraRecaptchaVerifier;
  }

  const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: "invisible",
  });
  window.__sentraRecaptchaVerifier = verifier;
  recaptchaVerifier = verifier;

  return verifier;
}

export async function signInWithGoogle() {
  const auth = firebaseAuth;
  if (!auth) {
    return normalizeAuthUnavailable("signInWithGoogle");
  }

  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const email = result.user.email?.trim();

    if (email) {
      void fetchSignInMethodsForEmail(auth, email).catch((lookupError) => {
        logFirebaseAuthError("Google sign-in methods lookup skipped", lookupError);
      });
    }

    return await finishProviderSignIn();
  } catch (error) {
    logFirebaseAuthError("Google sign-in failed", error);

    if (shouldFallbackToGoogleRedirect(error)) {
      try {
        await signInWithRedirect(auth, googleAuthProvider);
        return normalizeApiError({
          type: "about:blank",
          title: "Redirecting to Google",
          detail: "Google sign-in redirect started.",
          message: "Google sign-in redirect started.",
          code: "AUTH_GOOGLE_REDIRECT_STARTED",
          status: 202,
          retryable: true,
        });
      } catch (redirectError) {
        logFirebaseAuthError("Google redirect sign-in failed", redirectError);
        return normalizeFriendlyAuthError(redirectError, "google");
      }
    }

    return normalizeFriendlyAuthError(error, "google");
  }
}

export async function completeGoogleRedirectSignIn() {
  const auth = firebaseAuth;
  if (!auth) {
    return normalizeAuthUnavailable("completeGoogleRedirectSignIn");
  }

  try {
    const result = await getRedirectResult(auth);

    if (!result) {
      return normalizeApiSuccess<AuthResult | null>(null);
    }

    return await finishProviderSignIn();
  } catch (error) {
    logFirebaseAuthError("Google redirect completion failed", error);
    return normalizeFriendlyAuthError(error, "google");
  }
}

export async function lookupEmailSignInMethods(email: string) {
  const auth = firebaseAuth;
  if (!auth) {
    return normalizeAuthUnavailable("lookupEmailSignInMethods");
  }

  const trimmedEmail = email.trim();

  try {
    const methods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
    const hasPassword =
      methods.includes("password") || methods.includes(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD);
    const hasGoogle = methods.includes("google.com") || methods.includes(GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD);

    return normalizeApiSuccess({
      email: trimmedEmail,
      exists: methods.length > 0,
      methods,
      preferred: hasPassword ? ("password" as const) : hasGoogle ? ("google" as const) : ("create" as const),
    });
  } catch (error) {
    logFirebaseAuthError("Email sign-in methods lookup failed", error);
    return normalizeFriendlyAuthError(error);
  }
}

export async function authenticateWithEmail(email: string, password: string) {
  if (!firebaseAuth) {
    throw new Error("Firebase not initialized");
  }

  const trimmedEmail = email.trim();

  try {
    const methods = await fetchSignInMethodsForEmail(firebaseAuth, trimmedEmail);

    if (methods.length === 0) {
      await createUserWithEmailAndPassword(firebaseAuth, trimmedEmail, password);
      return await buildRequiredAuthResult();
    }

    if (
      methods.includes("password") ||
      methods.includes(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD)
    ) {
      await signInWithEmailAndPassword(firebaseAuth, trimmedEmail, password);
      return await buildRequiredAuthResult();
    }

    if (methods.includes("google.com")) {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const credential = EmailAuthProvider.credential(trimmedEmail, password);

      try {
        await linkWithCredential(result.user, credential);
      } catch (linkError: any) {
        if (
          linkError?.code !== "auth/provider-already-linked" &&
          linkError?.code !== "auth/credential-already-in-use"
        ) {
          throw linkError;
        }
      }

      return await buildRequiredAuthResult();
    }

    throw new Error("Unsupported authentication method");
  } catch (error: any) {
    console.error("[Sentra Auth] Email authentication failed", error);

    if (error?.code === "auth/email-already-in-use") {
      await signInWithEmailAndPassword(firebaseAuth, trimmedEmail, password);
      return await buildRequiredAuthResult();
    }

    if (error?.code === "auth/wrong-password" || error?.code === "auth/invalid-credential") {
      throw new Error("Incorrect password");
    }

    if (error?.code === "auth/user-not-found") {
      throw new Error("Account not found");
    }

    if (error?.code === "auth/email-already-in-use") {
      throw new Error("Email already registered. Try signing in.");
    }

    if (error?.code === "auth/invalid-email") {
      throw new Error("Invalid email address");
    }

    throw new Error(error?.message || "Authentication failed");
  }
}

export async function signInWithEmailPasswordOnly(email: string, password: string) {
  const auth = firebaseAuth;
  if (!auth) {
    return normalizeAuthUnavailable("signInWithEmailPasswordOnly");
  }

  try {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    return await buildAuthResult();
  } catch (error) {
    logFirebaseAuthError("Email sign-in failed", error);
    return normalizeFriendlyAuthError(error);
  }
}

export async function signUpWithEmailPassword(email: string, password: string, displayName?: string) {
  const auth = firebaseAuth;
  if (!auth) {
    return normalizeAuthUnavailable("signUpWithEmailPassword");
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const normalizedName = displayName?.trim();

    if (normalizedName) {
      await updateProfile(credential.user, { displayName: normalizedName });
    }

    return await buildAuthResult();
  } catch (error) {
    logFirebaseAuthError("Email sign-up failed", error);
    return normalizeFriendlyAuthError(error);
  }
}

export async function signInWithPhone(phoneNumber: string, containerId = "firebase-recaptcha") {
  const auth = firebaseAuth;
  if (!auth) {
    return normalizeAuthUnavailable("signInWithPhone");
  }

  try {
    const digitsOnly = phoneNumber.replace(/[^\d+]/g, "").trim();
    const normalizedPhone = digitsOnly.startsWith("+") ? digitsOnly : `+91${digitsOnly}`;
    const verifier = createRecaptchaVerifier(containerId);
    const confirmation = await signInWithPhoneNumber(auth, normalizedPhone, verifier);

    return normalizeApiSuccess({
      verificationId: confirmation.verificationId,
      phoneNumber: normalizedPhone,
      mode: "sign_in" as const,
    });
  } catch (error) {
    resetRecaptchaVerifier(containerId);
    logFirebaseAuthError("Phone sign-in failed", error);
    return normalizeFriendlyAuthError(error, "phone");
  }
}

export async function verifyOTP(code: string, verificationId: string) {
  const auth = firebaseAuth;
  if (!auth) {
    return normalizeAuthUnavailable("verifyOTP");
  }

  try {
    const credential = PhoneAuthProvider.credential(verificationId, code.trim());
    await signInWithCredential(auth, credential);

    resetRecaptchaVerifier();
    return await buildAuthResult();
  } catch (error) {
    resetRecaptchaVerifier();
    logFirebaseAuthError("Phone OTP verification failed", error);
    return normalizeFriendlyAuthError(error);
  }
}

export async function logout() {
  const auth = firebaseAuth;
  if (!auth) {
    clearClientAuthSessionCookie();
    clearLocalAuthSession();
    return normalizeApiSuccess({
      completed: true,
    });
  }

  try {
    await signOut(auth);
    resetRecaptchaVerifier();
    clearClientAuthSessionCookie();
    clearLocalAuthSession();
    return normalizeApiSuccess({
      completed: true,
    });
  } catch (error) {
    logFirebaseAuthError("Logout failed", error);
    return normalizeFriendlyAuthError(error);
  }
}
