from __future__ import annotations

from app.category_domination.models import COMPETITORS


def competitor_intelligence() -> list[dict[str, object]]:
    return COMPETITORS


def win_loss_reasons() -> dict[str, object]:
    return {
        "win_reasons": [
            "Unified command platform replaces fragmented crisis, growth, government, and executive tools.",
            "Autonomy OS and Data Empire OS compound prediction quality faster than competitors.",
            "Premium executive dashboards create board-level confidence during procurement.",
            "Tenant isolation, audit posture, and government command layer reduce enterprise risk.",
            "Marketplace, billing, CRM, and customer success systems prove full SaaS maturity.",
        ],
        "loss_reasons": [
            "Long public sector security review cycles.",
            "Legacy vendor bundle discounting in large renewals.",
            "Some buyers require regional hosting commitments before award.",
        ],
        "competitive_win_rate": 74,
        "replacement_rate": 67,
        "average_sales_cycle_days": 83,
    }


def killshot_cards() -> list[dict[str, object]]:
    return [
        {
            "theme": "Legacy suites cannot compound intelligence.",
            "sentra_advantage": "Data Empire OS links 14.8M signals/day into proprietary forecasts.",
            "competitor_gap": "Rivals sell dashboards; Sentra learns from every action.",
            "impact": "Prediction accuracy advantage +19%.",
        },
        {
            "theme": "Point tools fail executive trust.",
            "sentra_advantage": "Investor, Government, Autonomy, and Execution OS layers speak board language.",
            "competitor_gap": "Competitors stop at incident tickets and maps.",
            "impact": "Enterprise win rate 74%.",
        },
        {
            "theme": "Slow procurement needs proof.",
            "sentra_advantage": "Government trust engine, audit trail, RBAC, and tenancy are built-in.",
            "competitor_gap": "Legacy vendors require services-heavy hardening.",
            "impact": "11 government shortlists.",
        },
    ]

