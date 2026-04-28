"use client";

import { useEffect, useState } from "react";

import {
  approveAutonomy,
  createCloudTenant,
  generateBoardForecast,
  getAutonomySummary,
  getBoardInvestors,
  getBoardRevenue,
  getBoardSummary,
  getCloudSummary,
  rollbackAutonomy,
  runAutonomy,
  simulateBoardValuation,
  switchCloudTenant,
} from "@/lib/master/api";
import { fallbackAutonomySummary, fallbackBoardSummary, fallbackCloudSummary, fallbackInvestors, fallbackRevenue } from "@/lib/master/runtime";
import type { MasterAutonomySummary, MasterBoardSummary, MasterCloudSummary, MasterInvestor, MasterRevenueRow } from "@/lib/master/types";

type MasterState = {
  autonomy: MasterAutonomySummary;
  cloud: MasterCloudSummary;
  board: MasterBoardSummary;
  revenue: MasterRevenueRow[];
  investors: MasterInvestor[];
  loading: boolean;
  error: string | null;
  busyAction: string | null;
  lastAction: string | null;
};

const initialState: MasterState = {
  autonomy: fallbackAutonomySummary,
  cloud: fallbackCloudSummary,
  board: fallbackBoardSummary,
  revenue: fallbackRevenue,
  investors: fallbackInvestors,
  loading: true,
  error: null,
  busyAction: null,
  lastAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: MasterState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshMaster() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [autonomy, cloud, board, revenue, investors] = await Promise.all([getAutonomySummary(), getCloudSummary(), getBoardSummary(), getBoardRevenue(), getBoardInvestors()]);
      sharedState = {
        ...sharedState,
        autonomy: autonomy.data,
        cloud: cloud.data,
        board: board.data,
        revenue: revenue.items,
        investors: investors.items,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Phase 24 master layer is running in resilient local mode",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withMasterAction(label: string, action: () => Promise<{ message?: string }>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    const response = await action();
    sharedState = { ...sharedState, busyAction: null, lastAction: response.message ?? "Phase 24 master action complete" };
    notify();
    await refreshMaster();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Phase 24 master action could not be completed",
    };
    notify();
  }
}

export function useMaster() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    if (sharedState.loading && !refreshInFlight) {
      void refreshMaster();
    }
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshMaster,
    runAutonomy: (actionId?: string) => withMasterAction("run-autonomy", () => runAutonomy(actionId)),
    approveAutonomy: (actionId?: string) => withMasterAction("approve-autonomy", () => approveAutonomy(actionId)),
    rollbackAutonomy: (actionId?: string) => withMasterAction("rollback-autonomy", () => rollbackAutonomy(actionId)),
    createTenant: () => withMasterAction("create-tenant", createCloudTenant),
    switchTenant: (tenantId?: string) => withMasterAction("switch-tenant", () => switchCloudTenant(tenantId)),
    forecast: (scenario?: string) => withMasterAction("forecast", () => generateBoardForecast(scenario)),
    valuation: (objective?: string) => withMasterAction("valuation", () => simulateBoardValuation(objective)),
  };
}

