import type { IotNode } from "@/lib/iot/types";
import { cn } from "@/lib/utils";

type SensorCard = {
  label: string;
  value: string;
  detail: string;
  tone: "safe" | "warning" | "critical" | "idle";
};

const toneStyles: Record<SensorCard["tone"], string> = {
  safe: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  critical: "border-red-300/35 bg-red-500/15 text-red-100",
  idle: "border-white/10 bg-white/[0.04] text-white/70",
};

function gasTone(value: number | null): SensorCard["tone"] {
  if (value === null) {
    return "idle";
  }
  if (value >= 2350) {
    return "critical";
  }
  if (value >= 1350) {
    return "warning";
  }
  return "safe";
}

function temperatureTone(value: number | null): SensorCard["tone"] {
  if (value === null) {
    return "idle";
  }
  if (value >= 62) {
    return "critical";
  }
  if (value >= 48) {
    return "warning";
  }
  return "safe";
}

export function SensorStatusGrid({ node }: { node: IotNode | null }) {
  const telemetry = node?.latest_telemetry ?? null;
  const cards: SensorCard[] = [
    {
      label: "Temperature",
      value: telemetry?.temperature === null || telemetry?.temperature === undefined ? "--" : `${telemetry.temperature.toFixed(1)} C`,
      detail: "DHT22 utility-zone reading",
      tone: temperatureTone(telemetry?.temperature ?? null),
    },
    {
      label: "Humidity",
      value: telemetry?.humidity === null || telemetry?.humidity === undefined ? "--" : `${telemetry.humidity.toFixed(0)}%`,
      detail: "Relative humidity",
      tone: telemetry?.humidity === undefined || telemetry.humidity === null ? "idle" : "safe",
    },
    {
      label: "Gas",
      value: telemetry?.gas_level === null || telemetry?.gas_level === undefined ? "--" : `${telemetry.gas_level} ADC`,
      detail: "MQ analog threshold engine",
      tone: gasTone(telemetry?.gas_level ?? null),
    },
    {
      label: "Flame",
      value: telemetry?.flame_detected ? "Detected" : telemetry ? "Clear" : "--",
      detail: "Digital flame sensor",
      tone: telemetry?.flame_detected ? "critical" : telemetry ? "safe" : "idle",
    },
    {
      label: "Panic Button",
      value: telemetry?.button_pressed ? "Pressed" : telemetry ? "Idle" : "--",
      detail: "Manual emergency input",
      tone: telemetry?.button_pressed ? "critical" : telemetry ? "safe" : "idle",
    },
    {
      label: "Telemetry",
      value: telemetry ? telemetry.risk_level : "Waiting",
      detail: telemetry ? telemetry.triggers.join(", ") || "No active triggers" : "POST /api/iot/telemetry",
      tone: telemetry ? (telemetry.risk_level === "SAFE" ? "safe" : telemetry.risk_level === "WARNING" ? "warning" : "critical") : "idle",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className={cn("rounded-[26px] border p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-2xl", toneStyles[card.tone])}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{card.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{card.value}</p>
          <p className="mt-2 min-h-10 text-sm leading-5 opacity-65">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}
