from __future__ import annotations

from statistics import mean
from typing import Any

from app.master.store import master_store


def _sum(rows: list[dict[str, Any]], key: str) -> int:
    return int(sum(int(row.get(key, 0)) for row in rows))


def _avg(rows: list[dict[str, Any]], key: str) -> float:
    if not rows:
        return 0.0
    return round(mean(float(row.get(key, 0)) for row in rows), 2)


class MasterService:
    def autonomy_summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        actions = master_store.rows("action_queue", tenant_ids)
        executions = master_store.rows("executions", tenant_ids)
        recovery = master_store.rows("recovery", tenant_ids)
        guardrails = master_store.rows("guardrails", tenant_ids)
        incidents = master_store.rows("incidents", tenant_ids)
        return {
            "autonomy_score": 94,
            "actions_ready": len(actions),
            "running_executions": len([item for item in executions if item["status"] == "running"]),
            "awaiting_approval": len([item for item in actions if "required" in str(item["approval_status"])]),
            "retry_center": {
                "failed_actions": 1,
                "retry_success_percent": 97,
                "fallback_provider": "sovereign_notification_queue",
                "queue_pressure": 31,
            },
            "recovery_score": max((int(item["score"]) for item in recovery), default=0),
            "stability_eta_minutes": min((int(item["eta_to_stability_min"]) for item in incidents), default=0),
            "action_queue": actions,
            "live_executions": executions,
            "recovery": recovery,
            "failover_events": [
                {"event": "notification provider switched", "tenant": "SmartCity Authority", "impact": "delivery preserved", "confidence": 92},
                {"event": "workflow queue rebalanced", "tenant": "Grand Meridian Hotels", "impact": "SLA breach avoided", "confidence": 89},
            ],
            "guardrails": guardrails,
            "approval_modes": ["Advisory", "Approval Required", "Semi Auto", "Full Auto", "Emergency Manual Override"],
            "closed_loop_outcomes": [
                "Responder dispatch corrected live after east stairwell pressure changed.",
                "Panic reroute reduced corridor density before emergency threshold.",
                "Cyber fallback kept command cloud online during provider outage.",
            ],
            "events": master_store.rows("events", tenant_ids)[-12:],
        }

    def run_autonomy(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        action = master_store.update_action(tenant_ids, payload.get("action_id"), "running", "approved")
        event = master_store.record_event(
            tenant_ids,
            "autonomy_grid_run",
            {
                "action_id": (action or {}).get("action_id"),
                "scenario_id": payload.get("scenario_id") or "INC-AUTO-FIRE",
                "actor": payload.get("actor") or "sentra.autonomy",
                "risk_score": 74,
            },
        )
        return {"event": event, "action": action, "summary": self.autonomy_summary(tenant_ids)}

    def approve_autonomy(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        action = master_store.update_action(tenant_ids, payload.get("action_id"), "approved", "approved")
        event = master_store.record_event(tenant_ids, "autonomy_action_approved", {"action_id": payload.get("action_id"), "actor": payload.get("actor"), "risk_score": 66})
        return {"event": event, "action": action}

    def rollback_autonomy(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        action = master_store.update_action(tenant_ids, payload.get("action_id"), "rolled_back", "rollback_complete")
        event = master_store.record_event(tenant_ids, "autonomy_action_rolled_back", {"action_id": payload.get("action_id"), "reason": payload.get("reason"), "risk_score": 59})
        return {"event": event, "action": action, "rollback": "Fallback workflow restored previous safe posture."}

    def recovery(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {
            "items": master_store.rows("recovery", tenant_ids),
            "events": master_store.rows("events", tenant_ids)[-10:],
            "closed_loop_score": 93,
            "average_recovery_eta_minutes": 34,
            "verified_outcomes": 18,
        }

    def events(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return master_store.rows("events", tenant_ids)[-25:]

    def cloud_summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        tenants = master_store.rows("tenants", tenant_ids)
        regions = master_store.rows("regions", tenant_ids)
        usage = master_store.rows("usage", tenant_ids)
        return {
            "tenants_active": len(tenants),
            "regions_online": len(regions),
            "buildings_managed": _sum(tenants, "buildings"),
            "users_managed": _sum(tenants, "users"),
            "ai_runs_today": _sum(usage, "ai_runs"),
            "notifications_today": _sum(usage, "notifications"),
            "average_sla_percent": _avg(tenants, "sla_percent"),
            "average_command_capacity": _avg(tenants, "command_capacity"),
            "global_incidents": master_store.rows("incidents", tenant_ids),
            "tenants": tenants,
            "regions": regions,
            "usage": usage,
            "audit": master_store.rows("audit", tenant_ids)[-20:],
        }

    def create_tenant(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        tenant = master_store.create_tenant(tenant_ids, payload.get("payload") or payload)
        event = master_store.record_event(tenant_ids, "cloud_tenant_created", {"tenant_id": tenant["tenant_id"], "actor": payload.get("actor"), "risk_score": 42})
        return {"tenant": tenant, "event": event}

    def switch_tenant(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        selected = payload.get("tenant_id") or tenant_ids[0]
        event = master_store.record_event(tenant_ids, "cloud_tenant_switched", {"tenant_id": selected, "actor": payload.get("actor"), "risk_score": 32})
        return {"active_tenant_id": selected, "event": event, "tenant_scope_locked": True}

    def board_summary(self, tenant_ids: list[str]) -> dict[str, Any]:
        finance = (master_store.singletons("finance", tenant_ids) or [{}])[0]
        revenue = master_store.rows("revenue", tenant_ids)
        forecasts = master_store.singletons("forecasts", tenant_ids)
        return {
            "arr": int(finance.get("arr") or _sum(revenue, "arr")),
            "mrr": int(finance.get("mrr") or _sum(revenue, "mrr")),
            "growth_percent": int(finance.get("growth_percent") or 0),
            "nrr": int(finance.get("nrr") or 0),
            "runway_months": int(finance.get("runway_months") or 0),
            "burn_monthly": int(finance.get("burn_monthly") or 0),
            "valuation_base": int(finance.get("valuation_base") or 0),
            "ipo_score": int(finance.get("ipo_score") or 0),
            "churn_forecast": round(_avg(revenue, "churn_risk"), 1),
            "expansion_pipeline": _sum(revenue, "expansion_pipeline"),
            "forecast": forecasts,
            "summary": master_store.singletons("board_summary", tenant_ids),
            "strategic_risks": [
                {"risk": "Deployment capacity", "severity": "medium", "mitigation": "Hire enterprise rollout pod before sovereign pilot closes."},
                {"risk": "Autonomy governance confidence", "severity": "low", "mitigation": "Keep critical execution in approval-required mode."},
                {"risk": "Cloud region concentration", "severity": "medium", "mitigation": "Add APAC active-active failover before government expansion."},
            ],
        }

    def revenue(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        rows = master_store.rows("revenue", tenant_ids)
        if rows:
            return rows
        return master_store.singletons("revenue", tenant_ids)

    def investors(self, tenant_ids: list[str]) -> list[dict[str, Any]]:
        return master_store.singletons("investors", tenant_ids)

    def forecast(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        scenario = payload.get("scenario_id") or payload.get("objective") or "base"
        base = self.board_summary(tenant_ids)
        multiplier = 1.18 if "aggressive" in str(scenario) else 0.92 if "conservative" in str(scenario) else 1.0
        event = master_store.record_event(tenant_ids, "board_forecast_generated", {"scenario": scenario, "actor": payload.get("actor"), "risk_score": 28})
        return {
            "scenario": scenario,
            "arr_12_month": round(int(base["arr"]) * (1 + int(base["growth_percent"]) / 100) * multiplier),
            "runway_months": int(base["runway_months"]) + (2 if multiplier >= 1 else -3),
            "enterprise_wins": round(18 * multiplier),
            "confidence": 90 if multiplier == 1.0 else 84,
            "event": event,
        }

    def valuation(self, tenant_ids: list[str], payload: dict[str, Any]) -> dict[str, Any]:
        base = self.board_summary(tenant_ids)
        arr = int(base["arr"])
        ai_premium = 1.24 if payload.get("objective") != "cost_defense" else 1.08
        event = master_store.record_event(tenant_ids, "board_valuation_simulated", {"objective": payload.get("objective") or "base", "actor": payload.get("actor"), "risk_score": 26})
        return {
            "conservative": round(arr * 8.4 * ai_premium),
            "base": round(arr * 12.9 * ai_premium),
            "aggressive": round(arr * 20.4 * ai_premium),
            "drivers": ["ARR growth", "NRR", "AI autonomy premium", "government readiness", "multi-tenant cloud scale"],
            "event": event,
        }


master_service = MasterService()
