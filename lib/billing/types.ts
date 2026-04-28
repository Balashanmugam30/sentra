export type BillingInterval = "monthly" | "annual";
export type BillingStatus = "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete";
export type BillingPlanKey = "starter" | "business" | "enterprise" | "government";

export type BillingPlan = {
  plan_key: BillingPlanKey;
  name: string;
  seat_limit: number;
  monthly_price: number;
  annual_price: number;
  modules_enabled: string[];
  api_rate_limit: number;
  support_tier: string;
  entitlements: string[];
};

export type TenantSubscription = {
  tenant_id: string;
  organization_name: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  plan: BillingPlanKey;
  billing_status: BillingStatus;
  billing_interval: BillingInterval;
  trial_ends_at?: string | null;
  renewal_date: string;
  seat_limit: number;
  seats_used: number;
  monthly_mrr: number;
  annual_value: number;
  grace_period_days: number;
  suspended_flag: boolean;
  cancel_at_period_end: boolean;
  payment_method_status: string;
  entitlements: string[];
  locked_modules: string[];
  updated_at: string;
};

export type BillingInvoice = {
  invoice_id: string;
  tenant_id: string;
  number: string;
  status: "draft" | "open" | "paid" | "failed" | "void";
  amount_due: number;
  amount_paid: number;
  currency: string;
  hosted_invoice_url: string;
  invoice_pdf: string;
  created_at: string;
  due_date?: string | null;
  paid_at?: string | null;
  failure_reason?: string | null;
};

export type BillingMeResponse = {
  provider: "stripe" | "demo";
  publishable_key?: string | null;
  subscription: TenantSubscription;
  plan: BillingPlan;
  payment_recovery: {
    state: string;
    grace_period_days: number;
    next_retry?: string | null;
    message: string;
  };
  entitlements: Record<string, boolean>;
};

export type BillingPlansResponse = {
  provider: "stripe" | "demo";
  plans: BillingPlan[];
};

export type BillingInvoicesResponse = {
  tenant_id: string;
  invoices: BillingInvoice[];
};

export type BillingRevenueResponse = {
  provider: "stripe" | "demo";
  mrr: number;
  arr: number;
  arpu: number;
  ltv: number;
  active_customers: number;
  trials_converting: number;
  failed_payments: number;
  expansion_mrr: number;
  contraction_mrr: number;
  churn_percent: number;
  trial_conversion_percent: number;
  failed_payment_rate: number;
  collection_recovery_percent: number;
  net_revenue_retention: number;
  top_plans: Array<{ plan: string; customers: number; mrr: number }>;
  trend: Array<{ period: string; mrr: number; arr: number }>;
};

export type BillingUsageResponse = {
  tenant_id: string;
  seats_used: number;
  seat_limit: number;
  seat_utilization_percent: number;
  api_calls_month: number;
  api_rate_limit: number;
  reports_generated: number;
  ai_actions_month: number;
};

export type CheckoutPayload = {
  plan: BillingPlanKey;
  interval?: BillingInterval;
  seats?: number;
  success_url?: string;
  cancel_url?: string;
  promo_code?: string;
};

export type BillingMutationResponse = {
  ok: boolean;
  message: string;
  subscription?: TenantSubscription | null;
  data?: Record<string, unknown>;
};
