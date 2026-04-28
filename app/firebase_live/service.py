from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status

from app.auth.store import auth_store
from app.core.config import settings
from app.core.firebase import firebase_available, get_firestore_client, get_storage_bucket, verify_firebase_id_token
from app.core.runtime_cache import cached_call
from app.rbac.permissions import normalize_role


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_email(decoded: dict[str, Any]) -> str:
    email = str(decoded.get("email") or "").strip().lower()
    if email:
        return email
    return f"{decoded['uid']}@firebase.sentra.local"


def _display_name(decoded: dict[str, Any], email: str) -> str:
    return str(decoded.get("name") or decoded.get("phone_number") or email.split("@")[0] or "Sentra Operator")


def _provider(decoded: dict[str, Any]) -> str:
    firebase_claim = decoded.get("firebase") if isinstance(decoded.get("firebase"), dict) else {}
    return str(firebase_claim.get("sign_in_provider") or "firebase")


class FirebaseLiveService:
    def verify_token(self, id_token: str) -> dict[str, Any]:
        return verify_firebase_id_token(id_token)

    def sync_user_from_token(self, decoded: dict[str, Any]) -> dict[str, Any]:
        db = get_firestore_client()
        uid = str(decoded["uid"])
        email = _safe_email(decoded)
        provider = _provider(decoded)
        now = _now()
        users = db.collection("users")
        existing = users.document(uid).get()
        has_users = bool(list(users.limit(1).stream()))
        firestore_role = str(existing.to_dict().get("role")) if existing.exists and existing.to_dict() else ("admin" if not has_users else "operator")
        internal_role = "admin" if firestore_role == "admin" else normalize_role(firestore_role)
        profile = {
            "uid": uid,
            "name": _display_name(decoded, email),
            "email": decoded.get("email"),
            "phone": decoded.get("phone_number"),
            "photoURL": decoded.get("picture"),
            "role": firestore_role,
            "createdAt": existing.to_dict().get("createdAt") if existing.exists and existing.to_dict() else now,
            "lastLoginAt": now,
            "provider": provider,
            "status": "active",
        }
        users.document(uid).set(profile, merge=True)
        local_user = auth_store.upsert_firebase_user(
            firebase_uid=uid,
            name=str(profile["name"]),
            email=email,
            role=internal_role,
            mfa_enabled=provider in {"phone", "password"},
        )
        return {"profile": profile, "local_user": local_user}

    def dashboard_metrics(self) -> dict[str, Any]:
        if not firebase_available():
            return {
                "total_incidents": 0,
                "open_incidents": 0,
                "resolved_incidents": 0,
                "active_users": 0,
                "today_alerts": 0,
                "resources_deployed": 0,
                "firebase_available": False,
                "service_account_path": settings.firebase_service_account_path,
            }

        def build() -> dict[str, Any]:
            db = get_firestore_client()
            incidents = [doc.to_dict() | {"id": doc.id} for doc in db.collection("incidents").stream()]
            users = [doc.to_dict() | {"id": doc.id} for doc in db.collection("users").stream()]
            alerts = [doc.to_dict() | {"id": doc.id} for doc in db.collection("alerts").stream()]
            resources = [doc.to_dict() | {"id": doc.id} for doc in db.collection("resources").stream()]
            return {
                "total_incidents": len(incidents),
                "open_incidents": len([incident for incident in incidents if incident.get("status") in {"active", "open", "investigating"}]),
                "resolved_incidents": len([incident for incident in incidents if incident.get("status") in {"resolved", "closed"}]),
                "active_users": len([user for user in users if user.get("status") == "active"]),
                "today_alerts": len(alerts),
                "resources_deployed": len([resource for resource in resources if resource.get("status") == "deployed"]),
                "firebase_available": firebase_available(),
            }

        return cached_call("firebase:dashboard", 5.0, build)

    def list_users(self) -> dict[str, Any]:
        db = get_firestore_client()
        users = [doc.to_dict() | {"id": doc.id} for doc in db.collection("users").stream()]
        return {"users": users, "count": len(users)}

    def update_user_role(self, uid: str, role: str) -> dict[str, Any]:
        db = get_firestore_client()
        normalized = "admin" if role == "admin" else "operator"
        db.collection("users").document(uid).set({"role": normalized, "updatedAt": _now()}, merge=True)
        return {"uid": uid, "role": normalized}

    def disable_user(self, uid: str, disabled: bool) -> dict[str, Any]:
        db = get_firestore_client()
        status_value = "disabled" if disabled else "active"
        db.collection("users").document(uid).set({"status": status_value, "updatedAt": _now()}, merge=True)
        return {"uid": uid, "status": status_value}

    def storage_status(self) -> dict[str, Any]:
        if not firebase_available():
            return {
                "bucket": settings.firebase_storage_bucket,
                "project_id": settings.firebase_project_id,
                "ready": False,
                "service_account_path": settings.firebase_service_account_path,
            }
        bucket = get_storage_bucket()
        return {"bucket": bucket.name, "project_id": settings.firebase_project_id, "ready": True}

    def require_admin(self, user: dict[str, object]) -> None:
        role = normalize_role(str(user.get("role") or "guest_viewer"))
        if role not in {"super_admin", "admin"}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")


firebase_live_service = FirebaseLiveService()
