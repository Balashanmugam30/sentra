import type { IntegrationAutomation } from "@/lib/integrations/types";

export function AutomationExchange({ automations }: { automations: IntegrationAutomation[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100/55">Workflow Automation Exchange</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Trigger {"->"} condition {"->"} action flows</h3>
      <div className="mt-5 grid gap-4">
        {automations.map((automation) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={automation.automation_id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-white">{automation.name}</h4>
              <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">{automation.success_rate}% success</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Step label="Trigger" value={automation.trigger} />
              <Step label="Condition" value={automation.condition} />
              <Step label="Runs today" value={automation.runs_today.toString()} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {automation.actions.map((action) => (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60" key={`${automation.automation_id}-${action}`}>
                  {action}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Step({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 text-sm text-white/70">{value}</p>
    </div>
  );
}
