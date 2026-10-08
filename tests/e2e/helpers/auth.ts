import type { BrowserContext, Page } from "@playwright/test";

export const MOCK_AUTH_USER = {
  uid: "test-operator-01",
  email: "admin@sentra.local",
  displayName: "Sentra Operator",
  role: "admin",
  tenantId: "TEN-BALA-UNI",
  organizationName: "Grand Meridian Command",
  permissions: [
    "*",
    "dashboard.view",
    "alerts.view",
    "alerts.trigger",
    "incidents.view",
    "incidents.manage",
    "analytics.view",
    "analytics.executive",
    "routes.view",
    "routes.manage",
    "zones.manage",
    "staff.coordinate",
    "tasks.update",
    "operations.manage",
    "governance.approve",
    "facility.control",
    "hardware.control",
    "field.respond",
    "field.manage",
    "responder.tools",
    "reports.view",
    "reports.export",
    "settings.manage",
    "users.manage",
    "roles.manage",
    "system.admin",
  ],
  accessibleModules: ["all"],
};

export async function setupAuthSession(context: BrowserContext, page?: Page) {
  await context.addCookies([
    {
      name: "sentra_session",
      value: "active",
      path: "/",
      domain: "localhost",
    },
    {
      name: "sentra_session",
      value: "active",
      path: "/",
      domain: "127.0.0.1",
    },
    {
      name: "sentra_access_token",
      value: "mock-test-access-token",
      path: "/",
      domain: "localhost",
    },
    {
      name: "sentra_access_token",
      value: "mock-test-access-token",
      path: "/",
      domain: "127.0.0.1",
    },
  ]);

  if (page) {
    await page.addInitScript((user) => {
      window.localStorage.setItem(
        "sentra_local_auth",
        JSON.stringify({
          accessToken: "mock-test-access-token",
          refreshToken: "mock-test-refresh-token",
          accessTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          accessTokenIssuedAt: new Date().toISOString(),
          tokenRefreshedAt: new Date().toISOString(),
          user,
        })
      );
    }, MOCK_AUTH_USER);
  }
}
