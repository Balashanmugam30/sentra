"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorMetricTile,
  InvestorPanelChrome,
  InvestorStatusPill,
  asList,
  asNumber,
  asString,
  compactInvestorMoney,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

type ArrCase = { label: string; multiple: number; valuation: number };

export function LiveValuationEngine() {
  const { valuation } = useInvestor();
  const cases = asList<ArrCase>(valuation?.arr_multiple_cases);

  return (
    <InvestorPanelChrome
      action={<InvestorStatusPill label="AI + GovTech premium active" tone="gold" />}
      description={asString(
        valuation?.formula_note,
        "ARR multiples are adjusted by growth, retention, AI moat, GovTech, and strategic acquisition premiums.",
      )}
      eyebrow="Live Valuation Engine"
      title={`${compactInvestorMoney.format(asNumber(valuation?.base_valuation, 62_000_000))} base, ${compactInvestorMoney.format(asNumber(valuation?.strategic_acquisition_valuation, 156_000_000))} strategic`}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <InvestorMetricTile label="Conservative" note="ARR multiple floor" value={compactInvestorMoney.format(asNumber(valuation?.conservative_valuation, 38_000_000))} />
        <InvestorMetricTile label="Base" note="Series A case" value={compactInvestorMoney.format(asNumber(valuation?.base_valuation, 62_000_000))} />
        <InvestorMetricTile label="Aggressive" note="GovTech upside" value={compactInvestorMoney.format(asNumber(valuation?.aggressive_valuation, 110_000_000))} />
        <InvestorMetricTile label="Strategic" note="acquisition premium" value={compactInvestorMoney.format(asNumber(valuation?.strategic_acquisition_valuation, 156_000_000))} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {cases.map((item) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4" key={`${item.label}-${item.multiple}`}>
            <p className="text-xs uppercase tracking-[0.18em] text-white/42">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{investorMoney.format(item.valuation)}</p>
          </div>
        ))}
      </div>
    </InvestorPanelChrome>
  );
}
