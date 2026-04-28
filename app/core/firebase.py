from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import HTTPException, status

from app.core.config import settings

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
    from firebase_admin import credentials, firestore, storage
except ImportError:  # pragma: no cover - keeps local compile safe before pip install.
    firebase_admin = None  # type: ignore[assignment]
    firebase_auth = None  # type: ignore[assignment]
    credentials = None  # type: ignore[assignment]
    firestore = None  # type: ignore[assignment]
    storage = None  # type: ignore[assignment]


class FirebaseUnavailableError(RuntimeError):
    pass


def _service_account_path() -> Path:
    configured = Path(settings.firebase_service_account_path)
    if configured.is_absolute():
        return configured
    return Path(__file__).resolve().parents[2] / configured


@lru_cache(maxsize=1)
def firebase_available() -> bool:
    return firebase_admin is not None and _service_account_path().exists()


@lru_cache(maxsize=1)
def get_firebase_app():
    if firebase_admin is None or credentials is None:
        raise FirebaseUnavailableError("firebase-admin is not installed")

    service_account = _service_account_path()
    if not service_account.exists():
        raise FirebaseUnavailableError(
            f"Firebase service account not found at {service_account}. "
            "Place app/firebase-service-account.json or set FIREBASE_SERVICE_ACCOUNT_PATH."
        )

    if firebase_admin._apps:
        return firebase_admin.get_app()

    options: dict[str, str] = {"projectId": settings.firebase_project_id}
    if settings.firebase_storage_bucket:
        options["storageBucket"] = settings.firebase_storage_bucket

    return firebase_admin.initialize_app(credentials.Certificate(str(service_account)), options)


def require_firebase() -> None:
    try:
        get_firebase_app()
    except FirebaseUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


def get_firestore_client():
    require_firebase()
    return firestore.client(app=get_firebase_app())


def get_storage_bucket():
    require_firebase()
    return storage.bucket(app=get_firebase_app())


def verify_firebase_id_token(id_token: str) -> dict[str, Any]:
    require_firebase()
    try:
        return firebase_auth.verify_id_token(id_token, app=get_firebase_app(), check_revoked=True)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase ID token") from exc
