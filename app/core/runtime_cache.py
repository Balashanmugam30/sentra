from __future__ import annotations

from copy import deepcopy
from threading import Event, Lock
from time import monotonic
from typing import Callable, TypeVar

T = TypeVar("T")

_cache_lock = Lock()
_cache_store: dict[str, dict[str, object]] = {}
_inflight_events: dict[str, Event] = {}
_cache_stats = {
    "hits": 0,
    "misses": 0,
    "writes": 0,
    "singleflight_waits": 0,
}


def cached_call(key: str, ttl_seconds: float, builder: Callable[[], T]) -> T:
    now = monotonic()

    with _cache_lock:
        cached = _cache_store.get(key)
        if cached is not None and float(cached["expires_at"]) > now:
            _cache_stats["hits"] += 1
            return deepcopy(cached["value"])  # type: ignore[return-value]
        _cache_stats["misses"] += 1

        inflight = _inflight_events.get(key)
        if inflight is None:
            inflight = Event()
            _inflight_events[key] = inflight
            owner = True
        else:
            owner = False
            _cache_stats["singleflight_waits"] += 1

    if not owner:
        inflight.wait(timeout=max(0.5, ttl_seconds))
        with _cache_lock:
            cached = _cache_store.get(key)
            if cached is not None:
                value = deepcopy(cached["value"])
                if float(cached["expires_at"]) <= monotonic() and isinstance(value, dict):
                    value.setdefault("partial", True)
                    value.setdefault("stale_data", True)
                return value  # type: ignore[return-value]

    try:
        value = builder()
    except Exception:
        with _cache_lock:
            waiting_event = _inflight_events.pop(key, None)
            if waiting_event is not None:
                waiting_event.set()
            stale_cached = _cache_store.get(key)
            if stale_cached is not None:
                stale_value = deepcopy(stale_cached["value"])
                if isinstance(stale_value, dict):
                    stale_value.setdefault("partial", True)
                    stale_value.setdefault("stale_data", True)
                return stale_value  # type: ignore[return-value]
        raise

    with _cache_lock:
        _cache_store[key] = {
            "expires_at": monotonic() + ttl_seconds,
            "value": deepcopy(value),
        }
        _cache_stats["writes"] += 1
        waiting_event = _inflight_events.pop(key, None)
        if waiting_event is not None:
            waiting_event.set()

    return deepcopy(value)


def get_runtime_cache_stats() -> dict[str, int]:
    with _cache_lock:
        return {
            "entries": len(_cache_store),
            "inflight": len(_inflight_events),
            **_cache_stats,
        }


def clear_runtime_cache(prefix: str | None = None) -> None:
    with _cache_lock:
        if prefix is None:
            _cache_store.clear()
            return
        for key in list(_cache_store.keys()):
            if key.startswith(prefix):
                _cache_store.pop(key, None)
