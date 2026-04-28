"use client";

import { usePartners } from "@/lib/partners/use-partners";

export function FeaturedPartnersPanel() {
  const { live } = usePartners();
  const partners = live?.top_partners ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Featured Partners</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Certified ecosystem teams accelerating deployments</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {partners.map((partner, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${partner.partner_id}-${index}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{partner.name}</h3>
                <p className="mt-1 text-xs text-white/45">{partner.country} - {partner.partner_type.replaceAll("_", " ")}</p>
              </div>
              <span className="rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1 text-xs font-semibold uppercase text-amber-50">
                {partner.tier}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">{partner.specialization}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

