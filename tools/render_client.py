"""
Render Management Client for Antigravity & Sentra Operations.
Communicates directly with https://api.render.com/v1 using authenticated API keys.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any

SERVICE_ID = "srv-d7og1jreo5us73e6un70"
BASE_URL = "https://api.render.com/v1"


def get_api_key() -> str:
    # 1. Process environment
    val = os.getenv("RENDER_API_KEY")
    if val and val.strip():
        return val.strip()

    # 2. Windows registry user environment
    if sys.platform == "win32":
        try:
            import winreg

            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment") as key:
                reg_val, _ = winreg.QueryValueEx(key, "RENDER_API_KEY")
                if reg_val and reg_val.strip():
                    return reg_val.strip()
        except Exception:
            pass

    # 3. .env file if available
    try:
        from pathlib import Path

        for env_path in (Path(".env"), Path("../.env")):
            if env_path.is_file():
                for line in env_path.read_text(encoding="utf-8").splitlines():
                    if line.startswith("RENDER_API_KEY="):
                        k = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if k:
                            return k
    except Exception:
        pass

    raise RuntimeError("RENDER_API_KEY is not configured in process environment or user registry.")


def render_request(method: str, path: str, data: dict[str, Any] | None = None) -> Any:
    key = get_api_key()
    url = f"{BASE_URL}/{path.lstrip('/')}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    headers = {
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read().decode("utf-8")
            if not content.strip():
                return {}
            return json.loads(content)
    except urllib.error.HTTPError as error:
        err_msg = error.read().decode("utf-8")
        raise RuntimeError(f"Render API error {error.code} on {path}: {err_msg}") from error


def get_status() -> dict[str, Any]:
    owners = render_request("GET", "owners")
    svc = render_request("GET", f"services/{SERVICE_ID}")
    deploys = render_request("GET", f"services/{SERVICE_ID}/deploys?limit=5")
    return {
        "owners": owners,
        "service": svc,
        "deploys": deploys,
    }


def trigger_deploy(clear_cache: bool = False) -> dict[str, Any]:
    payload = {"clearCache": "clear" if clear_cache else "do_not_clear"}
    return render_request("POST", f"services/{SERVICE_ID}/deploys", payload)


def get_env_vars() -> list[dict[str, Any]]:
    return render_request("GET", f"services/{SERVICE_ID}/env-vars")


def update_env_vars(env_vars: list[dict[str, str]]) -> list[dict[str, Any]]:
    # format: [{"key": "FOO", "value": "BAR"}]
    return render_request("PUT", f"services/{SERVICE_ID}/env-vars", env_vars)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "deploy":
        res = trigger_deploy(clear_cache="--clear-cache" in sys.argv)
        print("Deploy triggered:", json.dumps(res, indent=2))
    elif len(sys.argv) > 1 and sys.argv[1] == "env":
        print(json.dumps(get_env_vars(), indent=2))
    else:
        status = get_status()
        svc = status.get("service", {})
        print(f"Service Name: {svc.get('name')}")
        print(f"Service ID: {svc.get('id')}")
        print(f"Service URL: {svc.get('serviceDetails', {}).get('url')}")
        print(f"Suspended: {svc.get('suspended')}")
        print("\nRecent Deploys:")
        for item in status.get("deploys", []):
            d = item.get("deploy", {})
            c = d.get("commit", {})
            sha = c.get("id", "none")[:7] if c.get("id") else "none"
            msg = c.get("message", "").strip().split("\n")[0][:50]
            print(f"- Deploy {d.get('id')}: {d.get('status')} | commit {sha} | {msg} | created: {d.get('createdAt')}")
