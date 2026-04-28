from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.facility.connectors import build_connector_snapshot, connector_mode
from app.facility.events import record_facility_event
from app.governance.engine import governance_gate_for_facility
from app.models.incident import Incident
from app.offline.engine import queue_event_if_needed
from app.operations.engine import record_external_operation_signal
from app.schemas.incident_schema import IncidentCreate
from app.services.incident_service import create_incident, get_all_incidents


@dataclass
class FacilityAssetRecord:
    asset_id: str
    asset_type: str
    zone: str
    name: str
    status: str
    online: bool
    mode: str
    last_seen: datetime
    health_score: int


_asset_store: dict[str, FacilityAssetRecord] = {}
_active_commands: list[dict[str, object]] = []
_secured_zones: set[str] = set()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _seed_assets() -> None:
    if _asset_store:
        return
    now = _now()
    assets = [
        FacilityAssetRecord("DOOR-Z2-EAST", "access_control", "Zone 2", "Zone 2 East Door", "unlocked", True, connector_mode("access_control"), now, 92),
        FacilityAssetRecord("DOOR-Z2-WEST", "access_control", "Zone 2", "Zone 2 West Door", "unlocked", True, connector_mode("access_control"), now, 91),
        FacilityAssetRecord("DOOR-Z1-NORTH", "access_control", "Zone 1", "Zone 1 North Door", "unlocked", True, connector_mode("access_control"), now, 90),
        FacilityAssetRecord("AHU-Z3-01", "hvac_bms", "Zone 3", "Zone 3 AHU", "normal_mode", True, connector_mode("hvac_bms"), now, 88),
        FacilityAssetRecord("AHU-Z2-01", "hvac_bms", "Zone 2", "Zone 2 AHU", "normal_mode", True, connector_mode("hvac_bms"), now, 89),
        FacilityAssetRecord("PA-MAIN-BLOCKA", "pa_system", "Campus", "Main PA Block A", "idle", True, connector_mode("pa_system"), now, 94),
        FacilityAssetRecord("ELEVATOR-TOWERA", "elevator_controller", "Tower A", "Tower A Elevator Group", "normal", True, connector_mode("elevator_controller"), now, 87),
        FacilityAssetRecord("CAM-Z5-ENTRY", "cctv_metadata", "Zone 5", "Zone 5 Entry Camera", "monitoring", True, connector_mode("cctv_metadata"), now, 86),
        FacilityAssetRecord("FIREPANEL-HQ", "fire_panel", "Campus", "HQ Fire Panel", "standby", True, connector_mode("fire_panel"), now, 93),
        FacilityAssetRecord("LIGHT-Z2-CORRIDOR", "lighting_controller", "Zone 2", "Zone 2 Corridor Lighting", "normal", True, connector_mode("lighting_controller"), now, 85),
        FacilityAssetRecord("DISPATCH-CAMPUS", "campus_dispatch", "Campus", "Campus Dispatch Relay", "ready", True, connector_mode("campus_dispatch"), now, 90),
    ]
    for asset in assets:
        _asset_store[asset.asset_id] = asset


def _update_modes() -> None:
    _seed_assets()
    for asset in _asset_store.values():
        asset.mode = connector_mode(asset.asset_type)


def _touch(asset: FacilityAssetRecord, *, status: str | None = None) -> None:
    asset.last_seen = _now()
    asset.mode = connector_mode(asset.asset_type)
    if status is not None:
        asset.status = status


def _log_command(action: str, assets: list[str], mode: str) -> None:
    _active_commands.append(
        {
            "timestamp": _now(),
            "action": action,
            "assets": assets,
            "mode": mode,
        }
    )
    del _active_commands[:-25]


def build_facility_assets_snapshot() -> list[dict[str, object]]:
    _update_modes()
    groups: dict[str, list[dict[str, object]]] = {}
    for asset in sorted(_asset_store.values(), key=lambda item: (item.asset_type, item.zone, item.asset_id)):
        groups.setdefault(asset.asset_type, []).append(
            {
                "asset_id": asset.asset_id,
                "asset_type": asset.asset_type,
                "zone": asset.zone,
                "name": asset.name,
                "status": asset.status,
                "online": asset.online,
                "mode": asset.mode,
                "last_seen": asset.last_seen,
                "health_score": asset.health_score,
            }
        )
    return [
        {"asset_type": asset_type, "assets": assets}
        for asset_type, assets in groups.items()
    ]


def build_facility_live_snapshot(incidents: list[Incident]) -> dict[str, object]:
    _update_modes()
    connectors = build_connector_snapshot()
    assets = list(_asset_store.values())
    critical_events = len([event for event in _active_commands if str(event["action"]).startswith("critical")])
    recent_event_count = len([event for event in _active_commands if event["timestamp"] >= _now() - timedelta(minutes=10)])
    if any(incident.type == "fire" and incident.status == "active" for incident in incidents) or "Campus" in _secured_zones:
        state = "emergency"
    elif _secured_zones:
        state = "lockdown"
    elif any(incident.status == "active" for incident in incidents):
        state = "alert"
    elif any(item["status"] == "degraded" for item in connectors):
        state = "degraded"
    else:
        state = "normal"

    recommended_actions: list[str] = []
    if state in {"emergency", "lockdown"}:
        recommended_actions.append("Confirm secured zones and maintain PA guidance for affected occupants")
    if any(asset.asset_type == "hvac_bms" and asset.status == "shutdown" for asset in assets):
        recommended_actions.append("Validate air handling isolation before restoring occupied zones")
    if any(item["mode"] == "offline_fallback" for item in connectors):
        recommended_actions.append("Keep facility commands queued locally until upstream connectivity is stable")
    if not recommended_actions:
        recommended_actions.append("Facility systems healthy; continue coordinated monitoring across campus assets")

    return {
        "global_facility_state": state,
        "connected_systems": len([item for item in connectors if item["status"] in {"ready", "degraded"}]),
        "assets_online": len([asset for asset in assets if asset.online]),
        "assets_offline": len([asset for asset in assets if not asset.online]),
        "active_commands": recent_event_count,
        "critical_events": critical_events,
        "zones_secured": len(_secured_zones),
        "recommended_actions": recommended_actions[:4],
        "summary": (
            f"{len(_secured_zones)} secured zones, {recent_event_count} active control actions, "
            f"and {len([asset for asset in assets if asset.online])} facility assets online."
        ),
        "connectors": connectors,
    }


def get_facility_asset(asset_id: str) -> FacilityAssetRecord | None:
    _seed_assets()
    return _asset_store.get(asset_id)


def execute_door_command(asset_id: str, command: str) -> dict[str, object]:
    asset = get_facility_asset(asset_id)
    if asset is None:
        raise ValueError(f"Asset '{asset_id}' not found")
    if asset.asset_type != "access_control":
        raise ValueError(f"Asset '{asset_id}' is not a door controller")

    status_map = {"lock": "locked", "unlock": "unlocked", "pulse_open": "pulse_open"}
    _touch(asset, status=status_map[command])
    if command == "lock":
        _secured_zones.add(asset.zone)
    elif command == "unlock":
        _secured_zones.discard(asset.zone)
    mode = asset.mode
    action = f"door_{command}"
    _log_command(action, [asset.asset_id], mode)
    record_facility_event(source="access_control", message=f"{asset.zone} door {asset.asset_id} {command.replace('_', ' ')}", severity="high" if command == "lock" else "normal")
    record_external_operation_signal("facility.door_command", {"asset_id": asset.asset_id, "command": command, "zone": asset.zone})
    queue_event_if_needed(
        source="facility",
        event_type="door_command",
        payload={"asset_id": asset.asset_id, "command": command},
        applied_locally=True,
    )
    return {"status": "queued" if mode == "offline_fallback" else "completed", "action": action, "mode": mode, "triggered_assets": [asset.asset_id]}


def execute_hvac_command(zone: str, command: str) -> dict[str, object]:
    _update_modes()
    assets = [asset for asset in _asset_store.values() if asset.asset_type == "hvac_bms" and asset.zone == zone]
    if not assets:
        raise ValueError(f"No HVAC assets found for {zone}")
    for asset in assets:
        _touch(asset, status=command)
    mode = assets[0].mode
    _log_command(f"hvac_{command}", [asset.asset_id for asset in assets], mode)
    record_facility_event(source="hvac_bms", message=f"HVAC {command.replace('_', ' ')} {zone}", severity="critical" if command == "shutdown" else "normal")
    record_external_operation_signal("facility.hvac_command", {"zone": zone, "command": command})
    queue_event_if_needed(
        source="facility",
        event_type="hvac_command",
        payload={"zone": zone, "command": command},
        applied_locally=True,
    )
    return {"status": "queued" if mode == "offline_fallback" else "completed", "action": f"hvac_{command}", "mode": mode, "triggered_assets": [asset.asset_id for asset in assets]}


def execute_announcement(scope: str, zone: str | None, template: str) -> dict[str, object]:
    asset = next((item for item in _asset_store.values() if item.asset_type == "pa_system"), None)
    if asset is None:
        raise ValueError("PA system unavailable")
    _touch(asset, status=template)
    target = zone or scope.title()
    mode = asset.mode
    _log_command(f"announcement_{template}", [asset.asset_id], mode)
    record_facility_event(source="pa_system", message=f"PA announcement {template.replace('_', ' ')} -> {target}", severity="critical" if template == "evacuate_now" else "high")
    record_external_operation_signal("facility.announcement", {"scope": scope, "zone": zone, "template": template})
    queue_event_if_needed(
        source="facility",
        event_type="announcement",
        payload={"scope": scope, "zone": zone, "template": template},
        applied_locally=True,
    )
    return {"status": "queued" if mode == "offline_fallback" else "completed", "action": f"announcement_{template}", "mode": mode, "triggered_assets": [asset.asset_id]}


def execute_elevator_recall(building: str) -> dict[str, object]:
    assets = [asset for asset in _asset_store.values() if asset.asset_type == "elevator_controller" and building in asset.zone]
    if not assets:
        assets = [asset for asset in _asset_store.values() if asset.asset_type == "elevator_controller"]
    if not assets:
        raise ValueError(f"No elevator controllers found for {building}")
    for asset in assets:
        _touch(asset, status="recalled")
    mode = assets[0].mode
    _log_command("elevator_recall", [asset.asset_id for asset in assets], mode)
    record_facility_event(source="elevator_controller", message=f"Elevator recall activated {building}", severity="high")
    record_external_operation_signal("facility.elevator_recall", {"building": building})
    queue_event_if_needed(
        source="facility",
        event_type="elevator_recall",
        payload={"building": building},
        applied_locally=True,
    )
    return {"status": "queued" if mode == "offline_fallback" else "completed", "action": "elevator_recall", "mode": mode, "triggered_assets": [asset.asset_id for asset in assets]}


def execute_lockdown(scope: str, zone: str | None, reason: str) -> dict[str, object]:
    _update_modes()
    target_zone = zone or "Campus"
    doors = [
        asset
        for asset in _asset_store.values()
        if asset.asset_type == "access_control"
        and (scope != "zone" or asset.zone == target_zone)
    ]
    if scope in {"building", "campus"}:
        target_zone = "Campus" if scope == "campus" else "Building"
        doors = [asset for asset in _asset_store.values() if asset.asset_type == "access_control"]
    for asset in doors:
        _touch(asset, status="locked")
        _secured_zones.add(asset.zone)

    mode = doors[0].mode if doors else connector_mode("access_control")
    governance = governance_gate_for_facility(scope, reason)
    _log_command(f"critical_lockdown_{scope}", [asset.asset_id for asset in doors], mode)
    record_facility_event(source="access_control", message=f"{target_zone} lockdown engaged for {reason.replace('_', ' ')}", severity="critical")
    record_external_operation_signal("facility.lockdown", {"scope": scope, "zone": zone, "reason": reason})
    queue_event_if_needed(
        source="facility",
        event_type="lockdown",
        payload={"scope": scope, "zone": zone, "reason": reason},
        applied_locally=True,
    )
    return {
        "status": "queued" if mode == "offline_fallback" else "completed",
        "action": f"lockdown_{scope}",
        "mode": mode,
        "triggered_assets": [asset.asset_id for asset in doors],
        "approval_required": governance["approval_required"],
        "required_role": governance["required_role"],
    }


async def process_fire_panel_event(zone: str, alarm: str) -> dict[str, object]:
    _seed_assets()
    panel = next((item for item in _asset_store.values() if item.asset_type == "fire_panel"), None)
    if panel is None:
        raise ValueError("Fire panel unavailable")
    _touch(panel, status=alarm)
    record_facility_event(source="fire_panel", message=f"{zone} fire panel alarm {alarm.replace('_', ' ')}", severity="critical")
    queue_event_if_needed(
        source="facility",
        event_type="fire_panel_event",
        payload={"zone": zone, "alarm": alarm},
        applied_locally=True,
    )

    created_any = False
    duplicate = any(
        incident.status == "active" and incident.location == zone and incident.type == "fire"
        for incident in get_all_incidents()
    )
    if not duplicate:
        await create_incident(
            IncidentCreate(
                type="fire",
                severity=5,
                location=zone,
                incident_type="fire_panel_alarm",
                confidence=0.97,
                detected_by="facility:fire_panel",
                recommended_action=f"Validate panel alarm and dispatch fire suppression to {zone}",
                priority="critical",
                decided_by="facility_command",
                decision_confidence=0.94,
            )
        )
        created_any = True

    record_external_operation_signal("facility.fire_panel_event", {"zone": zone, "alarm": alarm, "incident_created": created_any})
    return {"status": "accepted", "incident_created": created_any, "action": "fire_panel_event"}


async def run_facility_test_scenario(scenario: str) -> list[dict[str, object]]:
    _seed_assets()
    actions: list[dict[str, object]] = []
    if scenario == "fire_zone2":
        actions.append(execute_lockdown("zone", "Zone 2", "critical_fire"))
        actions.append(execute_hvac_command("Zone 2", "shutdown"))
        actions.append(execute_announcement("zone", "Zone 2", "evacuate_now"))
        fire_panel_result = await process_fire_panel_event("Zone 2", "smoke_loop_triggered")
        actions.append(
            {
                "status": "completed",
                "action": fire_panel_result["action"],
                "mode": connector_mode("fire_panel"),
                "triggered_assets": ["FIREPANEL-HQ"],
                "approval_required": False,
                "required_role": None,
            }
        )
    elif scenario == "gas_zone3":
        actions.append(execute_hvac_command("Zone 3", "shutdown"))
        actions.append(execute_announcement("zone", "Zone 3", "shelter_in_place"))
    elif scenario == "intrusion_zone1":
        actions.append(execute_lockdown("zone", "Zone 1", "security_intrusion"))
        actions.append(execute_announcement("zone", "Zone 1", "security_alert"))
    elif scenario == "campus_lockdown":
        actions.append(execute_lockdown("campus", None, "campus_lockdown"))
        actions.append(execute_announcement("campus", None, "security_alert"))
        actions.append(execute_elevator_recall("Tower A"))
    elif scenario == "all_clear":
        for asset in _asset_store.values():
            if asset.asset_type == "access_control":
                _touch(asset, status="unlocked")
            elif asset.asset_type == "hvac_bms":
                _touch(asset, status="normal_mode")
            elif asset.asset_type == "elevator_controller":
                _touch(asset, status="normal")
        _secured_zones.clear()
        actions.append(execute_announcement("campus", None, "all_clear"))
    return actions
