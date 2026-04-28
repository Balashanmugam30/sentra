"use client";

import { useGrowth } from "@/lib/growth/use-growth";

export function CountryLaunchPanel() {
  const { busyAction, countries, launchCountry } = useGrowth();
  const launchTargets = countries.filter((country) => country.status !== "launched").slice(0, 3);

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Country Launch Control</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">One-click market activation</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {launchTargets.map((country, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${country.country_id}-launch-${index}`}>
            <h3 className="text-lg font-semibold text-white">Launch {country.name}</h3>
            <p className="mt-2 text-sm text-white/55">ARR potential {country.ARR_potential.toLocaleString()} - cycle {country.sales_cycle_days}d</p>
            <button className="mt-4 rounded-full border border-cyan-200/22 bg-cyan-200/10 px-4 py-2 text-sm font-semibold text-cyan-50 disabled:opacity-50" disabled={busyAction === `launch-${country.name}`} onClick={() => void launchCountry(country.name)} type="button">
              {busyAction === `launch-${country.name}` ? "Launching..." : `Launch ${country.name}`}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

