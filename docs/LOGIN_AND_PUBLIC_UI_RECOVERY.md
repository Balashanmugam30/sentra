# SENTRA — Login Restoration & Public UI Recovery Report

## Executive Summary

This document details the targeted recovery of Sentra's original dark cyber landing page and login interface alongside the definitive resolution of the authentication session eviction loop. 

All changes have been tested, committed, pushed to GitHub `main`, and validated against the live production deployment at [https://sentra-01.vercel.app](https://sentra-01.vercel.app).

---

## 1. Targeted Historical Git Restoration

As requested, the public landing page (`/`) and login screen (`/login`) were cleanly restored from their exact historical Git snapshots rather than being subjected to light-first enterprise dashboard restyling.

### 1.1 Restored Components

- **From Commit `a2490ca6d1df7b3117a23238a3b7f04bcf5c0f93`**:
  - `components/landing/ai-section.tsx`
  - `components/landing/cta-section.tsx`
  - `components/landing/feature-section.tsx`
  - `components/landing/hero-section.tsx`
  - `components/landing/landing-experience.tsx`
  - `components/landing/navbar.tsx`
  - `components/landing/system-preview-section.tsx`
  - `modules/auth/components/login-screen.tsx`

- **From Commit `177b8c945fa743c82b482bf103eaf123500764a4`**:
  - `components/security/login-form.tsx`
  - `.sentra-login-page` and `.sentra-login-card` in `app/globals.css` (retaining the 28px border-radius, dark glass surface, and aurora curved backdrop).

- **Preservation of App Dashboard**:
  - The authenticated application layout (`/app`, `/app/command`, `/app/incidents`, `/app/analytics`, `/app/settings`) was strictly preserved as the light-first porcelain enterprise UI.
  - The brand logo component `components/brand/sentra-logo.tsx` was retained for `/app` header branding.

---

## 2. Authentication Root Causes & Fixes

### 2.1 Root Cause 1: Unauthenticated 401 Eviction Loop
- **Diagnosis**: 
  1. On first visit to any page, `use-auth.ts` executed `restoreSession()`.
  2. If the user was unauthenticated, `restoreSession()` unconditionally invoked `/auth/me` and `/auth/refresh`.
  3. The backend returned `401 Unauthorized`.
  4. In `lib/core/api-client.ts`, any `401` response triggered `redirectToLogin("session-expired")`.
  5. Visiting `/login` immediately displayed `"Your secure session expired. Sign in again."` even before logging in.
- **Resolution**:
  - `restoreSession()` in `lib/auth/use-auth.ts` now short-circuits with `{ ok: false }` if no access token or refresh token exists in local storage.
  - `redirectToLogin()` in `lib/core/api-client.ts` verifies that the current route is not already public/login and that an active session was previously present before initiating any eviction redirect.

### 2.2 Root Cause 2: Instant 1-Second Session Timeout in `SessionBanner`
- **Diagnosis**:
  1. Zustand's `persist` middleware in `store/auth-store.ts` serialized `sessionExpiresAt` and `lastActivityAt` into `localStorage`.
  2. When logging in or restoring an old tab, stale timestamps caused `now >= sessionExpiresAt` to evaluate as `true` almost immediately.
  3. `SessionBanner.tsx` detected expiration and invoked `logout()`, routing to `/login?reason=session-timeout` within 1 second of entering `/app`.
- **Resolution**:
  - In `store/auth-store.ts`, ephemeral timer states (`sessionExpiresAt`, `sessionWarningAt`, `lastActivityAt`, `sessionTimeoutVisible`) are now excluded from persistent storage, or validated and extended to valid future timestamps upon rehydration.
  - In `components/security/session-banner.tsx`, timestamp parsing was normalized and grace periods extended to ensure robust multi-tab operation without false evictions.
  - In `components/security/login-form.tsx`, any active session timeout banner is explicitly cleared when selecting demo credentials or interacting with the form.

### 2.3 Root Cause 3: Safe Admin Provisioning & Bootstrap Hardening
- **Diagnosis**: `/auth/bootstrap-admin` required protection against unauthorized or repeated invocations in multi-environment configurations.
- **Resolution**:
  - Added `auth_bootstrap_secret` (`SENTRA_BOOTSTRAP_SECRET` / `BOOTSTRAP_SECRET`) configuration support in `app/core/config.py`.
  - Added optional `secret` payload attribute in `app/auth/schemas.py` and `lib/auth/types.ts`.
  - Updated `app/auth/router.py` to enforce secret verification when configured and return deterministic `409 Conflict` if an admin already exists.
  - Added regression test suite in `tests/test_demo_auth_and_session.py`.

---

## 3. Verification & Evidence Matrix

| Check | Tool / Method | Target | Result | Evidence |
|---|---|---|---|---|
| Python Test Suite | `pytest` | Backend Auth & Security | PASSED (75/75) | `tests/test_demo_auth_and_session.py` passed |
| TypeScript Check | `npm run typecheck` | Next.js Codebase | PASSED (0 errors) | Clean compilation across all 163 routes |
| Linter | `npm run lint` | Next.js Codebase | PASSED (0 errors) | Zero ESLint errors or warnings |
| Next.js Build | `npm run build` | Frontend App | PASSED | Full production static/SSR build |
| Production Deploy | Vercel CLI | `https://sentra-01.vercel.app` | READY | Deployment `dpl_6cg8bnR7WuW2RFbGuZf1yLZx8y9c` |
| Landing Page Visual | Playwright | `/` | VERIFIED | `recovered-landing-1440.png` (dark aurora wave + typography) |
| Login Page Visual | Playwright | `/login` | VERIFIED | `recovered-login-1440.png` (dark glass card, no false banner) |
| Login Execution | Playwright | `/login` -> `/app` | VERIFIED | Seamless login via demo admin pill |
| Session Stability | Playwright | `/app` (5s wait + reload) | VERIFIED | `recovered-app-authenticated-1440.png` (zero evictions, persistent session) |

---

## 4. Key Artifacts

1. **`recovered-landing-1440.png`**: Visual proof of the restored original dark landing page with dotted background, cyan/violet gradient wave, and typography.
2. **`recovered-login-1440.png`**: Visual proof of the restored original dark cyber login card with pill-button role selectors and without premature warning banners.
3. **`recovered-app-authenticated-1440.png`**: Visual proof of authenticated access on `/app` showing the clean light-first porcelain dashboard remaining active and stable without session timeouts.

---

## 5. Canonical Git References

- `c69ccc4`: `feat(ui): restore original dark cyber landing and login interfaces from git history`
- `04ecb63`: `fix(auth): resolve session timeout loop, prevent unauthenticated 401 eviction, and harden bootstrap-admin`
