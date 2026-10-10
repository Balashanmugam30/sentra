"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { consumeAuthNotice } from "@/lib/auth-session";
import { useAuth } from "@/lib/auth/use-auth";
import { buildLoginPayload, findDemoCredential } from "@/lib/security/auth";
import { DEMO_AUTH_CREDENTIALS } from "@/lib/security/roles";
import {
  completeGoogleRedirectSignIn,
  lookupEmailSignInMethods,
  signInWithEmailPasswordOnly,
  signInWithGoogle,
  signInWithPhone,
  signUpWithEmailPassword,
  verifyOTP,
} from "@/modules/auth/api/auth-client";

type AuthStep = "email" | "password" | "create" | "phone";
type AccountIntent = "unknown" | "existing" | "new" | "google" | "local";

const countryCodes = ["+91", "+1", "+44", "+971", "+65"] as const;

const roleQuickAccess = [
  { label: "Admin Console", credential: DEMO_AUTH_CREDENTIALS[0]! },
  { label: "Security Manager", credential: DEMO_AUTH_CREDENTIALS[1]! },
  { label: "Staff login", credential: DEMO_AUTH_CREDENTIALS[2]! },
  { label: "Responder Mode", credential: DEMO_AUTH_CREDENTIALS[3]! },
  { label: "Analyst View", credential: DEMO_AUTH_CREDENTIALS[4]! },
] as const;

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

function FieldIcon({ type }: { type: "email" | "lock" | "user" | "phone" | "shield" | "google" }) {
  const common = {
    "aria-hidden": true,
    className: "h-4 w-4",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.75,
    viewBox: "0 0 24 24",
  };

  if (type === "email") {
    return (
      <svg {...common}>
        <path d="M4.5 6.5h15v11h-15z" />
        <path d="m5 7 7 5.5L19 7" />
      </svg>
    );
  }

  if (type === "lock") {
    return (
      <svg {...common}>
        <path d="M7 11V8a5 5 0 0 1 10 0v3" />
        <path d="M6 11h12v9H6z" />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg {...common}>
        <path d="M8 3.5h8v17H8z" />
        <path d="M11 17.5h2" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3.5 5.5 6v5.4c0 4.1 2.8 7.9 6.5 9.1 3.7-1.2 6.5-5 6.5-9.1V6L12 3.5Z" />
        <path d="m9.5 12 1.6 1.7 3.5-3.7" />
      </svg>
    );
  }

  if (type === "google") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
        <path
          d="M21.35 12.21c0-.74-.07-1.45-.19-2.13H12v4.03h5.24a4.47 4.47 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.17 2.91-7.28Z"
          fill="#4285F4"
        />
        <path
          d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92a5.82 5.82 0 0 1-5.47-4.02H3.29v2.52A9.73 9.73 0 0 0 12 21.7Z"
          fill="#34A853"
        />
        <path
          d="M6.53 13.8a5.85 5.85 0 0 1 0-3.6V7.68H3.29a9.73 9.73 0 0 0 0 8.64l3.24-2.52Z"
          fill="#FBBC05"
        />
        <path
          d="M12 6.18c1.43 0 2.72.49 3.73 1.46l2.79-2.79A9.36 9.36 0 0 0 12 2.3a9.73 9.73 0 0 0-8.71 5.38l3.24 2.52A5.82 5.82 0 0 1 12 6.18Z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c.9-3.8 3.3-5.7 7-5.7s6.1 1.9 7 5.7" />
    </svg>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithFirebaseToken } = useAuth();
  const [authStep, setAuthStep] = useState<AuthStep>("email");
  const [accountIntent, setAccountIntent] = useState<AccountIntent>("unknown");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("+91");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [sessionTimeoutVisible, setSessionTimeoutVisible] = useState(
    () => {
      const reason = searchParams.get("reason");
      return reason === "session-timeout" || reason === "session-expired";
    },
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const authNotice = consumeAuthNotice();
    if (!authNotice) {
      return undefined;
    }

    const noticeTimer = window.setTimeout(() => {
      setNotice(authNotice);
    }, 0);

    return () => window.clearTimeout(noticeTimer);
  }, []);

  useEffect(() => {
    if (!sessionTimeoutVisible) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSessionTimeoutVisible(false), 4_800);

    return () => window.clearTimeout(timeoutId);
  }, [sessionTimeoutVisible]);

  useEffect(() => {
    let cancelled = false;

    async function completeGoogleRedirect() {
      const result = await completeGoogleRedirectSignIn();

      if (cancelled || !result.success || !result.data) {
        return;
      }

      setIsSubmitting(true);
      const session = await loginWithFirebaseToken(result.data.token, { rememberDevice });

      if (cancelled) {
        return;
      }

      setIsSubmitting(false);

      if (!session.ok) {
        setError(session.error?.detail ?? "Google login succeeded, but Sentra session creation failed.");
        return;
      }

      const redirectTarget = (searchParams.get("from") || "/app") as Route;
      router.replace(redirectTarget);
    }

    void completeGoogleRedirect();

    return () => {
      cancelled = true;
    };
  }, [loginWithFirebaseToken, rememberDevice, router, searchParams]);

  const validationError = useMemo(() => {
    const trimmedEmail = email.trim();

    if (authStep === "phone") {
      if (!phoneLocal.trim()) {
        return "Enter a phone number.";
      }
      if (verificationId && otp.trim().length < 4) {
        return "Enter the OTP code.";
      }
      return null;
    }

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      return "Enter a valid work email address.";
    }

    if (authStep === "password" && accountIntent !== "google" && password.length < 6) {
      return "Enter your password.";
    }

    if (authStep === "create") {
      if (!displayName.trim()) {
        return "Enter your full name.";
      }
      if (password.length < 6) {
        return "Create a password with at least 6 characters.";
      }
    }

    return null;
  }, [accountIntent, authStep, displayName, email, otp, password, phoneLocal, verificationId]);

  const canSubmit = !validationError && !isSubmitting;
  const normalizedEmail = email.trim();
  const isEmailStep = authStep === "email";

  const redirectAfterLogin = () => {
    const redirectTarget = (searchParams.get("from") || "/app") as Route;
    router.replace(redirectTarget);
  };

  const resetMessages = () => {
    setError("");
    setNotice("");
    setSessionTimeoutVisible(false);
  };

  const exchangeFirebaseToken = async (idToken: string) => {
    const session = await loginWithFirebaseToken(idToken, { rememberDevice });
    if (!session.ok) {
      setError(session.error?.detail ?? "Firebase login succeeded, but Sentra session creation failed.");
      return false;
    }

    redirectAfterLogin();
    return true;
  };

  const submitLocalCredentials = async (nextEmail = email, nextPassword = password) => {
    resetMessages();
    setIsSubmitting(true);

    const result = await login(buildLoginPayload(nextEmail, nextPassword), { rememberDevice });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error?.detail ?? "Unable to sign in.");
      return;
    }

    redirectAfterLogin();
  };

  const submitPasswordLogin = async () => {
    resetMessages();
    setIsSubmitting(true);

    const result = await signInWithEmailPasswordOnly(normalizedEmail, password);

    if (!result.success || !result.data) {
      setIsSubmitting(false);
      setError(result.error?.message ?? "Unable to authenticate with Firebase.");
      return;
    }

    await exchangeFirebaseToken(result.data.token);
    setIsSubmitting(false);
  };

  const submitCreateAccount = async () => {
    resetMessages();
    setIsSubmitting(true);

    const result = await signUpWithEmailPassword(normalizedEmail, password, displayName);

    if (!result.success || !result.data) {
      setIsSubmitting(false);
      if (result.error?.code === "AUTH_PROVIDER_CONFLICT") {
        setAccountIntent("existing");
        setAuthStep("password");
        setNotice("Account found. Enter your password to continue.");
        return;
      }
      setError(result.error?.message ?? "Unable to create your Sentra access.");
      return;
    }

    await exchangeFirebaseToken(result.data.token);
    setIsSubmitting(false);
  };

  const continueWithEmail = async () => {
    resetMessages();

    const demoCredential = findDemoCredential(normalizedEmail);
    if (demoCredential) {
      setPassword(demoCredential.password);
      setAccountIntent("local");
      setAuthStep("password");
      setNotice(`${demoCredential.label} credentials filled. Review and enter Sentra OS.`);
      return;
    }

    setIsSubmitting(true);
    const lookup = await lookupEmailSignInMethods(normalizedEmail);
    setIsSubmitting(false);

    if (!lookup.success || !lookup.data) {
      setError(lookup.error?.message ?? "Unable to verify this email right now.");
      return;
    }

    if (lookup.data.preferred === "google") {
      setAccountIntent("google");
      setNotice("This email is connected to Google sign-in.");
      setAuthStep("password");
      return;
    }

    if (lookup.data.exists) {
      setAccountIntent("existing");
      setAuthStep("password");
      return;
    }

    setAccountIntent("new");
    setAuthStep("create");
  };

  const submitPhone = async () => {
    resetMessages();
    setIsSubmitting(true);

    if (!verificationId) {
      const result = await signInWithPhone(phoneNumber);
      setIsSubmitting(false);
      if (!result.success || !result.data) {
        setError(result.error?.message ?? "Unable to send OTP.");
        return;
      }
      setVerificationId(result.data.verificationId);
      setNotice(`OTP sent to ${result.data.phoneNumber}.`);
      return;
    }

    const result = await verifyOTP(otp, verificationId);
    if (!result.success || !result.data) {
      setIsSubmitting(false);
      setError(result.error?.message ?? "Unable to verify OTP.");
      return;
    }

    await exchangeFirebaseToken(result.data.token);
    setIsSubmitting(false);
  };

  const submitGoogle = async () => {
    resetMessages();
    setIsSubmitting(true);
    const result = await signInWithGoogle();
    if (!result.success || !result.data) {
      setIsSubmitting(false);
      setError(result.error?.message ?? "Unable to continue with Google.");
      return;
    }
    await exchangeFirebaseToken(result.data.token);
    setIsSubmitting(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (authStep === "email") {
      await continueWithEmail();
      return;
    }

    if (authStep === "phone") {
      await submitPhone();
      return;
    }

    if (accountIntent === "local") {
      await submitLocalCredentials();
      return;
    }

    if (accountIntent === "google") {
      await submitGoogle();
      return;
    }

    if (authStep === "create") {
      await submitCreateAccount();
      return;
    }

    await submitPasswordLogin();
  };

  const returnToEmailStep = () => {
    resetMessages();
    setAuthStep("email");
    setAccountIntent("unknown");
    setPassword("");
    setVerificationId("");
    setOtp("");
  };

  const fillDemoCredential = (credential: (typeof DEMO_AUTH_CREDENTIALS)[number], label: string) => {
    setEmail(credential.email);
    setPassword(credential.password);
    setAccountIntent("local");
    setAuthStep("password");
    setNotice(`${label} access filled. Continue when ready.`);
    setError("");
    setSessionTimeoutVisible(false);
  };

  const ctaLabel =
    authStep === "phone"
      ? verificationId
        ? "Verify and enter Sentra OS"
        : "Send secure code"
      : authStep === "email"
        ? "Continue"
        : accountIntent === "google"
          ? "Continue with Google"
          : "Enter Sentra OS";

  const stepTitle =
    authStep === "create"
      ? "Create your Sentra workspace access"
      : accountIntent === "google"
        ? "Continue securely with Google"
        : authStep === "password"
          ? "Welcome back"
          : authStep === "phone"
            ? "Continue with phone"
            : "Log in or sign up";

  const stepSubtext =
    authStep === "email"
      ? "Access Sentra command intelligence, operations, and continuity systems."
      : authStep === "create"
        ? "We'll create your protected profile and connect it to Sentra."
        : accountIntent === "google"
          ? "This workspace is linked to Google identity."
          : authStep === "phone"
            ? "Use a verified phone session for protected access."
            : `Sign in as ${normalizedEmail || "your Sentra operator account"}.`;
  const forgotPasswordCopy =
    "Forgot password? Send a secure reset link from your organization's configured identity provider.";

  return (
    <>
      {sessionTimeoutVisible ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed left-1/2 top-5 z-[90] w-[min(92vw,420px)] -translate-x-1/2 rounded-[24px] border border-white/10 bg-[#101118]/92 px-5 py-3 text-sm font-medium text-white/82 shadow-[0_22px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
          initial={{ opacity: 0, y: -12 }}
          role="status"
        >
          Your secure session expired. Sign in again.
        </motion.div>
      ) : null}

      <motion.section
        animate={{ opacity: 1, y: 0, scale: 1 }}
        aria-label="Sentra secure access"
        className="sentra-login-card group relative overflow-hidden"
        initial={{ opacity: 0, y: 10, scale: 0.985 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_13rem),linear-gradient(180deg,rgba(255,255,255,0.07),transparent_9rem)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/32 to-transparent" />

        <div className="relative">
          <div className="text-center">
            <h1 className="text-[clamp(1.65rem,3vh,2rem)] font-semibold tracking-[-0.055em] text-white">
              {stepTitle}
            </h1>
            <p className="mx-auto mt-3 max-w-[22rem] text-xs leading-5 text-white/58 sm:text-sm max-[780px]:mt-2">
              {stepSubtext}
            </p>
          </div>

          <div className="mt-[clamp(1.25rem,2.4vh,1.7rem)] space-y-3">
            <button
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.065] px-4 text-sm font-semibold text-white/86 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.095] focus:outline-none focus:ring-2 focus:ring-[#8aa7ff]/45 max-[780px]:h-11"
              disabled={isSubmitting}
              onClick={() => void submitGoogle()}
              type="button"
            >
              <FieldIcon type="google" />
              Continue with Google
            </button>
            <button
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.065] px-4 text-sm font-semibold text-white/86 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.095] focus:outline-none focus:ring-2 focus:ring-[#8aa7ff]/45 max-[780px]:h-11"
              disabled={isSubmitting}
              onClick={() => {
                resetMessages();
                setAuthStep("phone");
                setAccountIntent("unknown");
              }}
              type="button"
            >
              <FieldIcon type="phone" />
              Continue with phone
            </button>
          </div>

          <div className="my-4 flex items-center gap-3 max-[780px]:my-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/34">or</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="space-y-3 max-[780px]:space-y-2.5" onSubmit={(event) => void handleSubmit(event)}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className="space-y-3"
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                key={authStep}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {authStep === "phone" ? (
                  <>
                    <label className="relative block">
                      <span className="pointer-events-none absolute left-12 top-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/36">
                        Phone number
                      </span>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/42">
                        <FieldIcon type="phone" />
                      </span>
                      <div className="flex h-[3.18rem] rounded-2xl border border-white/10 bg-black/28 text-sm text-white transition focus-within:border-[#8aa7ff]/35 focus-within:shadow-[0_0_0_3px_rgba(138,167,255,0.10)] max-[780px]:h-[3rem]">
                        <select
                          aria-label="Country code"
                          className="ml-9 w-20 bg-transparent pl-3 pt-3 text-white outline-none"
                          onChange={(event) => {
                            const nextCountry = event.target.value;
                            setPhoneCountry(nextCountry);
                            setPhoneNumber(`${nextCountry}${phoneLocal.replace(/[^\d]/g, "")}`);
                          }}
                          value={phoneCountry}
                        >
                          {countryCodes.map((code) => (
                            <option className="bg-[#090a0f]" key={code} value={code}>
                              {code}
                            </option>
                          ))}
                        </select>
                        <input
                          autoComplete="tel-national"
                          className="min-w-0 flex-1 bg-transparent px-3 pt-3 outline-none placeholder:text-white/42"
                          inputMode="tel"
                          onChange={(event) => {
                            const nextPhone = event.target.value.replace(/[^\d\s-]/g, "");
                            setPhoneLocal(nextPhone);
                            setPhoneNumber(`${phoneCountry}${nextPhone.replace(/[^\d]/g, "")}`);
                          }}
                          placeholder="98765 43210"
                          type="tel"
                          value={phoneLocal}
                        />
                      </div>
                    </label>

                    {verificationId ? (
                      <label className="relative block">
                        <span className="pointer-events-none absolute left-12 top-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/36">
                          OTP code
                        </span>
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/42">
                          <FieldIcon type="lock" />
                        </span>
                        <input
                          autoComplete="one-time-code"
                          className="h-[3.18rem] w-full rounded-2xl border border-white/10 bg-black/28 px-12 pt-3 text-sm text-white outline-none transition placeholder:text-white/42 focus:border-[#8aa7ff]/35 focus:shadow-[0_0_0_3px_rgba(138,167,255,0.10)] max-[780px]:h-[3rem]"
                          inputMode="numeric"
                          onChange={(event) => setOtp(event.target.value)}
                          placeholder="Enter verification code"
                          type="text"
                          value={otp}
                        />
                      </label>
                    ) : null}
                  </>
                ) : (
                  <>
                    {authStep === "create" ? (
                      <label className="relative block">
                        <span className="pointer-events-none absolute left-12 top-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/36">
                          Full name
                        </span>
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/42">
                          <FieldIcon type="user" />
                        </span>
                        <input
                          autoComplete="name"
                          className="h-[3.18rem] w-full rounded-2xl border border-white/10 bg-black/28 px-12 pt-3 text-sm text-white outline-none transition placeholder:text-white/42 focus:border-[#8aa7ff]/35 focus:shadow-[0_0_0_3px_rgba(138,167,255,0.10)] max-[780px]:h-[3rem]"
                          onChange={(event) => setDisplayName(event.target.value)}
                          placeholder="Operations lead"
                          type="text"
                          value={displayName}
                        />
                      </label>
                    ) : null}

                    <label className="relative block">
                      <span className="pointer-events-none absolute left-12 top-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/36">
                        Work email
                      </span>
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/42">
                        <FieldIcon type="email" />
                      </span>
                      <input
                        autoComplete="email"
                        className="h-[3.18rem] w-full rounded-2xl border border-white/10 bg-black/28 px-12 pt-3 text-sm text-white outline-none transition placeholder:text-white/42 focus:border-[#8aa7ff]/35 focus:shadow-[0_0_0_3px_rgba(138,167,255,0.10)] max-[780px]:h-[3rem]"
                        disabled={!isEmailStep}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setAccountIntent("unknown");
                        }}
                        placeholder="Work email address"
                        type="email"
                        value={email}
                      />
                    </label>

                    {authStep === "password" || authStep === "create" ? (
                      accountIntent === "google" ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-xs leading-5 text-white/58">
                          We found a Google-linked account. Continue with Google to keep this session protected.
                        </div>
                      ) : (
                        <label className="relative block">
                          <span className="pointer-events-none absolute left-12 top-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/36">
                            Password
                          </span>
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/42">
                            <FieldIcon type="lock" />
                          </span>
                          <input
                            autoComplete={authStep === "create" ? "new-password" : "current-password"}
                            className="h-[3.18rem] w-full rounded-2xl border border-white/10 bg-black/28 px-12 pr-20 pt-3 text-sm text-white outline-none transition placeholder:text-white/42 focus:border-[#8aa7ff]/35 focus:shadow-[0_0_0_3px_rgba(138,167,255,0.10)] max-[780px]:h-[3rem]"
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                          />
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-semibold text-white/52 transition hover:bg-white/10 hover:text-white"
                            onClick={() => setShowPassword((current) => !current)}
                            type="button"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </label>
                      )
                    ) : null}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-white/54">
                <input
                  checked={rememberDevice}
                  className="h-4 w-4 accent-[#8aa7ff]"
                  onChange={(event) => setRememberDevice(event.target.checked)}
                  type="checkbox"
                />
                Remember device
              </label>
              {authStep === "password" ? (
                <button
                  className="text-xs font-semibold text-white/58 transition hover:text-white"
                  onClick={() => {
                    setForgotOpen((current) => !current);
                    setNotice("");
                  }}
                  type="button"
                >
                  Forgot password?
                </button>
              ) : authStep === "email" ? null : (
                <button className="text-xs font-semibold text-white/58 transition hover:text-white" onClick={returnToEmailStep} type="button">
                  Use email instead
                </button>
              )}
            </div>

            {forgotOpen ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/58">
                {forgotPasswordCopy}
              </div>
            ) : null}

            {notice ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-white/68">
                {notice}
              </p>
            ) : null}

            {error ? (
              <div className="space-y-2">
                <p className="rounded-2xl border border-[#ff7d7d]/22 bg-[#ff7d7d]/10 px-3 py-2 text-xs text-[#ffd0d0]">
                  {error}
                </p>
                {error.includes("Firebase authorized domains") || error.includes("authorized domains") ? (
                  <div className="rounded-2xl border border-sky-400/25 bg-sky-950/40 p-3 text-xs text-sky-200">
                    <p className="font-semibold text-white">To enable Google OAuth on Vercel:</p>
                    <p className="mt-1 text-white/70">
                      In Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains, add <code className="rounded bg-black/40 px-1 py-0.5 text-cyan-300">sentra-01.vercel.app</code>.
                    </p>
                    <button
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-400/35 bg-sky-500/20 py-2 text-xs font-bold text-white transition hover:bg-sky-500/30"
                      onClick={() => void submitLocalCredentials(DEMO_AUTH_CREDENTIALS[0]!.email, DEMO_AUTH_CREDENTIALS[0]!.password)}
                      type="button"
                    >
                      ⚡ Instant Access: Enter as Commander Now
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              className="sentra-auth-primary-button relative inline-flex h-[3.12rem] w-full items-center justify-center overflow-hidden rounded-full border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(224,229,244,0.9))] px-4 text-sm font-semibold text-[#12131a] shadow-[0_18px_44px_rgba(124,124,255,0.14)] transition-all duration-150 hover:-translate-y-0.5 hover:border-white/30 hover:shadow-[0_22px_50px_rgba(138,167,255,0.18)] focus:outline-none focus:ring-2 focus:ring-[#8aa7ff]/55 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-75 max-[780px]:h-[3rem]"
              disabled={!canSubmit}
              type="submit"
            >
              <span className={isSubmitting ? "opacity-0" : "opacity-100"}>{ctaLabel}</span>
              {isSubmitting ? (
                <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
                  <Spinner />
                  Verifying credentials...
                </span>
              ) : null}
            </button>
            <div id="firebase-recaptcha" className="sr-only" />
          </form>

          {authStep !== "email" && authStep !== "phone" ? (
            <button
              className="mt-2 w-full rounded-full px-3 py-2 text-xs font-semibold text-white/46 transition hover:bg-white/[0.04] hover:text-white/72"
              onClick={returnToEmailStep}
              type="button"
            >
              Change email
            </button>
          ) : null}

          <div className="mt-3 flex flex-wrap justify-center gap-1.5" aria-label="Demo role quick access">
            {roleQuickAccess.map(({ credential, label }) => (
              <button
                className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-white/58 transition hover:-translate-y-0.5 hover:border-[#8aa7ff]/28 hover:bg-white/[0.08] hover:text-white/86 focus:outline-none focus:ring-2 focus:ring-[#8aa7ff]/35"
                disabled={isSubmitting}
                key={label}
                onClick={() => fillDemoCredential(credential, label)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.section>
    </>
  );
}
