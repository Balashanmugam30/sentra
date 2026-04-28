from __future__ import annotations

from statistics import mean
from typing import Any

from app.demoengine.store import demo_store


class DemoService:
    def summary(self) -> dict[str, Any]:
        payload = demo_store.snapshot()
        scenes = sorted(payload["scenes"], key=lambda row: int(row["order"]))
        scores = payload["judge_scores"]
        polish = payload["polish_areas"]
        return {
            "headline": "The most advanced crisis intelligence operating system ever presented in a hackathon or startup pitch.",
            "active_mode": payload["state"]["active_mode"],
            "active_scene_index": payload["state"]["active_scene_index"],
            "scene_count": len(scenes),
            "demo_modes": payload["modes"],
            "wow_metrics": payload["wow_metrics"],
            "judge_score": round(mean(float(row["score"]) for row in scores)),
            "polish_score": round(mean(float(row["score"]) for row in polish)),
            "launch_status": "flagship ready",
            "systems_connected": ["AI", "IoT", "Operations", "Twin", "Security", "Revenue", "Investor", "Behavior", "MLOps", "Channel"],
            "presenter_shortcuts": ["Space next", "Left previous", "Right next", "F fullscreen", "D demo mode"],
            "state": payload["state"],
        }

    def scenes(self, mode: str | None = None) -> dict[str, Any]:
        payload = demo_store.snapshot()
        scenes = sorted(payload["scenes"], key=lambda row: int(row["order"]))
        if mode:
            scenes = [scene for scene in scenes if scene["mode"] == mode]
        return {
            "scenes": scenes,
            "state": payload["state"],
            "screenplay": [scene["caption"] for scene in scenes],
            "scene_metrics": [scene["metrics"] for scene in scenes],
        }

    def judge(self) -> dict[str, Any]:
        payload = demo_store.snapshot()
        scores = payload["judge_scores"]
        average = round(mean(float(row["score"]) for row in scores))
        return {
            "overall_score": average,
            "scores": scores,
            "judge_summary": "Sentra is differentiated because it unifies detection, prediction, behavior intelligence, autonomous operations, communications, recovery, and monetization in one governed platform.",
            "technical_highlights": [
                "Multi-agent AI council with explainable consensus",
                "Hyper digital twin with replay and predictive overlays",
                "Human behavior and crowd dynamics intelligence",
                "Enterprise SaaS, marketplace, channel, and trust layers",
            ],
            "recommendation": "Demo should open with the live twin, hit the fire climax by minute two, and close on recovery plus board report export.",
        }

    def export_center(self) -> dict[str, Any]:
        payload = demo_store.snapshot()
        return {
            "exports": payload["exports"],
            "latest_pack": "Sentra Phase 20.X launch pack",
            "board_report_ready": True,
            "investor_one_pager_ready": True,
            "screenshot_pack_ready": True,
            "evidence_note": "Exports are deterministic demo artifacts backed by the same scene and judge scoring data.",
        }

    def polish(self) -> dict[str, Any]:
        payload = demo_store.snapshot()
        return {
            "polish_areas": payload["polish_areas"],
            "global_polish_score": round(mean(float(row["score"]) for row in payload["polish_areas"])),
            "design_system": ["Elite buttons", "KPI cards", "Animated stat tiles", "Tactical tables", "Confidence meters", "Fullscreen panels", "Command prompts"],
            "performance_posture": ["request dedupe", "lazy route chunks", "suspense-ready pages", "fallback hydration", "polling discipline"],
        }


demo_service = DemoService()

