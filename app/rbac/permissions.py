from __future__ import annotations

from typing import Literal

EnterpriseRole = Literal[
    "super_admin",
    "admin",
    "security_manager",
    "staff",
    "responder",
    "analyst",
    "guest_viewer",
    # Legacy roles remain accepted so older modules continue to authorize safely.
    "executive",
    "operations_commander",
    "communications_lead",
    "security_lead",
    "viewer",
]

PermissionName = Literal[
    "dashboard.view",
    "alerts.view",
    "alerts.trigger",
    "incidents.view",
    "incidents.manage",
    "analytics.view",
    "analytics.executive",
    "routes.view",
    "routes.manage",
    "zones.manage",
    "staff.coordinate",
    "tasks.update",
    "operations.manage",
    "governance.approve",
    "facility.control",
    "hardware.control",
    "field.respond",
    "field.manage",
    "responder.tools",
    "reports.view",
    "reports.export",
    "settings.manage",
    "users.manage",
    "roles.manage",
    "system.admin",
]

ENTERPRISE_ROLES: tuple[EnterpriseRole, ...] = (
    "super_admin",
    "admin",
    "security_manager",
    "staff",
    "responder",
    "analyst",
    "guest_viewer",
)

LEGACY_ENTERPRISE_ROLES: tuple[EnterpriseRole, ...] = (
    "executive",
    "operations_commander",
    "communications_lead",
    "security_lead",
    "viewer",
)

ALL_PERMISSIONS: tuple[PermissionName, ...] = (
    "dashboard.view",
    "alerts.view",
    "alerts.trigger",
    "incidents.view",
    "incidents.manage",
    "analytics.view",
    "analytics.executive",
    "routes.view",
    "routes.manage",
    "zones.manage",
    "staff.coordinate",
    "tasks.update",
    "operations.manage",
    "governance.approve",
    "facility.control",
    "hardware.control",
    "field.respond",
    "field.manage",
    "responder.tools",
    "reports.view",
    "reports.export",
    "settings.manage",
    "users.manage",
    "roles.manage",
    "system.admin",
)

ROLE_PERMISSIONS: dict[EnterpriseRole, tuple[PermissionName, ...]] = {
    "super_admin": ALL_PERMISSIONS,
    "admin": (
        "dashboard.view",
        "alerts.view",
        "alerts.trigger",
        "incidents.view",
        "incidents.manage",
        "analytics.view",
        "analytics.executive",
        "routes.view",
        "routes.manage",
        "operations.manage",
        "governance.approve",
        "reports.view",
        "reports.export",
        "settings.manage",
        "users.manage",
    ),
    "security_manager": (
        "dashboard.view",
        "alerts.view",
        "alerts.trigger",
        "incidents.view",
        "incidents.manage",
        "routes.view",
        "routes.manage",
        "zones.manage",
        "staff.coordinate",
        "operations.manage",
        "governance.approve",
        "facility.control",
        "hardware.control",
        "field.respond",
        "field.manage",
        "responder.tools",
        "reports.view",
        "reports.export",
    ),
    "staff": (
        "dashboard.view",
        "alerts.view",
        "incidents.view",
        "routes.view",
        "tasks.update",
        "field.respond",
    ),
    "responder": (
        "dashboard.view",
        "alerts.view",
        "incidents.view",
        "routes.view",
        "field.respond",
        "responder.tools",
    ),
    "analyst": (
        "dashboard.view",
        "alerts.view",
        "incidents.view",
        "analytics.view",
        "reports.view",
        "reports.export",
    ),
    "guest_viewer": (
        "dashboard.view",
        "alerts.view",
        "routes.view",
    ),
    "executive": (
        "dashboard.view",
        "alerts.view",
        "incidents.view",
        "analytics.view",
        "analytics.executive",
        "governance.approve",
        "reports.view",
        "reports.export",
    ),
    "operations_commander": (
        "dashboard.view",
        "alerts.view",
        "alerts.trigger",
        "incidents.view",
        "incidents.manage",
        "routes.view",
        "routes.manage",
        "operations.manage",
        "governance.approve",
        "field.manage",
        "field.respond",
        "responder.tools",
        "reports.view",
        "reports.export",
    ),
    "communications_lead": (
        "dashboard.view",
        "alerts.view",
        "incidents.view",
        "analytics.view",
        "reports.view",
        "reports.export",
    ),
    "security_lead": (
        "dashboard.view",
        "alerts.view",
        "alerts.trigger",
        "incidents.view",
        "incidents.manage",
        "routes.view",
        "routes.manage",
        "zones.manage",
        "facility.control",
        "hardware.control",
        "field.manage",
        "field.respond",
        "responder.tools",
        "reports.view",
    ),
    "viewer": (
        "dashboard.view",
        "alerts.view",
        "routes.view",
    ),
}

PERMISSION_MODULE_MAP: dict[PermissionName, tuple[str, ...]] = {
    "dashboard.view": ("overview", "summary"),
    "alerts.view": ("alerts", "notifications"),
    "alerts.trigger": ("alerts", "emergency_actions"),
    "incidents.view": ("incidents", "situational_awareness"),
    "incidents.manage": ("incidents", "incident_command"),
    "analytics.view": ("analytics", "trends", "forecast"),
    "analytics.executive": ("executive", "boardroom"),
    "routes.view": ("routing", "personal_route"),
    "routes.manage": ("routing", "route_command"),
    "zones.manage": ("zones", "facility_scope"),
    "staff.coordinate": ("staff", "coordination"),
    "tasks.update": ("tasks", "field_updates"),
    "operations.manage": ("operations", "workflows", "scenario_lab"),
    "governance.approve": ("governance", "approvals"),
    "facility.control": ("facility", "lockdown"),
    "hardware.control": ("hardware", "devices"),
    "field.respond": ("field", "tasks"),
    "field.manage": ("field_command", "responder_grid"),
    "responder.tools": ("responder", "missions"),
    "reports.view": ("reports",),
    "reports.export": ("reports", "exports"),
    "settings.manage": ("settings",),
    "users.manage": ("user_admin",),
    "roles.manage": ("role_admin",),
    "system.admin": ("admin", "system"),
}

LEGACY_ROLE_MAP: dict[str, EnterpriseRole] = {
    "admin": "admin",
    "operator": "security_manager",
    "staff": "staff",
    "guest": "guest_viewer",
    "viewer": "viewer",
    "executive": "executive",
    "operations_commander": "operations_commander",
    "communications_lead": "communications_lead",
    "security_lead": "security_lead",
}

ROLE_ROUTE_ALIASES: dict[EnterpriseRole, set[str]] = {
    "super_admin": {"super_admin", "admin", "executive", "operations_commander", "security_lead"},
    "admin": {"admin", "executive", "operations_commander", "security_lead"},
    "security_manager": {"security_manager", "operations_commander", "security_lead"},
    "staff": {"staff", "communications_lead"},
    "responder": {"responder"},
    "analyst": {"analyst", "viewer"},
    "guest_viewer": {"guest_viewer", "viewer"},
    "executive": {"executive", "admin"},
    "operations_commander": {"operations_commander", "security_manager"},
    "communications_lead": {"communications_lead", "staff"},
    "security_lead": {"security_lead", "security_manager"},
    "viewer": {"viewer", "guest_viewer"},
}

DEMO_USERS: tuple[dict[str, str], ...] = (
    {
        "name": "Sentra Admin",
        "email": "admin@sentra.demo",
        "password": "SentraDemo!2026",
        "role": "admin",
    },
    {
        "name": "Security Manager",
        "email": "manager@sentra.demo",
        "password": "SentraDemo!2026",
        "role": "security_manager",
    },
    {
        "name": "Zone Staff",
        "email": "staff@sentra.demo",
        "password": "SentraDemo!2026",
        "role": "staff",
    },
    {
        "name": "Responder Team",
        "email": "responder@sentra.demo",
        "password": "SentraDemo!2026",
        "role": "responder",
    },
    {
        "name": "Analytics Specialist",
        "email": "analyst@sentra.demo",
        "password": "SentraDemo!2026",
        "role": "analyst",
    },
)


def normalize_role(role: str) -> EnterpriseRole:
    normalized = role.strip().lower()
    if normalized in ENTERPRISE_ROLES or normalized in LEGACY_ENTERPRISE_ROLES:
        return normalized  # type: ignore[return-value]
    return LEGACY_ROLE_MAP.get(normalized, "guest_viewer")


def get_permissions_for_role(role: str) -> list[str]:
    normalized = normalize_role(role)
    return list(ROLE_PERMISSIONS[normalized])


def get_accessible_modules_for_permissions(permissions: list[str]) -> list[str]:
    modules: set[str] = set()
    for permission in permissions:
        for module in PERMISSION_MODULE_MAP.get(permission, ()):
            modules.add(module)
    return sorted(modules)


def get_security_level_for_role(role: str) -> str:
    normalized = normalize_role(role)
    if normalized == "super_admin":
        return "tier_1"
    if normalized in {"admin", "security_manager", "executive", "operations_commander", "security_lead"}:
        return "tier_2"
    if normalized in {"staff", "responder", "analyst", "communications_lead"}:
        return "tier_3"
    return "tier_4"


def role_matches(role: str, allowed_roles: set[str] | tuple[str, ...] | list[str]) -> bool:
    normalized = normalize_role(role)
    aliases = ROLE_ROUTE_ALIASES.get(normalized, {normalized})
    return bool(aliases.intersection(set(allowed_roles)))
