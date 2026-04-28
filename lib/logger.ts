import { env } from "@/config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel) {
  const configured = (env.logLevel as LogLevel) || "info";

  return levelOrder[level] >= levelOrder[configured];
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeValue(entry)).filter((entry) => entry !== undefined);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [key, serializeValue(entry)] as const)
      .filter(([, entry]) => entry !== undefined);

    if (entries.length === 0) {
      return undefined;
    }

    return Object.fromEntries(entries);
  }

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}

function normalizeContext(context?: Record<string, unknown>) {
  if (!context) {
    return undefined;
  }

  const normalized = serializeValue(context);

  if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) {
    return undefined;
  }

  const entries = Object.entries(normalized);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function getConsoleMethod(level: LogLevel) {
  if (level === "error" && process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    return console.log;
  }

  if (level === "error") {
    return console.error;
  }

  if (level === "warn") {
    return console.warn;
  }

  if (level === "info") {
    return console.info;
  }

  return console.debug;
}

function write(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (!shouldLog(level)) {
    return;
  }

  const normalizedContext = normalizeContext(context);
  const output = {
    message: message || "Unknown error",
    ...(normalizedContext ? { details: normalizedContext } : {}),
    timestamp: new Date().toISOString(),
  };

  const log = getConsoleMethod(level);
  const prefix = level === "error" ? "[Sentra Error]" : level === "warn" ? "[Sentra Warn]" : "[Sentra]";

  log(prefix, output);
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => write("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => write("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => write("error", message, context),
};
