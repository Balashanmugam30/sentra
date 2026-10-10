import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/balashanmugam/.gemini/antigravity/brain/d973ed20-c81f-4bad-b222-075db166fe35";
const BASE_URL = "http://localhost:3005";

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Landing 1440x900
  console.info("Capturing before-landing-1440.png...");
  const pageLanding = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageLanding.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await pageLanding.waitForTimeout(2000);
  await pageLanding.screenshot({ path: path.join(ARTIFACTS_DIR, "before-landing-1440.png") });
  await pageLanding.close();

  // 2. App 1440x900
  console.info("Capturing before-app-1440.png...");
  const pageApp = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageApp.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await pageApp.waitForTimeout(600);
  await pageApp.click("button:has-text('Admin Console')");
  await pageApp.waitForTimeout(600);
  await pageApp.click("button[type='submit']");
  await pageApp.waitForURL("**/app**", { timeout: 15000 });
  await pageApp.waitForTimeout(2500);
  await pageApp.screenshot({ path: path.join(ARTIFACTS_DIR, "before-app-1440.png") });
  await pageApp.close();

  // 3. Mobile 390x844
  console.info("Capturing before-app-390.png...");
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await pageMobile.waitForTimeout(600);
  await pageMobile.click("button:has-text('Admin Console')");
  await pageMobile.waitForTimeout(600);
  await pageMobile.click("button[type='submit']");
  await pageMobile.waitForURL("**/app**", { timeout: 15000 });
  await pageMobile.waitForTimeout(2500);
  await pageMobile.screenshot({ path: path.join(ARTIFACTS_DIR, "before-app-390.png") });
  await contextMobile.close();

  await browser.close();
  console.info("Captured all 3 before screenshots successfully!");
}

main().catch(err => {
  console.error("Error capturing before screenshots:", err);
  process.exit(1);
});
