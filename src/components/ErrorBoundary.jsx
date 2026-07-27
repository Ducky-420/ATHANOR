import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Athanor crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 24,
            textAlign: "center",
            background: "var(--bg)",
            color: "var(--text-primary)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Something went wrong.</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--dim)", maxWidth: 320, lineHeight: 1.6 }}>
            Try reloading the page. Your saved workout data is unaffected — it lives in this browser's local
            storage, not in memory.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              minHeight: 44,
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: "var(--accent)",
              color: "#0A0810",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
