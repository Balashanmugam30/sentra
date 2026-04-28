from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

from app.core.config import settings
from app.ml.store import DEMO_TENANTS


SEEDED_AT = "2026-04-26T00:00:00+00:00"
STORE_VERSION = "phase29b-submission-2026-04-26"

MODES: tuple[dict[str, Any], ...] = (
    {"mode_id": "hackathon", "name": "Hackathon", "priority": "innovation + demo clarity", "score_weight": {"innovation": 25, "impact": 25, "technical_depth": 20, "wow_factor": 20, "feasibility": 10}},
    {"mode_id": "google_solution_challenge", "name": "Google Solution Challenge", "priority": "SDGs + social impact + inclusion + sustainability", "score_weight": {"impact": 30, "scale": 20, "innovation": 20, "inclusion": 15, "feasibility": 15}},
    {"mode_id": "investor", "name": "Investor Pitch", "priority": "ARR + moat + GTM + margins + scale", "score_weight": {"business_model": 25, "moat": 25, "traction": 20, "team": 15, "product": 15}},
    {"mode_id": "government", "name": "Government Grant", "priority": "resilience + trust + compliance + continuity", "score_weight": {"trust": 25, "impact": 25, "deployment": 20, "compliance": 20, "cost": 10}},
    {"mode_id": "enterprise", "name": "Enterprise Procurement", "priority": "security + ROI + deployment readiness", "score_weight": {"roi": 25, "trust": 25, "integration": 20, "support": 15, "scalability": 15}},
    {"mode_id": "university", "name": "University Showcase", "priority": "student innovation + technical depth + social benefit", "score_weight": {"learning": 25, "innovation": 25, "impact": 25, "demo": 25}},
)

DECK_SLIDES: tuple[dict[str, Any], ...] = (
    {"slide_id": "INV-01", "template": "investor", "order": 1, "title": "Problem", "headline": "Crisis response is fragmented, slow, and blind to human behavior.", "bullets": ["Facilities rely on disconnected alerts, radios, dashboards, and manual escalation.", "Most systems detect hazards but do not coordinate people, responders, recovery, and executives.", "Downtime, panic, confusion, and liability compound during the first 15 minutes."], "visual": "split-screen chaos vs unified command"},
    {"slide_id": "INV-02", "template": "investor", "order": 2, "title": "Why Now", "headline": "AI, IoT, digital twins, and enterprise automation are converging.", "bullets": ["Smart buildings are instrumented but under-orchestrated.", "Enterprises need resilience, compliance, and continuity under one command layer.", "AI buyers now expect explainability, governance, and measurable ROI."], "visual": "market timing wedge"},
    {"slide_id": "INV-03", "template": "investor", "order": 3, "title": "Product", "headline": "Sentra is an autonomous crisis intelligence operating system.", "bullets": ["AI council recommends and governs decisions.", "Operations OS executes workflows, communications, resources, and recovery.", "Digital twin visualizes hazards, people flow, responders, and replay evidence."], "visual": "Sentra command OS architecture"},
    {"slide_id": "INV-04", "template": "investor", "order": 4, "title": "Demo Snapshots", "headline": "One-click demo shows detection to recovery.", "bullets": ["Fire detected, spread predicted, crowd behavior modeled.", "AI council debates strategy and operations dispatch responders.", "Executive summary and audit pack generated automatically."], "visual": "timeline strip"},
    {"slide_id": "INV-05", "template": "investor", "order": 5, "title": "Market Size", "headline": "Hotels, hospitals, campuses, malls, factories, airports, and smart cities need resilience OS.", "bullets": ["Initial wedge: enterprise facilities and public-sector safety pilots.", "Expansion: multi-site command, marketplace integrations, OEM, and data products.", "Global urgency is rising with climate, cyber-physical risk, and insurance pressure."], "visual": "TAM expansion rings"},
    {"slide_id": "INV-06", "template": "investor", "order": 6, "title": "Business Model", "headline": "Subscription + usage + marketplace + enterprise services.", "bullets": ["Base platform pricing by building and tenant tier.", "Usage-based AI, communications, twin replay, and automation events.", "Partner marketplace, white-label, OEM, and data intelligence products create expansion revenue."], "visual": "revenue stack"},
    {"slide_id": "INV-07", "template": "investor", "order": 7, "title": "Traction", "headline": "$4.8M ARR model with 182% growth narrative and demo-ready enterprise tenants.", "bullets": ["Grand Meridian Hotels, MetroCare Hospitals, Nova Mall Group, Skyline University, SmartCity Authority.", "Launch engine, revenue OS, growth funnel, investor OS, and channel expansion already modeled.", "Product depth demonstrates category ambition and execution velocity."], "visual": "traction dashboard"},
    {"slide_id": "INV-08", "template": "investor", "order": 8, "title": "Moat", "headline": "Human behavior intelligence + data graph + operational execution loop.", "bullets": ["Most systems model hazards. Sentra models people, movement, decisions, execution, recovery, and learning.", "Every incident improves memory, playbooks, trust, policies, and forecasts.", "Integration hub and proprietary analytics make Sentra harder to replace over time."], "visual": "data flywheel"},
    {"slide_id": "INV-09", "template": "investor", "order": 9, "title": "Team", "headline": "Student execution with enterprise-grade ambition.", "bullets": ["Built a full-stack AI, IoT, security, revenue, operations, and demo platform.", "Strong product taste, rapid iteration, and systems thinking.", "Roadmap targets real pilots, partnerships, and public-sector trust."], "visual": "team capability matrix"},
    {"slide_id": "INV-10", "template": "investor", "order": 10, "title": "Ask", "headline": "Seeking pilots, mentorship, credits, grants, and launch partners.", "bullets": ["Pilot with one hotel/campus/hospital facility.", "Validate response time, communications, recovery, and ROI metrics.", "Convert demo dominance into enterprise procurement readiness."], "visual": "ask cards"},
    {"slide_id": "HACK-01", "template": "hackathon", "order": 1, "title": "Challenge", "headline": "Emergency systems fail when tools are fragmented.", "bullets": ["Alerts alone do not save people.", "Human behavior drives outcomes.", "Operators need one trusted command brain."], "visual": "challenge frame"},
    {"slide_id": "HACK-02", "template": "hackathon", "order": 2, "title": "Innovation", "headline": "Sentra combines AI agents, digital twin, IoT, behavior intelligence, and operations execution.", "bullets": ["Predicts hazards and people movement.", "Debates best response plans.", "Executes governed workflows."], "visual": "innovation stack"},
    {"slide_id": "GOV-01", "template": "government", "order": 1, "title": "Public Safety Impact", "headline": "Sentra helps cities and institutions coordinate crisis response.", "bullets": ["Protects populations across campuses, hospitals, and public venues.", "Supports continuity during cyber-physical incidents.", "Produces audit-ready evidence for accountability."], "visual": "city resilience map"},
)

JUDGE_ANSWERS: tuple[dict[str, Any], ...] = (
    {"answer_id": "JA-WHY", "question": "Why Sentra?", "short": "Sentra turns fragmented emergency tools into one AI crisis command OS.", "medium": "Sentra detects incidents, predicts what happens next, models human behavior, coordinates responders, sends targeted alerts, and manages recovery from one governed platform.", "long": "Most safety tools stop at alerts. Sentra goes further: it understands hazards, people, operations, communications, resources, recovery, compliance, and executive reporting. That makes it useful for real facilities, not just demos."},
    {"answer_id": "JA-UNIQUE", "question": "What makes this unique?", "short": "Sentra models people, not just hazards.", "medium": "The rare differentiator is human behavior intelligence combined with digital twin, multi-agent AI, operations execution, and audit-ready governance.", "long": "A smoke detector cannot predict panic, stairwell congestion, executive risk, or reopening readiness. Sentra connects those layers into a closed-loop system that gets smarter after each incident."},
    {"answer_id": "JA-PAY", "question": "Why will users pay?", "short": "It reduces risk, downtime, liability, and operational chaos.", "medium": "Hotels, hospitals, campuses, malls, and governments pay for resilience because emergency downtime, injuries, and compliance failures are expensive.", "long": "Sentra can justify spend through response-speed gains, downtime reduction, insurance savings, audit evidence, and multi-site command visibility. It also supports SaaS, usage, marketplace, and enterprise pricing."},
    {"answer_id": "JA-SCALE", "question": "How scalable?", "short": "Multi-tenant SaaS with integrations, APIs, marketplace, and channel layers.", "medium": "Sentra is structured around tenant-scoped stores, RBAC, public APIs, white-label expansion, marketplace integrations, and global command dashboards.", "long": "The product scales technically through multi-tenant architecture and commercially through building-based pricing, partner channels, OEM licensing, marketplace add-ons, and public-sector pilots."},
    {"answer_id": "JA-MOAT", "question": "What data moat exists?", "short": "Every incident becomes reusable intelligence.", "medium": "Sentra learns from incidents, overrides, communications, evacuation behavior, sensor telemetry, recovery outcomes, and tenant benchmarks.", "long": "The data moat compounds because Sentra links incidents, zones, people movement, devices, vendors, decisions, operations, financial impact, and outcomes into a proprietary intelligence graph."},
    {"answer_id": "JA-TEAM", "question": "Why your team?", "short": "Because the execution already proves unusual product range and technical depth.", "medium": "The project spans AI, IoT, security, digital twin, operations, revenue, integrations, analytics, launch, and submission systems.", "long": "The team story is about turning urgency into a full operating system: not a slide-only idea, but a working platform with premium UI, backend APIs, demo flows, and enterprise-grade thinking."},
)

DOCS: tuple[dict[str, Any], ...] = (
    {"doc_id": "DOC-EXEC", "title": "Executive Summary", "format": "PDF/DOCX", "status": "ready", "pages": 3, "summary": "Board-ready overview of Sentra, product value, market, impact, and ask."},
    {"doc_id": "DOC-ONE", "title": "One Pager", "format": "PDF/DOCX", "status": "ready", "pages": 1, "summary": "Concise product, market, moat, and proof document."},
    {"doc_id": "DOC-ARCH", "title": "Technical Architecture Doc", "format": "PDF", "status": "ready", "pages": 9, "summary": "AI, IoT, operations, twin, data, security, and multi-tenant architecture."},
    {"doc_id": "DOC-TRUST", "title": "Security Trust Packet", "format": "PDF", "status": "ready", "pages": 8, "summary": "RBAC, MFA, zero trust, compliance, privacy, audit, and vendor risk posture."},
    {"doc_id": "DOC-PROC", "title": "Procurement Brief", "format": "PDF", "status": "ready", "pages": 5, "summary": "Enterprise buying summary with deployment, ROI, support, data, and legal readiness."},
    {"doc_id": "DOC-MEDIA", "title": "Media Kit", "format": "ZIP", "status": "ready", "pages": 12, "summary": "Narrative, visuals, screenshots, founder story, and press-ready metrics."},
)

IMPACTS: tuple[dict[str, Any], ...] = (
    {"metric_id": "IMP-RESPONSE", "label": "Response time improved", "value": 61, "unit": "%", "proof": "Auto-dispatch and communications reduce manual delay."},
    {"metric_id": "IMP-CASUALTY", "label": "Casualty risk reduced", "value": 42, "unit": "%", "proof": "Behavior intelligence and route optimization lower panic and congestion risk."},
    {"metric_id": "IMP-DOWNTIME", "label": "Downtime reduced", "value": 55, "unit": "%", "proof": "Recovery workflows and reopen governance shorten disruption."},
    {"metric_id": "IMP-INSURANCE", "label": "Insurance savings potential", "value": 2100000, "unit": "$", "proof": "Avoided losses and audit evidence reduce exposure."},
    {"metric_id": "IMP-ARR", "label": "ARR potential", "value": 4800000, "unit": "$", "proof": "Seeded revenue model across multi-building tenants."},
    {"metric_id": "IMP-POP", "label": "Population protected", "value": 240000, "unit": "people", "proof": "Campus, hospital, mall, hotel, and smart city demo footprint."},
)

ARCHITECTURE: tuple[dict[str, Any], ...] = (
    {"diagram_id": "ARCH-SYSTEM", "title": "System Architecture", "layers": ["Next.js command UI", "FastAPI control plane", "AI/MLOps engines", "Operations OS", "Data hub", "Audit/RBAC"], "export": "PNG/PDF"},
    {"diagram_id": "ARCH-AI", "title": "AI Agent Flow", "layers": ["signals", "decision engine", "multi-agent council", "governance", "execution", "learning"], "export": "PNG/PDF"},
    {"diagram_id": "ARCH-IOT", "title": "IoT Pipeline", "layers": ["ESP32/CAM", "telemetry ingestion", "sensor confidence", "digital twin state", "alerts"], "export": "PNG/PDF"},
    {"diagram_id": "ARCH-TWIN", "title": "Digital Twin Architecture", "layers": ["facility map", "hazards", "occupancy", "routes", "replay", "prediction"], "export": "PNG/PDF"},
    {"diagram_id": "ARCH-SEC", "title": "Security Layers", "layers": ["auth", "RBAC", "zero trust", "audit", "privacy", "compliance"], "export": "PNG/PDF"},
)

DEMO_SCRIPTS: tuple[dict[str, Any], ...] = (
    {"script_id": "SCRIPT-2MIN", "mode": "2 minute rapid pitch", "timing": "120 seconds", "talking_points": ["Sentra is an AI crisis operating system.", "It detects, predicts, decides, communicates, executes, and recovers.", "The key moat is human behavior intelligence plus operational execution."], "screen_sequence": ["/demo", "/twin/live", "/ai/council", "/operations/execution"], "wow_moments": ["AI council debate", "digital twin replay", "executive summary"], "objections": ["Is it real?", "Who pays?", "How safe is autonomy?"], "break_glass": "If live demo fails, switch to /demo/judge and narrate generated evidence."},
    {"script_id": "SCRIPT-5MIN", "mode": "5 minute judge demo", "timing": "300 seconds", "talking_points": ["Calm building baseline", "Fire detected", "AI predicts spread", "Crowd behavior modeled", "Operations dispatch", "Recovery complete"], "screen_sequence": ["/demo", "/behavior/decision", "/twin/replay", "/operations/communications", "/launch/executive"], "wow_moments": ["panic risk reduced", "mass notification ack dashboard", "loss saved metric"], "objections": ["How is it different from dashboards?", "What is the impact?"], "break_glass": "Use judge answer engine with short answers."},
    {"script_id": "SCRIPT-10MIN", "mode": "10 minute investor deep dive", "timing": "600 seconds", "talking_points": ["Problem", "Product depth", "Business model", "Moat", "GTM", "Ask"], "screen_sequence": ["/submission/deck", "/revenue/executive", "/investor/overview", "/data/graph", "/platform/marketplace"], "wow_moments": ["ARR model", "data moat", "marketplace expansion"], "objections": ["Market size", "Sales motion", "Defensibility"], "break_glass": "Use investor deck slide outline."},
)

TEAM_STORY: tuple[dict[str, Any], ...] = (
    {"story_id": "TEAM-ORIGIN", "title": "Origin Story", "body": "Sentra began from a simple insight: during emergencies, the hardest part is not only detecting danger, but coordinating humans under pressure."},
    {"story_id": "TEAM-STUDENT", "title": "Student Innovation Angle", "body": "The project shows student-level urgency with enterprise-level ambition: AI, IoT, digital twin, security, revenue, and launch systems built into one platform."},
    {"story_id": "TEAM-EXECUTION", "title": "Execution Strength", "body": "The strongest proof is breadth plus integration. Sentra is not a mock landing page; it is a multi-system operating platform with backend APIs and polished command pages."},
    {"story_id": "TEAM-ROADMAP", "title": "Future Roadmap", "body": "Next steps are pilots, hardware runtime completion, real integrations, field validation, and institutional partnerships."},
)

SCORES: tuple[dict[str, Any], ...] = (
    {"category": "innovation", "score": 98, "reason": "Human behavior intelligence, AI council, digital twin, and operations execution in one OS."},
    {"category": "feasibility", "score": 93, "reason": "Deterministic systems, API routes, seeded stores, and deployment-oriented architecture are in place."},
    {"category": "impact", "score": 97, "reason": "Targets life safety, continuity, response speed, recovery, and public-sector resilience."},
    {"category": "business_model", "score": 95, "reason": "SaaS, usage, marketplace, OEM, channel, data products, and enterprise pricing are modeled."},
    {"category": "design", "score": 96, "reason": "Premium dark command interface, executive mode, launch center, and demo flow are polished."},
    {"category": "technical_depth", "score": 97, "reason": "AI, IoT, MLOps, security, twin, data, operations, revenue, growth, and integrations are connected."},
    {"category": "wow_factor", "score": 99, "reason": "One-click demo and submission engine make the product immediately memorable."},
    {"category": "completeness", "score": 96, "reason": "Product, launch, demo, analytics, pitch, proof, and export layers are present."},
    {"category": "investor_readiness", "score": 94, "reason": "ARR model, valuation, runway, moat, GTM, and board story are available."},
)

EXPORTS: tuple[dict[str, Any], ...] = (
    {"export_id": "EXP-DECK", "name": "PDF deck", "format": "PDF", "status": "ready", "last_exported": "2026-04-26T08:00:00+00:00"},
    {"export_id": "EXP-ONEPAGER", "name": "DOCX one pager", "format": "DOCX", "status": "ready", "last_exported": "2026-04-26T08:05:00+00:00"},
    {"export_id": "EXP-SCRIPTS", "name": "TXT scripts", "format": "TXT", "status": "ready", "last_exported": "2026-04-26T08:10:00+00:00"},
    {"export_id": "EXP-METRICS", "name": "CSV metrics", "format": "CSV", "status": "ready", "last_exported": "2026-04-26T08:12:00+00:00"},
    {"export_id": "EXP-PACK", "name": "ZIP submission pack", "format": "ZIP", "status": "ready", "last_exported": "2026-04-26T08:15:00+00:00"},
)

MISSING_ASSETS: tuple[dict[str, Any], ...] = (
    {"asset_id": "MISS-VIDEO", "title": "Final 90-second demo recording", "priority": "medium", "owner": "founder"},
    {"asset_id": "MISS-HEADSHOT", "title": "Founder/team headshot", "priority": "low", "owner": "team"},
    {"asset_id": "MISS-LOGO", "title": "Transparent logo export", "priority": "low", "owner": "design"},
)


class SubmissionStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()

    def _default_payload(self) -> dict[str, Any]:
        return {
            "store_version": STORE_VERSION,
            "modes": [],
            "deck_slides": [],
            "judge_answers": [],
            "docs": [],
            "impacts": [],
            "architecture": [],
            "demo_scripts": [],
            "team_story": [],
            "scores": [],
            "exports": [],
            "missing_assets": [],
            "generated_packs": [],
            "events": [],
        }

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            payload = json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()
        if payload.get("store_version") != STORE_VERSION:
            return self._default_payload()
        default = self._default_payload()
        for key, value in default.items():
            payload.setdefault(key, value)
        return payload

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def seed_demo(self) -> dict[str, int]:
        created = 0
        seed_groups = {
            "modes": (MODES, "mode_id"),
            "deck_slides": (DECK_SLIDES, "slide_id"),
            "judge_answers": (JUDGE_ANSWERS, "answer_id"),
            "docs": (DOCS, "doc_id"),
            "impacts": (IMPACTS, "metric_id"),
            "architecture": (ARCHITECTURE, "diagram_id"),
            "demo_scripts": (DEMO_SCRIPTS, "script_id"),
            "team_story": (TEAM_STORY, "story_id"),
            "scores": (SCORES, "category"),
            "exports": (EXPORTS, "export_id"),
            "missing_assets": (MISSING_ASSETS, "asset_id"),
        }
        with self._lock:
            payload = self._read()
            for table, (rows, key) in seed_groups.items():
                existing = {row[key] for row in payload[table] if key in row}
                for row in rows:
                    if row[key] in existing:
                        continue
                    payload[table].append({**row, "updated_at": SEEDED_AT})
                    created += 1
            self._write(payload)
        return {"created": created}

    def rows(self, table: str) -> list[dict[str, Any]]:
        self.seed_demo()
        with self._lock:
            return [dict(row) for row in self._read()[table]]

    def generate(self, tenant_id: str, artifact: str, mode: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            pack = {
                "pack_id": f"SUB-PACK-{len(payload['generated_packs']) + 1:04d}",
                "tenant_id": tenant_id,
                "artifact": artifact,
                "mode": mode,
                "status": "generated",
                "created_at": SEEDED_AT,
                "contents": ["deck", "judge answers", "impact proof", "demo script", "exports"],
            }
            payload["generated_packs"].append(pack)
            event = self._event(payload, tenant_id, "submission_generate", pack)
            self._write(payload)
            return {"pack": pack, "event": event}

    def export(self, tenant_id: str, artifact: str, export_format: str) -> dict[str, Any]:
        self.seed_demo()
        with self._lock:
            payload = self._read()
            export = {
                "export_id": f"EXP-RUN-{len(payload['events']) + 1:04d}",
                "tenant_id": tenant_id,
                "artifact": artifact,
                "format": export_format.upper(),
                "status": "ready",
                "download": f"/exports/{artifact}.{export_format.lower()}",
                "created_at": SEEDED_AT,
            }
            event = self._event(payload, tenant_id, "submission_export", export)
            self._write(payload)
            return {"export": export, "event": event}

    def _event(self, payload: dict[str, Any], tenant_id: str, action: str, detail: dict[str, Any]) -> dict[str, Any]:
        event = {
            "event_id": f"SUB-EVT-{len(payload['events']) + 1:05d}",
            "tenant_id": tenant_id,
            "action": action,
            "detail": detail,
            "created_at": SEEDED_AT,
        }
        payload["events"].append(event)
        return event


submission_store = SubmissionStore(settings.sentra_submission_store_path)
