from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from app.audit.engine import append_audit_event
from app.auth.session import get_current_user
from app.firebase_live.schemas import FirebaseDisableUserRequest, FirebaseMutationResponse, FirebaseResponse, FirebaseUserRoleRequest
from app.firebase_live.service import firebase_live_service

router = APIRouter(prefix="/firebase", tags=["Firebase Production Integration"])


def _audit(request: Request, user: dict[str, object], action: str, reason: str, after_state: dict[str, object]) -> None:
    append_audit_event(
        category="firebase",
        action=action,
        severity="medium",
        target_module="firebase_live",
        status="success",
        reason=reason,
        request=request,
        identity={
            "user_id": str(user.get("user_id") or user.get("uid") or ""),
            "email": str(user.get("email") or ""),
            "role": str(user.get("role") or ""),
        },
        after_state=after_state,
        risk_score=42,
    )


@router.get("/status", response_model=FirebaseResponse)
def get_firebase_status() -> FirebaseResponse:
    return FirebaseResponse(data=firebase_live_service.storage_status())


@router.get("/dashboard", response_model=FirebaseResponse)
def get_firebase_dashboard(user: dict[str, object] = Depends(get_current_user)) -> FirebaseResponse:
    return FirebaseResponse(data=firebase_live_service.dashboard_metrics())


@router.get("/users", response_model=FirebaseResponse)
def get_firebase_users(user: dict[str, object] = Depends(get_current_user)) -> FirebaseResponse:
    firebase_live_service.require_admin(user)
    return FirebaseResponse(data=firebase_live_service.list_users())


@router.post("/users/role", response_model=FirebaseMutationResponse)
def post_firebase_user_role(payload: FirebaseUserRoleRequest, request: Request, user: dict[str, object] = Depends(get_current_user)) -> FirebaseMutationResponse:
    firebase_live_service.require_admin(user)
    result = firebase_live_service.update_user_role(payload.uid, payload.role)
    _audit(request, user, "firebase_user_role_update", "Admin updated Firestore user role", result)
    return FirebaseMutationResponse(ok=True, message="Firebase user role updated", data=result)


@router.post("/users/disable", response_model=FirebaseMutationResponse)
def post_firebase_disable_user(payload: FirebaseDisableUserRequest, request: Request, user: dict[str, object] = Depends(get_current_user)) -> FirebaseMutationResponse:
    firebase_live_service.require_admin(user)
    result = firebase_live_service.disable_user(payload.uid, payload.disabled)
    _audit(request, user, "firebase_user_disable", "Admin changed Firestore user status", result)
    return FirebaseMutationResponse(ok=True, message="Firebase user status updated", data=result)
