import type { AIDecisionStrategy } from "@/lib/ai/types";

export function StrategyTable({
  strategies,
  recommendedId,
}: {
  strategies: AIDecisionStrategy[];
  recommendedId: string;
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/60">Strategy Comparison</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">AI-ranked response options</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-black/25 text-[11px] uppercase tracking-[0.2em] text-white/40">
            <tr>
              {["Option", "Strategy", "Success", "Evacuation", "Casualty Reduction", "Disruption", "Confidence", "Score"].map((heading) => (
                <th className="px-4 py-3" key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strategies.map((strategy) => (
              <tr className="border-t border-white/10 text-white/70" key={strategy.option_id}>
                <td className="px-4 py-4 font-semibold text-white">{strategy.option_id}</td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-white">{strategy.name}</span>
                  {strategy.option_id === recommendedId ? (
                    <span className="ml-2 rounded-full bg-cyan-300/15 px-2 py-1 text-[10px] font-bold uppercase text-cyan-100">Best</span>
                  ) : null}
                </td>
                <td className="px-4 py-4">{strategy.success_probability}%</td>
                <td className="px-4 py-4">{strategy.estimated_evacuation_time}</td>
                <td className="px-4 py-4">{strategy.casualty_reduction_estimate}%</td>
                <td className="px-4 py-4">{strategy.operational_disruption}%</td>
                <td className="px-4 py-4">{strategy.confidence}%</td>
                <td className="px-4 py-4 font-semibold text-cyan-100">{strategy.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
