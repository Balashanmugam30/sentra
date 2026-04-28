"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

export function CustomerSuccessCopilot() {
  const { copilot } = useCustomerSuccess();

  return (
    <section className="rounded-[30px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(5,10,20,0.78),rgba(103,232,249,0.08),rgba(245,158,11,0.06))] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        AI Customer Success Copilot
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Recommended retention and expansion actions
      </h2>
      <div className="mt-5 grid gap-3">
        {(copilot?.actions ?? []).slice(0, 8).map((action, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${action.action_id}-${action.tenant_id}-${index}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-50/50">{action.priority} priority</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{action.recommendation}</h3>
                <p className="mt-2 text-sm leading-6 text-white/56">{action.why}</p>
              </div>
              <div className="rounded-[18px] border border-cyan-200/12 bg-cyan-200/6 p-3 text-sm text-cyan-50/72">
                {action.workspace_name}
              </div>
            </div>
            <p className="mt-3 text-xs text-white/42">
              Owner: {action.owner} - Due: {action.due} - Impact: {action.expected_impact}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
