"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

function stanceTone(stance: string) {
  if (stance === "concern") {
    return "border-rose-300/24 bg-rose-400/10 text-rose-100";
  }
  if (stance === "conditional") {
    return "border-amber-300/24 bg-amber-400/10 text-amber-100";
  }
  return "border-cyan-300/22 bg-cyan-400/10 text-cyan-100";
}

export function MultiAgentCouncilChamber() {
  const { council, live } = useAutonomousAI();
  const snapshot = council ?? live?.consensus ?? null;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.74)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
            Multi-Agent Council Chamber
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Specialist agents negotiate one merged strategy before action
          </h2>
        </div>
        <div className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50">
          Consensus {snapshot?.agreement_percent ?? 0}%
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
        <p className="text-sm font-semibold text-white">Final merged strategy</p>
        <p className="mt-2 text-sm leading-6 text-white/62">
          {snapshot?.final_merged_strategy ?? "Syncing agent strategy consensus."}
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(snapshot?.agents ?? []).map((agent) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={agent.agent_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/42">
                  {agent.domain.replaceAll("_", " ")}
                </p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[0.62rem] uppercase tracking-[0.14em] ${stanceTone(agent.stance)}`}>
                {agent.stance}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/64">{agent.proposed_action}</p>
            <p className="mt-2 text-xs text-white/46">{agent.rationale}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/64">
              <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-2">Urgency {agent.urgency}%</div>
              <div className="rounded-2xl border border-white/8 bg-black/18 px-3 py-2">Confidence {agent.confidence}%</div>
            </div>
          </article>
        ))}
      </div>

      {snapshot?.minority_concerns?.length ? (
        <div className="mt-5 rounded-[22px] border border-amber-200/18 bg-amber-200/8 p-4 text-sm text-amber-50/82">
          {snapshot.minority_concerns.join(" ")}
        </div>
      ) : null}
    </section>
  );
}

