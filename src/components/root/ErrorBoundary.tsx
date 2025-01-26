"use client";

import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  suppressConsole?: boolean;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error("Error occurred:", error);

    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (!this.props.suppressConsole && process.env.NODE_ENV === "development") {
      console.error("Error occurred:", error);
    }
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
