import { useState } from "react";
import { calculatePlates, suggestWarmup } from "../lib/plateMath.js";

export default function PlateCalculator({ accentVar }) {
  const [input, setInput] = useState("");
  const { plates, remainder } = calculatePlates(input);
  const warmup = suggestWarmup(input);

  return (
    <div
      style={{
        background: "var(--input)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "9px 10px",
        marginBottom: 9,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: plates.length || remainder ? 8 : 0 }}>
        <span style={{ fontSize: 11, color: "var(--dim)", fontWeight: 700, flexShrink: 0 }}>Per side</span>
        <input
          type="text"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="kg"
          aria-label="Target weight per side for plate calculator"
          style={{
            flex: 1,
            minWidth: 0,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--text-primary)",
            fontSize: 13,
            fontWeight: 600,
            padding: "6px 8px",
            boxSizing: "border-box",
            outline: "none",
          }}
        />
      </div>

      {plates.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {plates.map((p) => (
            <span
              key={p.weight}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11.5,
                fontWeight: 700,
                color: accentVar,
                background: "var(--surface)",
                border: `1px solid ${accentVar}`,
                borderRadius: 6,
                padding: "3px 7px",
              }}
            >
              {p.weight}
              <span style={{ color: "var(--faint)", fontWeight: 600 }}>×{p.count}</span>
            </span>
          ))}
        </div>
      )}

      {remainder > 0 && (
        <p style={{ margin: "6px 0 0", fontSize: 10.5, color: "var(--danger)" }}>
          {remainder.toFixed(2)}kg can't be made exactly with this plate set.
        </p>
      )}

      {warmup.length > 0 && (
        <p style={{ margin: "8px 0 0", fontSize: 10.5, color: "var(--dim)", fontWeight: 600 }}>
          Warm-up: {warmup.join(" → ")} → <span style={{ color: "var(--text-primary)" }}>{input}</span>
        </p>
      )}
    </div>
  );
}
