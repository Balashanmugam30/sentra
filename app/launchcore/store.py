from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS


SEEDED_AT = "2026-04-26T00:00:00+00:00"
STORE_VERSION = "phase29a-launch-2026-04-26"

DESIGN_AUDITS: tuple[dict[str, Any], ...] = (
    {"audit_id": "DA-TYPO", "tenant_id": "TEN-GRAND-MERIDIAN", "area": "Typography", "score": 96, "status": "elite", "checks": ["Clear H1/H2 rhythm", "Metric readability", "Compact label hierarchy"], "finding": "Executive and command pages now share a consistent premium type scale."},
    {"audit_id": "DA-CARDS", "tenant_id": "TEN-BALA-HOSP", "area": "Cards + Buttons", "score": 94, "status": "strong", "checks": ["Glass cards", "Action hierarchy", "Hover/focus states"], "finding": "Critical cards and CTAs use consistent rounded glass treatment and high-contrast actions."},
    {"audit_id": "DA-LAYOUT", "tenant_id": "TEN-NOVA-MALL", "area": "Layout Rhythm", "score": 93, "status": "strong", "checks": ["Grid alignment", "Section spacing", "Responsive breakpoints"], "finding": "War-room pages keep dense data readable without collapsing mobile/tablet layouts."},
    {"audit_id": "DA-A11Y", "tenant_id": "TEN-SKYLINE", "area": "Accessibility", "score": 91, "status": "launch_ready", "checks": ["Keyboard paths", "Contrast", "Reduced motion readiness"], "finding": "Interactive launch surfaces use semantic buttons and strong contrast for command use."},
    {"audit_id": "DA-BRAND", "tenant_id": "TEN-SMARTCITY", "area": "Brand Polish", "score": 95, "status": "elite", "checks": ["Trust-first language", "Enterprise wording", "Premium gradients"], "finding": "Launch copy now emphasizes reliability, trust, and enterprise buying confidence."},
)

PERFORMANCE_ROUTES: tuple[dict[str, Any], ...] = (
    {"route": "/demo", "p95_ms": 148, "status": "fast", "cache": "edge-ready", "chunk_kb": 84, "owner": "demo"},
    {"route": "/twin/live", "p95_ms": 224, "status": "watch", "cache": "live-dedupe", "chunk_kb": 132, "owner": "digital_twin"},
    {"route": "/operations/communications", "p95_ms": 178, "status": "fast", "cache": "stale-while-revalidate", "chunk_kb": 96, "owner": "ops"},
    {"route": "/security/soc", "p95_ms": 190, "status": "fast", "cache": "runtime-cache", "chunk_kb": 104, "owner": "security"},
    {"route": "/analytics", "p95_ms": 166, "status": "fast", "cache": "runtime-cache", "chunk_kb": 88, "owner": "analytics"},
)

QUALITY_CHECKS: tuple[dict[str, Any], ...] = (
    {"check_id": "QC-ROUTES", "name": "Broken route scanner", "severity": "low", "status": "pass", "count": 0, "detail": "Core launch routes and major command pages resolve."},
    {"check_id": "QC-DATA", "name": "Missing data detector", "severity": "low", "status": "pass", "count": 0, "detail": "Fallback datasets cover launch, demo, analytics, cloud, and platform views."},
    {"check_id": "QC-CONSOLE", "name": "Console error tracker", "severity": "medium", "status": "watch", "count": 1, "detail": "One third-party map warning remains non-blocking in local mode."},
    {"check_id": "QC-API", "name": "Failed API panel", "severity": "low", "status": "pass", "count": 0, "detail": "Launch smoke endpoints return deterministic envelopes."},
    {"check_id": "QC-POLLING", "name": "Stale polling warnings", "severity": "low", "status": "pass", "count": 0, "detail": "Launch pages refresh manually and use cached API client defaults."},
    {"check_id": "QC-MOBILE", "name": "Mobile layout issues", "severity": "medium", "status": "watch", "count": 2, "detail": "Dense twin and SOC pages should stay in executive compact mode on tablets."},
)

READINESS: tuple[dict[str, Any], ...] = (
    {"dimension": "Build health", "score": 96, "status": "ready", "evidence": "lint, typecheck, build, compileall"},
    {"dimension": "Feature completeness", "score": 98, "status": "ready", "evidence": "AI, ops, twin, security, revenue, data, integrations"},
    {"dimension": "Route coverage", "score": 94, "status": "ready", "evidence": "116+ web routes build successfully"},
    {"dimension": "Trust readiness", "score": 93, "status": "ready", "evidence": "RBAC, zero trust, compliance, audit stores"},
    {"dimension": "Investor readiness", "score": 95, "status": "ready", "evidence": "revenue, growth, board, valuation, ARR narrative"},
    {"dimension": "Demo readiness", "score": 97, "status": "ready", "evidence": "one-click story engine and judge scoring"},
    {"dimension": "Submission readiness", "score": 94, "status": "ready", "evidence": "launch pages, export center, executive summaries"},
)

OPS_SIGNALS: tuple[dict[str, Any], ...] = (
    {"signal_id": "OPS-UPTIME", "label": "Uptime", "value": 99.96, "unit": "%", "status": "healthy", "detail": "Launch-grade availability target is being met in demo posture."},
    {"signal_id": "OPS-QUEUE", "label": "Queue depth", "value": 27, "unit": "jobs", "status": "healthy", "detail": "Backpressure remains below alert threshold."},
    {"signal_id": "OPS-RETRY", "label": "Retries", "value": 8, "unit": "today", "status": "watch", "detail": "ServiceNow retry path is active and contained."},
    {"signal_id": "OPS-CACHE", "label": "Cache hit ratio", "value": 91, "unit": "%", "status": "healthy", "detail": "Runtime cache and request dedupe are reducing backend load."},
    {"signal_id": "OPS-SOCKET", "label": "Websocket health", "value": 98, "unit": "%", "status": "healthy", "detail": "Incident realtime channel is stable."},
)

PREFERENCES: tuple[dict[str, Any], ...] = (
    {"pref_id": "PREF-DENSITY", "name": "Density", "options": ["compact", "balanced", "spacious"], "default": "balanced"},
    {"pref_id": "PREF-MODE", "name": "Mode", "options": ["tactical", "executive"], "default": "executive"},
    {"pref_id": "PREF-THEME", "name": "Accent Theme", "options": ["cyan trust", "emerald readiness", "amber crisis"], "default": "cyan trust"},
    {"pref_id": "PREF-REALTIME", "name": "Realtime Intensity", "options": ["low", "standard", "high"], "default": "standard"},
    {"pref_id": "PREF-PRIVACY", "name": "Privacy", "options": ["strict", "balanced"], "default": "strict"},
)

EXECUTIVE_ACTIONS: tuple[dict[str, Any], ...] = (
    {"action_id": "EX-ACT-DEMO", "title": "Run judge demo in executive mode", "impact": "Proves product story in five minutes", "urgency": "today"},
    {"action_id": "EX-ACT-MOBILE", "title": "Keep tablet command mode as default for field demos", "impact": "Improves buyer confidence", "urgency": "this week"},
    {"action_id": "EX-ACT-TRUST", "title": "Export trust and compliance pack", "impact": "Unblocks enterprise procurement", "urgency": "this week"},
)


class LaunchStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "store_version": STORE_VERSION,
            "design_audits": [],
            "performance_routes": [],
            "quality_checks": [],
            "readiness": [],
            "ops_signals": [],
            "preferences": [],
            "executive_actions": [],
            "scans": [],
            "optimizations": [],
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
            "design_audits": (DESIGN_AUDITS, "audit_id"),
            "performance_routes": (PERFORMANCE_ROUTES, "route"),
            "quality_checks": (QUALITY_CHECKS, "check_id"),
            "readiness": (READINESS, "dimension"),
            "ops_signals": (OPS_SIGNALS, "signal_id"),
            "preferences": (PREFERENCES, "pref_id"),
            "executive_actions": (EXECUTIVE_ACTIONS, "action_id"),
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

    def rows(self, table: str, tenant_ids: list[str] | None = None) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            rows = [dict(row) for row in self._read()[table]]
        if tenant_ids is None or set(tenant_ids) == set(DEMO_TENANTS):
            return rows
        return [row for row in rows if row.get("tenant_id") in tenant_ids or "tenant_id" not in row]

    def record_scan(self, tenant_id: str, target: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            scan = {
                "scan_id": f"LAUNCH-SCAN-{len(payload['scans']) + 1:04d}",
                "tenant_id": tenant_id,
                "target": target,
                "status": "completed",
                "issues_found": 3 if target == "all" else 1,
                "created_at": SEEDED_AT,
            }
            payload["scans"].append(scan)
            event = self._event(payload, tenant_id, "launch_scan", scan)
            self._write(payload)
            return {"scan": scan, "event": event}

    def record_optimize(self, tenant_id: str, target: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            optimization = {
                "optimization_id": f"LAUNCH-OPT-{len(payload['optimizations']) + 1:04d}",
                "tenant_id": tenant_id,
                "target": target,
                "status": "queued",
                "expected_gain_percent": 9 if target == "performance" else 6,
                "created_at": SEEDED_AT,
            }
            payload["optimizations"].append(optimization)
            event = self._event(payload, tenant_id, "launch_optimize", optimization)
            self._write(payload)
            return {"optimization": optimization, "event": event}

    def _event(self, payload: dict[str, Any], tenant_id: str, action: str, detail: dict[str, Any]) -> dict[str, Any]:
        event = {
            "event_id": f"LAUNCH-EVT-{len(payload['events']) + 1:05d}",
            "tenant_id": tenant_id,
            "action": action,
            "detail": detail,
            "created_at": SEEDED_AT,
        }
        payload["events"].append(event)
        return event


launch_store = LaunchStore(settings.sentra_launch_store_path)
