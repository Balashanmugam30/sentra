from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS


SEEDED_AT = "2026-04-26T00:00:00+00:00"
STORE_VERSION = "phase20x-2026-04-26"

DEMO_MODES: tuple[dict[str, Any], ...] = (
    {"mode_id": "judge", "name": "Hackathon Judge Demo", "duration_minutes": 5, "audience": "judges", "promise": "Prove crisis intelligence from detection to recovery in one cinematic arc."},
    {"mode_id": "investor", "name": "Investor Demo", "duration_minutes": 7, "audience": "investors", "promise": "Show TAM, ARR potential, defensible AI moat, and global scale."},
    {"mode_id": "government", "name": "Government Demo", "duration_minutes": 8, "audience": "public sector", "promise": "Demonstrate smart city, hospital mesh, and sovereign readiness."},
    {"mode_id": "enterprise", "name": "Enterprise Demo", "duration_minutes": 6, "audience": "enterprise buyers", "promise": "Run hotel, hospital, campus, mall, and industrial crisis operations."},
)

DEMO_SCENES: tuple[dict[str, Any], ...] = (
    {"scene_id": "SCN-01-CALM", "mode": "judge", "order": 1, "title": "Calm building baseline", "what_happened": "Grand Meridian Hotel is operating normally with healthy IoT nodes, steady occupancy, and no active threats.", "why_sentra_wins": "Sentra starts with a living operational picture instead of waiting for a 911 call.", "ai_reasoning": "Baseline telemetry gives the AI confidence that later deviations are real.", "next_action": "Arm digital twin and watch weak signals.", "metrics": {"risk": 8, "confidence": 91, "eta": "0 min"}, "caption": "At 10:40 AM, Sentra sees a calm facility before humans notice anything unusual."},
    {"scene_id": "SCN-02-FIRE", "mode": "judge", "order": 2, "title": "Fire detected in Kitchen Zone B", "what_happened": "Heat, smoke, and flame signatures converge from IoT telemetry and corridor vision.", "why_sentra_wins": "The system correlates sensor, camera, and occupancy data into one verified incident.", "ai_reasoning": "Multiple independent signals raise severity without waiting for manual confirmation.", "next_action": "Trigger predictive spread and council analysis.", "metrics": {"risk": 82, "confidence": 93, "eta": "14 min"}, "caption": "At 10:42 AM, fire risk becomes confirmed and Sentra moves from monitoring to command."},
    {"scene_id": "SCN-03-PREDICT", "mode": "judge", "order": 3, "title": "AI predicts spread", "what_happened": "The digital twin forecasts smoke reaching the west service corridor in seven minutes.", "why_sentra_wins": "Sentra shows what happens next, not just what happened already.", "ai_reasoning": "Smoke direction, HVAC status, stairwell load, and occupancy density point to west-wing exposure.", "next_action": "Keep west corridor closed and prioritize east stairwell routing.", "metrics": {"risk": 76, "confidence": 92, "eta": "7 min"}, "caption": "The twin forecasts where danger will be before it gets there."},
    {"scene_id": "SCN-04-BEHAVIOR", "mode": "judge", "order": 4, "title": "Crowd panic forecast", "what_happened": "Human behavior intelligence predicts hesitation near Floor 3 elevators and bunching near Stairwell A.", "why_sentra_wins": "Sentra models people, not just fire.", "ai_reasoning": "Alarm ambiguity, density, and poor visibility increase panic probability.", "next_action": "Send calm directional messaging and split crowds to two exits.", "metrics": {"panic_reduced": 42, "confidence": 90, "compliance": 87}, "caption": "Sentra knows evacuations fail when people freeze, rush, or follow the wrong crowd."},
    {"scene_id": "SCN-05-COUNCIL", "mode": "judge", "order": 5, "title": "Multi-agent council debates", "what_happened": "Safety, logistics, medical, communications, and executive risk agents compare full evacuation versus phased evacuation.", "why_sentra_wins": "Multiple specialist AIs debate tradeoffs before the final plan is governed.", "ai_reasoning": "Partial floor evacuation minimizes congestion while fire response contains the source.", "next_action": "Approve phased evacuation with responder dispatch.", "metrics": {"consensus": 94, "confidence": 93, "risk_delta": -31}, "caption": "Instead of a single black box, Sentra produces a governed expert consensus."},
    {"scene_id": "SCN-06-OPS", "mode": "judge", "order": 6, "title": "Operations auto-dispatch", "what_happened": "Fire Team Alpha, Medical Unit 2, and Security Bravo receive tasks with SLA timers.", "why_sentra_wins": "Recommendations become executable workflows with owners and evidence.", "ai_reasoning": "Nearest capable teams have the highest skill fit and fastest route availability.", "next_action": "Dispatch responders and lock service elevators.", "metrics": {"response_speed": 61, "sla": 97, "teams": 3}, "caption": "Sentra stops being a dashboard and becomes an operations engine."},
    {"scene_id": "SCN-07-COMMS", "mode": "judge", "order": 7, "title": "Mass communications sent", "what_happened": "Targeted alerts reach occupants, responders, executives, and public-area staff across multiple channels.", "why_sentra_wins": "Silence is escalated and help requests are routed immediately.", "ai_reasoning": "Zone-specific communication avoids panic and improves compliance.", "next_action": "Track acknowledgements and re-route silent zones.", "metrics": {"population_reached": 96, "avg_ack_seconds": 38, "silent_zones": 1}, "caption": "Humans receive the right message, through the right channel, at the right moment."},
    {"scene_id": "SCN-08-TWIN", "mode": "judge", "order": 8, "title": "Twin visualizes movement", "what_happened": "The live twin shows responders, evacuees, smoke layers, safe exits, and blocked routes.", "why_sentra_wins": "Executives and responders share one visual truth.", "ai_reasoning": "The command overlay validates east-flow evacuation and maintains corridor pressure below threshold.", "next_action": "Replay decision timeline for audit evidence.", "metrics": {"evac_progress": 74, "route_safety": 95, "visibility": 88}, "caption": "Everyone sees the same operational reality, not fragmented radio calls."},
    {"scene_id": "SCN-09-EXEC", "mode": "judge", "order": 9, "title": "Executive summary generated", "what_happened": "Sentra produces a board-ready incident summary with saved losses, recovery ETA, and governance evidence.", "why_sentra_wins": "Leadership gets clarity while operators keep moving.", "ai_reasoning": "All high-impact actions are linked to confidence, owners, and audit evidence.", "next_action": "Launch recovery workflow and reopen readiness checks.", "metrics": {"cost_saved": 2100000, "downtime_reduced": 55, "trust": 94}, "caption": "The system translates chaos into an executive-grade decision record."},
    {"scene_id": "SCN-10-RECOVERY", "mode": "judge", "order": 10, "title": "Recovery complete", "what_happened": "Hazard clearance, guest relocation, vendor tasks, and reopening approvals complete.", "why_sentra_wins": "Sentra owns the full crisis lifecycle from detection to reopening.", "ai_reasoning": "Closeout is allowed only after verification, audit evidence, and human approval.", "next_action": "Export board report and lessons learned.", "metrics": {"recovery_eta_minutes": 14, "loss_reduction": 55, "readiness": 96}, "caption": "Sentra does not just respond. It recovers the business."},
)

WOW_METRICS: tuple[dict[str, Any], ...] = (
    {"metric_id": "WOW-CASUALTY", "label": "Casualty risk reduced", "value": 42, "suffix": "%", "trend": "safer"},
    {"metric_id": "WOW-SPEED", "label": "Response speed", "value": 61, "suffix": "%", "trend": "faster"},
    {"metric_id": "WOW-DOWNTIME", "label": "Downtime reduced", "value": 55, "suffix": "%", "trend": "lower"},
    {"metric_id": "WOW-SAVED", "label": "Cost saved", "value": 2.1, "suffix": "M", "prefix": "$", "trend": "protected"},
    {"metric_id": "WOW-CONFIDENCE", "label": "AI confidence", "value": 93, "suffix": "%", "trend": "trusted"},
    {"metric_id": "WOW-ETA", "label": "Recovery ETA", "value": 14, "suffix": " min", "trend": "controlled"},
)

JUDGE_SCORE: tuple[dict[str, Any], ...] = (
    {"category": "Innovation", "score": 98, "reason": "Human behavior, digital twin, autonomy, and governance combine into one command OS."},
    {"category": "Technical complexity", "score": 96, "reason": "Sentra spans IoT, MLOps, AI council, operations workflows, communications, and multi-tenant SaaS."},
    {"category": "Real-world impact", "score": 97, "reason": "Hotels, hospitals, campuses, malls, airports, factories, and governments can reduce harm and downtime."},
    {"category": "Scalability", "score": 95, "reason": "Marketplace, channel, revenue, tenant isolation, and white-label layers prove platform scale."},
    {"category": "Business model", "score": 94, "reason": "Subscription, usage billing, partner marketplace, OEM licensing, and channel expansion are modeled."},
    {"category": "Wow factor", "score": 99, "reason": "One-click cinematic demo makes the product immediately understandable and memorable."},
)

EXPORTS: tuple[dict[str, Any], ...] = (
    {"export_id": "EXP-BOARD", "name": "PDF board report", "type": "pdf", "status": "ready", "pages": 14, "audience": "board"},
    {"export_id": "EXP-INVESTOR", "name": "Investor one pager", "type": "pdf", "status": "ready", "pages": 1, "audience": "investor"},
    {"export_id": "EXP-INCIDENT", "name": "Incident report", "type": "pdf", "status": "ready", "pages": 9, "audience": "operations"},
    {"export_id": "EXP-DEMO", "name": "Demo summary", "type": "pdf", "status": "ready", "pages": 5, "audience": "judges"},
    {"export_id": "EXP-SCREEN", "name": "Screenshot pack", "type": "zip", "status": "ready", "pages": 24, "audience": "media"},
)

POLISH_AREAS: tuple[dict[str, Any], ...] = (
    {"area_id": "POL-VISUAL", "name": "Visual language", "score": 96, "items": ["glass command cards", "animated gradients", "premium shadows", "severity badges"]},
    {"area_id": "POL-UX", "name": "Operator UX", "score": 94, "items": ["loading skeletons", "empty states", "sticky command actions", "keyboard shortcuts"]},
    {"area_id": "POL-PERF", "name": "Performance posture", "score": 91, "items": ["request dedupe", "route chunking", "suspense boundaries", "polling discipline"]},
    {"area_id": "POL-EXEC", "name": "Executive mode", "score": 95, "items": ["simplified boards", "board-ready summaries", "presenter mode", "exports"]},
)


class DemoStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "store_version": STORE_VERSION,
            "modes": [],
            "scenes": [],
            "wow_metrics": [],
            "judge_scores": [],
            "exports": [],
            "polish_areas": [],
            "runs": [],
            "state": {"active_mode": "judge", "active_scene_index": 0, "speed": 1, "playing": False, "fullscreen": False},
            "events": [],
        }

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        if payload.get("store_version") != STORE_VERSION:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        seed_groups = {
            "modes": (DEMO_MODES, "mode_id"),
            "scenes": (DEMO_SCENES, "scene_id"),
            "wow_metrics": (WOW_METRICS, "metric_id"),
            "judge_scores": (JUDGE_SCORE, "category"),
            "exports": (EXPORTS, "export_id"),
            "polish_areas": (POLISH_AREAS, "area_id"),
        }
        with self._lock:
            payload = self._read()
            for table, (rows, key) in seed_groups.items():
                existing = {row[key] for row in payload[table] if key in row}
                for row in rows:
                    if row[key] in existing:
                        continue
                    payload[table].append({**row, "updated_at": SEEDED_AT})
                    created += 1
            self._write(payload)
        return {"created": created}

    def snapshot(self) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            return self._read()

    def update_state(self, updates: dict[str, Any], action: str, tenant_id: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            payload["state"].update(updates)
            event = self._event(payload, tenant_id, action, updates)
            self._write(payload)
            return {"state": dict(payload["state"]), "event": event}

    def run(self, tenant_id: str, mode: str, scenario: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            run = {
                "run_id": f"DEMO-RUN-{len(payload['runs']) + 1:04d}",
                "tenant_id": tenant_id,
                "mode": mode,
                "scenario": scenario,
                "status": "running",
                "started_at": SEEDED_AT,
                "systems_injected": ["iot", "digital_twin", "ai_council", "operations", "communications", "executive"],
                "evidence": "all demo mutations are audit logged and reversible",
            }
            payload["runs"].append(run)
            payload["state"].update({"active_mode": mode, "active_scene_index": 0, "playing": True})
            event = self._event(payload, tenant_id, f"demo_run_{scenario}", {"run_id": run["run_id"], "mode": mode})
            self._write(payload)
            return {"run": run, "state": dict(payload["state"]), "event": event}

    def reset(self, tenant_id: str) -> dict[str, Any]:
        return self.update_state({"active_mode": "judge", "active_scene_index": 0, "speed": 1, "playing": False, "fullscreen": False}, "demo_reset", tenant_id)

    def _event(self, payload: dict[str, Any], tenant_id: str, action: str, detail: dict[str, Any]) -> dict[str, Any]:
        event = {
            "event_id": f"DEMO-EVT-{len(payload['events']) + 1:05d}",
            "tenant_id": tenant_id,
            "action": action,
            "detail": detail,
            "created_at": SEEDED_AT,
        }
        payload["events"].append(event)
        return event


def tenant_ids_for(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    if str(identity.get("role")) in {"super_admin", "admin"}:
        return list(DEMO_TENANTS)
    return [str(tenant["tenant_id"])]


demo_store = DemoStore(settings.sentra_demo_store_path)

