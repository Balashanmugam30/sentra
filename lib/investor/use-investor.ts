"use client";

import { useEffect, useState } from "react";

import {
  addInvestorCash,
  addInvestorProspect,
  generateInvestorBoardPack,
  getInvestorBoard,
  getInvestorBoardPack,
  getInvestorCapTable,
  getInvestorCopilot,
  getInvestorDataRoom,
  getInvestorFunds,
  getInvestorIpo,
  getInvestorLive,
  getInvestorMetrics,
  getInvestorMna,
  getInvestorReadiness,
  getInvestorRunway,
  getInvestorSummary,
  getInvestorValuation,
  runInvestorScenario,
  seedInvestorDemo,
  updateInvestorFund,
  updateInvestorCapTable,
} from "@/lib/investor/api";
import type { InvestorLiveResponse, InvestorRecord, InvestorSummary } from "@/lib/investor/types";

type InvestorState = {
  summary: InvestorSummary;
  live: InvestorLiveResponse | null;
  metrics: Record<string, unknown> | null;
  valuation: Record<string, unknown> | null;
  runway: Record<string, unknown> | null;
  captable: Record<string, unknown> | null;
  readiness: Record<string, unknown> | null;
  board: Record<string, unknown> | null;
  boardpack: Record<string, unknown> | null;
  dataroom: Record<string, unknown> | null;
  mna: Record<string, unknown> | null;
  ipo: Record<string, unknown> | null;
  investors: InvestorRecord[];
  copilot: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const demoInvestors: InvestorRecord[] = [
  {
    investor_id: "INV-SEQUOIA-SCOUT",
    tenant_id: "TEN-GRAND-MERIDIAN",
    fund_name: "Sequoia Scout",
    partner_name: "Maya Chen",
    check_size: 1_000_000,
    stage_fit: "Seed to Series A",
    geography: "US",
    thesis_fit: "AI-native critical infrastructure command systems",
    warm_intro: "Founder network",
    last_meeting: null,
    interest_score: 86,
    probability_to_invest: 42,
    next_action_date: "2026-05-05T00:00:00.000Z",
    status: "intro",
    created_at: "2026-04-26T00:00:00.000Z",
  },
  {
    investor_id: "INV-ACCEL-PARTNER",
    tenant_id: "TEN-GRAND-MERIDIAN",
    fund_name: "Accel Partner",
    partner_name: "Daniel Ross",
    check_size: 5_000_000,
    stage_fit: "Series A",
    geography: "US",
    thesis_fit: "Enterprise resilience and workflow automation",
    warm_intro: "Customer CEO",
    last_meeting: "2026-04-22T00:00:00.000Z",
    interest_score: 91,
    probability_to_invest: 58,
    next_action_date: "2026-05-08T00:00:00.000Z",
    status: "partner meeting",
    created_at: "2026-04-26T00:00:00.000Z",
  },
  {
    investor_id: "INV-LIGHTSPEED-ASSOC",
    tenant_id: "TEN-GRAND-MERIDIAN",
    fund_name: "Lightspeed Associate",
    partner_name: "Anika Rao",
    check_size: 3_500_000,
    stage_fit: "Series A",
    geography: "US/India",
    thesis_fit: "Vertical AI with government and enterprise GTM",
    warm_intro: "Operator angel",
    last_meeting: null,
    interest_score: 84,
    probability_to_invest: 39,
    next_action_date: "2026-05-11T00:00:00.000Z",
    status: "first meeting",
    created_at: "2026-04-26T00:00:00.000Z",
  },
  {
    investor_id: "INV-TIGER-GROWTH",
    tenant_id: "TEN-GRAND-MERIDIAN",
    fund_name: "Tiger Growth",
    partner_name: "Elena Fischer",
    check_size: 12_000_000,
    stage_fit: "Growth",
    geography: "Global",
    thesis_fit: "High-growth category leader with platform expansion",
    warm_intro: "Banking relationship",
    last_meeting: null,
    interest_score: 79,
    probability_to_invest: 26,
    next_action_date: "2026-05-14T00:00:00.000Z",
    status: "target",
    created_at: "2026-04-26T00:00:00.000Z",
  },
  {
    investor_id: "INV-UAE-SOVEREIGN",
    tenant_id: "TEN-GRAND-MERIDIAN",
    fund_name: "Sovereign UAE fund",
    partner_name: "Nadia Al Mansoori",
    check_size: 15_000_000,
    stage_fit: "Strategic",
    geography: "UAE",
    thesis_fit: "Sovereign smart-city resilience and national continuity",
    warm_intro: "GovTech advisor",
    last_meeting: "2026-04-24T00:00:00.000Z",
    interest_score: 94,
    probability_to_invest: 61,
    next_action_date: "2026-05-07T00:00:00.000Z",
    status: "DD",
    created_at: "2026-04-26T00:00:00.000Z",
  },
  {
    investor_id: "INV-STRATEGIC-GOVTECH",
    tenant_id: "TEN-GRAND-MERIDIAN",
    fund_name: "Strategic GovTech Fund",
    partner_name: "Omar Khalid",
    check_size: 10_000_000,
    stage_fit: "Strategic",
    geography: "Global public sector",
    thesis_fit: "Government-grade crisis intelligence and operating systems",
    warm_intro: "Public-sector partner",
    last_meeting: "2026-04-23T00:00:00.000Z",
    interest_score: 96,
    probability_to_invest: 72,
    next_action_date: "2026-05-04T00:00:00.000Z",
    status: "term sheet",
    created_at: "2026-04-26T00:00:00.000Z",
  },
];

const initialState: InvestorState = {
  summary: {
    generated_at: "2026-04-26T00:00:00.000Z",
    ARR: 4_800_000,
    MRR: 400_000,
    growth_percent: 182,
    net_revenue_retention: 129,
    gross_margin_percent: 81,
    burn_multiple: 2.47,
    runway_months: 30,
    rule_of_40: 152,
    cash_on_hand: 6_400_000,
    monthly_burn: 210_000,
    fundraising_readiness: 89,
    raise_recommendation: "Open a $10M Series A with strategic UAE optionality.",
    base_valuation: 62_000_000,
    conservative_valuation: 38_000_000,
    aggressive_valuation: 110_000_000,
    weighted_raise: 18_320_000,
    ipo_score: 69,
    next_raise_deadline: "2028-04-26",
    investor_count: 6,
  },
  live: null,
  metrics: null,
  valuation: null,
  runway: null,
  captable: null,
  readiness: null,
  board: null,
  boardpack: null,
  dataroom: null,
  mna: null,
  ipo: null,
  investors: demoInvestors,
  copilot: null,
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: InvestorState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshInvestor() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [
        summary,
        live,
        metrics,
        valuation,
        runway,
        captable,
        readiness,
        board,
        boardpack,
        dataroom,
        mna,
        ipo,
        funds,
        copilot,
      ] = await Promise.all([
        getInvestorSummary(),
        getInvestorLive(),
        getInvestorMetrics(),
        getInvestorValuation(),
        getInvestorRunway(),
        getInvestorCapTable(),
        getInvestorReadiness(),
        getInvestorBoard(),
        getInvestorBoardPack(),
        getInvestorDataRoom(),
        getInvestorMna(),
        getInvestorIpo(),
        getInvestorFunds(),
        getInvestorCopilot(),
      ]);

      sharedState = {
        ...sharedState,
        summary: summary.summary,
        live,
        metrics: metrics.metrics,
        valuation: valuation.valuation,
        runway: runway.runway,
        captable: captable.captable,
        readiness: readiness.readiness,
        board: board.board,
        boardpack: boardpack.boardpack,
        dataroom: dataroom.dataroom,
        mna: mna.mna,
        ipo: ipo.ipo,
        investors: funds.funds,
        copilot: copilot.copilot,
        loading: false,
        error: null,
      };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Investor operating system is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withInvestorAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshInvestor();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Investor action failed",
    };
    notify();
  }
}

export function useInvestor() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshInvestor();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshInvestor,
    addCash: (amount = 2_000_000) => withInvestorAction("add-cash", () => addInvestorCash(amount)),
    updateFund: (investorId: string, status = "partner meeting") =>
      withInvestorAction(`fund-${investorId}`, () => updateInvestorFund(investorId, status)),
    runScenario: (scenario = "Raise $10M") =>
      withInvestorAction(`scenario-${scenario}`, () => runInvestorScenario(scenario)),
    addInvestor: () => withInvestorAction("add-investor", addInvestorProspect),
    updateCapTable: () => withInvestorAction("cap-table", updateInvestorCapTable),
    generateBoardPack: () => withInvestorAction("board-pack", generateInvestorBoardPack),
    seedDemo: () => withInvestorAction("seed-demo", seedInvestorDemo),
  };
}
