"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { useLiveDataStore } from "@/lib/realtime/live-data-store";

type CopilotMessage = {
  id: string;
  role: "sentra" | "user";
  text: string;
};

const quickPrompts = [
  "Summarize current state",
  "Show highest risk zones",
  "Recommend next actions",
  "Generate executive briefing",
] as const;

const hiddenRoutes = ["/", "/landing", "/login", "/unauthorized"];

function formatCurrency(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  return `$${Math.round(value / 1_000)}K`;
}

function routeContext(pathname: string | null) {
  if (!pathname) {
    return "Sentra command surface";
  }
  if (pathname.includes("executive")) {
    return "executive intelligence suite";
  }
  if (pathname.includes("crisis")) {
    return "emergency war room";
  }
  if (pathname.includes("demo")) {
    return "guided product showcase";
  }
  if (pathname.includes("command") || pathname.includes("dashboard") || pathname.includes("app")) {
    return "operator command center";
  }
  if (pathname.includes("landing") || pathname === "/") {
    return "public product showcase";
  }
  return "Sentra command surface";
}

function sanitizeCopilotText(text: string) {
  return text
    .replace(/\u00c2\u00b7/g, "-")
    .replace(/\u00e2\u20ac\u0153/g, '"')
    .replace(/\u00e2\u20ac\u009d/g, '"');
}

export function AskSentraCopilot() {
  const pathname = usePathname();
  const incidents = useLiveDataStore((state) => state.incidents);
  const executive = useLiveDataStore((state) => state.executive);
  const recommendations = useLiveDataStore((state) => state.aiRecommendations);
  const notifications = useLiveDataStore((state) => state.notifications);
  const lastUpdatedAt = useLiveDataStore((state) => state.lastUpdatedAt);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const responseTimerRef = useRef<number | null>(null);
  const messageCounterRef = useRef(0);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome",
      role: "sentra",
      text: "Ask Sentra for the current risk posture, highest-risk zones, recommended actions, or a boardroom briefing.",
    },
  ]);

  const shouldHide = hiddenRoutes.some((route) => pathname === route || pathname?.startsWith(`${route}/`));
  const activeIncidents = incidents.filter((incident) => incident.status !== "resolved");
  const critical = activeIncidents.filter((incident) => incident.severity >= 4);
  const topIncident = activeIncidents[0];
  const topRecommendation = recommendations[0];

  const statusLine = useMemo(() => {
    const context = routeContext(pathname);
    return `${context} · ${activeIncidents.length} active · readiness ${executive.readiness}%`;
  }, [activeIncidents.length, executive.readiness, pathname]);
  const displayStatusLine = sanitizeCopilotText(statusLine);

  useEffect(() => {
    return () => {
      if (responseTimerRef.current) {
        window.clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  function buildAnswer(prompt: string) {
    const normalized = prompt.toLowerCase();
    const topZones = activeIncidents
      .slice(0, 3)
      .map((incident) => `${incident.location} (${incident.lifecycle_status}, severity ${incident.severity})`)
      .join("; ");

    if (normalized.includes("brief") || normalized.includes("executive")) {
      return `Executive briefing: readiness is ${executive.readiness}%, threat score is ${executive.threatScore}, exposure is ${formatCurrency(executive.financialExposure)}, and recovery ETA is ${executive.nextRecoveryEta}m. Top concern: ${executive.topRisks[0] ?? "no critical operational risk detected"}. Recommended board note: maintain corridor-first response and monitor reputation risk at ${executive.reputationRisk}%.`;
    }

    if (normalized.includes("risk") || normalized.includes("zone")) {
      return `Highest risk zones: ${topZones || "no active high-risk zones"}. Critical count is ${critical.length}. The strongest risk signal is ${topIncident ? `${topIncident.title} with ${topIncident.spread_probability}% spread probability` : "stable operating posture"}.`;
    }

    if (normalized.includes("recommend") || normalized.includes("action")) {
      return topRecommendation
        ? `Next best action: ${topRecommendation.action} in ${topRecommendation.zone}. Confidence ${topRecommendation.confidence}%, urgency ${Math.round(topRecommendation.urgency)}. Reason: ${topRecommendation.reason}`
        : "No urgent action is queued. Keep monitoring live signals and preserve reserve capacity.";
    }

    if (normalized.includes("incident") || normalized.includes("state") || normalized.includes("summar")) {
      return `Current state: ${activeIncidents.length} active incidents, ${critical.length} critical, AI confidence ${topIncident?.decision_confidence ?? 93}%, and ${notifications.filter((note) => !note.read).length} unread intelligence updates. Last verified sync: ${new Date(lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`;
    }

    if (normalized.includes("demo") || normalized.includes("showcase")) {
      return "Recommended showcase flow: Landing for product positioning, Executive for boardroom value, Crisis for operational power, Demo for narrative, and Analytics for evidence. Keep the story under two minutes.";
    }

    return `Sentra readout: ${activeIncidents.length} active incidents, readiness ${executive.readiness}%, threat score ${executive.threatScore}, exposure ${formatCurrency(executive.financialExposure)}. Ask for “highest risk zones” or “executive briefing” for a sharper answer.`;
  }

  function nextMessageId(prefix: string) {
    messageCounterRef.current += 1;
    return `${prefix}-${messageCounterRef.current}`;
  }

  function sendPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || busy) {
      return;
    }

    const userMessage: CopilotMessage = {
      id: nextMessageId("user"),
      role: "user",
      text: trimmed,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);

    if (responseTimerRef.current) {
      window.clearTimeout(responseTimerRef.current);
    }

    responseTimerRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId("sentra"),
          role: "sentra",
          text: sanitizeCopilotText(buildAnswer(trimmed)),
        },
      ]);
      setBusy(false);
      responseTimerRef.current = null;
    }, 420);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendPrompt(input);
  }

  if (shouldHide) {
    return null;
  }

  return (
    <div className="sentra-copilot-root fixed z-[80] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.section
            aria-describedby="ask-sentra-status"
            aria-labelledby="ask-sentra-title"
            aria-modal="false"
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="sentra-ask-panel w-[min(420px,calc(100vw-2rem))] overflow-hidden"
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            id="ask-sentra-panel"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            role="dialog"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="sentra-ask-panel-header p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-[var(--sentra-app-soft)]">
                    Ask Sentra
                  </p>
                  <h2
                    className="mt-2 text-xl font-semibold tracking-[-0.035em] text-[var(--sentra-app-text)]"
                    id="ask-sentra-title"
                  >
                    Command copilot
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[var(--sentra-app-muted)]" id="ask-sentra-status">
                    {displayStatusLine}
                  </p>
                </div>
                <button
                  aria-label="Close Ask Sentra"
                  className="sentra-ask-close"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>

            <div
              aria-live="polite"
              className="max-h-[min(52vh,360px)] space-y-3 overflow-y-auto p-4"
              role="log"
            >
              {messages.map((message) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className={`sentra-ask-message ${message.role === "sentra" ? "is-sentra" : "is-user"}`}
                  initial={{ opacity: 0, y: 8 }}
                  key={message.id}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {message.text}
                </motion.div>
              ))}
              {busy ? (
                <div className="sentra-ask-thinking">
                  <span />
                  Sentra is reasoning
                </div>
              ) : null}
            </div>

            <div className="sentra-ask-panel-footer p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    aria-label={`Ask Sentra: ${prompt}`}
                    className="sentra-ask-prompt"
                    key={prompt}
                    onClick={() => sendPrompt(prompt)}
                    type="button"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={onSubmit}>
                <input
                  aria-label="Ask Sentra prompt"
                  className="sentra-ask-input"
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about risk, incidents, or next actions..."
                  value={input}
                />
                <button
                  className="sentra-ask-submit"
                  disabled={busy || input.trim().length === 0}
                  type="submit"
                >
                  Ask
                </button>
              </form>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.button
        aria-controls="ask-sentra-panel"
        aria-expanded={open}
        aria-label="Open Ask Sentra copilot"
        className="sentra-ask-dock group flex items-center gap-3"
        onClick={() => setOpen((value) => !value)}
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="sentra-ask-dock-icon">
          <span />
          S
        </span>
        <span className="hidden sm:block">Ask Sentra</span>
      </motion.button>
    </div>
  );
}
