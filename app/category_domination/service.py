from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.category_domination.benchmark import analyst_positioning, benchmark_superiority
from app.category_domination.competitors import competitor_intelligence, killshot_cards, win_loss_reasons
from app.category_domination.market_share import industry_leaderboard, market_share_snapshot
from app.category_domination.models import DEMO_TENANTS, category_id, utc_now_iso
from app.category_domination.narrative import board_story_result, pr_campaign_result, strategic_narratives
from app.category_domination.scoring import category_score, live_category_snapshot
from app.category_domination.trust import brand_authority, customer_trust, enterprise_wins, government_trust
from app.core.config import settings


class CategoryDominationStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {"tenants": [], "events": [], "campaigns": [], "analyses": [], "board_stories": [], "simulations": []}

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        with self._lock:
            payload = self._read()
            existing = set(payload["tenants"])
            for tenant_id in DEMO_TENANTS:
                if tenant_id not in existing:
                    payload["tenants"].append(tenant_id)
                    created += 1
            self._write(payload)
        return {"created": created}

    def live(self, tenant_ids: list[str]) -> dict[str, Any]:
        self.seed_demo()
        return {"generated_at": utc_now_iso(), **live_category_snapshot()}

    def market_share(self, tenant_ids: list[str]) -> dict[str, Any]:
        return market_share_snapshot()

    def competitors(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {
            "competitors": competitor_intelligence(),
            "killshots": killshot_cards(),
            "win_loss": win_loss_reasons(),
        }

    def leaderboard(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {"leaderboard": industry_leaderboard(), "sentra_rank": 1}

    def trust(self, tenant_ids: list[str]) -> dict[str, Any]:
        return {
            "brand": brand_authority(),
            "customer": customer_trust(),
            "government": government_trust(),
            "enterprise": enterprise_wins(),
            "analyst": analyst_positioning(),
        }

    def benchmark(self, tenant_ids: list[str]) -> dict[str, Any]:
        return benchmark_superiority()

    def narrative(self, tenant_ids: list[str]) -> dict[str, Any]:
        return strategic_narratives()

    def score(self, tenant_ids: list[str]) -> dict[str, Any]:
        return category_score()

    def run_pr_campaign(self, tenant_id: str) -> dict[str, Any]:
        result = {"action_id": category_id("PR"), "tenant_id": tenant_id, "created_at": utc_now_iso(), **pr_campaign_result()}
        self._record("campaigns", tenant_id, "pr_campaign_launched", result)
        return result

    def run_competitive_analysis(self, tenant_id: str) -> dict[str, Any]:
        result = {
            "analysis_id": category_id("COMP"),
            "tenant_id": tenant_id,
            "created_at": utc_now_iso(),
            "competitors_scored": len(competitor_intelligence()),
            "sentra_win_rate": 74,
            "top_move": "Lead with Data Empire OS and government-grade trust proof.",
        }
        self._record("analyses", tenant_id, "competitive_analysis_run", result)
        return result

    def generate_board_story(self, tenant_id: str) -> dict[str, Any]:
        result = {"tenant_id": tenant_id, "created_at": utc_now_iso(), **board_story_result()}
        self._record("board_stories", tenant_id, "board_narrative_generated", result)
        return result

    def run_market_simulation(self, tenant_id: str, scenario: str | None) -> dict[str, Any]:
        result = {
            "simulation_id": category_id("MSIM"),
            "tenant_id": tenant_id,
            "scenario": scenario or "category_leader_acceleration",
            "created_at": utc_now_iso(),
            "projected_capture": 1_920_000_000,
            "category_score_after": 98,
            "expected_mentions_lift": 18,
            "recommended_move": "Publish benchmark, intensify government trust motion, and launch competitive replacement campaign.",
        }
        self._record("simulations", tenant_id, "market_simulation_executed", result)
        return result

    def _record(self, collection: str, tenant_id: str, action: str, result: dict[str, Any]) -> None:
        with self._lock:
            payload = self._read()
            payload[collection].append(result)
            payload["events"].append(
                {
                    "event_id": category_id("CAT-EVT"),
                    "tenant_id": tenant_id,
                    "action": action,
                    "target": str(result.get("action_id") or result.get("analysis_id") or result.get("story_id") or result.get("simulation_id")),
                    "created_at": utc_now_iso(),
                }
            )
            self._write(payload)


def tenant_scope(identity: dict[str, object], tenant: dict[str, object]) -> list[str]:
    tenant_id = str(tenant["tenant_id"])
    if str(identity.get("role")) == "super_admin":
        return sorted(set(DEMO_TENANTS + [tenant_id]))
    return [tenant_id]


category_domination_store = CategoryDominationStore(settings.sentra_category_domination_store_path)

