import type { OpsRecoverySnapshot, OpsResourcesSnapshot } from "@/lib/ops/types";

type ContinuityKpisProps = {
  resources?: OpsResourcesSnapshot;
  recovery?: OpsRecoverySnapshot;
};

export function ContinuityKpis({ resources, recovery }: ContinuityKpisProps) {
  const metrics = recovery
    ? [
        ["Contain", recovery.kpis.time_to_contain],
        ["Reopen", recovery.kpis.time_to_reopen],
        ["Losses reduced", recovery.kpis.losses_reduced],
        ["Continuity", recovery.kpis.continuity_score],
        ["Readiness", recovery.kpis.readiness_score],
        ["Progress", `${recovery.kpis.recovery_progress}%`],
      ]
    : [
        ["Incidents", resources?.summary?.active_incidents ?? 0],
        ["Units ready", resources?.summary?.units_available ?? 0],
        ["Equipment", resources?.summary?.equipment_ready ?? 0],
        ["Vehicles", resources?.summary?.vehicles_active ?? 0],
        ["Reserves", resources?.summary?.reserve_units ?? 0],
        ["Readiness", resources?.summary?.readiness_score ?? 0],
      ];

  return (
    <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {metrics.map(([label, value]) => (
        <article key={label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <p className="text-2xl font-black text-white">{value}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        </article>
      ))}
    </section>
  );
}
