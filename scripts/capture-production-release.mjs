import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/balashanmugam/.gemini/antigravity/brain/d973ed20-c81f-4bad-b222-075db166fe35";
const BASE_URL = "https://sentra-01.vercel.app";

async function main() {
  console.info(`Starting production release verification against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  
  // 1. Landing 1440x900
  console.info("Capturing release-landing-1440.png...");
  const pageLanding = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageLanding.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await pageLanding.waitForTimeout(2000);
  await pageLanding.screenshot({ path: path.join(ARTIFACTS_DIR, "release-landing-1440.png") });
  await pageLanding.close();

  // 2. Login 1440x900
  console.info("Capturing release-login-1440.png...");
  const pageLogin = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageLogin.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await pageLogin.waitForTimeout(2000);
  await pageLogin.screenshot({ path: path.join(ARTIFACTS_DIR, "release-login-1440.png") });
  
  // Authenticate session on this page
  console.info("Authenticating via Admin Console quick access...");
  await pageLogin.click("button:has-text('Admin Console')");
  await pageLogin.waitForTimeout(800);
  await pageLogin.click("button[type='submit']");
  
  // Wait for redirect to /app
  console.info("Waiting for /app navigation...");
  await pageLogin.waitForURL("**/app**", { timeout: 35000 });
  await pageLogin.waitForTimeout(3000);
  
  // Save storage state for reuse across all authenticated views
  const storageState = await pageLogin.context().storageState();
  await pageLogin.close();

  // Helper for authenticated pages
  async function captureAuthPage(urlPath, filename, options = {}) {
    console.info(`Capturing ${filename}...`);
    const { 
      viewport = options.width && options.height ? { width: options.width, height: options.height } : { width: 1440, height: 900 }, 
      mobile = false, 
      colorScheme = "light" 
    } = options;
    const context = await browser.newContext({
      viewport,
      storageState,
      colorScheme,
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

  // 3. Executive Workspace (Default)
  await captureAuthPage("/app?mode=executive", "release-app-executive-1440.png");

  // 4. Default /app
  await captureAuthPage("/app", "release-app-1440.png");

  // 5. Command Workspace
  await captureAuthPage("/app?mode=command", "release-app-command-1440.png");

  // 6. Demo Workspace
  await captureAuthPage("/app?mode=demo", "release-app-demo-1440.png");

  // 7. Crisis Workspace
  await captureAuthPage("/app?mode=crisis", "release-app-crisis-1440.png");

  // 8. Incidents
  await captureAuthPage("/app/incidents", "release-incidents-1440.png");

  // 9. Analytics
  await captureAuthPage("/app/analytics", "release-analytics-1440.png");

  // 10. Mobile 390x844
  await captureAuthPage("/app", "release-mobile-390.png", { width: 390, height: 844, mobile: true });

  // 11. Dark colorScheme OS test
  await captureAuthPage("/app?mode=executive", "release-dark-mode-test-1440.png", { colorScheme: "dark" });

  await browser.close();
  console.info("All production release verification screenshots successfully captured!");
}

main().catch(err => {
  console.error("Error capturing production views:", err);
  process.exit(1);
});
