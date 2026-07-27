import { useEffect, useRef, useState } from "react";
import { Tick } from "./icons/Tick.jsx";

export default function SetRow({ set, def, onChange, onDone }) {
  const label = def.assist ? "assist" : def.timed ? "sec" : def.bodyweight ? "+kg" : def.perSide ? "kg/side" : "kg";
  const [pop, setPop] = useState(false);
  const prevDone = useRef(set.done);

  useEffect(() => {
    if (!prevDone.current && set.done) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 420);
      return () => clearTimeout(t);
    }
    prevDone.current = set.done;
  }, [set.done]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 0",
        borderBottom: "1px solid var(--border)",
        opacity: set.done ? 0.45 : 1,
        transition: "opacity .2s",
      }}
    >
      <span style={{ fontSize: 10, color: "var(--faint)", width: 14, flexShrink: 0, fontWeight: 800 }}>{set.n}</span>

      <div style={{ flex: 1.35, position: "relative" }}>
        <input
          type="text"
          inputMode="decimal"
          value={set.w}
          onChange={(e) => onChange("w", e.target.value)}
          placeholder="—"
          aria-label={`Set ${set.n} weight`}
          style={{
            width: "100%",
            background: "var(--input)",
            border: "1px solid var(--border)",
            borderRadius: 7,
            color: "var(--text-primary)",
            fontSize: 14,
            fontWeight: 600,
            padding: "8px 46px 8px 9px",
            boxSizing: "border-box",
            outline: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 9,
            color: "var(--faint)",
            pointerEvents: "none",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <input
          type="text"
          inputMode="numeric"
          value={set.r}
          onChange={(e) => onChange("r", e.target.value)}
          placeholder="—"
          aria-label={`Set ${set.n} reps`}
          style={{
            width: "100%",
            background: "var(--input)",
            border: "1px solid var(--border)",
            borderRadius: 7,
            color: "var(--text-primary)",
            fontSize: 14,
            fontWeight: 600,
            padding: "8px 34px 8px 9px",
            boxSizing: "border-box",
            outline: "none",
          }}
        />
        <span
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 9,
            color: "var(--faint)",
            pointerEvents: "none",
            fontWeight: 700,
          }}
        >
          reps
        </span>
      </div>

      <button
        type="button"
        onClick={onDone}
        aria-label={set.done ? `Mark set ${set.n} as not done` : `Mark set ${set.n} as done`}
        style={{
          width: 44,
          height: 44,
          borderRadius: 9,
          flexShrink: 0,
          padding: 0,
          cursor: "pointer",
          border: `1.5px solid ${set.done ? "var(--done)" : "var(--border)"}`,
          background: set.done ? "var(--done)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .15s",
          position: "relative",
          transform: pop ? "scale(1.18)" : "scale(1)",
        }}
      >
        {set.done && <Tick color="var(--bg)" />}
        {pop && (
          <span
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: 11,
              border: "2px solid var(--done)",
              animation: "ringPop .42s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        )}
      </button>
    </div>
  );
}
