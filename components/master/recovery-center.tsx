import type { MasterGuardrail, MasterRecovery } from "@/lib/master/types";

type RecoveryCenterProps = {
  recovery: MasterRecovery[];
  guardrails: MasterGuardrail[];
  failoverEvents: { event: string; tenant: string; impact: string; confidence: number }[];
  outcomes: string[];
};

export function RecoveryCenter({ recovery, guardrails, failoverEvents, outcomes }: RecoveryCenterProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Closed Loop Recovery</p>
        <h2 className="mt-2 text-2xl font-black text-white">Recovery & Guardrails</h2>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {recovery.map((item) => (
          <article key={item.recovery_id} className="rounded-3xl border border-emerald-300/15 bg-emerald-300/10 p-4">
            <p className="text-3xl font-black text-white">{item.score}</p>
            <h3 className="mt-2 font-bold text-emerald-50">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-emerald-100/75">{item.outcome}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-emerald-200/60">ETA {item.eta_minutes}m</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-black text-white">Safety Guardrails</h3>
          <div className="mt-3 space-y-3">
            {guardrails.map((guardrail) => (
              <div key={guardrail.guardrail_id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-100">{guardrail.name}</span>
                  <span className="text-emerald-200">{guardrail.coverage}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-300" style={{ width: `${guardrail.coverage}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{guardrail.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <h3 className="font-black text-white">Failover & Outcomes</h3>
          <div className="mt-3 space-y-3">
            {failoverEvents.map((event) => (
              <div key={`${event.tenant}-${event.event}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-sm font-bold text-white">{event.event}</p>
                <p className="mt-1 text-xs text-slate-400">{event.tenant} · {event.impact} · {event.confidence}% confidence</p>
              </div>
            ))}
            {outcomes.slice(0, 3).map((outcome) => (
              <p key={outcome} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-sm text-cyan-50">
                {outcome}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

