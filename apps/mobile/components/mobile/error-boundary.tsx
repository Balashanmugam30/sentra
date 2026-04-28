"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { EmptyState } from "./empty-state";

type ErrorBoundaryProps = {
  children: ReactNode;
  label?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void error;
    void info;
  }

  render() {
    if (this.state.hasError) {
      return <EmptyState description="This panel could not render. Core route, SOS, and offline guidance remain available." title={this.props.label ?? "Panel recovered"} tone="warning" />;
    }

    return this.props.children;
  }
}
