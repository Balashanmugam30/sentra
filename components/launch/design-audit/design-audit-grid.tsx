import { LaunchPanel } from "@/components/launch/launch-panel";

type DesignAudit = {
  area: string;
  score: number;
  status: string;
  checks: string[];
  finding: string;
};

export function DesignAuditGrid({ audits }: { audits: DesignAudit[] }) {
  return (
    <LaunchPanel eyebrow="Global UI Consistency Engine" title="Typography, cards, buttons, layout, accessibility, and brand polish">
      <div className="grid gap-4 lg:grid-cols-2">
        {audits.map((audit) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={audit.area}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold text-white">{audit.area}</p>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs text-cyan-100">{audit.score}/100</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">{audit.finding}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {audit.checks.map((check) => (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60" key={`${audit.area}-${check}`}>{check}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </LaunchPanel>
  );
}
