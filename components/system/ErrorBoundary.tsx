"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { Button, Card, Container } from "@/components/ui";
import { logger } from "@/lib/logger";
import { captureError } from "@/lib/telemetry";

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode | ((props: { error: Error | null; reset: () => void }) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Container className="flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-xl">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">System Error</p>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">{title}</h1>
          </div>
          <p className="text-sm leading-6 text-muted">{description}</p>
          {onRetry ? <Button onClick={onRetry}>Retry</Button> : null}
        </div>
      </Card>
    </Container>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("React error boundary captured an error", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    captureError("React error boundary captured an error", error, {
      component: "ErrorBoundary",
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  private reset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback({
            error: this.state.error,
            reset: this.reset,
          });
        }

        return this.props.fallback;
      }

      return (
        <ErrorState
          title="Something went wrong"
          description={this.state.error?.message ?? "An unexpected UI error occurred."}
          onRetry={this.reset}
        />
      );
    }

    return this.props.children;
  }
}
