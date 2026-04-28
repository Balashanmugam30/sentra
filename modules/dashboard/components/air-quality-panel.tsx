"use client";

import type { UseEnvironmentResult } from "@/lib/environment/use-environment";

function aqiTone(aqi: number) {
  if (aqi >= 180) {
    return "from-rose-500/20 to-rose-950/20 text-rose-100 border-rose-400/30";
  }
  if (aqi >= 130) {
    return "from-amber-500/20 to-amber-950/20 text-amber-100 border-amber-400/30";
  }
  if (aqi >= 80) {
    return "from-sky-500/20 to-sky-950/20 text-sky-100 border-sky-400/30";
  }
  return "from-emerald-500/20 to-emerald-950/20 text-emerald-100 border-emerald-400/30";
}

type AirQualityPanelProps = {
  environment: UseEnvironmentResult;
};

export function AirQualityPanel({ environment }: AirQualityPanelProps) {
  const live = environment.live;
  const aqi = live?.air_quality?.aqi ?? 0;
  const riskBand = live?.air_quality?.risk_band ?? "unknown";
  const pm25 = live?.air_quality?.pm25 ?? 0;
  const pm10 = live?.air_quality?.pm10 ?? 0;
  const ozone = live?.air_quality?.o3 ?? 0;
  const no2 = live?.air_quality?.no2 ?? 0;

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.78)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Air Quality Panel
          </p>
          <h2 className="text-lg font-semibold text-white">
            AQI, particulate load, and outdoor exposure guidance for responder and facility safety
          </h2>
        </div>

        <div className={`grid gap-4 rounded-[24px] border bg-gradient-to-br p-5 ${aqiTone(aqi)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.16em] opacity-75">AQI Gauge</div>
              <div className="mt-2 text-3xl font-semibold">{aqi}</div>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.16em]">
              {riskBand}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["PM2.5", pm25],
              ["PM10", pm10],
              ["Ozone", ozone],
              ["NO2", no2],
            ].map(([label, value], index) => (
              <div className="rounded-[18px] border border-white/10 bg-black/15 px-4 py-4" key={`${label}-${index}`}>
                <div className="text-[0.68rem] uppercase tracking-[0.16em] opacity-70">{label}</div>
                <div className="mt-2 text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[18px] border border-white/10 bg-black/15 px-4 py-4 text-sm">
            <span className="font-medium">Recommendation:</span>{" "}
            {live?.operational_impacts?.facility_hvac_recommendation ??
              "Maintain monitored fresh-air mode"}
          </div>
        </div>
      </div>
    </section>
  );
}
