"use client";

import type { RevenueBillingSnapshot } from "@/lib/revenue/types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

export function percentOf(used: number, included: number) {
  return Math.min(100, Math.round((used / Math.max(1, included)) * 100));
}

export function statusClass(status: string) {
  if (["paid", "active", "low"].includes(status)) {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  }
  if (["open", "medium", "trial", "cancel_at_renewal"].includes(status)) {
    return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  }
  if (["overdue", "failed", "past_due", "high", "critical"].includes(status)) {
    return "border-rose-300/30 bg-rose-400/10 text-rose-100";
  }
  return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
}

export function buildLocalRevenueSnapshot(): RevenueBillingSnapshot {
  const plans = [
    {
      plan_key: "starter",
      name: "Starter",
      audience: "Small teams proving Sentra in one facility",
      monthly_price: 490,
      yearly_price: 4_900,
      included_seats: 12,
      max_seats: 35,
      ai_quota: 1_500,
      api_quota: 80_000,
      storage_quota_gb: 120,
      support_tier: "Standard email",
      enabled_modules: ["alerts", "mobile", "iot_basic", "reports"],
      upgrade_signal: "Upgrade when usage reaches multi-site operations.",
    },
    {
      plan_key: "growth",
      name: "Growth",
      audience: "Regional operators standardizing response workflows",
      monthly_price: 1_900,
      yearly_price: 19_000,
      included_seats: 40,
      max_seats: 140,
      ai_quota: 8_000,
      api_quota: 420_000,
      storage_quota_gb: 800,
      support_tier: "Priority support",
      enabled_modules: ["alerts", "mobile", "iot", "ai_decision", "ops", "premium_reports"],
      upgrade_signal: "Enterprise recommended for SLA, SSO, and advanced AI autonomy.",
    },
    {
      plan_key: "enterprise",
      name: "Enterprise",
      audience: "Large deployments with advanced AI and uptime commitments",
      monthly_price: 8_500,
      yearly_price: 85_000,
      included_seats: 180,
      max_seats: 1_200,
      ai_quota: 55_000,
      api_quota: 2_500_000,
      storage_quota_gb: 6_000,
      support_tier: "24/7 SLA support",
      enabled_modules: ["all_core", "advanced_ai", "ops", "executive", "security", "ecosystem"],
      upgrade_signal: "Government tier recommended for sovereign and isolated environments.",
    },
    {
      plan_key: "government",
      name: "Government",
      audience: "Sovereign agencies and public infrastructure operators",
      monthly_price: 18_000,
      yearly_price: 180_000,
      included_seats: 400,
      max_seats: 5_000,
      ai_quota: 140_000,
      api_quota: 8_000_000,
      storage_quota_gb: 20_000,
      support_tier: "Sovereign command support",
      enabled_modules: ["all_core", "government", "world", "omega", "audit_plus", "isolated_env"],
      upgrade_signal: "Custom Strategic for national rollouts and bespoke integrations.",
    },
    {
      plan_key: "custom_strategic",
      name: "Custom Strategic",
      audience: "Negotiated global, defense, and national infrastructure programs",
      monthly_price: 0,
      yearly_price: 0,
      included_seats: 1_000,
      max_seats: null,
      ai_quota: 500_000,
      api_quota: 30_000_000,
      storage_quota_gb: 100_000,
      support_tier: "Named success, security, and deployment team",
      enabled_modules: ["platform_all", "bespoke_integrations", "private_deployments", "command_governance"],
      upgrade_signal: "Board-approved commercial architecture required.",
    },
  ];

  const forecast = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const base = 73_400;
    return {
      month: `M${month}`,
      conservative: Math.round(base * 1.035 ** month),
      expected: Math.round(base * 1.062 ** month + month * 2_400),
      aggressive: Math.round(base * 1.091 ** month + month * 6_200),
    };
  });

  return {
    summary: {
      provider: "stripe_ready",
      generated_at: new Date().toISOString(),
      mrr: 73_400,
      arr: 880_800,
      net_revenue_retention: 132,
      churn_percent: 2.6,
      expansion_mrr: 38_600,
      contraction_mrr: 6_800,
      arpu: 18_350,
      ltv_estimate: 697_300,
      gross_margin_percent: 84,
      renewal_pipeline: 509_000,
      collections_ratio: 96,
      active_customers: 4,
      overdue_revenue: 2_057,
      growth_trend: [
        { period: "Jan", mrr: 51_200, arr: 614_400 },
        { period: "Feb", mrr: 58_800, arr: 705_600 },
        { period: "Mar", mrr: 66_900, arr: 802_800 },
        { period: "Apr", mrr: 73_400, arr: 880_800 },
      ],
      investor_summary:
        "Sentra is monetization-ready with enterprise ACV expansion, 132% NRR, strong collections, and multiple high-intent expansion accounts.",
    },
    plans,
    subscription: {
      tenant_id: "TEN-GRAND-MERIDIAN",
      customer: "Grand Meridian Hotel",
      plan_key: "enterprise",
      plan_name: "Enterprise",
      status: "active",
      billing_interval: "annual",
      monthly_recurring_revenue: 7_083,
      annual_contract_value: 85_000,
      renewal_date: "2026-06-09",
      cancel_at_renewal: false,
      trial_days_remaining: 0,
      proration_preview: 0,
      approval_required: false,
      seats: {
        seats_purchased: 220,
        seats_used: 188,
        pending_invites: 14,
        suspended_users: 3,
        available_seats: 18,
        utilization_percent: 85,
        recommendation: "Expansion recommended before next incident drill",
      },
    },
    usage: [
      { key: "ai_decisions", label: "AI decision runs", included: 55_000, used: 46_750, remaining: 8_250, overage_estimate: 0, unit: "runs" },
      { key: "api_calls", label: "API calls", included: 2_500_000, used: 1_925_000, remaining: 575_000, overage_estimate: 0, unit: "calls" },
      { key: "notifications", label: "Notifications sent", included: 180_000, used: 126_400, remaining: 53_600, overage_estimate: 0, unit: "messages" },
      { key: "storage", label: "Storage used", included: 6_000, used: 4_020, remaining: 1_980, overage_estimate: 0, unit: "GB" },
      { key: "exports", label: "Exports generated", included: 1_200, used: 826, remaining: 374, overage_estimate: 0, unit: "exports" },
      { key: "camera_events", label: "Camera processing events", included: 95_000, used: 67_400, remaining: 27_600, overage_estimate: 0, unit: "events" },
      { key: "automations", label: "Automation executions", included: 24_000, used: 18_840, remaining: 5_160, overage_estimate: 0, unit: "runs" },
    ],
    invoices: [
      { invoice_id: "REV-INV-ELITE01", customer: "Grand Meridian Hotel", tenant_id: "TEN-GRAND-MERIDIAN", billing_period: "2026-04", subtotal: 7_083, taxes: 584, credits: 0, total: 7_667, status: "open", due_date: "2026-05-03", download_url: "https://billing.sentra.local/revenue/REV-INV-ELITE01.pdf" },
      { invoice_id: "REV-INV-METRO02", customer: "MetroCare Hospital", tenant_id: "TEN-METROCARE", billing_period: "2026-04", subtotal: 15_000, taxes: 1_238, credits: 0, total: 16_238, status: "paid", due_date: "2026-05-01", download_url: "https://billing.sentra.local/revenue/REV-INV-METRO02.pdf" },
      { invoice_id: "REV-INV-NOVA03", customer: "Nova Mall Group", tenant_id: "TEN-NOVA-MALL", billing_period: "2026-04", subtotal: 1_900, taxes: 157, credits: 0, total: 2_057, status: "overdue", due_date: "2026-04-21", download_url: "https://billing.sentra.local/revenue/REV-INV-NOVA03.pdf" },
    ],
    payment_health: {
      payment_method_valid: true,
      retry_attempts: 0,
      failed_charges: 0,
      grace_period_remaining: 0,
      collections_risk: "low",
      next_action: "Payment posture healthy",
    },
    renewals: [
      { tenant_id: "TEN-SKYLINE-CAMPUS", customer: "Skyline Campus", renewal_date: "2026-05-05", amount: 5_880, risk: "medium", owner: "Iris Park" },
      { tenant_id: "TEN-NOVA-MALL", customer: "Nova Mall Group", renewal_date: "2026-05-08", amount: 22_800, risk: "high", owner: "Maya Sol" },
      { tenant_id: "TEN-METROCARE", customer: "MetroCare Hospital", renewal_date: "2026-05-23", amount: 180_000, risk: "medium", owner: "Nora Hale" },
    ],
    alerts: [
      { alert_id: "FIN-OVERDUE-NOVA", type: "overdue_invoice", title: "Past-due invoice requires collections action", severity: "critical", customer: "Nova Mall Group", value_at_risk: 1_900, recommended_action: "Retry payment, notify billing admin, and prepare downgrade warning." },
      { alert_id: "FIN-SEAT-GRAND", type: "nearing_seat_cap", title: "Seat capacity nearing limit", severity: "medium", customer: "Grand Meridian Hotel", value_at_risk: 18_000, recommended_action: "Recommend expansion pack before next emergency readiness drill." },
      { alert_id: "FIN-EXP-GRAND", type: "enterprise_expansion", title: "Enterprise expansion opportunity detected", severity: "high", customer: "Grand Meridian Hotel", value_at_risk: 96_000, recommended_action: "Package IoT fleet expansion with annual commitment uplift." },
    ],
    customers: [
      { tenant_id: "TEN-METROCARE", customer: "MetroCare Hospital", plan: "Government", arr: 180_000, growth_rate: 24, usage_score: 96, renewal_risk: "medium", executive_owner: "Nora Hale" },
      { tenant_id: "TEN-GRAND-MERIDIAN", customer: "Grand Meridian Hotel", plan: "Enterprise", arr: 85_000, growth_rate: 31, usage_score: 92, renewal_risk: "low", executive_owner: "Avery Chen" },
      { tenant_id: "TEN-NOVA-MALL", customer: "Nova Mall Group", plan: "Growth", arr: 22_800, growth_rate: 18, usage_score: 84, renewal_risk: "high", executive_owner: "Maya Sol" },
      { tenant_id: "TEN-SKYLINE-CAMPUS", customer: "Skyline Campus", plan: "Starter", arr: 5_880, growth_rate: 42, usage_score: 77, renewal_risk: "medium", executive_owner: "Iris Park" },
    ],
    forecast,
  };
}

