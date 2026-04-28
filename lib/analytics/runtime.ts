import type { AnalyticsHubSummary } from "@/lib/analytics/types";

export const fallbackAnalyticsHubSummary: AnalyticsHubSummary = {
  analytics_supremacy_score: 93,
  domains: ["executive", "crisis", "ai", "government"],
  metrics: {
    executive: [
      { metric_id: "MET-ARR", tenant_id: "GLOBAL", domain: "executive", label: "ARR trend", value: 4800000, unit: "usd", trend: 18, insight: "Enterprise expansion pipeline is compounding." },
      { metric_id: "MET-ROI", tenant_id: "GLOBAL", domain: "executive", label: "ROI saved", value: 2100000, unit: "usd", trend: 24, insight: "Recovery automation reduces downtime exposure." },
    ],
    crisis: [
      { metric_id: "MET-RESP", tenant_id: "GLOBAL", domain: "crisis", label: "Avg response time", value: 4.2, unit: "min", trend: -12, insight: "Automation and communications cut response time." },
      { metric_id: "MET-CONTAIN", tenant_id: "GLOBAL", domain: "crisis", label: "Containment rate", value: 94, unit: "%", trend: 7, insight: "Twin-guided route plans improve containment." },
    ],
    ai: [
      { metric_id: "MET-TRUST", tenant_id: "GLOBAL", domain: "ai", label: "AI trust score", value: 91, unit: "%", trend: 5, insight: "Overrides are falling as recommendations improve." },
      { metric_id: "MET-ACCURACY", tenant_id: "GLOBAL", domain: "ai", label: "Forecast precision", value: 89, unit: "%", trend: 4, insight: "MLOps drift controls are stabilizing model quality." },
    ],
    government: [
      { metric_id: "MET-CITY", tenant_id: "GLOBAL", domain: "government", label: "Civic readiness", value: 87, unit: "%", trend: 9, insight: "Hospital load and weather feeds enrich city forecasts." },
    ],
  },
  scenario_simulator: {
    options: ["churn next quarter", "likely incidents next week", "hardware failures", "weather disruption", "PR reputation risk"],
    recommended: "Pre-stage field teams for weather pressure and hardware fatigue in APAC.",
    confidence: 90,
  },
};
