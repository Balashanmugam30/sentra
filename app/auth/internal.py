from __future__ import annotations

import secrets

from fastapi import Request


INTERNAL_TOKEN_HEADERS = (
    "x-sentra-internal-token",
    "x-internal-api-key",
    "x-api-key",
)


def get_internal_token_from_request(request: Request) -> str | None:
    for header in INTERNAL_TOKEN_HEADERS:
        value = request.headers.get(header)
        if value:
            return value.strip()

    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("internal "):
        return authorization.split(" ", 1)[1].strip()

    return None


def has_internal_token(request: Request) -> bool:
    return get_internal_token_from_request(request) is not None


def is_valid_internal_request(request: Request) -> bool:
    expected = str(getattr(request.app.state.settings, "internal_api_key", "") or "").strip()
    supplied = get_internal_token_from_request(request)

    if not expected or len(expected) < 16 or not supplied:
        return False

    return secrets.compare_digest(supplied, expected)


def internal_request_identity() -> dict[str, object]:
    return {
        "auth_type": "internal_api_key",
        "email": "internal.pipeline@sentra.local",
        "role": "system",
        "user_id": "internal:simulator-pipeline",
    }
