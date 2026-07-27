import { useState } from "react";
import { deltaFor, weeklyDelta } from "../lib/bodyLog.js";
import { todayISO, fmtDate } from "../lib/dateUtils.js";
import { TAB_BAR_CLEARANCE } from "../lib/layout.js";
import EmptyState from "../components/EmptyState.jsx";

function DeltaTag({ delta }) {
  if (delta == null) return null;
  const down = delta <= 0;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 999,
        background: down ? "var(--done-bg)" : "rgba(248,113,113,0.15)",
        color: down ? "var(--done)" : "var(--danger)",
      }}
    >
      {down ? "▾" : "▴"} {Math.abs(delta).toFixed(1)} kg
    </span>
  );
}

function TrendChart({ entries }) {
  if (entries.length < 2) return null;
  const weights = entries.map((e) => e.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const points = entries
    .map((e, i) => {
      const x = (i / (entries.length - 1)) * 300;
      const y = 44 - ((e.weight - min) / range) * 40;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" height="48" viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BodyScreen({ bodyLog, onAddEntry }) {
  const [input, setInput] = useState("");
  const sorted = [...bodyLog].sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
  const latest = sorted[sorted.length - 1];
  const recent = [...sorted].reverse().slice(0, 8);
  const weekDelta = weeklyDelta(bodyLog);

  const handleSave = () => {
    const weight = parseFloat(input);
    if (Number.isNaN(weight) || weight <= 0) return;
    onAddEntry({ dateISO: todayISO(), weight });
    setInput("");
  };

  return (
    <div style={{ padding: `4px 20px ${TAB_BAR_CLEARANCE}` }}>
      <h1 style={{ margin: "22px 0 3px", fontSize: 25, fontWeight: 800, letterSpacing: "-.03em" }}>Body</h1>
      <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--accent)", fontWeight: 700 }}>Weight &amp; measurements</p>

      {bodyLog.length === 0 ? (
        <EmptyState title="No entries yet" message="Log today's weight below to start tracking your trend." />
      ) : (
        <div
          style={{
            padding: 16,
            marginBottom: 16,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 28, fontWeight: 700, letterSpacing: "-.03em", color: "var(--text-primary)" }}>
                {latest.weight}
                <span style={{ fontSize: 14, color: "var(--faint)" }}> kg</span>
              </p>
              <p style={{ margin: 0, fontSize: 10.5, color: "var(--faint)", fontWeight: 600 }}>
                {latest.dateISO === todayISO() ? "Today" : fmtDate(latest.dateISO)}
              </p>
            </div>
            {weekDelta != null && (
              <span style={{ fontSize: 11, fontWeight: 700, color: weekDelta <= 0 ? "var(--done)" : "var(--danger)" }}>
                {weekDelta <= 0 ? "▾" : "▴"} {Math.abs(weekDelta).toFixed(1)} kg this week
              </span>
            )}
          </div>
          <TrendChart entries={sorted.slice(-8)} />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 8px 8px 14px",
          marginBottom: 20,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <label htmlFor="body-weight-input" style={{ flex: 1, fontSize: 12.5, color: "var(--dim)", fontWeight: 600 }}>
          Log today's weight
        </label>
        <input
          id="body-weight-input"
          type="text"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={latest ? String(latest.weight) : "kg"}
          style={{
            width: 64,
            minHeight: 36,
            textAlign: "right",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--text-primary)",
            background: "var(--input)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "6px 10px",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          style={{
            minHeight: 36,
            padding: "0 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "var(--accent)",
            color: "var(--bg)",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          Save
        </button>
      </div>

      {recent.length > 0 && (
        <>
          <p style={{ margin: "0 0 8px", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>
            Recent entries
          </p>
          {recent.map((e) => (
            <div
              key={e.dateISO}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 13px",
                marginBottom: 7,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{e.weight} kg</p>
                <p style={{ margin: 0, fontSize: 10.5, color: "var(--faint)", fontWeight: 600 }}>
                  {e.dateISO === todayISO() ? "Today" : fmtDate(e.dateISO)}
                </p>
              </div>
              <DeltaTag delta={deltaFor(bodyLog, e)} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
