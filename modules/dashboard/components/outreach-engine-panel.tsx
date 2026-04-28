"use client";

import { useCrm } from "@/lib/crm/use-crm";

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function OutreachEnginePanel() {
  const { activities, busyAction, leads, logActivity } = useCrm();
  const nextLead = leads?.leads?.[0];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
            Outreach Engine
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Follow-ups, sequences, and sales activity ledger
          </h2>
        </div>
        {nextLead ? (
          <button
            className="rounded-full border border-cyan-200/18 bg-cyan-200/8 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/14 disabled:opacity-50"
            disabled={busyAction === "activity-log"}
            onClick={() =>
              void logActivity({
                lead_id: nextLead.id,
                activity_type: "follow_up",
                subject: `Founder follow-up for ${nextLead.company_name}`,
                notes: "Sent tailored executive ROI proof points and requested decision workshop.",
                owner: nextLead.owner,
                next_step: "Confirm executive buying committee",
              })
            }
            type="button"
          >
            {busyAction === "activity-log" ? "Logging..." : "Log Follow-up"}
          </button>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3">
        {(activities?.activities ?? []).slice(0, 8).map((activity, index) => (
          <article className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${activity.id}-${activity.created_at}-${index}`}>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{activity.subject}</h3>
                <p className="mt-1 text-xs text-white/42">
                  {activity.activity_type} · {activity.owner} · {formatShortDate(activity.created_at)}
                </p>
              </div>
              <span className="rounded-full border border-amber-200/14 bg-amber-200/8 px-3 py-1 text-xs font-semibold text-amber-50/70">
                {activity.next_step ?? "Next step pending"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">{activity.notes}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
