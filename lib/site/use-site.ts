"use client";

import { useEffect, useState } from "react";

import { getSiteAuthority, getSiteGlobal, getSiteInvestors, getSiteStatus, getSiteSummary } from "@/lib/site/api";
import { siteAuthority, siteGlobal, siteInvestors, siteStatus, siteSummary } from "@/lib/site/runtime";

const fallback = {
  summary: siteSummary,
  authority: siteAuthority,
  global: siteGlobal,
  status: siteStatus,
  investors: siteInvestors,
  loading: true,
  error: null as string | null,
};

export function useSite() {
  const [state, setState] = useState(fallback);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [summary, authority, global, status, investors] = await Promise.all([
          getSiteSummary(),
          getSiteAuthority(),
          getSiteGlobal(),
          getSiteStatus(),
          getSiteInvestors(),
        ]);
        if (!mounted) {
          return;
        }
        setState({
          summary: summary.data,
          authority: authority.data,
          global: global.data,
          status: status.data,
          investors: investors.data,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!mounted) {
          return;
        }
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "Prestige API unavailable; showing deterministic showcase data.",
        }));
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
