from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4

from app.core.config import settings


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class AuthStore:
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._lock = Lock()
        self._path.parent.mkdir(parents=True, exist_ok=True)

    def _default_payload(self) -> dict[str, Any]:
        return {"users": [], "sessions": []}

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return self._default_payload()
        try:
            return json.loads(self._path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return self._default_payload()

    def _write(self, payload: dict[str, Any]) -> None:
        self._path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def has_users(self) -> bool:
        with self._lock:
            payload = self._read()
            return len(payload["users"]) > 0

    def list_users(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._read()["users"])

    def get_user_by_email(self, email: str) -> dict[str, Any] | None:
        normalized = email.strip().lower()
        with self._lock:
            for user in self._read()["users"]:
                if user["email"] == normalized:
                    return dict(user)
        return None

    def get_user_by_id(self, user_id: str) -> dict[str, Any] | None:
        with self._lock:
            for user in self._read()["users"]:
                if user["user_id"] == user_id:
                    return dict(user)
        return None

    def create_user(
        self,
        *,
        name: str,
        email: str,
        password_hash: str,
        role: str,
    ) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            now = _utc_now().isoformat()
            user = {
                "user_id": f"USR-{uuid4().hex[:10]}",
                "name": name.strip(),
                "email": email.strip().lower(),
                "password_hash": password_hash,
                "role": role,
                "is_active": True,
                "mfa_enabled": False,
                "created_at": now,
                "last_login": None,
            }
            payload["users"].append(user)
            self._write(payload)
            return dict(user)

    def upsert_firebase_user(
        self,
        *,
        firebase_uid: str,
        name: str,
        email: str,
        role: str,
        mfa_enabled: bool = False,
    ) -> dict[str, Any]:
        normalized_email = email.strip().lower()
        with self._lock:
            payload = self._read()
            now = _utc_now().isoformat()
            for user in payload["users"]:
                if user["user_id"] == firebase_uid or user["email"] == normalized_email:
                    user["name"] = name.strip() or str(user.get("name") or normalized_email)
                    user["email"] = normalized_email
                    user["role"] = user.get("role") or role
                    user["mfa_enabled"] = bool(user.get("mfa_enabled") or mfa_enabled)
                    user["last_login"] = now
                    user["firebase_uid"] = firebase_uid
                    user["auth_provider"] = "firebase"
                    self._write(payload)
                    return dict(user)

            user = {
                "user_id": firebase_uid,
                "name": name.strip() or normalized_email,
                "email": normalized_email,
                "password_hash": f"firebase:{firebase_uid}",
                "role": role,
                "is_active": True,
                "mfa_enabled": mfa_enabled,
                "created_at": now,
                "last_login": now,
                "firebase_uid": firebase_uid,
                "auth_provider": "firebase",
            }
            payload["users"].append(user)
            self._write(payload)
            return dict(user)

    def update_user(
        self,
        user_id: str,
        *,
        name: str | None = None,
        password_hash: str | None = None,
        role: str | None = None,
        last_login: datetime | None = None,
        mfa_enabled: bool | None = None,
    ) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            for user in payload["users"]:
                if user["user_id"] != user_id:
                    continue
                if name is not None:
                    user["name"] = name.strip()
                if password_hash is not None:
                    user["password_hash"] = password_hash
                if role is not None:
                    user["role"] = role
                if last_login is not None:
                    user["last_login"] = last_login.isoformat()
                if mfa_enabled is not None:
                    user["mfa_enabled"] = mfa_enabled
                self._write(payload)
                return dict(user)
        return None

    def store_refresh_session(
        self,
        *,
        session_id: str,
        user_id: str,
        expires_at: datetime,
        issued_at: datetime,
        revoked: bool = False,
    ) -> dict[str, Any]:
        with self._lock:
            payload = self._read()
            session = {
                "session_id": session_id,
                "user_id": user_id,
                "issued_at": issued_at.isoformat(),
                "expires_at": expires_at.isoformat(),
                "revoked": revoked,
                "revoked_at": None,
            }
            payload["sessions"] = [
                existing for existing in payload["sessions"] if existing["session_id"] != session_id
            ]
            payload["sessions"].append(session)
            self._write(payload)
            return dict(session)

    def get_refresh_session(self, session_id: str) -> dict[str, Any] | None:
        with self._lock:
            for session in self._read()["sessions"]:
                if session["session_id"] == session_id:
                    return dict(session)
        return None

    def list_user_sessions(self, user_id: str) -> list[dict[str, Any]]:
        with self._lock:
            return [
                dict(session)
                for session in self._read()["sessions"]
                if session["user_id"] == user_id
            ]

    def revoke_refresh_session(self, session_id: str) -> dict[str, Any] | None:
        with self._lock:
            payload = self._read()
            for session in payload["sessions"]:
                if session["session_id"] != session_id:
                    continue
                session["revoked"] = True
                session["revoked_at"] = _utc_now().isoformat()
                self._write(payload)
                return dict(session)
        return None

    def revoke_all_user_sessions(self, user_id: str) -> int:
        with self._lock:
            payload = self._read()
            count = 0
            for session in payload["sessions"]:
                if session["user_id"] == user_id and not session["revoked"]:
                    session["revoked"] = True
                    session["revoked_at"] = _utc_now().isoformat()
                    count += 1
            if count:
                self._write(payload)
            return count

    def clear_all(self) -> None:
        with self._lock:
            self._write(self._default_payload())


auth_store = AuthStore(settings.auth_store_path)
