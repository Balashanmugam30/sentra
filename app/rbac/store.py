from __future__ import annotations

from datetime import datetime

from app.auth.security import hash_password
from app.auth.store import auth_store
from app.rbac.permissions import (
    DEMO_USERS,
    get_accessible_modules_for_permissions,
    get_permissions_for_role,
    get_security_level_for_role,
    normalize_role,
)


def _parse_datetime(value: object) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(str(value))


def serialize_user(user: dict[str, object]) -> dict[str, object]:
    role = normalize_role(str(user["role"]))
    permissions = get_permissions_for_role(role)
    return {
        "id": str(user["user_id"]),
        "name": str(user["name"]),
        "email": str(user["email"]),
        "role": role,
        "permissions": permissions,
        "accessible_modules": get_accessible_modules_for_permissions(permissions),
        "security_level": get_security_level_for_role(role),
        "is_active": bool(user["is_active"]),
        "last_login": _parse_datetime(user.get("last_login")),
    }


def list_serialized_users() -> list[dict[str, object]]:
    return [serialize_user(user) for user in auth_store.list_users()]


def assign_role_to_user(*, email: str, role: str) -> dict[str, object]:
    user = auth_store.get_user_by_email(email)
    if user is None:
        raise ValueError(f"User '{email}' not found")
    updated = auth_store.update_user(str(user["user_id"]), role=normalize_role(role))
    return serialize_user(updated or user)


def seed_demo_users() -> tuple[int, int, list[dict[str, object]]]:
    created_count = 0
    updated_count = 0
    result_users: list[dict[str, object]] = []

    for demo in DEMO_USERS:
        existing = auth_store.get_user_by_email(demo["email"])
        if existing is None:
            created = auth_store.create_user(
                name=demo["name"],
                email=demo["email"],
                password_hash=hash_password(demo["password"]),
                role=normalize_role(demo["role"]),
            )
            created_count += 1
            result_users.append(serialize_user(created))
            continue

        updated = auth_store.update_user(
            str(existing["user_id"]),
            name=demo["name"],
            password_hash=hash_password(demo["password"]),
            role=normalize_role(demo["role"]),
        )
        updated_count += 1
        result_users.append(serialize_user(updated or existing))

    return created_count, updated_count, result_users
