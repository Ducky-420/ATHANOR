import { useEffect, useRef, useState } from "react";
import { fmtTime } from "../lib/dateUtils.js";
import { REST_TIMER_BOTTOM } from "../lib/layout.js";

export default function RestTimer({ seconds, onClose }) {
  const [left, setLeft] = useState(seconds);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => setLeft((l) => (l <= 1 ? 0 : l - 1)), 1000);
    return () => clearInterval(ref.current);
  }, []);

  useEffect(() => {
    if (left === 0 && ref.current) clearInterval(ref.current);
  }, [left]);

  const done = left === 0;
  const pct = seconds > 0 ? (seconds - left) / seconds : 1;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: REST_TIMER_BOTTOM,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 24px)",
        maxWidth: 456,
        zIndex: 50,
        boxSizing: "border-box",
        background: "var(--surface-glass)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${done ? "var(--done-bd)" : "var(--accent-bd)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "14px 18px",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10.5, color: "var(--dim)", letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 700 }}>
          {done ? "Rest complete" : "Resting"}
        </span>
        <span
          style={{
            fontSize: 23,
            fontWeight: 800,
            letterSpacing: "-.02em",
            color: done ? "var(--done)" : "var(--accent)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmtTime(left)}
        </span>
      </div>
      <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
        <div
          style={{
            height: "100%",
            width: `${pct * 100}%`,
            background: done ? "var(--done)" : "var(--accent)",
            borderRadius: 2,
            transition: "width 1s linear",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => setLeft((l) => l + 30)}
          aria-label="Add 30 seconds to rest timer"
          style={{
            flex: 1,
            padding: "15px 0",
            borderRadius: 8,
            cursor: "pointer",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--dim)",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          +30s
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 2,
            padding: "15px 0",
            borderRadius: 8,
            cursor: "pointer",
            border: "none",
            background: done ? "var(--done)" : "var(--accent)",
            color: "var(--bg)",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {done ? "Next set" : "Skip rest"}
        </button>
      </div>
    </div>
  );
}
