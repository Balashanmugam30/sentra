from __future__ import annotations

from datetime import datetime, timezone

from app.perception.schemas import SensorZoneState

ZONE_NAMES = [f"Zone {index}" for index in range(1, 6)]


def _time_bucket(now: datetime | None = None) -> int:
    reference = now or datetime.now(timezone.utc)
    return int(reference.timestamp() // 5)


def _clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def _zone_number(zone: str) -> int:
    return int(zone.split()[-1])


def _fire_boost(bucket: int, zone_number: int) -> int:
    return 26 if (bucket + zone_number * 2) % 6 == 0 else 0


def _gas_boost(bucket: int, zone_number: int) -> int:
    return 34 if (bucket + zone_number * 3) % 8 == 3 else 0


def _crowd_boost(bucket: int, zone_number: int) -> int:
    return 28 if (bucket + zone_number) % 5 == 2 else 0


def _sensor_state(zone: str, bucket: int) -> SensorZoneState:
    zone_number = _zone_number(zone)
    temperature = 24 + ((bucket * 3 + zone_number * 11) % 34) + _fire_boost(bucket, zone_number)
    smoke = 8 + ((bucket * 5 + zone_number * 13) % 40) + (_fire_boost(bucket, zone_number) // 2)
    gas = 4 + ((bucket * 4 + zone_number * 17) % 36) + _gas_boost(bucket, zone_number)
    crowd = 28 + ((bucket * 6 + zone_number * 9) % 38) + _crowd_boost(bucket, zone_number)
    noise = 18 + ((bucket * 7 + zone_number * 7) % 34) + (_crowd_boost(bucket, zone_number) // 2)

    return SensorZoneState(
        zone=zone,
        temperature=_clamp(temperature, 20, 95),
        smoke_index=_clamp(smoke, 0, 100),
        gas_ppm=_clamp(gas, 0, 100),
        crowd_density=_clamp(crowd, 0, 100),
        noise_level=_clamp(noise, 0, 100),
    )


def generate_sensor_snapshot(now: datetime | None = None) -> list[SensorZoneState]:
    bucket = _time_bucket(now)
    return [_sensor_state(zone, bucket) for zone in ZONE_NAMES]

