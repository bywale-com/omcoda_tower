import { Component, type ErrorInfo, type ReactNode } from "react";

type RegisterErrorBoundaryProps = {
  children: ReactNode;
};

type RegisterErrorBoundaryState = {
  error: Error | null;
};

/** Surfaces register render failures instead of a blank page. */
export class RegisterErrorBoundary extends Component<
  RegisterErrorBoundaryProps,
  RegisterErrorBoundaryState
> {
  state: RegisterErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RegisterErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Register render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            color: "#b91c1c",
            background: "#fff",
            minHeight: "100vh",
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Register failed to render</p>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{this.state.error.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
