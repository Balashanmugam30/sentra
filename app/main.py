from __future__ import annotations

import asyncio
import os
from uuid import uuid4
from time import perf_counter

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import PlainTextResponse, Response

from app.ai.router import router as autonomous_ai_router
from app.ai.council_router import router as ai_council_router
from app.ai.learning_router import router as ai_learning_router
from app.aicouncil.router import router as ai_decision_council_router
from app.aicouncil.store import ai_council_store
from app.analytics.router import router as analytics_router
from app.agents.router import router as agents_router
from app.autonomy.router import router as autonomy_router
from app.autonomy.service import autonomy_store
from app.audit.engine import log_system_event
from app.audit.router import router as audit_router
from app.behavior.crowd_router import router as behavior_crowd_router
from app.behavior.crowd_store import crowd_store
from app.behavior.decision_router import router as behavior_decision_router
from app.behavior.decision_store import decision_store
from app.behavior.learning_router import router as behavior_learning_router
from app.behavior.learning_store import learning_store
from app.behavior.router import router as behavior_router
from app.behavior.store import behavior_store
from app.auth.router import router as auth_router
from app.billing.router import router as billing_router
from app.billing.service import billing_store
from app.crm.router import router as crm_router
from app.crm.service import crm_store
from app.customer_success.router import router as customer_success_router
from app.customer_success.service import customer_success_store
from app.category_domination.router import router as category_domination_router
from app.category_domination.service import category_domination_store
from app.channel.router import router as channel_router
from app.channel.store import channel_store
from app.civilization_infra.router import router as civilization_infra_router
from app.civilization_infra.service import civilization_infra_store
from app.developer.router import embed_router, router as developer_router
from app.developer.service import developer_store
from app.developers.router import router as developers_router
from app.datahub.router import router as datahub_router
from app.datahub.store import datahub_store
from app.data_empire.router import router as data_empire_router
from app.data_empire.service import data_empire_store
from app.demoengine.router import router as demo_router
from app.demoengine.store import demo_store
from app.analyticshub.router import router as analyticshub_router
from app.analyticshub.store import analyticshub_store
from app.auth.security import decode_token
from app.auth.store import auth_store
from app.communications.router import router as enterprise_communications_router
from app.core.config import settings
from app.core.observability import (
    build_deep_health,
    build_observability_snapshot,
    build_prometheus_metrics,
    log_event,
)
from app.core.health import health_payload as production_health_payload
from app.core.health import liveness_payload, readiness_payload
from app.core.runtime_mode import should_seed_demo_data
from app.core.startup_checks import run_startup_checks
from app.core.reports import build_executive_pdf_report
from app.core.runtime_cache import get_runtime_cache_stats
from app.environment.router import router as environment_router
from app.ecosystem.router import router as ecosystem_router
from app.ecosystem.service import ecosystem_store
from app.execution.router import router as execution_router
from app.execution.service import execution_store
from app.governance.router import router as governance_router
from app.government.router import router as government_router
from app.government.service import government_store
from app.geospatial.router import router as geospatial_router
from app.growth.router import router as growth_router
from app.growth.service import growth_store
from app.field.router import router as field_router
from app.facility.router import router as facility_router
from app.firebase_live.router import router as firebase_live_router
from app.hardware.mqtt_client import start_mqtt_listener, stop_mqtt_listener
from app.hardware.router import router as hardware_router
from app.integrations.router import router as integrations_router
from app.integrations.store import integration_hub_store
from app.investor.router import router as investor_router
from app.investor.service import investor_store
from app.iot.router import router as iot_router
from app.launchcore.router import router as launch_router
from app.launchcore.store import launch_store
from app.offline.router import router as offline_router
from app.ops.status_router import router as ops_router
from app.ops.communications_router import router as ops_communications_router
from app.ops.execution_router import router as ops_execution_router
from app.ops.governance_router import router as ops_governance_router
from app.ops.executive_router import router as ops_executive_router
from app.ops.recovery_router import router as ops_recovery_router
from app.ops.resilience_router import router as ops_resilience_router
from app.ops.resources_router import router as ops_resources_router
from app.osint.router import router as osint_router
from app.operations.router import router as operations_router
from app.platform.router import router as platform_router
from app.platform.store import platform_store
from app.marketplace.router import router as marketplace_router
from app.marketplace.service import marketplace_store
from app.master.router import router as master_router
from app.master.store import master_store
from app.ml.router import router as ml_router
from app.ml.store import ml_store
from app.mlops.router import router as mlops_router
from app.mlops.store import mlops_store
from app.monopoly_expansion.router import router as monopoly_expansion_router
from app.monopoly_expansion.service import monopoly_expansion_store
from app.omega.router import router as omega_router
from app.omega.service import omega_store
from app.partners.router import router as partners_router
from app.partners.service import partners_store
from app.perception.injector import auto_scan_loop
from app.perception.router import router as perception_router
from app.prediction.router import router as prediction_router
from app.prestige.router import router as prestige_router
from app.prestige.store import prestige_store
from app.public_safety.router import router as public_safety_router
from app.rbac.router import router as rbac_router
from app.rbac.permissions import normalize_role
from app.rbac.store import seed_demo_users
from app.resilience.router import router as resilience_router
from app.revenue.router import router as revenue_router
from app.revenue.store import revenue_store
from app.revenue_growth.router import router as revenue_growth_router
from app.revenue_growth.service import revenue_growth_store
from app.routes.incident_routes import router as incident_router
from app.routes.ws_routes import router as ws_router
from app.services.incident_service import reset_incidents
from app.services.connection_manager import incident_connection_manager
from app.security.hardening import security_headers_middleware
from app.security.rate_limit import ip_rate_limit_middleware
from app.security.router import router as security_center_router
from app.security.session_guard import observe_session
from app.security.store import security_center_store
from app.securitydefense.router import router as security_defense_router
from app.securitydefense.store import security_defense_store
from app.securitytrust.router import router as security_trust_router
from app.securitytrust.store import security_trust_store
from app.simulation.router import router as simulation_router
from app.soc.engine import ingest_soc_request
from app.soc.router import router as soc_router
from app.soc.telemetry import get_recent_telemetry, get_requests_last_minute
from app.submissioncore.router import router as submission_router
from app.submissioncore.store import submission_store
from app.tenancy.middleware import tenant_context_middleware
from app.tenancy.provisioning import tenancy_store
from app.tenancy.router import router as tenancy_router
from app.twin.ai_store import twin_ai_store
from app.twin.router import router as twin_router
from app.twin.store import twin_store
from app.world.router import router as world_router
from app.world.service import world_store

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1024)
app.middleware("http")(security_headers_middleware)
app.middleware("http")(ip_rate_limit_middleware)
app.middleware("http")(tenant_context_middleware)

app.state.settings = settings

app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(audit_router, prefix=settings.api_prefix)
app.include_router(rbac_router, prefix=settings.api_prefix)
app.include_router(security_center_router, prefix=settings.api_prefix)
app.include_router(security_defense_router, prefix=settings.api_prefix)
app.include_router(security_trust_router, prefix=settings.api_prefix)
app.include_router(tenancy_router, prefix=settings.api_prefix)
app.include_router(billing_router, prefix=settings.api_prefix)
app.include_router(crm_router, prefix=settings.api_prefix)
app.include_router(customer_success_router, prefix=settings.api_prefix)
app.include_router(marketplace_router, prefix=settings.api_prefix)
app.include_router(partners_router, prefix=settings.api_prefix)
app.include_router(developer_router, prefix=settings.api_prefix)
app.include_router(embed_router, prefix=settings.api_prefix)
app.include_router(developers_router, prefix=settings.api_prefix)
app.include_router(platform_router, prefix=settings.api_prefix)
app.include_router(channel_router, prefix=settings.api_prefix)
app.include_router(demo_router, prefix=settings.api_prefix)
app.include_router(growth_router, prefix=settings.api_prefix)
app.include_router(revenue_growth_router, prefix=settings.api_prefix)
app.include_router(revenue_router, prefix=settings.api_prefix)
app.include_router(launch_router, prefix=settings.api_prefix)
app.include_router(submission_router, prefix=settings.api_prefix)
app.include_router(prestige_router, prefix=settings.api_prefix)
app.include_router(firebase_live_router, prefix=settings.api_prefix)
app.include_router(ecosystem_router, prefix=settings.api_prefix)
app.include_router(data_empire_router, prefix=settings.api_prefix)
app.include_router(datahub_router, prefix=settings.api_prefix)
app.include_router(category_domination_router, prefix=settings.api_prefix)
app.include_router(monopoly_expansion_router, prefix=settings.api_prefix)
app.include_router(civilization_infra_router, prefix=settings.api_prefix)
app.include_router(omega_router, prefix=settings.api_prefix)
app.include_router(investor_router, prefix=settings.api_prefix)
app.include_router(behavior_router, prefix=settings.api_prefix)
app.include_router(behavior_crowd_router, prefix=settings.api_prefix)
app.include_router(behavior_decision_router, prefix=settings.api_prefix)
app.include_router(behavior_learning_router, prefix=settings.api_prefix)
app.include_router(ml_router, prefix=settings.api_prefix)
app.include_router(mlops_router, prefix=settings.api_prefix)
app.include_router(execution_router, prefix=settings.api_prefix)
app.include_router(government_router, prefix=settings.api_prefix)
app.include_router(autonomy_router, prefix=settings.api_prefix)
app.include_router(world_router, prefix=settings.api_prefix)
app.include_router(soc_router, prefix=settings.api_prefix)
app.include_router(incident_router, prefix=settings.api_prefix)
app.include_router(prediction_router, prefix=settings.api_prefix)
app.include_router(simulation_router, prefix=settings.api_prefix)
app.include_router(perception_router, prefix=settings.api_prefix)
app.include_router(agents_router, prefix=settings.api_prefix)
app.include_router(autonomous_ai_router, prefix=settings.api_prefix)
app.include_router(ai_council_router, prefix=settings.api_prefix)
app.include_router(ai_learning_router, prefix=settings.api_prefix)
app.include_router(ai_decision_council_router, prefix=settings.api_prefix)
app.include_router(master_router, prefix=settings.api_prefix)
app.include_router(twin_router, prefix=settings.api_prefix)
app.include_router(enterprise_communications_router, prefix=settings.api_prefix)
app.include_router(analytics_router, prefix=settings.api_prefix)
app.include_router(analyticshub_router, prefix=settings.api_prefix)
app.include_router(geospatial_router, prefix=settings.api_prefix)
app.include_router(environment_router, prefix=settings.api_prefix)
app.include_router(public_safety_router, prefix=settings.api_prefix)
app.include_router(osint_router, prefix=settings.api_prefix)
app.include_router(operations_router, prefix=settings.api_prefix)
app.include_router(integrations_router, prefix=settings.api_prefix)
app.include_router(governance_router, prefix=settings.api_prefix)
app.include_router(field_router, prefix=settings.api_prefix)
app.include_router(facility_router, prefix=settings.api_prefix)
app.include_router(resilience_router, prefix=settings.api_prefix)
app.include_router(hardware_router, prefix=settings.api_prefix)
app.include_router(iot_router, prefix=settings.api_prefix)
app.include_router(offline_router, prefix=settings.api_prefix)
app.include_router(ops_router, prefix=settings.api_prefix)
app.include_router(ops_communications_router, prefix=settings.api_prefix)
app.include_router(ops_execution_router, prefix=settings.api_prefix)
app.include_router(ops_governance_router, prefix=settings.api_prefix)
app.include_router(ops_resilience_router, prefix=settings.api_prefix)
app.include_router(ops_executive_router, prefix=settings.api_prefix)
app.include_router(ops_resources_router, prefix=settings.api_prefix)
app.include_router(ops_recovery_router, prefix=settings.api_prefix)
app.include_router(ws_router)


@app.middleware("http")
async def soc_telemetry_middleware(request, call_next):
    started_at = perf_counter()
    status_code = 500
    trace_id = request.headers.get("x-request-id") or request.headers.get("x-trace-id") or str(uuid4())

    try:
        response = await call_next(request)
        status_code = response.status_code
        response_size = int(response.headers.get("content-length") or 0)
        response.headers["X-Trace-Id"] = trace_id
        response.headers["X-Response-Time-Ms"] = str(round((perf_counter() - started_at) * 1000))
        response.headers["X-Sentra-Response-Bytes"] = str(response_size)
        return response
    finally:
        duration_ms = round((perf_counter() - started_at) * 1000)
        actor_email = None
        actor_role = None
        session_id = None
        token = None
        authorization = request.headers.get("authorization", "")
        if authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1].strip()
        if not token:
            token = request.cookies.get(settings.auth_access_cookie_name)

        if token:
            try:
                payload = decode_token(token, expected_type="access")
                user = auth_store.get_user_by_id(str(payload["sub"]))
                if user is not None and user.get("is_active"):
                    actor_email = str(user["email"])
                    actor_role = normalize_role(str(user["role"]))
                    session_id = str(payload.get("sid") or "") or None
            except Exception:
                pass

        source_ip = request.client.host if request.client else None
        observe_session(session_id, actor_email, source_ip, request.headers.get("user-agent", ""))
        log_event(
            "warning" if duration_ms >= 1_200 or status_code >= 500 else "info",
            "request_completed",
            trace_id=trace_id,
            user_id=actor_email,
            session_id=session_id,
            route=request.url.path,
            method=request.method,
            latency_ms=duration_ms,
            status=status_code,
            source_ip=source_ip,
            user_agent=request.headers.get("user-agent", ""),
            response_size_bytes=int(locals().get("response_size", 0)),
        )
        ingest_soc_request(
            path=request.url.path,
            method=request.method,
            status_code=status_code,
            duration_ms=duration_ms,
            actor_email=actor_email,
            actor_role=actor_role,
            source_ip=source_ip,
            session_id=session_id,
        )


@app.on_event("startup")
async def startup_event() -> None:
    startup_checks = run_startup_checks()
    if startup_checks["status"] == "blocked":
        log_event("critical", "startup_blocked", route="startup", status=503, checks=startup_checks)
        raise RuntimeError("Sentra production startup checks failed")
    reset_incidents()
    if should_seed_demo_data():
        seed_demo_users()
        tenancy_store.seed_demo()
        billing_store.seed_demo()
        crm_store.seed_demo()
        customer_success_store.seed_demo()
        marketplace_store.seed_demo()
        partners_store.seed_demo()
        developer_store.seed_demo()
        integration_hub_store.seed_demo()
        platform_store.seed_demo()
        channel_store.seed_demo()
        demo_store.seed_demo()
        growth_store.seed_demo()
        revenue_growth_store.seed_demo()
        revenue_store.seed_demo()
        launch_store.seed_demo()
        submission_store.seed_demo()
        prestige_store.seed_demo()
        ecosystem_store.seed_demo()
        data_empire_store.seed_demo()
        datahub_store.seed_demo()
        analyticshub_store.seed_demo()
        category_domination_store.seed_demo()
        monopoly_expansion_store.seed_demo()
        civilization_infra_store.seed_demo()
        omega_store.seed_demo()
        investor_store.seed_demo()
        behavior_store.seed_demo()
        crowd_store.seed_demo()
        decision_store.seed_demo()
        learning_store.seed_demo()
        ml_store.seed_demo()
        mlops_store.seed_demo()
        master_store.seed_demo()
        twin_store.seed_demo()
        twin_ai_store.seed_demo()
        security_center_store.seed_demo()
        security_defense_store.seed_demo()
        security_trust_store.seed_demo()
        execution_store.seed_demo()
        ai_council_store.seed_demo()
        government_store.seed_demo()
        autonomy_store.seed_demo()
        world_store.seed_demo()
    else:
        log_event("info", "demo_seed_skipped", route="startup", status=200, app_env=settings.app_env)
    log_event("info", "startup", route="startup", status=200, trace_id=str(uuid4()))
    log_system_event(
        action="startup",
        severity="low",
        reason="Sentra backend startup completed",
    )
    start_mqtt_listener()
    existing_task = getattr(app.state, "perception_auto_scan_task", None)
    if existing_task is None or existing_task.done():
        app.state.perception_auto_scan_task = asyncio.create_task(auto_scan_loop())


@app.on_event("shutdown")
async def shutdown_event() -> None:
    log_system_event(
        action="shutdown",
        severity="low",
        reason="Sentra backend shutdown initiated",
    )
    stop_mqtt_listener()
    scan_task = getattr(app.state, "perception_auto_scan_task", None)
    if scan_task is not None:
        scan_task.cancel()
        try:
            await scan_task
        except asyncio.CancelledError:
            pass


@app.get("/")
def healthcheck() -> dict[str, object]:
    return health_payload()


@app.get("/health")
def health() -> dict[str, object]:
    return health_payload()


@app.get("/livez")
def livez() -> dict[str, object]:
    return liveness_payload()


@app.get("/readyz")
def readyz() -> dict[str, object]:
    return readiness_payload()


@app.get("/readiness")
def readiness() -> dict[str, object]:
    return readiness_payload()


@app.get("/system/performance")
def system_performance() -> dict[str, object]:
    records = get_recent_telemetry()
    route_stats = _route_performance_buckets(records)
    slowest_routes = _slowest_routes(route_stats, limit=8)
    cache_stats = get_runtime_cache_stats()
    cpu_load = 0.0
    if hasattr(os, "getloadavg"):
        try:
            cpu_load = round(float(os.getloadavg()[0]), 2)
        except OSError:
            cpu_load = 0.0

    return {
        "generated_at": _performance_timestamp(),
        "cpu_load": cpu_load,
        "memory_estimate": {
            "telemetry_records": len(records),
            "cache_entries": cache_stats["entries"],
        },
        "requests_last_min": get_requests_last_minute(records),
        "cache_hits": cache_stats["hits"],
        "cache_misses": cache_stats["misses"],
        "websocket_clients": len(incident_connection_manager.active_connections),
        "slowest_routes": slowest_routes,
        "timeouts_today": sum(stats["timeouts"] for stats in route_stats.values()),
        "backend_mode": "healthy" if get_requests_last_minute(records) < 120 else "watch",
    }


@app.get("/system/performance/deep")
def system_performance_deep() -> dict[str, object]:
    records = get_recent_telemetry()
    route_stats = _route_performance_buckets(records)
    cache_stats = get_runtime_cache_stats()
    slow_routes = _slowest_routes(route_stats, limit=12)
    failing_routes = [
        {
            "route": route,
            "errors": stats["errors"],
            "error_rate_percent": round((stats["errors"] / max(1, stats["count"])) * 100),
            "count": stats["count"],
        }
        for route, stats in sorted(route_stats.items(), key=lambda item: item[1]["errors"], reverse=True)
        if stats["errors"] > 0
    ][:8]

    return {
        "generated_at": _performance_timestamp(),
        "slow_routes": slow_routes,
        "failing_routes": failing_routes,
        "avg_route_times": {
            route: round(stats["total_ms"] / max(1, stats["count"]))
            for route, stats in sorted(route_stats.items())[:30]
        },
        "cache": {
            **cache_stats,
            "hit_ratio": _runtime_cache_hit_ratio(cache_stats),
        },
        "socket_count": len(incident_connection_manager.active_connections),
        "memory_estimate": {
            "telemetry_records": len(records),
            "runtime_cache_entries": cache_stats["entries"],
            "inflight_cache_builds": cache_stats["inflight"],
        },
        "stale_engine_states": [
            item["route"]
            for item in slow_routes
            if int(str(item["avg_latency_ms"])) >= 1_200 or int(str(item["timeouts"])) > 0
        ],
        "recommendations": [
            "Keep executive mode active for leadership reviews.",
            "Use folded sections for AI/history archives until operators need detail.",
            "Hot live endpoints are runtime-cache protected with single-flight waits.",
        ],
    }


@app.get("/system/metrics", response_class=PlainTextResponse)
def system_metrics() -> str:
    return build_prometheus_metrics()


@app.get("/system/health/deep")
def system_deep_health() -> dict[str, object]:
    return build_deep_health()


@app.get("/system/observability")
def system_observability() -> dict[str, object]:
    return build_observability_snapshot()


@app.get("/system/reports/executive.pdf")
def system_executive_report(request: Request) -> Response:
    snapshot = build_observability_snapshot()
    organization_name = getattr(request.state, "organization_name", None)
    if organization_name:
        snapshot["tenant"] = {
            "organization_name": organization_name,
            "pdf_report_header": f"{organization_name} Command Intelligence Report",
        }
    report_bytes = build_executive_pdf_report(snapshot)
    return Response(
        content=report_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=sentra-executive-report.pdf",
            "X-Sentra-Report-Org": str(organization_name or "Sentra"),
        },
    )


@app.post("/system/alerts/webhook")
async def system_alerts_webhook(payload: dict[str, object]) -> dict[str, object]:
    log_event("warning", "alertmanager_webhook", route="/system/alerts/webhook", status=202, payload=payload)
    return {"accepted": True}


def _performance_timestamp() -> str:
    from datetime import datetime, timezone

    return datetime.now(timezone.utc).isoformat()


def _route_performance_buckets(records) -> dict[str, dict[str, int]]:
    route_stats: dict[str, dict[str, int]] = {}
    for record in records:
        bucket = route_stats.setdefault(
            f"{record.method} {record.path}",
            {"count": 0, "total_ms": 0, "max_ms": 0, "timeouts": 0, "errors": 0},
        )
        bucket["count"] += 1
        bucket["total_ms"] += record.duration_ms
        bucket["max_ms"] = max(bucket["max_ms"], record.duration_ms)
        if record.duration_ms >= 12_000:
            bucket["timeouts"] += 1
        if record.status_code >= 500:
            bucket["errors"] += 1
    return route_stats


def _slowest_routes(route_stats: dict[str, dict[str, int]], *, limit: int) -> list[dict[str, object]]:
    return [
        {
            "route": route,
            "avg_latency_ms": round(stats["total_ms"] / max(1, stats["count"])),
            "max_latency_ms": stats["max_ms"],
            "count": stats["count"],
            "timeouts": stats["timeouts"],
            "errors": stats["errors"],
        }
        for route, stats in sorted(
            route_stats.items(),
            key=lambda item: item[1]["total_ms"] / max(1, item[1]["count"]),
            reverse=True,
        )[:limit]
    ]


def _runtime_cache_hit_ratio(cache_stats: dict[str, int]) -> int:
    total = cache_stats.get("hits", 0) + cache_stats.get("misses", 0)
    if total == 0:
        return 0
    return round((cache_stats.get("hits", 0) / total) * 100)


def health_payload() -> dict[str, object]:
    payload = production_health_payload()
    return {
        "success": True,
        "data": {
            "service": settings.app_name,
            "version": settings.app_version,
            "status": payload["status"],
            "environment": settings.app_env,
            "generated_at": payload["generated_at"],
            "readiness": payload["readiness"],
        },
    }
