import { apiClient } from "@/lib/core/api-client";
import type {
  RevenueAlertsResponse,
  RevenueBillingSnapshot,
  RevenueCustomersResponse,
  RevenueForecastResponse,
  RevenueInvoicesResponse,
  RevenueMutationResponse,
  RevenuePlansResponse,
  RevenueSummary,
  RevenueUsageResponse,
} from "@/lib/revenue/types";

export function getRevenueBilling() {
  return apiClient.requestData<RevenueBillingSnapshot>("/revenue/billing", {
    priority: "high",
    cacheTtlMs: 8_000,
  });
}

export function getRevenueSummary() {
  return apiClient.requestData<RevenueSummary>("/revenue/summary", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getRevenuePlans() {
  return apiClient.requestData<RevenuePlansResponse>("/revenue/plans", {
    priority: "low",
    cacheTtlMs: 30_000,
  });
}

export function getRevenueInvoices() {
  return apiClient.requestData<RevenueInvoicesResponse>("/revenue/invoices", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getRevenueUsage() {
  return apiClient.requestData<RevenueUsageResponse>("/revenue/usage", {
    priority: "normal",
    cacheTtlMs: 10_000,
  });
}

export function getRevenueForecast() {
  return apiClient.requestData<RevenueForecastResponse>("/revenue/forecast", {
    priority: "low",
    cacheTtlMs: 18_000,
  });
}

export function getRevenueAlerts() {
  return apiClient.requestData<RevenueAlertsResponse>("/revenue/alerts", {
    priority: "normal",
    cacheTtlMs: 8_000,
  });
}

export function getRevenueCustomers() {
  return apiClient.requestData<RevenueCustomersResponse>("/revenue/customers", {
    priority: "low",
    cacheTtlMs: 18_000,
  });
}

export function upgradeRevenuePlan(planKey = "enterprise", interval = "annual") {
  return apiClient.requestData<RevenueMutationResponse>("/revenue/upgrade", {
    method: "POST",
    body: { plan_key: planKey, interval, reason: "Revenue command upgrade request" },
    priority: "high",
  });
}

export function downgradeRevenuePlan(planKey = "growth", interval = "monthly") {
  return apiClient.requestData<RevenueMutationResponse>("/revenue/downgrade", {
    method: "POST",
    body: { plan_key: planKey, interval, reason: "Revenue command downgrade request" },
    priority: "high",
  });
}

export function cancelRevenueSubscription() {
  return apiClient.requestData<RevenueMutationResponse>("/revenue/cancel", {
    method: "POST",
    body: { reason: "cancel_at_renewal" },
    priority: "high",
  });
}

export function reactivateRevenueSubscription() {
  return apiClient.requestData<RevenueMutationResponse>("/revenue/reactivate", {
    method: "POST",
    priority: "high",
  });
}

export function addRevenueSeats(seats = 10) {
  return apiClient.requestData<RevenueMutationResponse>("/revenue/seats/add", {
    method: "POST",
    body: { seats, reason: "seat expansion from Revenue OS" },
    priority: "high",
  });
}

export function removeRevenueSeats(seats = 5) {
  return apiClient.requestData<RevenueMutationResponse>("/revenue/seats/remove", {
    method: "POST",
    body: { seats, reason: "seat reduction from Revenue OS" },
    priority: "high",
  });
}

export function markRevenueInvoicePaid(invoiceId: string) {
  return apiClient.requestData<RevenueMutationResponse>("/revenue/invoice/pay", {
    method: "POST",
    body: { invoice_id: invoiceId, reason: "manual admin payment reconciliation" },
    priority: "high",
  });
}

