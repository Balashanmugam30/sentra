"use client";

import { addDoc, collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { firebaseApp } from "@/lib/firebase";
import type { Incident } from "@/lib/api/incident";

export type FirebaseUserProfile = {
  uid: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
  role: "admin" | "operator";
  createdAt: unknown;
  lastLoginAt: unknown;
  provider: string | null;
  status: "active" | "disabled";
};

export function getFirebaseDb() {
  if (!firebaseApp) {
    return null;
  }
  return getFirestore(firebaseApp);
}

export async function upsertUserProfile(profile: Omit<FirebaseUserProfile, "createdAt" | "lastLoginAt" | "status">) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured.");
  }
  const ref = doc(db, "users", profile.uid);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      ...profile,
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      status: "active",
    },
    { merge: true },
  );
}

export async function createFirestoreIncident(payload: Partial<Incident> & { title?: string; description?: string }) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured.");
  }
  const ref = await addDoc(collection(db, "incidents"), {
    title: payload.title ?? payload.type ?? "Incident",
    description: payload.description ?? "",
    severity: payload.severity ?? 3,
    category: payload.category ?? payload.incident_type ?? payload.type ?? "incident",
    type: payload.type ?? "incident",
    location: payload.location ?? "Unknown",
    lat: payload.lat ?? null,
    lng: payload.lng ?? null,
    status: payload.status ?? "active",
    createdBy: payload.created_by ?? "firebase-client",
    assignedTo: payload.assigned_to ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    images: payload.images ?? [],
    videos: payload.videos ?? [],
    aiSummary: payload.ai_summary ?? null,
    source: payload.source ?? "frontend",
  });
  return ref.id;
}

export async function listFirestoreIncidents() {
  const db = getFirebaseDb();
  if (!db) {
    return [];
  }
  const snapshot = await getDocs(collection(db, "incidents"));
  return snapshot.docs.map((item) => mapFirestoreIncident(item.id, item.data()));
}

export function subscribeToFirestoreIncidents(onUpdate: (incidents: Incident[]) => void, onError?: (error: Error) => void) {
  const db = getFirebaseDb();
  if (!db) {
    return null;
  }
  return onSnapshot(
    query(collection(db, "incidents")),
    (snapshot) => {
      onUpdate(snapshot.docs.map((item) => mapFirestoreIncident(item.id, item.data())));
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function updateFirestoreIncidentStatus(id: string, status: string) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error("Firestore is not configured.");
  }
  await updateDoc(doc(db, "incidents", id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

function mapTimestamp(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return new Date().toISOString();
}

function mapFirestoreIncident(id: string, data: Record<string, unknown>): Incident {
  return {
    id,
    type: String(data.type ?? data.title ?? "incident"),
    status: String(data.status ?? "active"),
    severity: Number(data.severity ?? 3),
    location: String(data.location ?? "Unknown"),
    created_at: mapTimestamp(data.createdAt ?? data.created_at),
    title: typeof data.title === "string" ? data.title : undefined,
    description: typeof data.description === "string" ? data.description : undefined,
    category: typeof data.category === "string" ? data.category : undefined,
    lat: typeof data.lat === "number" ? data.lat : null,
    lng: typeof data.lng === "number" ? data.lng : null,
    created_by: typeof data.createdBy === "string" ? data.createdBy : undefined,
    assigned_to: typeof data.assignedTo === "string" ? data.assignedTo : undefined,
    updated_at: mapTimestamp(data.updatedAt ?? data.updated_at),
    images: Array.isArray(data.images) ? data.images.filter((item): item is string => typeof item === "string") : [],
    videos: Array.isArray(data.videos) ? data.videos.filter((item): item is string => typeof item === "string") : [],
    ai_summary: typeof data.aiSummary === "string" ? data.aiSummary : undefined,
    source: typeof data.source === "string" ? data.source : undefined,
  };
}
