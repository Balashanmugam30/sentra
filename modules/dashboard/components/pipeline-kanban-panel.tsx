"use client";

import { useMemo } from "react";

import type { CrmDeal, DealStage } from "@/lib/crm/types";
import { useCrm } from "@/lib/crm/use-crm";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const columns: Array<{ id: string; label: string; stages: DealStage[]; next?: DealStage }> = [
  { id: "new", label: "New", stages: ["pipeline"], next: "qualified" },
  { id: "qualified", label: "Qualified", stages: ["qualified"], next: "demo" },
  { id: "demo", label: "Demo", stages: ["demo"], next: "proposal" },
  { id: "proposal", label: "Proposal", stages: ["proposal"], next: "legal" },
  { id: "negotiation", label: "Negotiation", stages: ["legal", "procurement"], next: "closed_won" },
  { id: "won", label: "Won", stages: ["closed_won"] },
];

function dealStageRank(deal: CrmDeal) {
  return columns.findIndex((column) => column.stages.includes(deal.stage));
}

export function PipelineKanbanPanel() {
  const { busyAction, deals, moveDealStage } = useCrm();
  const grouped = useMemo(() => {
    const result = new Map<string, CrmDeal[]>();
    columns.forEach((column) => result.set(column.id, []));
    (deals?.deals ?? [])
      .slice()
      .sort((left, right) => dealStageRank(left) - dealStageRank(right) || right.value - left.value)
      .forEach((deal) => {
        const column = columns.find((item) => item.stages.includes(deal.stage));
        if (column) {
          result.get(column.id)?.push(deal);
        }
      });
    return result;
  }, [deals?.deals]);

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
            Pipeline Kanban
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Enterprise deals by stage
          </h2>
        </div>
        <p className="text-sm text-white/48">Drag-drop styled board with one-tap stage progression.</p>
      </div>
      <div className="mt-5 grid gap-3 xl:grid-cols-6">
        {columns.map((column) => {
          const columnDeals = grouped.get(column.id) ?? [];
          return (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-3" key={column.id}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/48">{column.label}</p>
                <span className="rounded-full border border-cyan-200/12 bg-cyan-200/8 px-2 py-1 text-xs text-cyan-50/70">
                  {columnDeals.length}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                {columnDeals.slice(0, 4).map((deal, index) => (
                  <article
                    className="rounded-[18px] border border-cyan-100/10 bg-[#07111f]/82 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
                    key={`${deal.id}-${deal.updated_at}-${index}`}
                  >
                    <h3 className="text-sm font-semibold text-white">{deal.company_name}</h3>
                    <p className="mt-1 text-xs text-white/45">{deal.owner}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-cyan-50">{money.format(deal.value)}</span>
                      <span className="text-white/50">{deal.probability}%</span>
                    </div>
                    {column.next ? (
                      <button
                        className="mt-3 w-full rounded-full border border-cyan-200/16 bg-cyan-200/8 px-3 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-200/14 disabled:opacity-50"
                        disabled={busyAction === `deal-stage-${deal.id}`}
                        onClick={() => void moveDealStage(deal.id, column.next as DealStage)}
                        type="button"
                      >
                        {busyAction === `deal-stage-${deal.id}` ? "Moving..." : `Move to ${column.next}`}
                      </button>
                    ) : null}
                  </article>
                ))}
                {columnDeals.length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-white/10 p-4 text-xs text-white/38">
                    No live deals in this lane.
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
