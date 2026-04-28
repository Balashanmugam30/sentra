from __future__ import annotations

from app.data_empire.models import GRAPH_ENTITY_TYPES


def build_entity_graph(tenant_id: str) -> dict[str, object]:
    nodes = [
        {
            "entity_type": entity_type,
            "tenant_id": tenant_id,
            "label": label,
            "count": count,
            "centrality": 92 - index * 3,
        }
        for index, (entity_type, label, count) in enumerate(GRAPH_ENTITY_TYPES)
    ]
    relationships = [
        {"from_entity": "incidents", "to_entity": "locations", "relationship": "occurred_at", "strength": 96},
        {"from_entity": "assets", "to_entity": "risks", "relationship": "exposed_to", "strength": 89},
        {"from_entity": "companies", "to_entity": "deals", "relationship": "commercial_signal", "strength": 84},
        {"from_entity": "signals", "to_entity": "ai_decisions", "relationship": "informs", "strength": 93},
        {"from_entity": "devices", "to_entity": "workflows", "relationship": "triggers", "strength": 82},
        {"from_entity": "agencies", "to_entity": "incidents", "relationship": "responds_to", "strength": 88},
    ]
    return {
        "tenant_id": tenant_id,
        "linked_entities": 2_100_000,
        "nodes": nodes,
        "relationships": relationships,
        "graph_density": 78,
        "identity_resolution_score": 94,
    }
