"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/system/ErrorBoundary";
import { logger } from "@/lib/logger";
import { captureError } from "@/lib/telemetry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Next.js route error boundary triggered", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
    captureError("Next.js route error boundary triggered", error, {
      component: "AppRouteErrorBoundary",
      metadata: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <ErrorState
      title="Sentra could not render this screen"
      description="The route failed while rendering. You can retry safely without leaving the application shell."
      onRetry={reset}
    />
  );
}
