"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function AIDebateChamberV2() {
  const { busyAction, debateV2, runDebateV2 } = useAutonomousAI();

  return (
    <section className="rounded-[30px] border border-cyan-100/12 bg-[linear-gradient(135deg,rgba(7,13,25,0.82),rgba(20,28,48,0.58))] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/56">
            AI Debate Chamber 2.0
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Agents negotiate conflicting priorities into one merged plan
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50">
            Consensus {debateV2?.consensus_percent ?? 0}%
          </div>
          <button
            className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/12 disabled:opacity-55"
            disabled={busyAction === "debate-v2"}
            onClick={() => {
              void runDebateV2("fire_corridor_blocked");
            }}
            type="button"
          >
            {busyAction === "debate-v2" ? "Debating..." : "Run Debate"}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-white">Final merged plan</p>
        <p className="mt-2 text-sm leading-6 text-white/62">
          {debateV2?.final_merged_plan ?? "Specialist agents are aligning a consensus plan."}
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          {(debateV2?.positions ?? []).slice(0, 6).map((position) => (
            <div className="rounded-[20px] border border-white/10 bg-white/[0.045] p-3" key={position.agent}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{position.agent}</p>
                <span className="rounded-full border border-cyan-200/18 bg-cyan-200/8 px-2 py-1 text-xs text-cyan-50">
                  {position.score}%
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-white/58">{position.position}</p>
              <p className="mt-2 text-xs text-amber-50/68">Non-negotiable: {position.non_negotiable}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4">
          <div className="rounded-[22px] border border-rose-200/14 bg-rose-400/[0.07] p-4">
            <p className="text-sm font-semibold text-rose-50">Conflicts</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-white/62">
              {(debateV2?.conflicts ?? []).map((conflict, index) => (
                <li key={`${conflict}-${index}`}>{conflict}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[22px] border border-amber-200/14 bg-amber-400/[0.07] p-4">
            <p className="text-sm font-semibold text-amber-50">Negotiated concessions</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-white/62">
              {(debateV2?.negotiations ?? []).map((negotiation, index) => (
                <li key={`${negotiation}-${index}`}>{negotiation}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
