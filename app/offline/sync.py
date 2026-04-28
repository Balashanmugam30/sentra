from __future__ import annotations

from app.communications.acknowledgements import submit_ack_response
from app.field.sync import process_field_sync
from app.hardware.ingest import process_hardware_ingest
from app.models.incident import Incident
from app.offline.engine import (
    finalize_sync_mode,
    mark_event_failed,
    mark_event_synced,
    queued_events,
    set_recovery_mode,
)


async def replay_offline_queue(incidents: list[Incident]) -> dict[str, int]:
    set_recovery_mode()
    synced_count = 0
    failed_count = 0

    for event in queued_events():
        if event.get("sync_state") == "synced":
            continue

        try:
            if not event.get("applied_locally", False):
                await _replay_event(event, incidents)
            mark_event_synced(str(event["event_id"]))
            synced_count += 1
        except Exception as error:  # noqa: BLE001
            mark_event_failed(str(event["event_id"]), str(error))
            failed_count += 1

    finalize_sync_mode()
    remaining = len([item for item in queued_events() if item.get("sync_state") != "synced"])
    return {
        "synced_count": synced_count,
        "failed_count": failed_count,
        "remaining": remaining,
    }


async def _replay_event(event: dict[str, object], incidents: list[Incident]) -> None:
    source = str(event.get("source", ""))
    event_type = str(event.get("type", ""))
    payload = dict(event.get("payload", {}))

    if source == "field":
        try:
            process_field_sync(
                str(payload.get("responder_id", "RSP-201")),
                [
                    {
                        "event_type": event_type,
                        **payload,
                    }
                ],
                incidents,
            )
        except ValueError:
            return
        return

    if source == "hardware":
        await process_hardware_ingest(
            device_id=str(payload.get("device_id", "OFFLINE-DEVICE")),
            zone=str(payload.get("zone", "Zone 1")),
            telemetry=dict(payload.get("telemetry", payload)),
            source_mode="http",
        )
        return

    if source == "communications" and event_type == "acknowledgement":
        await submit_ack_response(
            str(payload.get("zone", "Zone 1")),
            str(payload.get("role", "occupants")),
            str(payload.get("status", "SAFE")),
            str(payload.get("message", "")),
        )
        return
