export function generateTraceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `trace-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}
