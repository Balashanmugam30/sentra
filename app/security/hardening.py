"""Security header and request hardening middleware."""

from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.config import settings

WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def apply_security_headers(response) -> None:
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' ws: wss: http://localhost:8000 http://127.0.0.1:8000",
    )
    if settings.app_env.lower() in {"production", "enterprise"}:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")


async def security_headers_middleware(request: Request, call_next):
    if settings.emergency_read_only_mode and request.method.upper() in WRITE_METHODS:
        return JSONResponse(status_code=423, content={"detail": "Emergency read-only mode is active"})
    response = await call_next(request)
    if settings.secure_headers_enabled:
        apply_security_headers(response)
    return response

