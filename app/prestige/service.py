from __future__ import annotations

from typing import Any

from app.prestige.store import prestige_store


class PrestigeService:
    def summary(self) -> dict[str, Any]:
        summary = prestige_store.get("summary")
        return {
            **summary,
            "authority_snapshot": self.authority(),
            "global_snapshot": self.global_showcase(),
            "status_snapshot": self.status(),
        }

    def authority(self) -> dict[str, Any]:
        return prestige_store.get("authority")

    def global_showcase(self) -> dict[str, Any]:
        return prestige_store.get("global")

    def status(self) -> dict[str, Any]:
        return prestige_store.get("status")

    def investors(self) -> dict[str, Any]:
        return prestige_store.get("investors")

    def media(self) -> dict[str, Any]:
        return prestige_store.get("media")

    def careers(self) -> dict[str, Any]:
        return prestige_store.get("careers")

    def story(self) -> dict[str, Any]:
        return {"chapters": prestige_store.get("story")}

    def request_demo(self, payload: dict[str, Any]) -> dict[str, Any]:
        return prestige_store.capture_lead(payload, waitlist=False)

    def waitlist(self, payload: dict[str, Any]) -> dict[str, Any]:
        return prestige_store.capture_lead(payload, waitlist=True)


prestige_service = PrestigeService()
