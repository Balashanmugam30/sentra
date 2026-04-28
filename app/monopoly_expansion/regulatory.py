from __future__ import annotations


def regulatory_watch() -> dict[str, object]:
    return {
        "antitrust_risk": "moderate-low",
        "public_trust_score": 88,
        "compliance_posture": 92,
        "procurement_fairness": 91,
        "data_portability": 86,
        "interoperability_score": 89,
        "risk_register": [
            {"risk": "Large bundle perceived as closed ecosystem", "severity": "medium", "mitigation": "publish interoperability and export controls"},
            {"risk": "Government procurement concentration", "severity": "medium", "mitigation": "maintain transparent benchmark criteria"},
            {"risk": "Data gravity concerns", "severity": "low", "mitigation": "tenant-owned data contracts and deletion workflows"},
        ],
    }

