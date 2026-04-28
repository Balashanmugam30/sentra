"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function HumanTrustDashboard() {
  const { trust } = useAutonomousAI();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.76)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Human Trust Dashboard
      </p>
      <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
            AI trust score {trust?.avg_human_trust_score ?? 0}%
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
            {trust?.governance_summary ?? "Trust metrics are calibrating from operator decision memory."}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/68">
          <div className="rounded-2xl border border-cyan-200/14 bg-cyan-200/8 px-3 py-2">
            Accepted<br />
            <span className="text-sm font-semibold text-cyan-50">{trust?.accepted_decisions_percent ?? 0}%</span>
          </div>
          <div className="rounded-2xl border border-rose-200/14 bg-rose-200/8 px-3 py-2">
            Rejected<br />
            <span className="text-sm font-semibold text-rose-50">{trust?.rejected_decisions_percent ?? 0}%</span>
          </div>
          <div className="rounded-2xl border border-amber-200/14 bg-amber-200/8 px-3 py-2">
            Override<br />
            <span className="text-sm font-semibold text-amber-50">{trust?.override_rate_percent ?? 0}%</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
          <p className="text-sm font-semibold text-white">Departments trusting AI most</p>
          <div className="mt-4 space-y-3">
            {(trust?.departments_trusting_ai_most ?? []).map((department) => (
              <div className="rounded-[20px] border border-white/10 bg-black/18 p-3" key={department.department}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{department.department}</p>
                  <span className="text-sm font-semibold text-cyan-50">{department.trust_score}%</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/54">{department.reason}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-amber-200/14 bg-amber-200/[0.055] p-4">
          <p className="text-sm font-semibold text-amber-50">Top rejection reasons</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/62">
            {(trust?.top_rejection_reasons ?? []).map((reason, index) => (
              <li className="rounded-[18px] border border-white/10 bg-black/18 p-3" key={`${reason}-${index}`}>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
