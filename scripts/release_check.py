"""Sentra release gate: compile, environment validation, and smoke-safe checks."""

from __future__ import annotations

import json
import subprocess
import sys


def run(command: list[str]) -> dict[str, object]:
    completed = subprocess.run(command, text=True, capture_output=True, check=False)
    return {
        "command": " ".join(command),
        "returncode": completed.returncode,
        "stdout": completed.stdout[-4000:],
        "stderr": completed.stderr[-4000:],
    }


def main() -> int:
    checks = [
        run([sys.executable, "-m", "compileall", "app"]),
        run(["npm", "run", "lint"]),
        run(["npm", "run", "typecheck"]),
        run(["npm", "run", "build"]),
    ]
    ok = all(check["returncode"] == 0 for check in checks)
    print(json.dumps({"ok": ok, "checks": checks}, indent=2))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())

