"""Lightweight IP throttling for production-safe API protection."""

from __future__ import annotations

from collections import defaultdict, deque
from time import time
from typing import Deque

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.config import settings

_requests: dict[str, Deque[float]] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def check_ip_rate_limit(request: Request) -> tuple[bool, dict[str, object]]:
    now = time()
    window = settings.ip_rate_limit_window_seconds
    limit = settings.ip_rate_limit_max_requests
    ip = _client_ip(request)
    bucket = _requests[ip]
    while bucket and bucket[0] < now - window:
        bucket.popleft()
    bucket.append(now)
    remaining = max(0, limit - len(bucket))
    return len(bucket) <= limit, {"ip": ip, "limit": limit, "remaining": remaining, "window_seconds": window}


async def ip_rate_limit_middleware(request: Request, call_next):
    ok, payload = check_ip_rate_limit(request)
    if not ok:
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded", **payload})
    response = await call_next(request)
    response.headers["X-Sentra-RateLimit-Remaining"] = str(payload["remaining"])
    return response

