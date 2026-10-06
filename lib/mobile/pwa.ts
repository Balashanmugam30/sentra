let installPrompt: BeforeInstallPromptEvent | null = null;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function registerSentraServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.warn("Sentra Mobile service worker registration failed", error);
    });
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
  });
}

export function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

export function canPromptInstall() {
  return installPrompt !== null;
}

export async function promptInstallSentra() {
  if (!installPrompt) {
    return "unavailable" as const;
  }

  await installPrompt.prompt();
  const result = await installPrompt.userChoice;
  installPrompt = null;
  return result.outcome;
}

export async function readServiceWorkerReady() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  return Boolean(registration.active);
}
