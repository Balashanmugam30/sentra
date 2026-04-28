"use client";

import { usePartners } from "@/lib/partners/use-partners";

export function CertificationCenter() {
  const { certifications } = usePartners();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Certification Center</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Partner capability credentials</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {(certifications?.certifications ?? []).map((certification, index) => (
          <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs text-white/72" key={`${certification.name}-${index}`}>
            {certification.name} - {certification.partners} partners
          </span>
        ))}
      </div>
    </section>
  );
}

