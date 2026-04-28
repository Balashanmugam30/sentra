"use client";

import type { ReactNode } from "react";

import { channelTone, formatMoney } from "@/lib/channel/runtime";
import type { CertificationsState, ChannelPartnersState } from "@/lib/channel/types";

export function PartnerTierGrid({ partners, certifications, busyAction, onUpgrade }: { partners: ChannelPartnersState; certifications: CertificationsState; busyAction: string | null; onUpgrade: (partnerId: string) => void }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Partner network</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Reseller and implementation tiers</h2>
        </div>
        <p className="text-sm text-white/50">{certifications.trained_staff} certified operators · {certifications.average_score}% avg score</p>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {partners.partners.map((partner) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-4" key={partner.partner_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{partner.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/35">{partner.region}</p>
              </div>
              <span className={`font-mono text-2xl ${channelTone(partner.score)}`}>{partner.score}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{partner.tier}</Badge>
              <Badge>{partner.support_grade} SLA</Badge>
              <Badge>{partner.certification_level}</Badge>
            </div>
            <p className="mt-4 text-sm text-white/50">{partner.type} covering {partner.countries.join(", ")}.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="ARR" value={formatMoney(partner.partner_arr)} />
              <Metric label="Pipeline" value={formatMoney(partner.pipeline_arr)} />
            </div>
            <button className="mt-4 w-full rounded-2xl border border-cyan-200/25 bg-cyan-200/10 px-3 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-50" disabled={busyAction === `upgrade-${partner.partner_id}`} onClick={() => onUpgrade(partner.partner_id)} type="button">
              Upgrade tier
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/60">{children}</span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 font-mono text-sm text-white">{value}</p>
    </div>
  );
}
