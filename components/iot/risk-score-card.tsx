import type { IotNode, IotRiskLevel } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

const riskRank: Record<IotRiskLevel, number> = {
  SAFE: 0,
  WARNING: 1,
  CRITICAL: 2,
  "CRITICAL+": 3,
};

const riskTone: Record<IotRiskLevel, string> = {
  SAFE: "from-emerald-400/25 via-cyan-400/10 to-transparent text-emerald-100",
  WARNING: "from-amber-400/30 via-orange-400/10 to-transparent text-amber-100",
  CRITICAL: "from-red-500/35 via-rose-500/10 to-transparent text-red-100",
  "CRITICAL+": "from-red-500/45 via-fuchsia-500/15 to-transparent text-red-50",
};

function getPrimaryRisk(nodes: IotNode[]) {
  let primary = nodes[0] ?? null;
  for (const node of nodes) {
    if (!primary || riskRank[node.risk_level] > riskRank[primary.risk_level]) {
      primary = node;
    }
  }
  return primary;
}

export function RiskScoreCard({ nodes }: { nodes: IotNode[] }) {
  const primary = getPrimaryRisk(nodes);
  const riskLevel = primary?.risk_level ?? "SAFE";
  const riskScore = primary?.risk_score ?? 0;

  return (
    <article className={cn("relative overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br p-6 shadow-[0_30px_100px_rgba(0,0,0,0.34)]", riskTone[riskLevel])}>
      <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-current opacity-10 blur-3xl" />
      <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">Sentra Edge Risk Engine</p>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl font-semibold tracking-[-0.06em]">{riskLevel}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 opacity-70">
            {primary
              ? `${primary.label} is driving the current edge posture in ${primary.zone}.`
              : "No edge nodes registered yet. Provision utility_node_01 to begin live sensing."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-6xl font-semibold tracking-[-0.08em]">{riskScore}</p>
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">/ 100</p>
        </div>
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-black/30">
        <div className="h-full rounded-full bg-current transition-all duration-700" style={{ width: `${Math.max(4, riskScore)}%` }} />
      </div>
    </article>
  );
}
