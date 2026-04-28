export const polishPrinciples = [
  "Glass command cards with high-contrast readability",
  "Animated KPI rhythm without distracting operators",
  "Skeleton-first loading and graceful backend fallback",
  "Executive mode that compresses complexity into decisions",
  "Keyboard-presentable flows for judges, investors, and buyers",
];

export const designSystemModules = [
  "Elite buttons",
  "KPI cards",
  "Animated stat tiles",
  "Tactical tables",
  "Severity badges",
  "Confidence meters",
  "Fullscreen panels",
  "Slide drawers",
  "Command prompts",
  "Notification toasts",
];

export const polishPerformance = [
  { label: "Request dedupe", value: "active" },
  { label: "Route chunking", value: "105 pages built" },
  { label: "Fallback hydration", value: "enabled" },
  { label: "Polling discipline", value: "cache-aware" },
];

export function polishTone(score: number) {
  if (score >= 95) return "text-emerald-200";
  if (score >= 90) return "text-cyan-200";
  if (score >= 80) return "text-amber-200";
  return "text-rose-200";
}

