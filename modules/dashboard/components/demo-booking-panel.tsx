"use client";

import { useCrm } from "@/lib/crm/use-crm";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DemoBookingPanel() {
  const { bookDemo, busyAction, demos, scoring } = useCrm();
  const hotLead = scoring?.scored_leads?.find((lead) => lead.status !== "demo_booked");

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
            Demo Booking Desk
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Executive demos and proof-of-value sessions
          </h2>
        </div>
        {hotLead ? (
          <button
            className="rounded-full border border-amber-200/22 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/16 disabled:opacity-50"
            disabled={busyAction === "demo-book"}
            onClick={() =>
              void bookDemo({
                lead_id: hotLead.id,
                company_name: hotLead.company_name,
                contact_name: hotLead.contact_name,
                owner: hotLead.owner,
              })
            }
            type="button"
          >
            {busyAction === "demo-book" ? "Booking..." : "Book Hot Lead"}
          </button>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {(demos?.demos ?? []).slice(0, 6).map((demo, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${demo.id}-${demo.scheduled_at}-${index}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{demo.company_name}</h3>
                <p className="mt-1 text-xs text-white/45">{demo.contact_name}</p>
              </div>
              <span className="rounded-full border border-cyan-200/12 bg-cyan-200/8 px-3 py-1 text-xs font-semibold text-cyan-50/70">
                {demo.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-white/62">{formatDate(demo.scheduled_at)}</p>
            <p className="mt-2 text-xs leading-5 text-white/42">{demo.agenda}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
