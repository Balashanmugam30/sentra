import type { BehaviorCompliance, BehaviorZone } from "@/lib/behavior/types";

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculatePanicScore(zone: Pick<BehaviorZone, "fire_severity" | "smoke_level" | "alarm_clarity" | "density" | "visible_exits" | "time_pressure" | "noise_level" | "previous_alerts" | "exits">) {
  const visibleExitPenalty = 100 - zone.visible_exits;
  const alarmPenalty = 100 - zone.alarm_clarity;
  const exitPressure = Math.max(0, zone.density - zone.exits * 12);
  return clamp(
    zone.fire_severity * 0.22 +
      zone.smoke_level * 0.18 +
      alarmPenalty * 0.16 +
      zone.density * 0.16 +
      visibleExitPenalty * 0.12 +
      zone.time_pressure * 0.1 +
      zone.noise_level * 0.05 +
      zone.previous_alerts * 2 +
      exitPressure * 0.08,
  );
}

export function calculateFreezeScore(zone: Pick<BehaviorZone, "alarm_clarity" | "conflicting_instructions" | "visibility_score" | "mobility_percent" | "leadership_presence" | "smoke_level" | "density">) {
  return clamp(
    (100 - zone.alarm_clarity) * 0.18 +
      zone.conflicting_instructions * 0.18 +
      (100 - zone.visibility_score) * 0.18 +
      zone.mobility_percent * 0.18 +
      (100 - zone.leadership_presence) * 0.16 +
      zone.smoke_level * 0.08 +
      zone.density * 0.04,
  );
}

export function calculateCompliance(zone: BehaviorZone): BehaviorCompliance {
  const obey = clamp(
    zone.alarm_clarity * 0.28 +
      zone.leadership_presence * 0.24 +
      zone.visible_exits * 0.18 +
      zone.visibility_score * 0.14 -
      zone.conflicting_instructions * 0.16 -
      zone.noise_level * 0.07 +
      18,
  );
  return {
    obey_immediately: obey,
    delay_then_comply: clamp(52 + calculateFreezeScore(zone) * 0.28 - obey * 0.18),
    ignore_warning: clamp(34 + zone.previous_alerts * 5 + zone.conflicting_instructions * 0.22 - obey * 0.28),
    move_opposite_direction: clamp(18 + (100 - zone.visible_exits) * 0.18 + zone.density * 0.12 + zone.conflicting_instructions * 0.26),
  };
}

export function calculateHerdScore(zone: BehaviorZone) {
  return clamp(
    zone.density * 0.32 +
      (100 - zone.visible_exits) * 0.2 +
      zone.noise_level * 0.14 +
      zone.conflicting_instructions * 0.16 +
      (100 - zone.leadership_presence) * 0.12,
  );
}

export function calculateVulnerabilityScore(zone: BehaviorZone) {
  const ageFactor = zone.avg_age_band.toLowerCase().includes("elderly") ? 16 : zone.avg_age_band.toLowerCase().includes("families") ? 10 : 4;
  return clamp(zone.mobility_percent * 0.42 + zone.population / 38 + zone.smoke_level * 0.11 + (100 - zone.visibility_score) * 0.13 + ageFactor);
}

export function recommendCommunication(zone: BehaviorZone) {
  if (zone.mobility_percent >= 30) {
    return "Clinical calm voice alert with responder escort and repeated bedside instructions";
  }
  if (zone.panic_score >= 68) {
    return "Authoritative command, bright directional arrows, and multilingual repetition";
  }
  if (zone.freeze_score >= 58) {
    return "Calm voice alert, staff leader presence, and simple one-step instructions";
  }
  if (zone.herd_score >= 65) {
    return "Split-flow signage, responder marshals, and exit balancing language";
  }
  return "Clear directional message with calm confirmation loop";
}

