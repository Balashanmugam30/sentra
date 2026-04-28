"use client";

import { useCustomerSuccess } from "@/lib/customer-success/use-customer-success";

const milestones = [
  "setup_complete",
  "invited_users",
  "first_login",
  "first_report_created",
  "first_AI_action_used",
  "integrations_connected",
  "admin_trained",
  "executive_review_complete",
] as const;

export function OnboardingMissionControl() {
  const { onboarding } = useCustomerSuccess();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        Onboarding Mission Control
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Activation, time-to-value, and onboarding health
      </h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {(onboarding?.accounts ?? []).slice(0, 6).map((account, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${account.tenant_id}-${account.activation_score}-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{account.workspace_name}</h3>
                <p className="mt-1 text-xs text-white/42">{account.time_to_value}d time-to-value</p>
              </div>
              <span className="rounded-full border border-cyan-200/14 bg-cyan-200/8 px-3 py-1 text-xs font-semibold text-cyan-50/72">
                {account.activation_score}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {milestones.map((milestone) => (
                <div
                  className={`h-2 rounded-full ${account[milestone] ? "bg-cyan-300/80" : "bg-white/12"}`}
                  key={`${account.tenant_id}-${milestone}`}
                  title={milestone}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
