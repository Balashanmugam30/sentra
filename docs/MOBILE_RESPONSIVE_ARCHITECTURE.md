# 📱 Sentra Responsive & Mobile PWA Architecture

> **Focus:** Consolidation from duplicate codebases into a single unified responsive application.

---

## 1. Architectural Consolidation Overview

Prior to Phase 1, Sentra maintained two overlapping mobile implementations:
1. An integrated mobile route tree inside the primary Next.js app under `app/mobile/*`.
2. A separate standalone Next.js package inside `apps/mobile/` with its own `package.json`, dependencies, and deployment.

### Forensic Decision & Execution
- **Retired:** `apps/mobile/` workspace completely removed from `package.json`, CI, and filesystem.
- **Surviving Canonical Implementation:** `app/mobile/*` within the unified Next.js 16 monorepo.
- **PWA Asset Migration:** `manifest.json`, `sw.js`, and SVG vector icons transferred from standalone package to root `public/`, scoped cleanly to `/mobile`.

---

## 2. Responsive Viewport Strategy

Sentra provides a continuous responsive experience across all device profiles:

```
+-------------------------------------------------------------------------+
| Breakpoint         | Navigation UI             | Shell Behavior         |
|--------------------+---------------------------+------------------------|
| < 768px (Mobile)   | Top hamburger + Drawer    | Main full width,       |
|                    | BottomNav on /mobile/*    | Drawer on backdrop     |
|                    |                           |                        |
| 768px - 1023px     | Collapsible Rail          | Compact icons,         |
| (Tablet)           | TopBar mode tabs          | Flexible workspace     |
|                    |                           |                        |
| >= 1024px          | Fixed / Expandable        | Full multi-pane        |
| (Desktop)          | LuxurySidebar (280px/88px)| Command Center         |
+-------------------------------------------------------------------------+
```

### Mobile Drawer Mechanics (`<AppShell>` + `<LuxurySidebar>`)
- **Toggled Via:** Hamburger button in `TopBar` invoking `onOpenNav`.
- **Overlay:** Backlit scrim backdrop (`.sentra-mobile-nav-backdrop`) with tap-outside dismiss.
- **Keyboard Handling:** Global `Escape` key automatically dismisses drawer when active.
- **Route Transitions:** Navigation to any link automatically closes the drawer via `pathname` observer.

---

## 3. PWA Capabilities & Offline Operations

### Web App Manifest (`public/manifest.json`)
```json
{
  "name": "Sentra Mobile",
  "short_name": "Sentra",
  "start_url": "/mobile/home",
  "scope": "/mobile",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#030712",
  "theme_color": "#030712"
}
```

### Service Worker (`public/sw.js`)
- Caches all essential mobile app shells: `/mobile`, `/mobile/home`, `/mobile/alert`, `/mobile/route`, `/mobile/sos`, `/mobile/staff`, `/mobile/responder`, `/mobile/settings`, `/mobile/offline`.
- Intercepts offline navigation requests and gracefully routes to `/mobile/offline` when network disconnects during field emergencies.
- Background sync preserves queued field distress signals (SOS) and responder check-ins in Zustand offline storage (`store/useMobileStore.ts`).

---

## 4. Scroll & Keyboard Safety Architecture

### Lenis Smooth Scroll Resolution
Previous versions used `@studio-freight/lenis` globally in `app/layout.tsx` which intercepted `ArrowDown`, `ArrowUp`, `Space`, and `PageDown`, creating input traps in form fields and degrading touch scrolling on mobile.

**Phase 1 Resolution:**
1. Completely removed keydown listeners from smooth scroll logic—native browser accessibility navigation is 100% preserved.
2. Isolated smooth scrolling to public desktop landing surfaces only.
3. Automatically bypassed on:
   - Touch devices (`pointer: coarse`)
   - Reduced-motion user preferences (`prefers-reduced-motion: reduce`)
   - Authenticated application routes (`/app/*`, `/mobile/*`, `/login`)
