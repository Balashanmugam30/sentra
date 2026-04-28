"use client";

import { useCrm } from "@/lib/crm/use-crm";

const money = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function LeadRadarPanel() {
  const { scoring } = useCrm();
  const leads = scoring?.scored_leads?.slice(0, 20) ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
        AI Lead Radar
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
        Hottest enterprise prospects ranked by fit and urgency
      </h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {leads.map((lead, index) => (
          <article
            className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4"
            key={`${lead.id}-${lead.created_at}-${index}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{lead.company_name}</h3>
                <p className="mt-1 text-xs text-white/45">
                  {lead.contact_name} · {lead.role} · {lead.country}
                </p>
              </div>
              <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-1 text-sm font-semibold text-cyan-50">
                {lead.score}
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-300/80" style={{ width: `${lead.score}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/8 px-3 py-1 text-white/58">{lead.industry}</span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-white/58">{lead.status}</span>
              <span className="rounded-full bg-amber-200/10 px-3 py-1 text-amber-50/75">
                {money.format(lead.deal_value_estimate)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
