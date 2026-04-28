"use client";

import { useInvestor } from "@/lib/investor/use-investor";
import {
  InvestorActionButton,
  InvestorPanelChrome,
  InvestorStatusPill,
  asList,
  asString,
} from "@/modules/dashboard/components/investor-panel-primitives";

export function BoardPackExportPanel() {
  const { live, board, generateBoardPack, busyAction } = useInvestor();

  return (
    <InvestorPanelChrome
      action={
        <InvestorActionButton disabled={busyAction === "board-pack"} onClick={() => void generateBoardPack()} tone="gold">
          {busyAction === "board-pack" ? "Exporting..." : "Generate Board Pack"}
        </InvestorActionButton>
      }
      description="Export-ready board pack sections for metrics, valuation, runway, growth, risks, product launches, and board asks."
      eyebrow="Board Pack Export"
      title={`Board pack status: ${asString(live?.board_pack_status, "export_ready")}`}
    >
      <div className="grid gap-3 md:grid-cols-3">
        {["Metrics", "Valuation", "Runway", "Growth", "Risks", "Board asks"].map((item) => (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4" key={item}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">{item}</p>
              <InvestorStatusPill label="ready" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[22px] border border-cyan-200/14 bg-cyan-200/[0.045] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/52">Board asks included</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {asList<string>(board?.top_asks).map((ask) => (
            <InvestorStatusPill key={ask} label={ask} tone="gold" />
          ))}
        </div>
      </div>
    </InvestorPanelChrome>
  );
}
