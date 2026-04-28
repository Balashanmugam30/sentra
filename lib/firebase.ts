"use client";

import type { FirebaseApp } from "firebase/app";
import type { FirebaseOptions } from "firebase/app";
import type { Auth } from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

import { env } from "@/config/env";

let firebaseWarningLogged = false;

function warnFirebaseUnavailable() {
  if (firebaseWarningLogged || env.appEnv === "production") {
    return;
  }

  firebaseWarningLogged = true;

  console.warn(
    `[firebase] Firebase Authentication is not fully configured. Missing: ${env.missingFirebaseVars.join(", ")}. ` +
      "Add the NEXT_PUBLIC_FIREBASE_* values to .env.local to enable login in development.",
  );
}

const firebaseConfig: FirebaseOptions | null = env.hasFirebaseConfig
  ? {
      apiKey: env.firebase.apiKey ?? undefined,
      authDomain: env.firebase.authDomain ?? undefined,
      projectId: env.firebase.projectId ?? undefined,
      storageBucket: env.firebase.storageBucket ?? undefined,
      messagingSenderId: env.firebase.messagingSenderId ?? undefined,
      appId: env.firebase.appId ?? undefined,
    }
  : null;

export const firebaseApp: FirebaseApp | null = firebaseConfig
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseDb: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const firebaseStorage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null;

if (firebaseAuth) {
  void setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {
    return;
  });
} else {
  warnFirebaseUnavailable();
}

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
});

export const facebookAuthProvider = new FacebookAuthProvider();
facebookAuthProvider.setCustomParameters({
  display: "popup",
});

export const isFirebaseConfigured = env.hasFirebaseConfig;

export function requireFirebaseAuth() {
  if (!firebaseAuth) {
    throw new Error("Firebase Authentication is not configured.");
  }
  return firebaseAuth;
}

export function requireFirebaseApp() {
  if (!firebaseApp) {
    throw new Error("Firebase is not configured.");
  }
  return firebaseApp;
}

export function requireFirebaseDb() {
  if (!firebaseDb) {
    throw new Error("Firestore is not configured.");
  }
  return firebaseDb;
}

export function requireFirebaseStorage() {
  if (!firebaseStorage) {
    throw new Error("Firebase Storage is not configured.");
  }
  return firebaseStorage;
}
