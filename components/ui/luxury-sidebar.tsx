"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { KeyboardEvent, WheelEvent, useCallback, useEffect, useMemo, useState } from "react";

import { RoleBadge } from "@/components/security/role-badge";
import { useRbac } from "@/lib/rbac/use-rbac";
import { useAuthStore } from "@/store/auth-store";
import type { AppPermission } from "@/types/rbac";
import { useLiveDataStore } from "@/lib/realtime/live-data-store";
import { useLiveDataEngine } from "@/lib/realtime/use-live-data";
import { useWorkspace, type WorkspaceMode } from "@/lib/workspace/useWorkspace";

type ShellIconName =
  | "launch"
  | "security"
  | "intelligence"
  | "operations"
  | "ai"
  | "infrastructure"
  | "executive"
  | "incident"
  | "twin"
  | "soc"
  | "profile"
  | "settings"
  | "collapse"
  | "search"
  | "lock"
  | "spark";

type LuxurySidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onMobileOpenChange: (open: boolean) => void;
  onOpenCommand: () => void;
};

type NavItem = {
  description: string;
  href: Route;
  icon: ShellIconName;
  label: string;
  match?: string[];
  mode?: WorkspaceMode;
  permissions?: AppPermission[];
  premium?: boolean;
};

type NavGroup = {
  items: NavItem[];
  label: string;
};

const navGroups: NavGroup[] = [
  {
    label: "Core",
    items: [
      {
        description: "Workspace overview",
        href: "/app" as Route,
        icon: "launch",
        label: "Dashboard",
        match: ["/app", "/app/dashboard", "/dashboard"],
        permissions: ["dashboard.view"],
      },
      {
        description: "Analytics and operating evidence",
        href: "/app/analytics" as Route,
        icon: "intelligence",
        label: "Analytics",
        match: ["/app/analytics", "/analytics", "/data", "/behavior"],
        permissions: ["analytics.view", "analytics.executive"],
      },
      {
        description: "AI decision support",
        href: "/app/ai-council" as Route,
        icon: "ai",
        label: "AI Council",
        match: ["/app/ai-council", "/ai-council", "/ai", "/ml"],
        premium: true,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        description: "Live incident queue",
        href: "/app/incidents" as Route,
        icon: "incident",
        label: "Incidents",
        match: ["/app/incidents", "/incidents"],
        permissions: ["incidents.view"],
      },
      {
        description: "Execution, responders, recovery",
        href: "/operations/execution",
        icon: "operations",
        label: "Operations",
        match: ["/operations"],
        permissions: ["operations.manage", "field.respond", "field.manage"],
      },
      {
        description: "Deployment and capacity",
        href: "/operations/resources",
        icon: "operations",
        label: "Resources",
        match: ["/operations/resources"],
        permissions: ["operations.manage", "field.manage"],
      },
      {
        description: "Recovery and continuity",
        href: "/operations/recovery",
        icon: "security",
        label: "Recovery",
        match: ["/operations/recovery"],
        permissions: ["operations.manage", "reports.view"],
      },
      {
        description: "Mobile companion & field SOS",
        href: "/mobile/home" as Route,
        icon: "launch",
        label: "Field Mobile App",
        match: ["/mobile"],
      },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      {
        description: "Digital twin and facility state",
        href: "/twin/live",
        icon: "infrastructure",
        label: "Live Twin",
        match: ["/live-twin", "/twin"],
        permissions: ["routes.view", "facility.control", "hardware.control"],
      },
      {
        description: "Security operations center",
        href: "/soc" as Route,
        icon: "soc",
        label: "SOC",
        match: ["/soc", "/security/soc", "/security/threats", "/security/zero-trust"],
        permissions: ["system.admin", "users.manage", "roles.manage"],
        premium: true,
      },
      {
        description: "Forecast and risk modeling",
        href: "/twin/predictive",
        icon: "spark",
        label: "Predictions",
        match: ["/twin/predictive", "/ml/inference"],
        permissions: ["analytics.view", "analytics.executive"],
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        description: "Cloud tenant command",
        href: "/cloud/tenants",
        icon: "twin",
        label: "Cloud",
        match: ["/cloud"],
        permissions: ["system.admin", "users.manage", "roles.manage"],
        premium: true,
      },
      {
        description: "Boardroom intelligence suite",
        href: "/executive",
        icon: "executive",
        label: "Executive",
        match: ["/executive", "/board", "/investor", "/revenue", "/growth"],
        permissions: ["analytics.executive", "reports.view", "reports.export"],
        premium: true,
      },
      {
        description: "Board-ready evidence",
        href: "/board/executive",
        icon: "intelligence",
        label: "Reports",
        match: ["/board", "/launch/executive"],
        permissions: ["reports.view", "reports.export", "analytics.executive"],
        premium: true,
      },
      {
        description: "Users and access",
        href: "/security/users",
        icon: "profile",
        label: "Team",
        match: ["/security/users", "/security/organizations"],
        permissions: ["users.manage", "roles.manage", "system.admin"],
        premium: true,
      },
      {
        description: "Appearance and session settings",
        href: "/app/settings",
        icon: "settings",
        label: "Settings",
        match: ["/app/settings"],
      },
    ],
  },
];

const pinnedNav: NavItem[] = [];

function isDashboardPath(pathname: string) {
  return pathname === "/app" || pathname === "/app/dashboard" || pathname === "/dashboard";
}

function isActive(pathname: string, item: NavItem, currentMode: WorkspaceMode) {
  if (item.mode) {
    return isDashboardPath(pathname) && item.mode === currentMode;
  }

  const matches = item.match ?? [item.href];

  return matches.some((match) => {
    if (match === "/app") {
      return pathname === "/app" || pathname === "/app/dashboard";
    }

    return pathname === match || pathname.startsWith(`${match}/`);
  });
}

function ShellIcon({ name }: { name: ShellIconName }) {
  const common = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.75,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "launch":
      return (
        <svg {...common}>
          <path d="M4.5 15.5 12 3l7.5 12.5-7.5 5-7.5-5Z" />
          <path d="M12 3v17.5" />
          <path d="m7.5 13 4.5 3 4.5-3" />
        </svg>
      );
    case "security":
      return (
        <svg {...common}>
          <path d="M12 3.5 19 6v5.2c0 4.2-2.7 7.9-7 9.3-4.3-1.4-7-5.1-7-9.3V6l7-2.5Z" />
          <path d="m9.4 12.2 1.8 1.8 3.7-4" />
        </svg>
      );
    case "intelligence":
      return (
        <svg {...common}>
          <path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
          <path d="M4.7 9h14.6" />
          <path d="M4.7 15h14.6" />
          <path d="M12 4c2.1 2.2 3.1 4.9 3.1 8s-1 5.8-3.1 8c-2.1-2.2-3.1-4.9-3.1-8s1-5.8 3.1-8Z" />
        </svg>
      );
    case "operations":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
          <path d="M8 5v4" />
          <path d="M16 10v4" />
          <path d="M11 15v4" />
        </svg>
      );
    case "ai":
      return (
        <svg {...common}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="M7.8 7.8 5 5" />
          <path d="m19 19-2.8-2.8" />
          <circle cx="12" cy="12" r="3.6" />
        </svg>
      );
    case "infrastructure":
      return (
        <svg {...common}>
          <path d="M4 20h16" />
          <path d="M6 20V8l6-4 6 4v12" />
          <path d="M9 20v-6h6v6" />
          <path d="M9 10h.01" />
          <path d="M12 10h.01" />
          <path d="M15 10h.01" />
        </svg>
      );
    case "executive":
      return (
        <svg {...common}>
          <path d="M5 19V5" />
          <path d="M5 19h15" />
          <path d="m8 15 3-3 2.5 2.5L19 8" />
          <path d="M16 8h3v3" />
        </svg>
      );
    case "incident":
      return (
        <svg {...common}>
          <path d="M12 4 3.5 19h17L12 4Z" />
          <path d="M12 9v4" />
          <path d="M12 16h.01" />
        </svg>
      );
    case "twin":
      return (
        <svg {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="M12 12 4 7.5" />
          <path d="m12 12 8-4.5" />
          <path d="M12 12v9" />
        </svg>
      );
    case "soc":
      return (
        <svg {...common}>
          <path d="M4 18V6h16v12H4Z" />
          <path d="M7 15h2" />
          <path d="M11 15h6" />
          <path d="M7 9h4" />
          <path d="M14 9h3" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 20c.9-3.8 3.3-5.7 7-5.7s6.1 1.9 7 5.7" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-2 .1 1.7 1.7 0 0 0-.8 1.6v.2H9.2V22a1.7 1.7 0 0 0-.8-1.6 1.7 1.7 0 0 0-2-.1l-.2.1-2-3.4.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.4-1H3v-4h.2a1.7 1.7 0 0 0 1.4-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3.4.2.1a1.7 1.7 0 0 0 2-.1 1.7 1.7 0 0 0 .8-1.6V2h5.6v.2a1.7 1.7 0 0 0 .8 1.6 1.7 1.7 0 0 0 2 .1l.2-.1 2 3.4-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.4 1h.2v4h-.2a1.7 1.7 0 0 0-1.4 1Z" />
        </svg>
      );
    case "collapse":
      return (
        <svg {...common}>
          <path d="M15 6 9 12l6 6" />
          <path d="M21 6v12" />
          <path d="M3 6v12" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <path d="M7 11V8a5 5 0 0 1 10 0v3" />
          <path d="M6 11h12v9H6z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3 9.9 9.9 3 12l6.9 2.1L12 21l2.1-6.9L21 12l-6.9-2.1L12 3Z" />
        </svg>
      );
  }
}

function NavItemRow({
  collapsed,
  item,
  locked,
  onClick,
  onLockedClick,
  pathname,
  currentMode,
}: {
  collapsed: boolean;
  currentMode: WorkspaceMode;
  item: NavItem;
  locked: boolean;
  onClick?: () => void;
  onLockedClick: (item: NavItem) => void;
  pathname: string;
}) {
  const active = isActive(pathname, item, currentMode);
  const label = locked ? `${item.label} locked` : item.label;
  const className = `sentra-shell-nav-item sentra-luxury-nav-item group ${active ? "is-active" : ""} ${
    locked ? "is-locked" : ""
  } ${collapsed ? "is-collapsed justify-center" : ""}`;
  const content = (
    <>
      <span className="sentra-shell-nav-icon">
        <ShellIcon name={item.icon} />
      </span>
      <span className={`sentra-shell-nav-label min-w-0 ${collapsed ? "sr-only" : ""}`}>
        <span className="block truncate">{item.label}</span>
        <span className="block truncate text-[0.66rem] font-medium normal-case tracking-normal text-white/36">
          {item.description}
        </span>
      </span>
      {locked ? (
        <span className={`sentra-nav-lock ${collapsed ? "sr-only" : ""}`} aria-hidden="true">
          <ShellIcon name="lock" />
        </span>
      ) : null}
      {active ? <span className="sentra-shell-active-indicator" /> : null}
    </>
  );

  if (locked) {
    return (
      <button
        aria-label={label}
        className={className}
        onClick={() => onLockedClick(item)}
        title={collapsed ? label : undefined}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={className}
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
    >
      {content}
    </Link>
  );
}

function handleSidebarNavKeyDown(event: KeyboardEvent<HTMLElement>) {
  const container = event.currentTarget;
  const step = 72;
  const pageStep = Math.max(180, container.clientHeight * 0.82);
  let nextTop: number | null = null;

  switch (event.key) {
    case "ArrowDown":
      nextTop = container.scrollTop + step;
      break;
    case "ArrowUp":
      nextTop = container.scrollTop - step;
      break;
    case "PageDown":
      nextTop = container.scrollTop + pageStep;
      break;
    case "PageUp":
      nextTop = container.scrollTop - pageStep;
      break;
    case "Home":
      nextTop = 0;
      break;
    case "End":
      nextTop = container.scrollHeight;
      break;
    default:
      return;
  }

  event.preventDefault();
  event.stopPropagation();
  container.scrollTo({ behavior: "smooth", top: nextTop });
}

function stopSidebarWheelPropagation(event: WheelEvent<HTMLElement>) {
  event.stopPropagation();
}

function AccessModal({
  item,
  onClose,
  onSwitchWorkspace,
}: {
  item: NavItem | null;
  onClose: () => void;
  onSwitchWorkspace: () => void;
}) {
  if (!item) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="sentra-access-modal-backdrop"
      onMouseDown={onClose}
      role="dialog"
    >
      <section className="sentra-access-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-cyan-200/18 bg-cyan-200/10 text-cyan-50">
          <ShellIcon name="lock" />
        </div>
        <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">
          Premium access required
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-white">
          {item.label} is protected for this workspace
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/58">
          Sentra kept you on the current screen instead of sending you to a broken or unauthorized
          route. Ask an admin for the required permissions or switch to a workspace with this module enabled.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button className="sentra-access-button is-primary" onClick={onClose} type="button">
            Stay here
          </button>
          <button className="sentra-access-button" onClick={onSwitchWorkspace} type="button">
            Switch workspace
          </button>
          <Link className="sentra-access-button" href="/app">
            Return home
          </Link>
        </div>
      </section>
    </div>
  );
}

export function LuxurySidebar({
  collapsed,
  mobileOpen,
  onCollapsedChange,
  onMobileOpenChange,
}: LuxurySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  useLiveDataEngine();
  const user = useAuthStore((state) => state.user);
  const executiveReadiness = useLiveDataStore((state) => state.executive.readiness);
  const threatScore = useLiveDataStore((state) => state.executive.threatScore);
  const storedWorkspaceMode = useWorkspace((state) => state.mode);
  const { hasAnyPermission, loading } = useRbac();
  const [lockedItem, setLockedItem] = useState<NavItem | null>(null);
  const closeMobile = useCallback(() => {
    onMobileOpenChange(false);
  }, [onMobileOpenChange]);
  const currentMode = storedWorkspaceMode;

  useEffect(() => {
    closeMobile();
  }, [closeMobile, pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeMobile, mobileOpen]);

  const userLabel = user?.displayName || user?.email || "Sentra Operator";
  const workspaceLabel = useMemo(() => {
    if (user?.organizationName) {
      return user.organizationName;
    }

    return "Grand Meridian Command";
  }, [user?.organizationName]);

  function canAccess(item: NavItem) {
    if (!item.permissions?.length || loading) {
      return true;
    }

    return hasAnyPermission(...item.permissions);
  }

  function handleLockedClick(item: NavItem) {
    setLockedItem(item);
    closeMobile();
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={`sentra-mobile-nav-backdrop ${mobileOpen ? "is-open" : ""}`}
        onClick={closeMobile}
      />
      <aside
        aria-label="Sentra primary navigation"
        className={`sentra-app-sidebar sentra-luxury-sidebar sentra-phase12-sidebar glass-nav ${collapsed ? "is-collapsed" : ""} ${
          mobileOpen ? "is-mobile-open" : ""
        }`}
        data-lenis-prevent
        data-native-scroll
      >
        <div className="sentra-sidebar-brand sentra-luxury-brand">
          <Link className="flex min-w-0 items-center gap-3" href="/app" onClick={closeMobile}>
            <span className="sentra-sidebar-mark">S</span>
            <span className={`min-w-0 ${collapsed ? "hidden" : "block"}`}>
              <span className="block text-base font-semibold tracking-[-0.045em] text-white">Sentra</span>
              <span className="block text-[0.62rem] font-bold uppercase tracking-[0.24em] text-cyan-100/42">
                Crisis Intelligence OS
              </span>
            </span>
          </Link>
        </div>

        <div className={`sentra-workspace-card sentra-phase12-workspace-card ${collapsed ? "hidden" : "block"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/36">
                Workspace
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{workspaceLabel}</p>
              <p className="mt-1 truncate text-xs text-white/42">{userLabel}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="sentra-sidebar-live-chip">
                  <span className="sentra-sidebar-live-dot" />
                  Live
                </span>
                <span className="sentra-sidebar-micro-stat">Ready {executiveReadiness}%</span>
                <span className="sentra-sidebar-micro-stat">Threat {threatScore}%</span>
              </div>
            </div>
            <RoleBadge compact role={user?.role} />
          </div>
        </div>

        <nav
          aria-label="Sentra modules"
          className="sentra-sidebar-nav-scroll"
          data-lenis-prevent
          data-native-scroll
          onKeyDown={handleSidebarNavKeyDown}
          onWheel={stopSidebarWheelPropagation}
          tabIndex={0}
        >
          {navGroups.map((group) => {
            const visibleItems = group.items;

            if (!visibleItems.length) {
              return null;
            }

            return (
              <div className="sentra-sidebar-section sentra-luxury-nav-group" key={group.label}>
                <p className={`sentra-sidebar-section-label ${collapsed ? "sr-only" : ""}`}>{group.label}</p>
                <div className="space-y-1.5">
                  {visibleItems.map((item) => (
                    <NavItemRow
                      collapsed={collapsed}
                      currentMode={currentMode}
                      item={item}
                      key={`${group.label}-${item.href}-${item.label}`}
                      locked={!canAccess(item)}
                      onClick={closeMobile}
                      onLockedClick={handleLockedClick}
                      pathname={pathname}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {pinnedNav.length ? (
            <div className="sentra-sidebar-section sentra-luxury-nav-group">
              <p className={`sentra-sidebar-section-label ${collapsed ? "sr-only" : ""}`}>Pinned tools</p>
              <div className="space-y-1.5">
                {pinnedNav.filter(canAccess).map((item) => (
                  <NavItemRow
                    collapsed={collapsed}
                    currentMode={currentMode}
                    item={item}
                    key={`pinned-${item.href}-${item.label}`}
                    locked={false}
                    onClick={closeMobile}
                    onLockedClick={handleLockedClick}
                    pathname={pathname}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </nav>

        <div className="sentra-sidebar-bottom sentra-luxury-bottom">
          <button
            className={`sentra-shell-collapse sentra-luxury-collapse ${collapsed ? "justify-center" : ""}`}
            onClick={() => onCollapsedChange(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            type="button"
          >
            <ShellIcon name="collapse" />
            <span className={collapsed ? "sr-only" : ""}>
              {collapsed ? "Expand sidebar" : "Collapse"}
            </span>
          </button>
        </div>
      </aside>

      <AccessModal
        item={lockedItem}
        onClose={() => setLockedItem(null)}
        onSwitchWorkspace={() => {
          setLockedItem(null);
          router.push("/cloud/tenants");
        }}
      />
    </>
  );
}
