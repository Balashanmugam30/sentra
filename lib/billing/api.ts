import { apiClient } from "@/lib/core/api-client";
import type {
  BillingInvoicesResponse,
  BillingMeResponse,
  BillingMutationResponse,
  BillingPlansResponse,
  BillingPlanKey,
  BillingRevenueResponse,
  BillingUsageResponse,
  CheckoutPayload,
} from "@/lib/billing/types";

export function getBillingMe() {
  return apiClient.requestData<BillingMeResponse>("/billing/me", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getBillingPlans() {
  return apiClient.requestData<BillingPlansResponse>("/billing/plans", {
    priority: "low",
    cacheTtlMs: 30_000,
  });
}

export function getBillingInvoices() {
  return apiClient.requestData<BillingInvoicesResponse>("/billing/invoices", {
    priority: "low",
    cacheTtlMs: 15_000,
  });
}

export function getBillingRevenue() {
  return apiClient.requestData<BillingRevenueResponse>("/billing/revenue", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getBillingUsage() {
  return apiClient.requestData<BillingUsageResponse>("/billing/usage", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function createCheckout(payload: CheckoutPayload) {
  return apiClient.requestData<{ provider: "stripe" | "demo"; session_id: string; url: string }>(
    "/billing/create-checkout",
    {
      method: "POST",
      body: payload,
      priority: "high",
    },
  );
}

export function createBillingPortal() {
  return apiClient.requestData<{ provider: "stripe" | "demo"; url: string }>("/billing/create-portal", {
    method: "POST",
    priority: "high",
  });
}

export function changeBillingPlan(plan: BillingPlanKey, interval: "monthly" | "annual" = "monthly") {
  return apiClient.requestData<BillingMutationResponse>("/billing/change-plan", {
    method: "POST",
    body: { plan, interval },
    priority: "high",
  });
}

export function addBillingSeats(seats: number) {
  return apiClient.requestData<BillingMutationResponse>("/billing/add-seats", {
    method: "POST",
    body: { seats },
    priority: "high",
  });
}

export function cancelBillingSubscription() {
  return apiClient.requestData<BillingMutationResponse>("/billing/cancel", {
    method: "POST",
    priority: "high",
  });
}

export function reactivateBillingSubscription() {
  return apiClient.requestData<BillingMutationResponse>("/billing/reactivate", {
    method: "POST",
    priority: "high",
  });
}

export function applyBillingCoupon(coupon: string) {
  return apiClient.requestData<BillingMutationResponse>("/billing/apply-coupon", {
    method: "POST",
    body: { coupon },
    priority: "high",
  });
}

export function testBillingWebhook(eventType = "invoice.payment_failed") {
  return apiClient.requestData<{ received: boolean; event_type: string; action: string }>(
    "/billing/test-webhook",
    {
      method: "POST",
      body: { event_type: eventType },
      priority: "high",
    },
  );
}
