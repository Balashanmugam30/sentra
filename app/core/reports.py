from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable


def build_executive_pdf_report(snapshot: dict[str, object]) -> bytes:
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    health = snapshot.get("health", {})
    alerts = snapshot.get("alerts", [])
    tenant = snapshot.get("tenant", {})
    organization_name = tenant.get("organization_name", "Sentra") if isinstance(tenant, dict) else "Sentra"
    report_header = (
        tenant.get("pdf_report_header", f"{organization_name} Executive Resilience Report")
        if isinstance(tenant, dict)
        else "SENTRA EXECUTIVE RESILIENCE REPORT"
    )
    summary_lines = [
        str(report_header).upper(),
        f"Organization: {organization_name}",
        f"Generated: {generated_at}",
        "",
        "Strategic posture",
        "- Platform status: operational",
        f"- Version: {snapshot.get('version', 'unknown')}",
        f"- Environment: {snapshot.get('environment', 'unknown')}",
        "",
        "Operational evidence",
        f"- Health domains tracked: {_safe_len(health)}",
        f"- Active alerts: {_safe_len(alerts)}",
        "- Audit trail: hash-chained and review-ready",
        "- SOC telemetry: enabled",
        "- Crisis intelligence: GIS, environment, public safety, and OSINT fused",
        "",
        "Executive decision note",
        "Sentra is operating in launch-ready demo mode with protected access,",
        "observable infrastructure, and exportable compliance evidence.",
    ]
    return _build_simple_pdf(summary_lines)


def _safe_len(value: object) -> int:
    if isinstance(value, dict | list | tuple | set):
        return len(value)
    return 0


def _escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_simple_pdf(lines: Iterable[str]) -> bytes:
    y = 760
    text_parts = ["BT", "/F1 17 Tf", "72 800 Td"]
    for index, line in enumerate(lines):
        font_size = 17 if index == 0 else 10
        text_parts.append(f"/F1 {font_size} Tf")
        text_parts.append(f"72 {y} Td")
        text_parts.append(f"({_escape_pdf_text(line)}) Tj")
        y = -18
    text_parts.append("ET")
    content_stream = "\n".join(text_parts).encode("latin-1", errors="replace")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(content_stream)).encode("ascii") + b" >>\nstream\n" + content_stream + b"\nendstream",
    ]

    body = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for object_number, obj in enumerate(objects, start=1):
        offsets.append(len(body))
        body.extend(f"{object_number} 0 obj\n".encode("ascii"))
        body.extend(obj)
        body.extend(b"\nendobj\n")

    xref_offset = len(body)
    body.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    body.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        body.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    body.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode(
            "ascii"
        )
    )
    return bytes(body)
