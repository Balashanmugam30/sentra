import type { SystemEvent } from "./types";

type Listener = (event: SystemEvent<unknown>) => void | Promise<void>;
type ListenerRegistry = Record<string, Listener>;

declare global {
  interface Window {
    __SENTRA_EVENT_LISTENERS__?: ListenerRegistry;
  }
}

function getListeners(): ListenerRegistry {
  if (typeof window === "undefined") {
    return {};
  }

  if (!window.__SENTRA_EVENT_LISTENERS__) {
    window.__SENTRA_EVENT_LISTENERS__ = {};
  }

  return window.__SENTRA_EVENT_LISTENERS__;
}

export function emitEvent(event: SystemEvent<unknown>) {
  const listeners = getListeners();

  Object.values(listeners).forEach((listener) => {
    void listener(event);
  });
}

export function subscribeEvent(key: string, listener: Listener) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listeners = getListeners();
  listeners[key] = listener;

  return () => {
    if (typeof window === "undefined") {
      return;
    }

    const nextListeners = { ...getListeners() };
    delete nextListeners[key];
    window.__SENTRA_EVENT_LISTENERS__ = nextListeners;
  };
}
