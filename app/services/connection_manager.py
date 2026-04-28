from __future__ import annotations

import asyncio
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.discard(websocket)

    async def _send_with_timeout(self, connection: WebSocket, message: dict[str, Any]) -> WebSocket | None:
        try:
            await asyncio.wait_for(connection.send_json(message), timeout=0.35)
            return None
        except Exception:
            return connection

    async def broadcast(self, message: dict[str, Any]) -> None:
        disconnected = [
            connection
            for connection in await asyncio.gather(
                *(self._send_with_timeout(connection, message) for connection in list(self.active_connections)),
                return_exceptions=False,
            )
            if connection is not None
        ]

        for connection in disconnected:
            self.disconnect(connection)


incident_connection_manager = ConnectionManager()
