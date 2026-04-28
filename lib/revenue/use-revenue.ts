"use client";

import { useCallback, useEffect, useState } from "react";

import {
  addRevenueSeats,
  cancelRevenueSubscription,
  downgradeRevenuePlan,
  getRevenueBilling,
  markRevenueInvoicePaid,
  reactivateRevenueSubscription,
  removeRevenueSeats,
  upgradeRevenuePlan,
} from "@/lib/revenue/api";
import { buildLocalRevenueSnapshot } from "@/lib/revenue/helpers";
import type { RevenueBillingSnapshot } from "@/lib/revenue/types";

type RevenueState = {
  snapshot: RevenueBillingSnapshot;
  isLoading: boolean;
  isRefreshing: boolean;
  busyAction: string | null;
  error: string | null;
  usingFallback: boolean;
};

export function useRevenue({ enabled = true }: { enabled?: boolean } = {}) {
  const [state, setState] = useState<RevenueState>({
    snapshot: buildLocalRevenueSnapshot(),
    isLoading: enabled,
    isRefreshing: false,
    busyAction: null,
    error: null,
    usingFallback: false,
  });

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setState((current) => ({ ...current, isRefreshing: true }));
    try {
      const snapshot = await getRevenueBilling();
      setState((current) => ({ ...current, snapshot, isLoading: false, isRefreshing: false, error: null, usingFallback: false }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? `${error.message}. Using local revenue model.` : "Using local revenue model.",
        usingFallback: true,
      }));
    }
  }, [enabled]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const runRevenueAction = async (label: string, action: () => Promise<unknown>) => {
    setState((current) => ({ ...current, busyAction: label, error: null }));
    try {
      await action();
      setState((current) => ({ ...current, busyAction: null }));
      await refresh();
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: error instanceof Error ? `${error.message}. Revenue command staged locally.` : "Revenue command staged locally.",
        usingFallback: true,
      }));
    }
  };

  return {
    ...state,
    addSeats: (seats?: number) => runRevenueAction("add-seats", () => addRevenueSeats(seats)),
    cancelSubscription: () => runRevenueAction("cancel", cancelRevenueSubscription),
    downgradePlan: (planKey?: string) => runRevenueAction("downgrade", () => downgradeRevenuePlan(planKey)),
    markInvoicePaid: (invoiceId: string) => runRevenueAction(invoiceId, () => markRevenueInvoicePaid(invoiceId)),
    reactivateSubscription: () => runRevenueAction("reactivate", reactivateRevenueSubscription),
    refresh,
    removeSeats: (seats?: number) => runRevenueAction("remove-seats", () => removeRevenueSeats(seats)),
    upgradePlan: (planKey?: string) => runRevenueAction("upgrade", () => upgradeRevenuePlan(planKey)),
  };
}

