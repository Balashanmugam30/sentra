"use client";

import { useEffect, useState } from "react";

import {
  approvePartner,
  createPartner,
  getPartnerCertifications,
  getPartnerNetwork,
  getPartnerReferrals,
  getPartnerRevenue,
  getPartnersLive,
  payoutPartner,
} from "@/lib/partners/api";
import type {
  PartnerCertificationsResponse,
  PartnerNetworkResponse,
  PartnerReferralsResponse,
  PartnerRevenueResponse,
  PartnersLiveResponse,
} from "@/lib/partners/types";

type PartnersState = {
  live: PartnersLiveResponse | null;
  network: PartnerNetworkResponse | null;
  referrals: PartnerReferralsResponse | null;
  revenue: PartnerRevenueResponse | null;
  certifications: PartnerCertificationsResponse | null;
  loading: boolean;
  error: string | null;
  busyAction: string | null;
};

const initialState: PartnersState = {
  live: null,
  network: null,
  referrals: null,
  revenue: null,
  certifications: null,
  loading: true,
  error: null,
  busyAction: null,
};

let sharedState = initialState;
let refreshInFlight: Promise<void> | null = null;
const subscribers = new Set<(state: PartnersState) => void>();

function notify() {
  subscribers.forEach((subscriber) => subscriber(sharedState));
}

export async function refreshPartners() {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  sharedState = { ...sharedState, loading: true };
  notify();
  refreshInFlight = (async () => {
    try {
      const [live, network, referrals, revenue, certifications] = await Promise.all([
        getPartnersLive(),
        getPartnerNetwork(),
        getPartnerReferrals(),
        getPartnerRevenue(),
        getPartnerCertifications(),
      ]);
      sharedState = { ...sharedState, live, network, referrals, revenue, certifications, loading: false, error: null };
    } catch (error) {
      sharedState = {
        ...sharedState,
        loading: false,
        error: error instanceof Error ? error.message : "Partner ecosystem is reconnecting",
      };
    } finally {
      refreshInFlight = null;
      notify();
    }
  })();
  return refreshInFlight;
}

async function withPartnerAction(label: string, action: () => Promise<unknown>) {
  sharedState = { ...sharedState, busyAction: label, error: null };
  notify();
  try {
    await action();
    sharedState = { ...sharedState, busyAction: null };
    notify();
    await refreshPartners();
  } catch (error) {
    sharedState = {
      ...sharedState,
      busyAction: null,
      error: error instanceof Error ? error.message : "Partner action failed",
    };
    notify();
  }
}

export function usePartners() {
  const [state, setState] = useState(sharedState);

  useEffect(() => {
    subscribers.add(setState);
    void refreshPartners();
    return () => {
      subscribers.delete(setState);
    };
  }, []);

  return {
    ...state,
    refresh: refreshPartners,
    create: (name: string) => withPartnerAction("create-partner", () => createPartner(name)),
    approve: (partnerId: string) => withPartnerAction(`approve-${partnerId}`, () => approvePartner(partnerId)),
    payout: (partnerId: string) => withPartnerAction(`payout-${partnerId}`, () => payoutPartner(partnerId)),
  };
}

