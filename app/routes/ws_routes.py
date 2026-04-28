from __future__ import annotations

import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.connection_manager import incident_connection_manager

router = APIRouter(tags=["Realtime"])


@router.websocket("/ws/incidents")
async def incidents_websocket_endpoint(websocket: WebSocket) -> None:
    await incident_connection_manager.connect(websocket)

    try:
        while True:
            await asyncio.sleep(1000)
    except WebSocketDisconnect:
        incident_connection_manager.disconnect(websocket)
    except Exception:
        incident_connection_manager.disconnect(websocket)
