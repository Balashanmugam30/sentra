"use client";

import { useEffect, useState } from "react";

import {
  addBillingSeats,
  applyBillingCoupon,
  cancelBillingSubscription,
  changeBillingPlan,
  createBillingPortal,
  createCheckout,
  getBillingInvoices,
  getBillingMe,
  getBillingPlans,
  getBillingRevenue,
  getBillingUsage,
  reactivateBillingSubscription,
  testBillingWebhook,
} from "@/lib/billing/api";
import type {
  BillingInvoicesResponse,
  BillingMeResponse,
  BillingPlansResponse,
  BillingPlanKey,
  BillingRevenueResponse,
  BillingUsageResponse,
  CheckoutPayload,
} from "@/lib/billing/types";

type BillingState = {
  me: BillingMeResponse | null;
  plans: BillingPlansResponse | null;
  invoices: BillingInvoicesResponse | null;
  revenue: BillingRevenueResponse | null;
  usage: BillingUsageResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: BillingState = {
  me: null,
  plans: null,
  invoices: null,
  revenue: null,
  usage: null,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: BillingState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

async function refreshBilling() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [me, plans, invoices, revenue, usage] = await Promise.all([
        getBillingMe(),
        getBillingPlans(),
        getBillingInvoices(),
        getBillingRevenue().catch(() => null),
        getBillingUsage(),
      ]);
      sharedState = {
        ...sharedState,
        me,
        plans,
        invoices,
        revenue,
        usage,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Billing data is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withBillingAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: label };
    notify();
    await refreshBilling();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Billing action failed",
    };
    notify();
  }
}

export function useBilling() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshBilling();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshBilling,
    createCheckout: (payload: CheckoutPayload) =>
      withBillingAction(`checkout-${payload.plan}`, async () => {
        const session = await createCheckout(payload);
        if (typeof window !== "undefined") {
          window.open(session.url, "_blank", "noopener,noreferrer");
        }
      }),
    createPortal: () =>
      withBillingAction("portal", async () => {
        const portal = await createBillingPortal();
        if (typeof window !== "undefined") {
          window.open(portal.url, "_blank", "noopener,noreferrer");
        }
      }),
    changePlan: (plan: BillingPlanKey, interval: "monthly" | "annual" = "monthly") =>
      withBillingAction(`plan-${plan}`, () => changeBillingPlan(plan, interval)),
    addSeats: (seats: number) => withBillingAction("add-seats", () => addBillingSeats(seats)),
    cancel: () => withBillingAction("cancel", cancelBillingSubscription),
    reactivate: () => withBillingAction("reactivate", reactivateBillingSubscription),
    applyCoupon: (coupon: string) => withBillingAction("coupon", () => applyBillingCoupon(coupon)),
    testWebhook: (eventType?: string) => withBillingAction("webhook", () => testBillingWebhook(eventType)),
  };
}
