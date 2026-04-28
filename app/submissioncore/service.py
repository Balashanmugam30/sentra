from __future__ import annotations

from statistics import mean
from typing import Any

from app.submissioncore.store import submission_store


def _avg(rows: list[dict[str, Any]], key: str) -> int:
    if not rows:
        return 0
    return round(mean(float(row.get(key, 0)) for row in rows))


class SubmissionService:
    def summary(self) -> dict[str, Any]:
        scores = submission_store.rows("scores")
        exports = submission_store.rows("exports")
        return {
            "readiness_score": _avg(scores, "score"),
            "selected_mode": "google_solution_challenge",
            "modes": submission_store.rows("modes"),
            "pending_missing_assets": submission_store.rows("missing_assets"),
            "generated_packs": submission_store.rows("generated_packs"),
            "exports": exports,
            "last_export_dates": {row["name"]: row["last_exported"] for row in exports if "last_exported" in row},
            "recommended_next_steps": [
                "Record a 90-second demo video from /demo.",
                "Export the Google Solution Challenge pack.",
                "Use short judge answers during rapid Q&A.",
                "Open with human behavior intelligence as the memorable differentiator.",
            ],
            "architecture": self.architecture(),
            "demo_scripts": self.demo_script(),
            "team_story": self.team(),
        }

    def deck(self, template: str | None = None) -> dict[str, Any]:
        slides = submission_store.rows("deck_slides")
        active_template = template or "investor"
        filtered = [slide for slide in slides if slide["template"] == active_template]
        if not filtered:
            filtered = slides
        return {
            "template": active_template,
            "slides": sorted(filtered, key=lambda row: int(row["order"])),
            "templates": ["investor", "hackathon", "government"],
            "export_formats": ["PDF", "PPTX mock", "Markdown"],
            "deck_quality_score": 96,
        }

    def docs(self) -> dict[str, Any]:
        return {
            "documents": submission_store.rows("docs"),
            "doc_score": 95,
            "procurement_ready": True,
            "security_packet_ready": True,
            "case_study_pack": "Grand Meridian Hotel fire-to-recovery narrative",
        }

    def judges(self) -> dict[str, Any]:
        answers = submission_store.rows("judge_answers")
        return {
            "answers": answers,
            "modes": ["short", "medium", "long"],
            "recommended_mode": "short for live judging, medium for written submissions",
            "qna_score": 97,
        }

    def impact(self) -> dict[str, Any]:
        impacts = submission_store.rows("impacts")
        return {
            "impact_score": 97,
            "metrics": impacts,
            "population_protected": 240000,
            "government_scale_potential": "city, campus, hospital network, mall group, and smart district deployments",
            "proof_statement": "Sentra improves response speed, reduces casualty risk, cuts downtime, and creates audit evidence from detection through recovery.",
        }

    def architecture(self) -> dict[str, Any]:
        return {
            "diagrams": submission_store.rows("architecture"),
            "export_formats": ["PNG", "PDF", "SVG mock"],
            "architecture_score": 96,
            "narrative": "Next.js command UI + FastAPI control plane + AI/MLOps + operations OS + digital twin + data hub + security trust layers.",
        }

    def demo_script(self) -> dict[str, Any]:
        return {
            "scripts": submission_store.rows("demo_scripts"),
            "recovery_line": "If a live view fails, switch to /demo/judge, /submission/judges, or /submission/deck and narrate deterministic proof.",
            "script_score": 98,
        }

    def team(self) -> dict[str, Any]:
        return {
            "story": submission_store.rows("team_story"),
            "positioning": "Student-built crisis intelligence platform with enterprise-grade execution depth.",
            "interview_score": 94,
        }

    def score(self) -> dict[str, Any]:
        scores = submission_store.rows("scores")
        return {
            "overall_score": _avg(scores, "score"),
            "categories": scores,
            "winner_summary": "Sentra combines rare technical depth with memorable demo clarity, measurable impact, and enterprise business readiness.",
            "mode_recommendations": {
                "google_solution_challenge": ["Lead with SDGs, inclusion, and population protected.", "Show human behavior intelligence and public safety impact."],
                "investor": ["Lead with ARR model, moat, marketplace, and data flywheel.", "Show GTM and enterprise procurement readiness."],
                "government": ["Lead with trust, resilience, compliance, continuity, and auditability."],
            },
        }

    def generate(self, tenant_id: str, artifact: str, mode: str) -> dict[str, Any]:
        return submission_store.generate(tenant_id, artifact, mode)

    def export(self, tenant_id: str, artifact: str, export_format: str) -> dict[str, Any]:
        return submission_store.export(tenant_id, artifact, export_format)


submission_service = SubmissionService()
