import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/balashanmugam/.gemini/antigravity/brain/d973ed20-c81f-4bad-b222-075db166fe35";
const BASE_URL = "http://localhost:3005";

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop 1440x900
  const context1440 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark"
  });
  const page1440 = await context1440.newPage();
  
  await page1440.addInitScript(() => {
    window.localStorage.setItem("sentra-theme", "dark");
  });
  
  console.info("Navigating to login...");
  await page1440.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "after-login-1440.png") });
  
  // Click Admin Console role quick access
  console.info("Clicking 'Admin Console' quick access...");
  await page1440.click("button:has-text('Admin Console')");
  await page1440.waitForTimeout(800);
  
  // Click Enter Sentra OS
  console.info("Clicking Enter Sentra OS button...");
  const enterBtn = page1440.locator("button[type='submit']");
  await enterBtn.click();
  
  console.info("Waiting for navigation to /app...");
  await page1440.waitForURL("**/app**", { timeout: 15000 });
  await page1440.waitForTimeout(3000);
  
  console.info("Navigating to executive mode...");
  await page1440.goto(`${BASE_URL}/app?mode=executive`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(4000);
  
  console.info("Capturing desktop after screenshot...");
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "after-app-1440.png"), fullPage: false });
  
  // 2. Mobile 390x844
  const context390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
    colorScheme: "dark"
  });
  const page390 = await context390.newPage();
  
  // Transfer cookies & auth state
  const cookies = await context1440.cookies();
  await context390.addCookies(cookies);
  
  const localStorageData = await page1440.evaluate(() => JSON.stringify(window.localStorage));
  await page390.addInitScript(() => {
    window.localStorage.setItem("sentra-theme", "dark");
  });
  await page390.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page390.evaluate((data) => {
    const parsed = JSON.parse(data);
    for (const [key, value] of Object.entries(parsed)) {
      window.localStorage.setItem(key, value);
    }
  }, localStorageData);
  
  console.info("Navigating to mobile /app...");
  await page390.goto(`${BASE_URL}/app`, { waitUntil: "domcontentloaded" });
  await page390.waitForTimeout(4000);
  
  console.info("Capturing mobile after screenshot...");
  await page390.screenshot({ path: path.join(ARTIFACTS_DIR, "after-app-390.png") });
  
  await browser.close();
  console.info("All after screenshots captured successfully!");
}

main().catch(err => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
