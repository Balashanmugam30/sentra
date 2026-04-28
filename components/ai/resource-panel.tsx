import type { AIDecisionResources } from "@/lib/ai/types";

type ResourcePanelProps = {
  resources: AIDecisionResources;
};

const resourceLabels: Array<[keyof AIDecisionResources, string]> = [
  ["responders_needed", "Responders"],
  ["medics_needed", "Medics"],
  ["security_needed", "Security"],
  ["route_marshals_needed", "Route marshals"],
];

export function ResourcePanel({ resources }: ResourcePanelProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/70">Resource Optimizer</p>
      <h2 className="mt-2 text-xl font-semibold text-white">Recommended deployment</h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {resourceLabels.map(([key, label]) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-3xl font-black text-white">{resources[key]}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
        <p className="text-sm font-semibold text-cyan-100">
          External agency call: {resources.external_agency_required ? "Required" : "Monitor only"}
        </p>
        <p className="mt-2 text-sm text-slate-300">{resources.resource_summary}</p>
      </div>
    </section>
  );
}
