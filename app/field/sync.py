from __future__ import annotations

from app.field.tasks import (
    acknowledge_field_task,
    open_backup_request,
    record_field_checkpoint,
    update_field_task_status,
)
from app.models.incident import Incident


def process_field_sync(
    responder_id: str,
    queued_events: list[dict[str, object]],
    incidents: list[Incident],
) -> dict[str, int]:
    processed = 0

    for event in queued_events:
        event_type = str(event.get("event_type", ""))
        if event_type == "acknowledge" and event.get("task_id"):
            acknowledge_field_task(str(event["task_id"]), responder_id, incidents)
            processed += 1
        elif event_type == "status" and event.get("task_id") and event.get("status"):
            update_field_task_status(
                str(event["task_id"]),
                responder_id,
                str(event["status"]),
                str(event["note"]) if event.get("note") else None,
                incidents,
            )
            processed += 1
        elif event_type == "backup_request" and event.get("zone") and event.get("reason"):
            open_backup_request(
                responder_id,
                str(event["zone"]),
                str(event["reason"]),
                incidents,
            )
            processed += 1
        elif event_type == "checkpoint" and event.get("zone") and event.get("checkpoint"):
            record_field_checkpoint(
                responder_id,
                str(event["zone"]),
                str(event["checkpoint"]),
                incidents,
            )
            processed += 1

    return {"processed_events": processed, "queued_remaining": 0}

