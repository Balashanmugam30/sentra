import type { MobileNotification, NotificationPermissionState } from "./types";

export const SEEDED_NOTIFICATIONS: MobileNotification[] = [
  {
    body: "Kitchen Zone B emergency posture is active.",
    createdAt: "2026-04-25T09:49:00.000Z",
    id: "NOTIF-FIRE-FLOOR-3",
    read: false,
    title: "FIRE DETECTED FLOOR 3",
    type: "alert",
  },
  {
    body: "Use Service Hall C and proceed toward East Courtyard.",
    createdAt: "2026-04-25T09:49:20.000Z",
    id: "NOTIF-ROUTE-EXIT-B",
    read: false,
    title: "ROUTE UPDATED USE EXIT B",
    type: "route",
  },
  {
    body: "Alpha team is arriving near Room 312.",
    createdAt: "2026-04-25T09:49:40.000Z",
    id: "NOTIF-RESPONDER-ETA",
    read: false,
    title: "RESPONDER ARRIVING IN 2 MIN",
    type: "responder",
  },
  {
    body: "Verify smoke door seal in Zone 3.",
    createdAt: "2026-04-25T09:50:00.000Z",
    id: "NOTIF-TASK-ASSIGNED",
    read: true,
    title: "TASK ASSIGNED TO YOU",
    type: "task",
  },
  {
    body: "Command acknowledged the Room 312 assistance request.",
    createdAt: "2026-04-25T09:50:20.000Z",
    id: "NOTIF-HELP-ACK",
    read: true,
    title: "HELP REQUEST ACKNOWLEDGED",
    type: "sos",
  },
];

export function readNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.requestPermission();
}

export function sendLocalNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }

  new Notification(title, {
    body,
    icon: "/icons/sentra-icon.svg",
    tag: `sentra-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
  });
  return true;
}
