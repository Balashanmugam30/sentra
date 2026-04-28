"use client";

import { useOmega } from "@/lib/omega/use-omega";
import { OmegaMetricCard, OmegaPanelShell, OmegaPill, omegaCompact, omegaList, omegaRecord, omegaString } from "@/modules/dashboard/components/omega-panel-primitives";

export function StrategicMemoryEngine() {
  const { memory } = useOmega();
  const patterns = omegaList<Record<string, unknown>>(memory?.recurring_patterns);
  const trusted = omegaList<Record<string, unknown>>(memory?.trust_by_module);

  return (
    <OmegaPanelShell
      description="Persistent learning ledger for best actions, failed actions, recurring patterns, and trust by module."
      eyebrow="Strategic Memory Core"
      title={`${omegaCompact.format(Number(memory?.memory_episodes ?? 18_400))} memory episodes indexed`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-3">
        <OmegaMetricCard label="Best actions" value={omegaList(memory?.best_actions).length || 3} />
        <OmegaMetricCard label="Failed actions" value={omegaList(memory?.failed_actions).length || 2} />
        <OmegaMetricCard label="Patterns" value={patterns.length || 3} />
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          {patterns.map((pattern, index) => (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={`${omegaString(pattern.pattern, "pattern")}-${index}`}>
              <p className="text-sm font-semibold text-white">{omegaString(pattern.pattern, "Pattern")}</p>
              <OmegaPill>{String(pattern.confidence ?? 88)}% confidence</OmegaPill>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {trusted.map((module, index) => (
            <div className="rounded-[22px] border border-cyan-200/10 bg-cyan-200/[0.045] p-4" key={`${omegaString(module.module, "module")}-${index}`}>
              <p className="text-sm font-semibold text-white">{omegaString(module.module, "Module")}</p>
              <p className="mt-1 text-xs text-cyan-50/60">{String(module.trust ?? 91)}% trust</p>
            </div>
          ))}
        </div>
      </div>
    </OmegaPanelShell>
  );
}

