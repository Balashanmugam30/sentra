import { formatCurrency } from "@/lib/revenue/helpers";
import type { InvestorSummary } from "@/lib/investor/types";

type RaiseSimulatorProps = {
  summary: InvestorSummary;
  runway: Record<string, unknown> | null;
  busyAction: string | null;
  onRunScenario: (scenario: string) => void;
};

function scenarios(runway: Record<string, unknown> | null) {
  const value = runway?.scenarios;
  return Array.isArray(value) ? value as Array<Record<string, unknown>> : [
    { action: "Raise $2M", runway_months: 40, impact: "Adds bridge optionality." },
    { action: "Raise $10M", runway_months: 78, impact: "Funds global GTM and enterprise security certification." },
    { action: "Land $1M ARR deal", runway_months: 35, impact: "Improves burn multiple and Series A narrative." },
  ];
}

export function RaiseSimulator({ summary, runway, busyAction, onRunScenario }: RaiseSimulatorProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">Raise simulator</p>
      <p className="mt-3 text-4xl font-black text-white">{formatCurrency(summary.weighted_raise)}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">Probability-weighted raise based on active investor conviction and check sizes.</p>
      <div className="mt-4 space-y-3">
        {scenarios(runway).map((scenario) => {
          const action = String(scenario.action);
          return (
            <button
              key={action}
              type="button"
              onClick={() => onRunScenario(action)}
              disabled={busyAction === `scenario-${action}`}
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:bg-white/10 disabled:opacity-50"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-white">{action}</span>
                <span className="text-xl font-black text-emerald-100">{String(scenario.runway_months)}mo</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{String(scenario.impact)}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

