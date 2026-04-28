"""Write a deterministic release version stamp."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path


def main() -> int:
    path = Path(os.getenv("SENTRA_RELEASE_VERSION_FILE", "release_version.json"))
    payload = {
        "version": os.getenv("SENTRA_APP_VERSION", "0.1.0"),
        "channel": os.getenv("SENTRA_RELEASE_CHANNEL", os.getenv("APP_ENV", "development")),
        "commit": os.getenv("SENTRA_RELEASE_COMMIT_SHA", "local"),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

