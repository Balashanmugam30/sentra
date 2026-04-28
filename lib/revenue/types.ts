export type BillingInterval = "monthly" | "annual";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancel_at_renewal" | "canceled" | "approval_required";
export type InvoiceStatus = "paid" | "open" | "overdue" | "failed" | "refunded";

export type RevenuePlan = {
  plan_key: string;
  name: string;
  audience: string;
  monthly_price: number;
  yearly_price: number;
  included_seats: number;
  max_seats: number | null;
  ai_quota: number;
  api_quota: number;
  storage_quota_gb: number;
  support_tier: string;
  enabled_modules: string[];
  upgrade_signal: string;
};

export type SeatSnapshot = {
  seats_purchased: number;
  seats_used: number;
  pending_invites: number;
  suspended_users: number;
  available_seats: number;
  utilization_percent: number;
  recommendation: string;
};

export type QuotaMetric = {
  key: string;
  label: string;
  included: number;
  used: number;
  remaining: number;
  overage_estimate: number;
  unit: string;
};

export type RevenueSubscription = {
  tenant_id: string;
  customer: string;
  plan_key: string;
  plan_name: string;
  status: SubscriptionStatus;
  billing_interval: BillingInterval;
  monthly_recurring_revenue: number;
  annual_contract_value: number;
  renewal_date: string;
  cancel_at_renewal: boolean;
  trial_days_remaining: number;
  proration_preview: number;
  approval_required: boolean;
  seats: SeatSnapshot;
};

export type RevenueInvoice = {
  invoice_id: string;
  customer: string;
  tenant_id: string;
  billing_period: string;
  subtotal: number;
  taxes: number;
  credits: number;
  total: number;
  status: InvoiceStatus;
  due_date: string;
  download_url: string;
};

export type PaymentHealth = {
  payment_method_valid: boolean;
  retry_attempts: number;
  failed_charges: number;
  grace_period_remaining: number;
  collections_risk: string;
  next_action: string;
};

export type RenewalEvent = {
  tenant_id: string;
  customer: string;
  renewal_date: string;
  amount: number;
  risk: string;
  owner: string;
};

export type FinanceAlert = {
  alert_id: string;
  type: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  customer: string;
  value_at_risk: number;
  recommended_action: string;
};

export type RevenueCustomer = {
  tenant_id: string;
  customer: string;
  plan: string;
  arr: number;
  growth_rate: number;
  usage_score: number;
  renewal_risk: string;
  executive_owner: string;
};

export type ForecastPoint = {
  month: string;
  conservative: number;
  expected: number;
  aggressive: number;
};

export type RevenueSummary = {
  provider: "demo" | "stripe_ready";
  generated_at: string;
  mrr: number;
  arr: number;
  net_revenue_retention: number;
  churn_percent: number;
  expansion_mrr: number;
  contraction_mrr: number;
  arpu: number;
  ltv_estimate: number;
  gross_margin_percent: number;
  renewal_pipeline: number;
  collections_ratio: number;
  active_customers: number;
  overdue_revenue: number;
  growth_trend: Array<{ period: string; mrr: number; arr: number }>;
  investor_summary: string;
};

export type RevenueBillingSnapshot = {
  summary: RevenueSummary;
  plans: RevenuePlan[];
  subscription: RevenueSubscription;
  usage: QuotaMetric[];
  invoices: RevenueInvoice[];
  payment_health: PaymentHealth;
  renewals: RenewalEvent[];
  alerts: FinanceAlert[];
  customers: RevenueCustomer[];
  forecast: ForecastPoint[];
};

export type RevenueMutationResponse = {
  ok: boolean;
  message: string;
  subscription: RevenueSubscription | null;
  data: Record<string, unknown>;
};

export type RevenuePlansResponse = {
  plans: RevenuePlan[];
};

export type RevenueInvoicesResponse = {
  invoices: RevenueInvoice[];
};

export type RevenueUsageResponse = {
  usage: QuotaMetric[];
};

export type RevenueForecastResponse = {
  forecast: ForecastPoint[];
};

export type RevenueAlertsResponse = {
  alerts: FinanceAlert[];
};

export type RevenueCustomersResponse = {
  customers: RevenueCustomer[];
};
