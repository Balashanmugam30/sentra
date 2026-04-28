"use client";

import { memo, useEffect } from "react";

import { useUiStore } from "@/store/ui-store";

export const ActionFeedback = memo(function ActionFeedback() {
  const feedbackMessage = useUiStore((state) => state.feedbackMessage);
  const setFeedbackMessage = useUiStore((state) => state.setFeedbackMessage);

  useEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedbackMessage(null);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [feedbackMessage, setFeedbackMessage]);

  if (!feedbackMessage) {
    return null;
  }

  return (
    <div
      className="min-w-[16rem] rounded-full border border-[color-mix(in_srgb,var(--color-border)_78%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-4 py-3 text-sm text-foreground shadow-[var(--shadow-soft)] backdrop-blur-md"
      role="status"
      style={{ animation: "sentra-toast-in 180ms ease-out" }}
    >
      {feedbackMessage}
    </div>
  );
});
