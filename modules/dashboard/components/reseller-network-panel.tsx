"use client";

import { usePartners } from "@/lib/partners/use-partners";

export function ResellerNetworkPanel() {
  const { network } = usePartners();
  const partners = network?.partners ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Reseller Network</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Global ecosystem coverage and implementation strength</h2>
      <div className="mt-5 grid gap-3">
        {partners.map((partner, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${partner.partner_id}-network-${index}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{partner.name}</p>
                <p className="mt-1 text-xs text-white/45">{partner.specialization}</p>
              </div>
              <span className="rounded-full border border-cyan-200/18 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50">
                {partner.health_score} health
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

