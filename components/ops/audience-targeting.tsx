import { getCommsRiskTone } from "@/lib/ops/communications";
import type { OpsCommsAudience } from "@/lib/ops/types";

type AudienceTargetingProps = {
  audiences: OpsCommsAudience[];
};

export function AudienceTargeting({ audiences }: AudienceTargetingProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-violet-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-100/70">Audience Targeting</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Role, zone, tenant, incident</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {audiences.map((audience) => (
          <article key={audience.audience_id} className={`rounded-3xl border p-4 ${getCommsRiskTone(audience.risk)}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{audience.label}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] opacity-70">{audience.scope}</p>
              </div>
              <span className="text-2xl font-black text-white">{audience.count}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
