import type { OpsResourcesSnapshot } from "@/lib/ops/types";

export function getResourceTone(severity: string) {
  if (severity === "critical" || severity === "high") {
    return "border-rose-300/30 bg-rose-400/10 text-rose-100";
  }
  if (severity === "medium") {
    return "border-amber-300/25 bg-amber-400/10 text-amber-100";
  }
  return "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";
}

export function buildLocalResourcesSnapshot(): OpsResourcesSnapshot {
  const generatedAt = new Date().toISOString();
  return {
    generated_at: generatedAt,
    mode: "demo",
    live_incidents: [
      { incident_id: "INC-RES-001", title: "Kitchen Zone B fire", building: "Grand Meridian Hotel", zone: "Kitchen Zone B", severity: "critical", required_skill: "fire", urgency: 96 },
      { incident_id: "INC-RES-002", title: "Floor 3 trapped cluster", building: "Grand Meridian Hotel", zone: "Floor 3 West", severity: "high", required_skill: "rescue", urgency: 89 },
    ],
    deployment_map: [
      { assignment_id: "ASN-INC-RES-001", incident_id: "INC-RES-001", incident: "Kitchen Zone B fire", unit_id: "fire_alpha", unit: "Fire Team Alpha", eta_minutes: 3, confidence: 96, rationale: "Nearest fire-trained unit with low fatigue.", status: "recommended" },
      { assignment_id: "ASN-INC-RES-002", incident_id: "INC-RES-002", incident: "Floor 3 trapped cluster", unit_id: "security_bravo", unit: "Security Bravo", eta_minutes: 4, confidence: 89, rationale: "Best zone familiarity and rescue skill match.", status: "recommended" },
    ],
    teams: [
      { unit_id: "fire_alpha", name: "Fire Team Alpha", skills: ["fire", "rescue"], location: "Service corridor east", availability: "available", workload: 54, fatigue_score: 31, zone_familiarity: 94, eta_minutes: 3 },
      { unit_id: "security_bravo", name: "Security Bravo", skills: ["security", "crowd", "rescue"], location: "Lobby command post", availability: "deployed", workload: 71, fatigue_score: 42, zone_familiarity: 88, eta_minutes: 4 },
      { unit_id: "medic_2", name: "Medic Unit 2", skills: ["medical", "triage"], location: "South gate", availability: "available", workload: 46, fatigue_score: 27, zone_familiarity: 82, eta_minutes: 5 },
    ],
    inventory: [
      { item_id: "eq_extinguishers", name: "Extinguishers", category: "fire", ready: 88, deployed: 12, maintenance: 4, missing: 1, low_stock: false, state: "ready" },
      { item_id: "eq_oxygen", name: "Oxygen kits", category: "medical", ready: 18, deployed: 5, maintenance: 1, missing: 0, low_stock: true, state: "low stock" },
      { item_id: "eq_medkits", name: "Med kits", category: "medical", ready: 23, deployed: 9, maintenance: 2, missing: 1, low_stock: true, state: "low stock" },
    ],
    vehicles: [
      { vehicle_id: "amb_02", name: "Ambulance 02", type: "ambulance", status: "en route", eta_minutes: 7, route: "South Gate medical lane", blocked_route: false, reroute: "none" },
      { vehicle_id: "patrol_cart_3", name: "Patrol Cart 3", type: "patrol cart", status: "rerouting", eta_minutes: 4, route: "Atrium corridor", blocked_route: true, reroute: "Switch to loading dock path" },
    ],
    reserves: [
      { reserve_id: "reserve_security", name: "Reserve Security Pool", available: 8, activation_eta: "6 min", recommended: true },
      { reserve_id: "reserve_facilities", name: "Facilities On-call", available: 5, activation_eta: "12 min", recommended: true },
    ],
    eta_board: [
      { assignment_id: "ASN-INC-RES-001", incident_id: "INC-RES-001", incident: "Kitchen Zone B fire", unit_id: "fire_alpha", unit: "Fire Team Alpha", eta_minutes: 3, confidence: 96, rationale: "Nearest fire-trained unit with low fatigue.", status: "recommended" },
      { assignment_id: "ASN-INC-RES-002", incident_id: "INC-RES-002", incident: "Floor 3 trapped cluster", unit_id: "security_bravo", unit: "Security Bravo", eta_minutes: 4, confidence: 89, rationale: "Best zone familiarity and rescue skill match.", status: "recommended" },
    ],
    shortage_alerts: [
      { alert_id: "SHORT-MEDKIT", title: "Med kits low", severity: "high", owner: "Medical Unit 2", recommendation: "Release reserve med kits from lobby cache." },
      { alert_id: "FATIGUE-SEC", title: "Security fatigue high", severity: "medium", owner: "Security Bravo", recommendation: "Swap in reserve security pool within 20 minutes." },
    ],
    fatigue: [
      { unit: "Fire Team Alpha", active_hours: 7.1, fatigue_score: 31, overload_risk: "normal", recommended_swap: false },
      { unit: "Security Bravo", active_hours: 8.2, fatigue_score: 42, overload_risk: "high", recommended_swap: true },
    ],
    mission_assignments: [
      { assignment_id: "ASN-INC-RES-001", incident_id: "INC-RES-001", incident: "Kitchen Zone B fire", unit_id: "fire_alpha", unit: "Fire Team Alpha", eta_minutes: 3, confidence: 96, rationale: "Nearest fire-trained unit with low fatigue.", status: "recommended" },
    ],
    ledger: [
      { timestamp: generatedAt, event: "Resource Command local fallback", detail: "Local deterministic field deployment state loaded.", status: "verified" },
    ],
    summary: {
      active_incidents: 2,
      units_available: 3,
      equipment_ready: 129,
      vehicles_active: 2,
      reserve_units: 13,
      avg_eta_minutes: 4,
      shortages: 2,
      readiness_score: 92,
    },
  };
}
