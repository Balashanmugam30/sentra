export function readNetworkState() {
  if (typeof navigator === "undefined") {
    return true;
  }
  return navigator.onLine;
}

export function subscribeNetworkState(onChange: (online: boolean) => void, onRecover?: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleOnline = () => {
    onChange(true);
    onRecover?.();
  };
  const handleOffline = () => onChange(false);
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  onChange(readNetworkState());

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

export function clearSentraOfflineCache() {
  if (typeof caches === "undefined") {
    return Promise.resolve(false);
  }

  return caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("sentra-mobile")).map((key) => caches.delete(key)))).then(() => true);
}
