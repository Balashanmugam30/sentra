from __future__ import annotations

from datetime import datetime, timezone

from typing import Any

from fastapi import APIRouter, Header, HTTPException, Query, Request, status

from app.core.config import settings
from app.iot.schemas import (
    IotAlertRequest,
    IotAlertResponse,
    IotAnalyticsResponse,
    IotCameraLatestResponse,
    IotCalibrationRequest,
    IotDataResponse,
    IotDemoRunRequest,
    IotEventsResponse,
    IotFirmwareReleaseRequest,
    IotFeedResponse,
    IotFleetResponse,
    IotHealthResponse,
    IotNodeCommandRequest,
    IotNodeCommandResponse,
    IotNodeDetailResponse,
    IotNodesResponse,
    IotProvisionRequest,
    IotProvisionResponse,
    IotRoiRequest,
    IotSettingsResponse,
    IotTelemetryRequest,
    IotTelemetryResponse,
    IotThresholdsResponse,
)
from app.iot.service import (
    calibrate_node,
    calculate_roi,
    get_demo_scenarios,
    get_analytics,
    get_feed,
    get_firmware_center,
    get_fleet,
    get_health,
    get_launch,
    get_network,
    get_node_detail,
    get_provisioning,
    get_roi_defaults,
    get_thresholds,
    get_vision,
    ingest_alert,
    ingest_telemetry,
    latest_camera,
    list_events,
    list_nodes,
    provision_device,
    release_firmware,
    rollback_firmware,
    run_node_action,
    run_demo_scenario,
    set_thresholds,
)
from app.iot.store import iot_store

router = APIRouter(prefix="/iot", tags=["IoT Edge Nodes"])


def _verify_node_token(x_sentra_node_token: str | None) -> None:
    if not settings.iot_node_token:
        return
    if x_sentra_node_token != settings.iot_node_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Sentra node token")


@router.post("/telemetry", response_model=IotTelemetryResponse)
async def post_iot_telemetry(
    payload: IotTelemetryRequest,
    request: Request,
    x_sentra_node_token: str | None = Header(default=None),
) -> IotTelemetryResponse:
    _verify_node_token(x_sentra_node_token)
    result = await ingest_telemetry(payload)
    request.app.state.last_iot_event = result["event"]
    return IotTelemetryResponse(**result)


@router.post("/alert", response_model=IotAlertResponse)
async def post_iot_alert(
    payload: IotAlertRequest,
    request: Request,
    x_sentra_node_token: str | None = Header(default=None),
) -> IotAlertResponse:
    _verify_node_token(x_sentra_node_token)
    result = await ingest_alert(payload)
    request.app.state.last_iot_event = result["alert"]
    return IotAlertResponse(**result)


@router.get("/nodes", response_model=IotNodesResponse)
def get_iot_nodes() -> IotNodesResponse:
    return IotNodesResponse(generated_at=datetime.now(timezone.utc), nodes=list_nodes())


@router.get("/events", response_model=IotEventsResponse)
def get_iot_events() -> IotEventsResponse:
    return IotEventsResponse(generated_at=datetime.now(timezone.utc), events=list_events())


@router.get("/camera/latest", response_model=IotCameraLatestResponse)
def get_iot_camera_latest() -> IotCameraLatestResponse:
    return IotCameraLatestResponse(**latest_camera())


@router.get("/fleet", response_model=IotFleetResponse)
def get_iot_fleet() -> IotFleetResponse:
    return IotFleetResponse(**get_fleet())


@router.get("/node/{node_id}", response_model=IotNodeDetailResponse)
def get_iot_node(node_id: str) -> IotNodeDetailResponse:
    try:
        return IotNodeDetailResponse(**get_node_detail(node_id))
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IoT node not found") from exc


def _node_action_response(node_id: str, action: str, payload: IotNodeCommandRequest | None = None) -> IotNodeCommandResponse:
    try:
        return IotNodeCommandResponse(**run_node_action(node_id, action, label=payload.label if payload else None))
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IoT node not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/node/{node_id}/restart", response_model=IotNodeCommandResponse)
def restart_iot_node(node_id: str) -> IotNodeCommandResponse:
    return _node_action_response(node_id, "restart")


@router.post("/node/{node_id}/mute", response_model=IotNodeCommandResponse)
def mute_iot_node(node_id: str) -> IotNodeCommandResponse:
    return _node_action_response(node_id, "mute")


@router.post("/node/{node_id}/snapshot", response_model=IotNodeCommandResponse)
def snapshot_iot_node(node_id: str) -> IotNodeCommandResponse:
    return _node_action_response(node_id, "snapshot")


@router.post("/node/{node_id}/ping", response_model=IotNodeCommandResponse)
def ping_iot_node(node_id: str) -> IotNodeCommandResponse:
    return _node_action_response(node_id, "ping")


@router.post("/node/{node_id}/disable", response_model=IotNodeCommandResponse)
def disable_iot_node(node_id: str) -> IotNodeCommandResponse:
    return _node_action_response(node_id, "disable")


@router.post("/node/{node_id}/rename", response_model=IotNodeCommandResponse)
def rename_iot_node(node_id: str, payload: IotNodeCommandRequest) -> IotNodeCommandResponse:
    return _node_action_response(node_id, "rename", payload)


@router.post("/node/{node_id}/calibrate", response_model=IotNodeCommandResponse)
def calibrate_iot_node(node_id: str, payload: IotCalibrationRequest) -> IotNodeCommandResponse:
    try:
        return IotNodeCommandResponse(**calibrate_node(node_id, payload.model_dump()))
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IoT node not found") from exc


@router.get("/analytics", response_model=IotAnalyticsResponse)
def get_iot_analytics(time_range: str = Query(default="24h")) -> IotAnalyticsResponse:
    return IotAnalyticsResponse(**get_analytics(time_range))


@router.get("/thresholds", response_model=IotThresholdsResponse)
def get_iot_thresholds() -> IotThresholdsResponse:
    return IotThresholdsResponse(**get_thresholds())


@router.post("/thresholds", response_model=IotThresholdsResponse)
def post_iot_thresholds(payload: IotCalibrationRequest) -> IotThresholdsResponse:
    return IotThresholdsResponse(**set_thresholds(payload.model_dump()))


@router.get("/health", response_model=IotHealthResponse)
def get_iot_health() -> IotHealthResponse:
    return IotHealthResponse(**get_health())


@router.get("/feed", response_model=IotFeedResponse)
def get_iot_feed() -> IotFeedResponse:
    return IotFeedResponse(**get_feed())


@router.get("/settings", response_model=IotSettingsResponse)
def get_iot_settings() -> IotSettingsResponse:
    return IotSettingsResponse(generated_at=datetime.now(timezone.utc), settings=iot_store.get_settings())


@router.post("/settings", response_model=IotSettingsResponse)
def post_iot_settings(payload: dict[str, Any]) -> IotSettingsResponse:
    return IotSettingsResponse(generated_at=datetime.now(timezone.utc), settings=iot_store.set_settings(payload))


@router.get("/provisioning", response_model=IotDataResponse)
def get_iot_provisioning() -> IotDataResponse:
    return IotDataResponse(**get_provisioning())


@router.post("/provision", response_model=IotProvisionResponse)
def post_iot_provision(payload: IotProvisionRequest) -> IotProvisionResponse:
    return IotProvisionResponse(**provision_device(payload))


@router.get("/firmware", response_model=IotDataResponse)
def get_iot_firmware() -> IotDataResponse:
    return IotDataResponse(**get_firmware_center())


@router.post("/firmware/release", response_model=IotDataResponse)
def post_iot_firmware_release(payload: IotFirmwareReleaseRequest) -> IotDataResponse:
    return IotDataResponse(**release_firmware(payload.version, payload.rollout_percentage, payload.target))


@router.post("/firmware/rollback", response_model=IotDataResponse)
def post_iot_firmware_rollback() -> IotDataResponse:
    return IotDataResponse(**rollback_firmware())


@router.get("/network", response_model=IotDataResponse)
def get_iot_network() -> IotDataResponse:
    return IotDataResponse(**get_network())


@router.get("/vision", response_model=IotDataResponse)
def get_iot_vision() -> IotDataResponse:
    return IotDataResponse(**get_vision())


@router.get("/demo/scenarios", response_model=IotDataResponse)
def get_iot_demo_scenarios() -> IotDataResponse:
    return IotDataResponse(**get_demo_scenarios())


@router.post("/demo/run", response_model=IotDataResponse)
def post_iot_demo_run(payload: IotDemoRunRequest) -> IotDataResponse:
    return IotDataResponse(**run_demo_scenario(payload.scenario_id))


@router.get("/roi", response_model=IotDataResponse)
def get_iot_roi() -> IotDataResponse:
    return IotDataResponse(**get_roi_defaults())


@router.post("/roi/calculate", response_model=IotDataResponse)
def post_iot_roi_calculate(payload: IotRoiRequest) -> IotDataResponse:
    return IotDataResponse(**calculate_roi(payload))


@router.get("/launch", response_model=IotDataResponse)
def get_iot_launch() -> IotDataResponse:
    return IotDataResponse(**get_launch())
