import { useState } from "react";
import { Chev } from "./icons/Chev.jsx";
import SetRow from "./SetRow.jsx";

export default function ExCard({ def, data, open, onToggle, onSet, onDone, onNote, onVariant, lastSet, onFillLast, isExtra, idx }) {
  const [showNote, setShowNote] = useState(false);
  const doneN = data.sets.filter((s) => s.done).length;
  const total = data.sets.length;
  const allDone = doneN === total;
  const hasFillable = data.sets.some((s, i) => !s.w && !s.r && lastSet?.[i]);
  const accentVar = isExtra ? "var(--extra)" : "var(--accent)";
  // Raw hex needed alongside accentVar: the active-variant background below
  // blends in an alpha suffix, which only works on a literal hex, not var().
  const accentHex = isExtra ? "#F0ABFC" : "#A78BFA";
  const R = 10;
  const CIRC = 2 * Math.PI * R;
  const bodyId = `excard-body-${def.id}`;

  return (
    <div
      style={{
        background: allDone ? "var(--done-bg)" : isExtra ? "var(--extra-bg)" : "var(--surface)",
        border: `1px solid ${allDone ? "var(--done-bd)" : isExtra ? "var(--extra-bd)" : "var(--border)"}`,
        borderRadius: 12,
        marginBottom: 8,
        overflow: "hidden",
        boxShadow: allDone ? "var(--done-glow)" : "var(--shadow-sm)",
        transition: "all .2s",
        animation: idx != null ? "cardIn .32s cubic-bezier(.22,1,.36,1) both" : "none",
        animationDelay: idx != null ? `${Math.min(idx * 35, 280)}ms` : "0ms",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "13px 14px",
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          gap: 12,
          textAlign: "left",
        }}
      >
        <div style={{ position: "relative", width: 26, height: 26, flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="13" cy="13" r={R} fill="none" stroke="var(--border)" strokeWidth="2.2" />
            <circle
              cx="13"
              cy="13"
              r={R}
              fill="none"
              stroke={allDone ? "var(--done)" : accentVar}
              strokeWidth="2.2"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - doneN / total)}
              strokeLinecap="round"
              style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dashoffset .35s" }}
            />
          </svg>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              fontWeight: 800,
              color: allDone ? "var(--done)" : "var(--dim)",
            }}
          >
            {doneN}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: "0 0 3px",
              fontSize: 13.5,
              fontWeight: 700,
              letterSpacing: "-.01em",
              color: allDone ? "var(--done)" : "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {def.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10.5, color: "var(--faint)", fontWeight: 700 }}>
              {total}×{def.target}
            </span>
            {data.variant && (
              <span style={{ fontSize: 9.5, color: "var(--dim)", fontWeight: 600 }}>· {data.variant}</span>
            )}
            {data.note.trim() && <span style={{ fontSize: 9.5, color: "var(--faint)" }}>· note</span>}
          </div>
        </div>

        <Chev open={open} />
      </button>

      {open && (
        <div id={bodyId} style={{ padding: "0 14px 14px" }}>
          {def.variants && (
            <div style={{ display: "flex", gap: 5, marginBottom: 9 }}>
              {def.variants.map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => onVariant(v)}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: 7,
                    cursor: "pointer",
                    fontSize: 10.5,
                    fontWeight: 700,
                    border: `1px solid ${data.variant === v ? accentVar : "var(--border)"}`,
                    background: data.variant === v ? `${accentHex}1A` : "transparent",
                    color: data.variant === v ? accentVar : "var(--dim)",
                    transition: "all .15s",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          {hasFillable && (
            <button
              type="button"
              onClick={onFillLast}
              style={{
                width: "100%",
                marginBottom: 9,
                padding: "8px 0",
                minHeight: 36,
                borderRadius: 7,
                cursor: "pointer",
                background: "transparent",
                border: `1px solid ${accentVar}`,
                color: accentVar,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              ↻ Use last session's numbers
            </button>
          )}

          {data.sets.map((s, i) => (
            <SetRow key={i} set={s} def={def} onChange={(f, v) => onSet(i, f, v)} onDone={() => onDone(i)} lastSet={lastSet?.[i]} />
          ))}

          {showNote || data.note ? (
            <textarea
              value={data.note}
              onChange={(e) => onNote(e.target.value)}
              placeholder="How did it feel? Form cues…"
              rows={2}
              aria-label={`Note for ${def.name}`}
              style={{
                width: "100%",
                marginTop: 9,
                background: "var(--input)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 12,
                padding: "8px 9px",
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              style={{
                marginTop: 8,
                minHeight: 44,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--faint)",
                fontSize: 11,
                padding: 0,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
              }}
            >
              + Add note
            </button>
          )}
        </div>
      )}
    </div>
  );
}
