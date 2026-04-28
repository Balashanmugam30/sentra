"use client";

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

import { firebaseApp, firebaseStorage } from "@/lib/firebase";

export type StorageUploadTarget = "incident-photos" | "cctv-captures" | "reports" | "documents" | "avatars";

export function getFirebaseStorage() {
  if (!firebaseApp || !firebaseStorage) {
    return null;
  }
  return firebaseStorage ?? getStorage(firebaseApp);
}

export async function uploadSentraFile(target: StorageUploadTarget, file: File, ownerId: string) {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error("Firebase Storage is not configured.");
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${target}/${ownerId}/${Date.now()}-${safeName}`;
  const snapshot = await uploadBytes(ref(storage, path), file, {
    contentType: file.type,
    customMetadata: {
      ownerId,
      target,
      source: "sentra-web",
    },
  });
  return {
    path,
    url: await getDownloadURL(snapshot.ref),
  };
}

export function uploadIncidentPhoto(file: File, incidentId: string) {
  return uploadSentraFile("incident-photos", file, incidentId);
}

export function uploadCctvCapture(file: File, incidentId: string) {
  return uploadSentraFile("cctv-captures", file, incidentId);
}

export function uploadReport(file: File, reportId: string) {
  return uploadSentraFile("reports", file, reportId);
}

export function uploadDocument(file: File, ownerId: string) {
  return uploadSentraFile("documents", file, ownerId);
}

export function uploadAvatar(file: File, uid: string) {
  return uploadSentraFile("avatars", file, uid);
}
