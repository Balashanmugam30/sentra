import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/balashanmugam/.gemini/antigravity/brain/d973ed20-c81f-4bad-b222-075db166fe35";
const BASE_URL = "https://sentra-01.vercel.app";

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Unauthenticated landing and login check (must be preserved dark baseline)
  console.info("Testing public landing and login...");
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page1440.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(3000);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "final-landing-1440.png") });

  await page1440.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(2000);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "final-login-1440.png") });

  // 2. Perform authentic login via Admin Console
  console.info("Logging into Admin Console...");
  await page1440.click("button:has-text('Admin Console')");
  await page1440.waitForTimeout(800);
  await page1440.click("button[type='submit']");
  await page1440.waitForURL("**/app**", { timeout: 35000 });
  await page1440.waitForTimeout(3000);

  // 3. Capture /app dashboard
  console.info("Capturing /app dashboard...");
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "final-app-1440.png") });

  // 4. Capture /executive route at 1440x900
  console.info("Capturing /executive desktop...");
  await page1440.goto(`${BASE_URL}/executive`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(4000);

  const executiveComputed = await page1440.evaluate(() => {
    const mainEl = document.querySelector("main") || document.body;
    const bodyEl = document.body;
    const cards = Array.from(document.querySelectorAll("[data-section-id='executive-summary'] .rounded-xl, .sentra-analytics-hero, section .rounded-xl"));
    const primaryHeading = document.querySelector("h1, h2");

    const getStyles = (el) => {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        bg: s.backgroundColor,
        color: s.color,
        fontFamily: s.fontFamily,
        border: s.borderColor,
      };
    };

    return {
      body: getStyles(bodyEl),
      main: getStyles(mainEl),
      heading: getStyles(primaryHeading),
      sampleCard: cards[0] ? getStyles(cards[0]) : null,
    };
  });

  console.info("Executive computed styles (1440x900):", JSON.stringify(executiveComputed, null, 2));
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "final-executive-1440.png") });

  // 5. Capture other primary authenticated routes
  console.info("Capturing /app/analytics...");
  await page1440.goto(`${BASE_URL}/app/analytics`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(4000);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "final-analytics-1440.png") });

  console.info("Capturing /app/incidents...");
  await page1440.goto(`${BASE_URL}/app/incidents`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(4000);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "final-incidents-1440.png") });

  // 6. Capture mobile viewport 390x844 on /executive within authenticated session
  console.info("Capturing mobile /executive (390x844)...");
  await page1440.setViewportSize({ width: 390, height: 844 });
  await page1440.goto(`${BASE_URL}/executive`, { waitUntil: "domcontentloaded" });
  await page1440.waitForTimeout(4000);
  await page1440.screenshot({ path: path.join(ARTIFACTS_DIR, "final-executive-390.png") });

  await browser.close();
  console.info("All verification screenshots successfully captured!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
