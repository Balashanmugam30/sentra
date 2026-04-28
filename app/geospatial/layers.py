from __future__ import annotations


def build_geo_layers(*, summary_only: bool) -> list[dict[str, object]]:
    layers = [
        {"layer_id": "incidents", "label": "Incidents", "enabled": True},
        {"layer_id": "responders", "label": "Responders", "enabled": not summary_only},
        {"layer_id": "sensors", "label": "Sensors", "enabled": not summary_only},
        {"layer_id": "routes", "label": "Routes", "enabled": True},
        {"layer_id": "heatmap", "label": "Heatmap", "enabled": True},
        {"layer_id": "facilities", "label": "Facilities", "enabled": not summary_only},
        {"layer_id": "safe_zones", "label": "Safe Zones", "enabled": True},
    ]
    if summary_only:
        for layer in layers:
            if layer["layer_id"] in {"responders", "sensors", "facilities"}:
                layer["restricted"] = True
    return layers
