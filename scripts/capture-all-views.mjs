import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/balashanmugam/.gemini/antigravity/brain/d973ed20-c81f-4bad-b222-075db166fe35";
const BASE_URL = "http://localhost:3005";

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Landing 1440x900
  console.info("Capturing after-landing-1440.png...");
  const pageLanding = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageLanding.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await pageLanding.waitForTimeout(2000);
  await pageLanding.screenshot({ path: path.join(ARTIFACTS_DIR, "after-landing-1440.png") });
  await pageLanding.close();

  // 2. Login 1440x900
  console.info("Capturing after-login-1440.png...");
  const pageLogin = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageLogin.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await pageLogin.waitForTimeout(1500);
  await pageLogin.screenshot({ path: path.join(ARTIFACTS_DIR, "after-login-1440.png") });
  
  // Authenticate session on this page
  console.info("Authenticating via Admin Console quick access...");
  await pageLogin.click("button:has-text('Admin Console')");
  await pageLogin.waitForTimeout(600);
  await pageLogin.click("button[type='submit']");
  await pageLogin.waitForURL("**/app**", { timeout: 15000 });
  await pageLogin.waitForTimeout(2500);
  
  // Save storage state for reuse across all authenticated views
  const storageState = await pageLogin.context().storageState();
  await pageLogin.close();

  // Helper for authenticated pages
  async function captureAuthPage(urlPath, filename, viewport = { width: 1440, height: 900 }, mobile = false) {
    console.info(`Capturing ${filename}...`);
    const context = await browser.newContext({
      viewport,
      storageState,
      userAgent: mobile 
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1"
        : undefined,
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${urlPath}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, filename) });
    await context.close();
  }

  // 3. Executive Workspace
  await captureAuthPage("/app?mode=executive", "after-executive-1440.png");

  // Also capture default after-app-1440.png
  await captureAuthPage("/app", "after-app-1440.png");

  // 4. Command Workspace
  await captureAuthPage("/app?mode=command", "after-command-1440.png");

  // 5. Demo Workspace
  await captureAuthPage("/app?mode=demo", "after-demo-1440.png");

  // 6. Crisis Workspace
  await captureAuthPage("/app?mode=crisis", "after-crisis-1440.png");

  // 7. Incidents
  await captureAuthPage("/app/incidents", "after-incidents-1440.png");

  // 8. Analytics
  await captureAuthPage("/app/analytics", "after-analytics-1440.png");

  // 9. Settings
  await captureAuthPage("/app/settings", "after-settings-1440.png");

  // 10. Tablet (768x1024)
  await captureAuthPage("/app", "after-tablet-768.png", { width: 768, height: 1024 });

  // 11. Mobile (390x844)
  await captureAuthPage("/app", "after-app-390.png", { width: 390, height: 844 }, true);

  await browser.close();
  console.info("All 11 target screenshots successfully captured to artifacts directory!");
}

main().catch(err => {
  console.error("Error capturing views:", err);
  process.exit(1);
});
