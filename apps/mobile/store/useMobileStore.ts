"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_ROLE, DEFAULT_STATUS } from "../lib/mobile/constants";
import { buildDemoScenario } from "../lib/mobile/demoEngine";
import { createId } from "../lib/mobile/helpers";
import {
  DEFAULT_CURRENT_ZONE,
  SEEDED_OPS_FEED,
  SEEDED_RESPONDER_MISSIONS,
  SEEDED_SOS_REQUESTS,
  SEEDED_STAFF_TASKS,
  SEEDED_TEAM_MEMBERS,
  SEEDED_ZONE_STATUS,
  buildOpsFeedItem,
} from "../lib/mobile/opsEngine";
import { SEEDED_NOTIFICATIONS } from "../lib/mobile/notifications";
import { PRIMARY_BLOCKED_ZONE } from "../lib/mobile/routing";
import { sortResponderQueue } from "../lib/mobile/tasks";
import type {
  DemoScenario,
  IncidentType,
  MobileIncident,
  MobileRole,
  MobileRoute,
  MobileRouteStep,
  MobileTask,
  MobileTheme,
  MobileNotification,
  NotificationPermissionState,
  OpsFeedItem,
  ResponderMission,
  ResponderMissionStatus,
  SosRequest,
  SosKind,
  StaffTask,
  TeamMember,
  SyncQueueItem,
  SystemStatus,
  ZoneStatus,
} from "../lib/mobile/types";

type MobileState = {
  acceptMission: (missionId: string) => void;
  acceptTask: (taskId: string) => void;
  activeScenario: DemoScenario;
  ackSOS: (requestId: string) => void;
  addNotification: (title: string, body: string, type?: MobileNotification["type"]) => void;
  blockedZones: string[];
  clearNotifications: () => void;
  clearOfflineState: () => void;
  completeTask: (taskId: string) => void;
  confidence: number;
  currentZone: string;
  enqueueSync: (type: SyncQueueItem["type"], label: string, payload: string) => void;
  escalateTask: (taskId: string) => void;
  flushSyncQueue: () => void;
  flushSOS: () => void;
  addTask: (title: string, priority?: SystemStatus) => void;
  highContrast: boolean;
  eta: number;
  incident: MobileIncident | null;
  incidentType: IncidentType;
  lastCachedAt: string | null;
  lastVoiceInstruction: string | null;
  lastSync: string | null;
  networkOnline: boolean;
  notificationsEnabled: boolean;
  notificationHistory: MobileNotification[];
  notificationPermission: NotificationPermissionState;
  occupancy: number;
  opsFeed: OpsFeedItem[];
  priorityQueue: ResponderMission[];
  queueSOS: (message: string) => void;
  reducedMotion: boolean;
  rerouteReason: string | null;
  responders: number;
  responderMissions: ResponderMission[];
  resolveSOS: (requestId: string) => void;
  route: MobileRoute | null;
  routeSteps: MobileRouteStep[];
  sendSOS: (kind: SosKind, message?: string) => string;
  severity: SystemStatus;
  setDemoScenario: (scenario: DemoScenario) => void;
  setIncident: (incident: MobileIncident | null) => void;
  setNetwork: (online: boolean) => void;
  setNotificationPermission: (permission: NotificationPermissionState) => void;
  setReducedMotion: (enabled: boolean) => void;
  setRole: (role: MobileRole) => void;
  setRoute: (route: MobileRoute | null) => void;
  setStatus: (status: SystemStatus) => void;
  setTheme: (theme: MobileTheme) => void;
  setVoiceInstruction: (instruction: string) => void;
  setVoiceRate: (rate: number) => void;
  sosRequests: SosRequest[];
  sosQueue: SosRequest[];
  staffTasks: StaffTask[];
  syncQueue: SyncQueueItem[];
  systemStatus: SystemStatus;
  tasks: MobileTask[];
  teamMembers: TeamMember[];
  theme: MobileTheme;
  tickOpsFeed: () => void;
  toggleBlockedZone: () => void;
  toggleHighContrast: () => void;
  toggleNotifications: () => void;
  toggleReducedMotion: () => void;
  toggleVoice: () => void;
  updateMission: (missionId: string, status: ResponderMissionStatus) => void;
  userRole: MobileRole;
  voiceEnabled: boolean;
  voiceRate: number;
  zoneStatus: ZoneStatus[];
};

function syncNow() {
  return new Date().toISOString();
}

const defaultScenario = buildDemoScenario("safe", "2026-04-25T00:00:00.000Z");
const seededCachedAt = new Date(Date.now() - 45_000).toISOString();
const SEEDED_SYNC_QUEUE: SyncQueueItem[] = [
  {
    createdAt: new Date(Date.now() - 42_000).toISOString(),
    id: "SYNC-SOS-ROOM-312",
    label: "Queued SOS acknowledgement",
    payload: "SOS-ROOM-312",
    status: "queued",
    type: "ack",
  },
  {
    createdAt: new Date(Date.now() - 37_000).toISOString(),
    id: "SYNC-TASK-SMOKE-DOOR",
    label: "Queued task completion",
    payload: "TASK-CHECK-SMOKE-DOOR",
    status: "queued",
    type: "task",
  },
  {
    createdAt: new Date(Date.now() - 31_000).toISOString(),
    id: "SYNC-ROUTE-REROUTE",
    label: "Queued route snapshot",
    payload: "ROUTE-DEMO-REROUTED",
    status: "queued",
    type: "route",
  },
];

export const useMobileStore = create<MobileState>()(
  persist(
    (set, get) => ({
      acceptMission: (missionId) =>
        set((state) => {
          const now = syncNow();
          const responderMissions = state.responderMissions.map((mission) =>
            mission.id === missionId ? { ...mission, status: "accepted" as const } : mission,
          );
          return {
            lastSync: now,
            opsFeed: [
              buildOpsFeedItem("Mission accepted", `${responderMissions.find((mission) => mission.id === missionId)?.target ?? "Responder mission"} accepted.`, "high", now),
              ...state.opsFeed,
            ].slice(0, 12),
            priorityQueue: sortResponderQueue(responderMissions),
            responderMissions,
          };
        }),
      acceptTask: (taskId) =>
        set((state) => {
          const now = syncNow();
          const task = state.staffTasks.find((item) => item.id === taskId);
          return {
            lastSync: now,
            opsFeed: task ? [buildOpsFeedItem("Task accepted", task.title, task.priority, now), ...state.opsFeed].slice(0, 12) : state.opsFeed,
            staffTasks: state.staffTasks.map((item) => (item.id === taskId ? { ...item, status: "accepted" } : item)),
          };
        }),
      activeScenario: "safe",
      ackSOS: (requestId) =>
        set((state) => {
          const now = syncNow();
          const request = state.sosRequests.find((item) => item.id === requestId);
          return {
            lastSync: now,
            opsFeed: request ? [buildOpsFeedItem("SOS acknowledged", request.message, request.priority ?? "high", now), ...state.opsFeed].slice(0, 12) : state.opsFeed,
            sosRequests: state.sosRequests.map((item) => (item.id === requestId ? { ...item, status: "acknowledged" } : item)),
            sosQueue: state.sosQueue.map((item) => (item.id === requestId ? { ...item, status: "acknowledged" } : item)),
            syncQueue: state.networkOnline
              ? state.syncQueue
              : [
                  {
                    createdAt: now,
                    id: createId("SYNC"),
                    label: "SOS acknowledgement",
                    payload: requestId,
                    status: "queued",
                    type: "ack",
                  },
                  ...state.syncQueue,
                ],
          };
        }),
      addNotification: (title, body, type = "system") =>
        set((state) => ({
          lastSync: syncNow(),
          notificationHistory: [
            {
              body,
              createdAt: syncNow(),
              id: createId("NOTIF"),
              read: false,
              title,
              type,
            },
            ...state.notificationHistory,
          ].slice(0, 20),
        })),
      addTask: (title, priority = "safe") =>
        set((state) => ({
          lastSync: syncNow(),
          tasks: [
            {
              completed: false,
              createdAt: syncNow(),
              id: createId("TASK"),
              priority,
              title: title.trim() || "Mobile task",
            },
            ...state.tasks,
          ],
        })),
      blockedZones: defaultScenario.blockedZones,
      clearNotifications: () => set({ lastSync: syncNow(), notificationHistory: [] }),
      clearOfflineState: () =>
        set({
          lastCachedAt: syncNow(),
          lastSync: syncNow(),
          syncQueue: [],
        }),
      completeTask: (taskId) =>
        set((state) => {
          const now = syncNow();
          const task = state.staffTasks.find((item) => item.id === taskId);
          return {
            lastSync: now,
            opsFeed: task ? [buildOpsFeedItem("Task completed", task.title, task.priority, now), ...state.opsFeed].slice(0, 12) : state.opsFeed,
            staffTasks: state.staffTasks.map((item) => (item.id === taskId ? { ...item, status: "completed" } : item)),
            syncQueue: state.networkOnline
              ? state.syncQueue
              : [
                  {
                    createdAt: now,
                    id: createId("SYNC"),
                    label: "Task completion",
                    payload: taskId,
                    status: "queued",
                    type: "task",
                  },
                  ...state.syncQueue,
                ],
          };
        }),
      confidence: defaultScenario.confidence,
      currentZone: DEFAULT_CURRENT_ZONE,
      enqueueSync: (type, label, payload) =>
        set((state) => ({
          lastSync: syncNow(),
          syncQueue: [
            {
              createdAt: syncNow(),
              id: createId("SYNC"),
              label,
              payload,
              status: "queued",
              type,
            },
            ...state.syncQueue,
          ],
        })),
      escalateTask: (taskId) =>
        set((state) => {
          const now = syncNow();
          const task = state.staffTasks.find((item) => item.id === taskId);
          return {
            lastSync: now,
            opsFeed: task ? [buildOpsFeedItem("Task escalated", `${task.title} needs backup.`, "critical", now), ...state.opsFeed].slice(0, 12) : state.opsFeed,
            staffTasks: state.staffTasks.map((item) => (item.id === taskId ? { ...item, priority: "critical", status: "escalated" } : item)),
            systemStatus: "emergency",
          };
        }),
      eta: defaultScenario.eta,
      flushSyncQueue: () =>
        set((state) => ({
          lastCachedAt: syncNow(),
          lastSync: syncNow(),
          notificationHistory:
            state.syncQueue.length > 0
              ? [
                  {
                    body: `${state.syncQueue.length} offline actions synced to command.`,
                    createdAt: syncNow(),
                    id: createId("NOTIF"),
                    read: false,
                    title: "OFFLINE QUEUE SYNCED",
                    type: "system" as const,
                  },
                  ...state.notificationHistory,
                ].slice(0, 20)
              : state.notificationHistory,
          syncQueue: [],
        })),
      flushSOS: () =>
        set((state) => ({
          lastSync: syncNow(),
          sosQueue: [],
          sosRequests: state.sosRequests.map((request) => (request.status === "queued" ? { ...request, status: "dispatched" } : request)),
        })),
      incident: defaultScenario.incident,
      incidentType: defaultScenario.incidentType,
      highContrast: false,
      lastCachedAt: seededCachedAt,
      lastVoiceInstruction: "Proceed to Exit B",
      lastSync: null,
      networkOnline: true,
      notificationHistory: SEEDED_NOTIFICATIONS,
      notificationPermission: "default",
      notificationsEnabled: true,
      occupancy: defaultScenario.occupancy,
      opsFeed: SEEDED_OPS_FEED,
      priorityQueue: sortResponderQueue(SEEDED_RESPONDER_MISSIONS),
      queueSOS: (message) => {
        get().sendSOS("need_assistance", message);
      },
      reducedMotion: false,
      rerouteReason: null,
      responders: defaultScenario.responders,
      responderMissions: SEEDED_RESPONDER_MISSIONS,
      resolveSOS: (requestId) =>
        set((state) => {
          const now = syncNow();
          const request = state.sosRequests.find((item) => item.id === requestId);
          return {
            lastSync: now,
            opsFeed: request ? [buildOpsFeedItem("SOS resolved", request.message, request.priority ?? "normal", now), ...state.opsFeed].slice(0, 12) : state.opsFeed,
            sosRequests: state.sosRequests.map((item) => (item.id === requestId ? { ...item, status: "resolved" } : item)),
            sosQueue: state.sosQueue.filter((item) => item.id !== requestId),
          };
        }),
      route: defaultScenario.route,
      routeSteps: defaultScenario.routeSteps,
      sendSOS: (kind, message) => {
        const now = syncNow();
        const id = createId("SOS");
        const state = get();
        const request: SosRequest = {
          batteryLevel: "82%",
          currentZone: state.currentZone,
          id,
          incidentId: state.incident?.id ?? null,
          kind,
          message: message?.trim() || kind.replaceAll("_", " "),
          networkOnline: state.networkOnline,
          priority: kind === "injured" || kind === "cannot_move" || kind === "trapped" ? "critical" : kind === "smoke_nearby" || kind === "medical_help" ? "high" : "normal",
          queuedAt: now,
          role: state.userRole,
          sentAt: state.networkOnline ? now : undefined,
          status: state.networkOnline ? "dispatched" : "queued",
        };
        set((current) => ({
          lastSync: now,
          opsFeed: [buildOpsFeedItem("SOS received", request.message, request.priority ?? "high", now), ...current.opsFeed].slice(0, 12),
          sosQueue: request.status === "queued" ? [request, ...current.sosQueue] : current.sosQueue,
          sosRequests: [request, ...current.sosRequests],
          systemStatus: current.systemStatus === "safe" ? "warning" : current.systemStatus,
        }));
        return id;
      },
      setDemoScenario: (scenario) => {
        const now = syncNow();
        const snapshot = buildDemoScenario(scenario, now);
        set({
          activeScenario: scenario,
          blockedZones: snapshot.blockedZones,
          confidence: snapshot.confidence,
          eta: snapshot.eta,
          incident: snapshot.incident,
          incidentType: snapshot.incidentType,
          lastSync: now,
          occupancy: snapshot.occupancy,
          rerouteReason: scenario === "corridor_blocked" ? "Route updated due corridor hazard" : null,
          responders: snapshot.responders,
          route: snapshot.route,
          routeSteps: snapshot.routeSteps,
          severity: snapshot.severity,
          systemStatus: snapshot.systemStatus,
        });
      },
      setIncident: (incident) =>
        set({
          incident,
          incidentType: incident?.type ?? "none",
          lastSync: syncNow(),
          severity: incident?.severity ?? get().systemStatus,
        }),
      setNetwork: (networkOnline) =>
        set((state) => {
          const recovered = networkOnline && !state.networkOnline;
          const now = syncNow();
          return {
            lastCachedAt: now,
            lastSync: now,
            networkOnline,
            notificationHistory:
              recovered && state.syncQueue.length > 0
                ? [
                    {
                      body: `${state.syncQueue.length} offline actions synced safely.`,
                      createdAt: now,
                      id: createId("NOTIF"),
                      read: false,
                      title: "SYNC RECOVERED",
                      type: "system" as const,
                    },
                    ...state.notificationHistory,
                  ].slice(0, 20)
                : state.notificationHistory,
            syncQueue: recovered ? [] : state.syncQueue,
          };
        }),
      setNotificationPermission: (notificationPermission) => set({ lastSync: syncNow(), notificationPermission }),
      setReducedMotion: (reducedMotion) => set({ lastSync: syncNow(), reducedMotion }),
      setRole: (userRole) => set({ userRole, lastSync: syncNow() }),
      setRoute: (route) => set({ route, lastSync: syncNow() }),
      setStatus: (systemStatus) => set({ lastSync: syncNow(), severity: systemStatus, systemStatus }),
      setTheme: (theme) => set({ lastSync: syncNow(), theme }),
      setVoiceInstruction: (lastVoiceInstruction) => set({ lastSync: syncNow(), lastVoiceInstruction }),
      setVoiceRate: (voiceRate) => set({ lastSync: syncNow(), voiceRate: Math.min(1.4, Math.max(0.65, voiceRate)) }),
      severity: defaultScenario.severity,
      sosRequests: SEEDED_SOS_REQUESTS,
      sosQueue: [],
      staffTasks: SEEDED_STAFF_TASKS,
      syncQueue: SEEDED_SYNC_QUEUE,
      systemStatus: DEFAULT_STATUS,
      tasks: [],
      teamMembers: SEEDED_TEAM_MEMBERS,
      theme: "dark",
      tickOpsFeed: () =>
        set((state) => {
          const now = syncNow();
          const nextFeed = [
            buildOpsFeedItem("Live update", `Responder ETA ${state.route?.etaSeconds ? Math.max(60, state.route.etaSeconds - 10) : 95}s and evac progress improving.`, "normal", now),
            ...state.opsFeed,
          ].slice(0, 12);
          return { lastSync: now, opsFeed: nextFeed };
        }),
      toggleBlockedZone: () =>
        set((state) => {
          const now = syncNow();
          const nextScenario = state.blockedZones.includes(PRIMARY_BLOCKED_ZONE) ? "active_fire" : "corridor_blocked";
          const snapshot = buildDemoScenario(nextScenario, now);
          return {
            activeScenario: nextScenario,
            blockedZones: snapshot.blockedZones,
            confidence: snapshot.confidence,
            eta: snapshot.eta,
            incident: snapshot.incident,
            incidentType: snapshot.incidentType,
            lastSync: now,
            occupancy: snapshot.occupancy,
            rerouteReason: nextScenario === "corridor_blocked" ? "Route updated due corridor hazard" : null,
            responders: snapshot.responders,
            route: snapshot.route,
            routeSteps: snapshot.routeSteps,
            severity: snapshot.severity,
            systemStatus: snapshot.systemStatus,
            syncQueue: state.networkOnline
              ? state.syncQueue
              : [
                  {
                    createdAt: now,
                    id: createId("SYNC"),
                    label: "Route update",
                    payload: snapshot.route.id,
                    status: "queued",
                    type: "route",
                  },
                  ...state.syncQueue,
                ],
          };
        }),
      toggleHighContrast: () => set({ highContrast: !get().highContrast, lastSync: syncNow() }),
      toggleNotifications: () => set({ lastSync: syncNow(), notificationsEnabled: !get().notificationsEnabled }),
      toggleReducedMotion: () => set({ lastSync: syncNow(), reducedMotion: !get().reducedMotion }),
      toggleVoice: () => set({ lastSync: syncNow(), voiceEnabled: !get().voiceEnabled }),
      updateMission: (missionId, status) =>
        set((state) => {
          const now = syncNow();
          const responderMissions = state.responderMissions.map((mission) => (mission.id === missionId ? { ...mission, status } : mission));
          const mission = responderMissions.find((item) => item.id === missionId);
          return {
            lastSync: now,
            opsFeed: mission ? [buildOpsFeedItem("Mission updated", `${mission.target}: ${status.replaceAll("_", " ")}`, mission.priority, now), ...state.opsFeed].slice(0, 12) : state.opsFeed,
            priorityQueue: sortResponderQueue(responderMissions),
            responderMissions,
          };
        }),
      userRole: DEFAULT_ROLE,
      voiceEnabled: true,
      voiceRate: 1,
      zoneStatus: SEEDED_ZONE_STATUS,
    }),
    {
      name: "sentra-mobile-state",
      partialize: (state) => ({
        activeScenario: state.activeScenario,
        blockedZones: state.blockedZones,
        confidence: state.confidence,
        currentZone: state.currentZone,
        eta: state.eta,
        highContrast: state.highContrast,
        incident: state.incident,
        incidentType: state.incidentType,
        lastCachedAt: state.lastCachedAt,
        lastVoiceInstruction: state.lastVoiceInstruction,
        lastSync: state.lastSync,
        notificationHistory: state.notificationHistory,
        notificationPermission: state.notificationPermission,
        notificationsEnabled: state.notificationsEnabled,
        occupancy: state.occupancy,
        opsFeed: state.opsFeed,
        priorityQueue: state.priorityQueue,
        reducedMotion: state.reducedMotion,
        rerouteReason: state.rerouteReason,
        responders: state.responders,
        responderMissions: state.responderMissions,
        route: state.route,
        routeSteps: state.routeSteps,
        severity: state.severity,
        sosRequests: state.sosRequests,
        sosQueue: state.sosQueue,
        staffTasks: state.staffTasks,
        systemStatus: state.systemStatus,
        tasks: state.tasks,
        teamMembers: state.teamMembers,
        theme: state.theme,
        userRole: state.userRole,
        voiceEnabled: state.voiceEnabled,
        voiceRate: state.voiceRate,
        zoneStatus: state.zoneStatus,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
