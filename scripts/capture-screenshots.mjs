import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/balashanmugam/.gemini/antigravity/brain/d973ed20-c81f-4bad-b222-075db166fe35";
const BASE_URL = "http://localhost:3005";

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop 1440x900 - Light Theme
  const context1440 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light"
  });
  const page1440 = await context1440.newPage();
  
  await page1440.addInitScript(() => {
    window.localStorage.setItem("sentra-theme", "light");
  });
  
  console.info("1. Capturing Login screen (1440x900)...");
  await page1440.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(1000);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "after-login-1440.png") });
  
  // Fill Admin Console demo credentials and submit
  console.info("Clicking 'Admin Console' quick access...");
  await page1440.click("button:has-text('Admin Console')");
  await page1440.waitForTimeout(600);
  
  console.info("Clicking submit button...");
  const enterBtn = page1440.locator("button[type='submit']");
  await enterBtn.click();
  
  console.info("Waiting for navigation to /app...");
  await page1440.waitForURL("**/app**", { timeout: 15000 });
  await page1440.waitForTimeout(2000);
  
  // 2. Executive workspace (1440x900)
  console.info("2. Capturing Executive dashboard (1440x900)...");
  await page1440.goto(`${BASE_URL}/app?mode=executive`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(2500);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "after-app-1440.png"), fullPage: false });
  
  // 3. Command workspace (1440x900)
  console.info("3. Capturing Command workspace (1440x900)...");
  await page1440.goto(`${BASE_URL}/app?mode=command`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(2500);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "after-command-1440.png"), fullPage: false });
  
  // 4. Crisis workspace (1440x900)
  console.info("4. Capturing Crisis workspace (1440x900)...");
  await page1440.goto(`${BASE_URL}/app?mode=crisis`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(2500);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "after-crisis-1440.png"), fullPage: false });
  
  // 5. Demo workspace (1440x900)
  console.info("5. Capturing Demo workspace (1440x900)...");
  await page1440.goto(`${BASE_URL}/app?mode=demo`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(2500);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "after-demo-1440.png"), fullPage: false });
  
  // 6. Incidents page (1440x900)
  console.info("6. Capturing Incidents page (1440x900)...");
  await page1440.goto(`${BASE_URL}/app/incidents`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(2500);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "after-incidents-1440.png"), fullPage: false });
  
  // 7. Analytics page (1440x900)
  console.info("7. Capturing Analytics page (1440x900)...");
  await page1440.goto(`${BASE_URL}/app/analytics`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(2500);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "after-analytics-1440.png"), fullPage: false });
  
  // Auth state for other contexts
  const cookies = await context1440.cookies();
  const localStorageData = await page1440.evaluate(() => JSON.stringify(window.localStorage));
  
  // 8. Tablet layout 768x1024
  console.info("8. Capturing Tablet layout (768x1024)...");
  const context768 = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    colorScheme: "light"
  });
  const page768 = await context768.newPage();
  await page768.addInitScript(() => {
    window.localStorage.setItem("sentra-theme", "light");
  });
  await page768.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page768.waitForTimeout(600);
  await page768.click("button:has-text('Admin Console')");
  await page768.waitForTimeout(600);
  await page768.click("button[type='submit']");
  await page768.waitForURL("**/app**", { timeout: 15000 });
  await page768.waitForTimeout(2500);
  await page768.screenshot({ path: path.join(ARTIFACTS_DIR, "after-tablet-768.png") });
  
  // 9. Mobile layout 390x844
  console.info("9. Capturing Mobile layout (390x844)...");
  const context390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
    colorScheme: "light"
  });
  const page390 = await context390.newPage();
  await page390.addInitScript(() => {
    window.localStorage.setItem("sentra-theme", "light");
  });
  await page390.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page390.waitForTimeout(600);
  await page390.click("button:has-text('Admin Console')");
  await page390.waitForTimeout(600);
  await page390.click("button[type='submit']");
  await page390.waitForURL("**/app**", { timeout: 15000 });
  await page390.waitForTimeout(2500);
  await page390.screenshot({ path: path.join(ARTIFACTS_DIR, "after-app-390.png") });
  
  await browser.close();
  console.info("All 9 required screenshots captured successfully!");
}

main().catch(err => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
