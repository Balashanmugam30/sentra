import type { IotDemoRunData, IotDemoScenario } from "@/lib/iot/types";

export function DemoScenarios({
  scenarios,
  busyId,
  result,
  onRun,
}: {
  scenarios: IotDemoScenario[];
  busyId: string | null;
  result: IotDemoRunData | null;
  onRun: (scenarioId: string) => void;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-4">
        {scenarios.map((scenario) => (
          <article className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]" key={scenario.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/55">{scenario.building}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{scenario.title}</h3>
                <p className="mt-1 text-sm text-white/45">Expected response ETA {scenario.expected_eta}</p>
              </div>
              <button
                className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-50"
                disabled={busyId === scenario.id}
                onClick={() => onRun(scenario.id)}
                type="button"
              >
                {busyId === scenario.id ? "Launching..." : "Run scenario"}
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.26)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/65">Executive Demo Output</p>
        {result ? (
          <div className="mt-5">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white">{result.scenario.title}</h2>
            <p className="mt-4 text-sm leading-6 text-white/60">{result.executive_summary}</p>
            <div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4 text-sm text-cyan-50/75">
              {result.routing_update}
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-white/55">
            Run any judge scenario to spawn an alert, update the feed, request verification, and generate a board-ready summary.
          </p>
        )}
      </div>
    </section>
  );
}
