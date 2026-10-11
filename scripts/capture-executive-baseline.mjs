import { chromium } from "@playwright/test";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/balashanmugam/.gemini/antigravity/brain/d973ed20-c81f-4bad-b222-075db166fe35";
const BASE_URL = "https://sentra-01.vercel.app";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // 1. Login to get authenticated session
  console.info("Logging in via Admin Console...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await page.click("button:has-text('Admin Console')");
  await page.waitForTimeout(800);
  await page.click("button[type='submit']");
  await page.waitForURL("**/app**", { timeout: 35000 });
  await page.waitForTimeout(2000);

  // 2. Open /executive route
  console.info("Navigating to /executive...");
  await page.goto(`${BASE_URL}/executive`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  // Inspect computed styles
  const inspection = await page.evaluate(() => {
    const mainEl = document.querySelector("main");
    const heroEl = document.querySelector(".sentra-analytics-hero");
    const kpiEl = document.querySelector(".sentra-analytics-kpi");
    const kpiTitle = document.querySelector(".sentra-analytics-kpi p");
    const briefingEl = document.querySelector("section.overflow-hidden");

    function getStyles(el) {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        bg: s.backgroundColor,
        bgImg: s.backgroundImage?.slice(0, 80),
        color: s.color,
        fontFamily: s.fontFamily,
        border: s.borderColor,
      };
    }

    return {
      main: getStyles(mainEl),
      hero: getStyles(heroEl),
      kpi: getStyles(kpiEl),
      kpiTitle: getStyles(kpiTitle),
      briefing: getStyles(briefingEl),
    };
  });

  console.info("Computed styles on /executive:", JSON.stringify(inspection, null, 2));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "baseline-executive-route-rejected.png") });
  console.info("Saved baseline-executive-route-rejected.png!");
  await browser.close();
}

main().catch(console.error);
