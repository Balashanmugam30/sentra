"use client";

import { useAutonomy } from "@/lib/autonomy/use-autonomy";
import {
  AutonomyPanelChrome,
  AutonomyPill,
  autoList,
  autoNumber,
  autoString,
} from "@/modules/dashboard/components/autonomy-panel-primitives";

export function StrategyEvolutionPanel() {
  const { learning, memory } = useAutonomy();
  const playbooks = autoList<Record<string, unknown>>(learning?.playbook_win_rates);
  const learnings = autoList<string>(memory?.recent_learnings);
  const rejected = autoList<string>(learning?.override_reasons);

  return (
    <AutonomyPanelChrome title="Strategy Evolution Panel" eyebrow="Continuous Strategic Improvement" accent="gold">
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <h4 className="font-semibold text-white">Playbook Win Rates</h4>
          <div className="mt-4 space-y-3">
            {playbooks.slice(0, 3).map((playbook, index) => (
              <div key={`${autoString(playbook.playbook, "playbook")}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-2">
                <span className="text-sm text-slate-200">{autoString(playbook.playbook, "Playbook")}</span>
                <AutonomyPill>{autoNumber(playbook.win_rate, 88)}%</AutonomyPill>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <h4 className="font-semibold text-white">Recent Learnings</h4>
          <div className="mt-4 space-y-2">
            {learnings.slice(0, 3).map((learning, index) => (
              <p key={`${learning}-${index}`} className="rounded-xl bg-cyan-300/8 px-3 py-2 text-sm text-cyan-50">
                {learning}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
        <h4 className="font-semibold text-orange-100">Override Pattern Intelligence</h4>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {rejected.slice(0, 3).map((reason, index) => (
            <p key={`${reason}-${index}`} className="text-sm text-orange-50/85">
              {reason}
            </p>
          ))}
        </div>
      </div>
    </AutonomyPanelChrome>
  );
}

