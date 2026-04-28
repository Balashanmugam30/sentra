"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorPanelChrome,
  InvestorStatusPill,
  asList,
  asNumber,
  asRecord,
  asString,
  investorMoney,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function BoardroomWarRoom() {
  const { board } = useInvestor();
  const growth = asRecord(board?.growth_metrics);

  return (
    <InvestorPanelChrome
      action={<InvestorStatusPill label={asString(board?.board_pack_status, "export_ready")} tone="gold" />}
      description="Monthly board narrative, wins, risks, cash, product launches, trust posture, global expansion, and board asks."
      eyebrow={`Boardroom War Room - ${asString(board?.month, "April 2026")}`}
      title={`Cash ${investorMoney.format(asNumber(board?.cash_position, 6_400_000))}, readiness ${asNumber(board?.readiness_score, 88)}/100`}
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-[24px] border border-cyan-200/14 bg-cyan-200/[0.045] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/50">What changed</p>
          <div className="mt-3 space-y-2">
            {asList<string>(board?.what_changed).map((item) => (
              <p className="text-sm leading-6 text-white/68" key={item}>
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Wins</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {asList<string>(board?.wins).map((item) => (
              <InvestorStatusPill key={item} label={item} />
            ))}
          </div>
          <p className="mt-4 text-sm text-white/54">
            Rule of 40 {asNumber(growth.rule_of_40, 71)} with burn multiple {asNumber(growth.burn_multiple, 2.47)}.
          </p>
        </div>
        <div className="rounded-[24px] border border-orange-300/16 bg-orange-400/[0.055] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-100/54">Board asks</p>
          <div className="mt-3 space-y-2">
            {asList<string>(board?.top_asks).map((item) => (
              <p className="text-sm leading-6 text-white/68" key={item}>
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </InvestorPanelChrome>
  );
}
