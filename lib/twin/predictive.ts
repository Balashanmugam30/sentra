import type { TwinForecast, TwinPredictiveState } from "@/lib/twin/types";

export function dominantPrediction(predictive: TwinPredictiveState) {
  return [...predictive.predictions].sort((left, right) => right.risk - left.risk)[0] ?? null;
}

export function forecastPeak(forecast: TwinForecast) {
  return forecast.horizons.reduce(
    (peak, horizon) => {
      const score = Math.max(horizon.fire_spread, horizon.gas_spread, horizon.crowd_pressure, horizon.panic, horizon.utility_chain);
      return score > peak.score ? { window: horizon.window, score } : peak;
    },
    { window: "5 min", score: 0 },
  );
}

