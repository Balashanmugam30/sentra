export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const SESSION_WARNING_WINDOW_MS = 3 * 60 * 1000;
export const REMEMBERED_DEVICE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_DEVICE_MAX_AGE_SECONDS = 60 * 60 * 12;

export function getSessionExpiresAt(lastActivityAt: number, rememberDevice: boolean) {
  const timeout = rememberDevice ? REMEMBERED_DEVICE_MAX_AGE_SECONDS * 1000 : SESSION_IDLE_TIMEOUT_MS;
  return lastActivityAt + timeout;
}

export function getSessionWarningAt(lastActivityAt: number, rememberDevice: boolean) {
  return getSessionExpiresAt(lastActivityAt, rememberDevice) - SESSION_WARNING_WINDOW_MS;
}

export function getSessionTimeRemaining(expiresAt: number | null) {
  if (!expiresAt) {
    return 0;
  }

  return Math.max(0, expiresAt - Date.now());
}

export function formatSessionDuration(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}
