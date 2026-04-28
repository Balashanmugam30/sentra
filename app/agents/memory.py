from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class AgentMemoryRecord:
    agent_id: str
    name: str
    domain: str
    recent_alerts: list[str] = field(default_factory=list)
    recent_decisions: list[str] = field(default_factory=list)
    recent_failures: list[str] = field(default_factory=list)
    trusted_patterns: list[str] = field(default_factory=list)
    preferred_actions: list[str] = field(default_factory=list)
    last_updated: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


DEFAULT_MEMORIES: dict[str, dict[str, object]] = {
    "fire_commander": {
        "name": "Fire Commander AI",
        "domain": "fire_response",
        "trusted_patterns": [
            "Zone 2 repeatedly escalates under gas incidents",
            "Rapid suppression near top fused zones improves containment",
        ],
        "preferred_actions": [
            "Pre-stage suppression teams",
            "Isolate spread corridors early",
        ],
    },
    "medical_commander": {
        "name": "Medical Commander AI",
        "domain": "medical_response",
        "trusted_patterns": [
            "Zone 4 has recurring smoke exposure pattern",
            "Early triage staging lowers evac friction",
        ],
        "preferred_actions": [
            "Stage triage close to evacuation flow",
            "Prioritize smoke exposure support",
        ],
    },
    "security_commander": {
        "name": "Security Commander AI",
        "domain": "security_control",
        "trusted_patterns": [
            "Crowd pressure builds fastest near busy corridors",
            "Lane isolation reduces cross-flow conflict",
        ],
        "preferred_actions": [
            "Protect evacuation lanes",
            "Lock unstable corridors quickly",
        ],
    },
    "logistics_commander": {
        "name": "Logistics Commander AI",
        "domain": "resource_mobility",
        "trusted_patterns": [
            "Drone repositioning improves live visibility",
            "Backup staging near top zones shortens recovery time",
        ],
        "preferred_actions": [
            "Move drones toward pressure zones",
            "Pre-stage backup assets",
        ],
    },
    "executive_strategy": {
        "name": "Executive Strategy AI",
        "domain": "executive_strategy",
        "trusted_patterns": [
            "Mutual aid timing strongly affects continuity risk",
            "Queue failures amplify board attention pressure",
        ],
        "preferred_actions": [
            "Authorize mutual aid before overload peaks",
            "Shift to continuity mode before severe downtime",
        ],
    },
    "communications_commander": {
        "name": "Communications AI",
        "domain": "communications_control",
        "trusted_patterns": [
            "Cadence drops during queue backlog increase confusion",
            "Role-targeted updates reduce command friction",
        ],
        "preferred_actions": [
            "Increase alert cadence under drift",
            "Push role-specific updates during escalation",
        ],
    },
}

_memory_store: dict[str, AgentMemoryRecord] = {}
_current_scenario: str | None = None


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _append_limited(items: list[str], value: str, limit: int = 4) -> None:
    if value in items:
        items.remove(value)
    items.insert(0, value)
    del items[limit:]


def _seed_record(agent_id: str) -> AgentMemoryRecord:
    template = DEFAULT_MEMORIES[agent_id]
    return AgentMemoryRecord(
        agent_id=agent_id,
        name=str(template["name"]),
        domain=str(template["domain"]),
        trusted_patterns=list(template["trusted_patterns"]),
        preferred_actions=list(template["preferred_actions"]),
        last_updated=_now(),
    )


def ensure_agent_memories() -> dict[str, AgentMemoryRecord]:
    if not _memory_store:
        for agent_id in DEFAULT_MEMORIES:
            _memory_store[agent_id] = _seed_record(agent_id)
    return _memory_store


def summarize_memory(record: AgentMemoryRecord) -> list[str]:
    summary: list[str] = []
    if record.trusted_patterns:
        summary.append(record.trusted_patterns[0])
    if record.recent_decisions:
        summary.append(record.recent_decisions[0])
    elif record.preferred_actions:
        summary.append(record.preferred_actions[0])
    if record.recent_failures:
        summary.append(record.recent_failures[0])
    return summary[:3]


def refresh_agent_memory(
    agent_id: str,
    *,
    alert: str | None = None,
    decision: str | None = None,
    failure: str | None = None,
    pattern: str | None = None,
    preferred_action: str | None = None,
) -> AgentMemoryRecord:
    memories = ensure_agent_memories()
    record = memories[agent_id]
    if alert:
        _append_limited(record.recent_alerts, alert)
    if decision:
        _append_limited(record.recent_decisions, decision)
    if failure:
        _append_limited(record.recent_failures, failure)
    if pattern:
        _append_limited(record.trusted_patterns, pattern)
    if preferred_action:
        _append_limited(record.preferred_actions, preferred_action)
    record.last_updated = _now()
    return record


def get_agent_memory_snapshot() -> list[dict[str, object]]:
    memories = ensure_agent_memories()
    return [
        {
            "agent_id": record.agent_id,
            "name": record.name,
            "domain": record.domain,
            "recent_alerts": record.recent_alerts,
            "recent_decisions": record.recent_decisions,
            "recent_failures": record.recent_failures,
            "trusted_patterns": record.trusted_patterns,
            "preferred_actions": record.preferred_actions,
            "last_updated": record.last_updated,
        }
        for record in memories.values()
    ]


def reset_agent_state() -> int:
    global _current_scenario
    _memory_store.clear()
    _current_scenario = None
    ensure_agent_memories()
    return len(_memory_store)


def set_test_scenario(scenario: str) -> None:
    global _current_scenario
    _current_scenario = scenario


def get_test_scenario() -> str | None:
    ensure_agent_memories()
    return _current_scenario
