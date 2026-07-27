import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { DAYS, DAY_ORDER } from "./data/days.js";
import { initDay, COMPOUND } from "./App.helpers.js";
import { loadStore, saveStore, freshAllState } from "./lib/storage.js";
import { todayISO, fmtDate } from "./lib/dateUtils.js";
import { useToast } from "./hooks/useToast.jsx";
import { Tick } from "./components/icons/Tick.jsx";
import ExCard from "./components/ExCard.jsx";
import EmptyState from "./components/EmptyState.jsx";

const RestTimer = lazy(() => import("./components/RestTimer.jsx"));

export default function App() {
  const { showToast } = useToast();
  const stored = loadStore();
  const [allState, setAllState] = useState(() => (stored && stored.allState ? stored.allState : freshAllState()));
  const [dayId, setDayId] = useState(() => (stored && stored.dayId) || "d1");
  const [dateISO, setDate] = useState(() => (stored && stored.dateISO) || todayISO());
  const [editDate, setEditDate] = useState(false);
  const [open, setOpen] = useState(null);
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [showPool, setShowPool] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const day = DAYS[dayId];
  const state = allState[dayId];

  // Persist on every change
  useEffect(() => {
    saveStore({ allState, dayId, dateISO }, (msg) => {
      showToast({ message: msg, variant: "error", duration: 6000 });
    });
  }, [allState, dayId, dateISO, showToast]);

  const switchDay = useCallback((id) => {
    setDayId(id);
    setOpen(null);
    setShowPool(false);
    setTimer(null);
    setConfirmReset(false);
  }, []);

  const resetDay = useCallback(() => {
    const previousDayState = allState[dayId];
    setAllState((prev) => ({ ...prev, [dayId]: initDay(dayId) }));
    setConfirmReset(false);
    setOpen(null);
    showToast({
      message: "Cleared inputs for today.",
      actionLabel: "Undo",
      duration: 30000,
      onAction: () => setAllState((prev) => ({ ...prev, [dayId]: previousDayState })),
    });
  }, [allState, dayId, showToast]);

  const activeExtras = day.pool.filter((ex) => state[ex.id]?.active);
  const visible = [...day.baseline, ...activeExtras];

  const upd = useCallback(
    (id, fn) => {
      setAllState((prev) => ({
        ...prev,
        [dayId]: { ...prev[dayId], [id]: fn(prev[dayId][id]) },
      }));
    },
    [dayId]
  );

  const setField = useCallback(
    (id, i, f, v) =>
      upd(id, (ex) => ({
        ...ex,
        sets: ex.sets.map((s, j) => (j === i ? { ...s, [f]: v } : s)),
      })),
    [upd]
  );

  const toggleDone = useCallback(
    (id, i, def) => {
      const wasDone = state[id].sets[i].done;
      upd(id, (ex) => ({
        ...ex,
        sets: ex.sets.map((s, j) => (j === i ? { ...s, done: !s.done } : s)),
      }));
      if (!wasDone) {
        setTimer(COMPOUND.includes(def.name) ? 150 : 75);
        setTimerKey((k) => k + 1);
      }
    },
    [state, upd]
  );

  const toggleExtra = useCallback((id) => upd(id, (ex) => ({ ...ex, active: !ex.active })), [upd]);

  const totalSets = visible.reduce((a, e) => a + state[e.id].sets.length, 0);
  const doneSets = visible.reduce((a, e) => a + state[e.id].sets.filter((s) => s.done).length, 0);
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;
  const baseDone = day.baseline.every((e) => state[e.id].sets.every((s) => s.done));

  const copyLog = useCallback(async () => {
    const L = [];
    L.push(`${day.name.toUpperCase()} — ${day.focus}`);
    L.push(fmtDate(dateISO));
    L.push("");
    const write = (ex, mark) => {
      const d = state[ex.id];
      const unit = ex.assist ? "kg assist" : ex.timed ? "s" : ex.perSide ? "kg/side" : "kg";
      const vari = d.variant ? ` [${d.variant}]` : "";
      L.push(`${mark}${ex.name}${vari}  (${ex.sets}×${ex.target})`);
      d.sets.forEach((s) => {
        const w = s.w ? `${s.w}${unit}` : "—";
        const r = s.r ? ` × ${s.r}` : "";
        L.push(`   ${s.n}.  ${w}${r}${s.done ? "  ✓" : ""}`);
      });
      if (d.note.trim()) L.push(`   ↳ ${d.note.trim()}`);
      L.push("");
    };
    day.baseline.forEach((ex) => write(ex, ""));
    if (activeExtras.length) {
      L.push(`— ${day.poolLabel} —`);
      L.push("");
      activeExtras.forEach((ex) => write(ex, "+ "));
    }
    L.push("───────────────");
    L.push(`${doneSets}/${totalSets} sets · ${pct}%`);
    const text = L.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }, [day, state, dateISO, activeExtras, doneSets, totalSets, pct]);

  return (
    <div
      className="app-shell"
      style={{
        background: "var(--bg)",
        maxWidth: 480,
        margin: "0 auto",
        color: "var(--text-primary)",
        paddingBottom: timer !== null ? 140 : "env(safe-area-inset-bottom)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div
        style={{
          padding: "26px 20px 18px",
          background: "linear-gradient(180deg, var(--surface-hi) 0%, var(--bg) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {editDate ? (
            <input
              type="date"
              value={dateISO}
              autoFocus
              onChange={(e) => setDate(e.target.value)}
              onBlur={() => setEditDate(false)}
              aria-label="Session date"
              style={{
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--accent)",
                color: "var(--accent)",
                fontSize: 10,
                letterSpacing: ".12em",
                outline: "none",
                padding: "0 2px",
                fontWeight: 800,
                minHeight: 44,
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditDate(true)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ fontSize: 10, color: "var(--dim)", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 800 }}>
                {fmtDate(dateISO)}
              </span>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="var(--faint)" strokeWidth="1.6" aria-hidden="true">
                <path d="M8 2l2 2-6 6H2V8L8 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                fontSize: 10,
                color: "var(--faint)",
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
              }}
            >
              Reset day
            </button>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 9.5, color: "var(--danger)", fontWeight: 700 }}>Clear all inputs?</span>
              <button
                type="button"
                onClick={resetDay}
                style={{
                  background: "var(--danger)",
                  border: "none",
                  borderRadius: 5,
                  padding: "3px 8px",
                  minHeight: 32,
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: "#0A0810",
                  cursor: "pointer",
                }}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 5,
                  padding: "3px 8px",
                  minHeight: 32,
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: "var(--dim)",
                  cursor: "pointer",
                }}
              >
                No
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <h1 style={{ margin: "0 0 3px", fontSize: 27, fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1 }}>{day.name}</h1>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--accent)", fontWeight: 700, letterSpacing: "-.01em" }}>{day.focus}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-.03em",
                color: pct === 100 ? "var(--done)" : "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
                transition: "transform .3s cubic-bezier(.34,1.56,.64,1), color .3s ease",
                transform: pct === 100 ? "scale(1.08)" : "scale(1)",
              }}
            >
              {pct}
              <span style={{ fontSize: 15, color: "var(--faint)" }}>%</span>
            </p>
            <p style={{ margin: 0, fontSize: 10, color: "var(--faint)", fontWeight: 700 }}>
              {doneSets}/{totalSets} sets
            </p>
          </div>
        </div>

        <div style={{ height: 4, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: 3,
              background: pct === 100 ? "var(--done)" : "linear-gradient(90deg, var(--accent-dim), var(--accent))",
              transition: "width .5s cubic-bezier(.34,1.56,.64,1)",
              animation: pct === 100 ? "barGlow 1.6s ease-in-out 1" : "none",
            }}
          />
        </div>

        {baseDone && (
          <div
            style={{
              marginTop: 11,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 11px",
              background: "var(--done-bg)",
              border: "1px solid var(--done-bd)",
              borderRadius: 7,
              animation: "bannerIn .4s cubic-bezier(.34,1.56,.64,1) both",
            }}
          >
            <Tick color="var(--done)" />
            <span style={{ fontSize: 11, color: "var(--done)", fontWeight: 700 }}>Baseline complete</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 5, padding: "13px 20px", borderBottom: "1px solid var(--border)" }}>
        {DAY_ORDER.map((id) => (
          <button
            type="button"
            key={id}
            onClick={() => switchDay(id)}
            aria-pressed={dayId === id}
            style={{
              flex: 1,
              padding: "9px 0",
              minHeight: 44,
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: ".06em",
              background: dayId === id ? "var(--accent)" : "var(--surface)",
              color: dayId === id ? "#0A0810" : "var(--dim)",
              transition: "all .18s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {DAYS[id].tag}
          </button>
        ))}
      </div>

      <div key={dayId} className="day-fade" style={{ padding: "15px 20px 0" }}>
        {day.baseline.map((ex, idx) => (
          <ExCard
            key={ex.id}
            def={ex}
            data={state[ex.id]}
            idx={idx}
            open={open === ex.id}
            onToggle={() => setOpen((o) => (o === ex.id ? null : ex.id))}
            onSet={(i, f, v) => setField(ex.id, i, f, v)}
            onDone={(i) => toggleDone(ex.id, i, ex)}
            onNote={(v) => upd(ex.id, (e) => ({ ...e, note: v }))}
            onVariant={(v) => upd(ex.id, (e) => ({ ...e, variant: v }))}
            isExtra={false}
          />
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 11px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 9.5, color: "var(--extra)", fontWeight: 800, letterSpacing: ".13em", textTransform: "uppercase" }}>
            Extras · {day.poolLabel}
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {activeExtras.map((ex) => (
          <ExCard
            key={ex.id}
            def={ex}
            data={state[ex.id]}
            open={open === ex.id}
            onToggle={() => setOpen((o) => (o === ex.id ? null : ex.id))}
            onSet={(i, f, v) => setField(ex.id, i, f, v)}
            onDone={(i) => toggleDone(ex.id, i, ex)}
            onNote={(v) => upd(ex.id, (e) => ({ ...e, note: v }))}
            onVariant={(v) => upd(ex.id, (e) => ({ ...e, variant: v }))}
            isExtra
          />
        ))}

        <button
          type="button"
          onClick={() => setShowPool((p) => !p)}
          aria-expanded={showPool}
          style={{
            width: "100%",
            padding: "11px",
            minHeight: 44,
            borderRadius: 10,
            cursor: "pointer",
            background: "transparent",
            border: "1px dashed var(--border-hi)",
            color: "var(--dim)",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: showPool ? 8 : 0,
            transition: "all .15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showPool ? "Hide options" : `+ Add extra  ·  ${day.pool.length - activeExtras.length} available`}
        </button>

        {showPool && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 11, padding: 7, marginBottom: 4 }}>
            {day.pool.length === 0 ? (
              <EmptyState title="No optional exercises" message="This day has no extras configured." />
            ) : (
              day.pool.map((ex) => {
                  const on = state[ex.id].active;
                  return (
                    <button
                      type="button"
                      key={ex.id}
                      onClick={() => toggleExtra(ex.id)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        minHeight: 44,
                        borderRadius: 8,
                        cursor: "pointer",
                        background: on ? "var(--extra-bg)" : "transparent",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        textAlign: "left",
                        marginBottom: 2,
                        transition: "background .15s",
                      }}
                    >
                      <div
                        style={{
                          width: 17,
                          height: 17,
                          borderRadius: 5,
                          flexShrink: 0,
                          border: `1.5px solid ${on ? "var(--extra)" : "var(--border-hi)"}`,
                          background: on ? "var(--extra)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {on && <Tick color="#0A0810" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: on ? "var(--extra)" : "var(--text-primary)" }}>{ex.name}</p>
                        <p style={{ margin: "1px 0 0", fontSize: 10, color: "var(--faint)", fontWeight: 600 }}>
                          {ex.sets}×{ex.target} · {ex.group}
                        </p>
                      </div>
                    </button>
                  );
              })
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "20px 20px 36px" }}>
        <button
          type="button"
          onClick={copyLog}
          style={{
            width: "100%",
            padding: "15px",
            minHeight: 44,
            borderRadius: 11,
            cursor: "pointer",
            border: `1px solid ${copied ? "var(--done-bd)" : "var(--border-hi)"}`,
            background: copied ? "var(--done-bg)" : "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            transition: "all .2s",
          }}
        >
          {copied ? (
            <Tick color="var(--done)" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="var(--dim)" strokeWidth="1.5" aria-hidden="true">
              <rect x="5" y="2" width="8" height="10" rx="2" />
              <path d="M3 5H2.5A1.5 1.5 0 001 6.5v6A1.5 1.5 0 002.5 14h6a1.5 1.5 0 001.5-1.5V12" />
            </svg>
          )}
          <span style={{ fontSize: 13, fontWeight: 700, color: copied ? "var(--done)" : "var(--dim)" }}>
            {copied ? "Copied — paste into Notes" : "Copy session log"}
          </span>
        </button>
        <p style={{ margin: "12px 0 0", fontSize: 10.5, color: "var(--faint)", textAlign: "center", lineHeight: 1.6 }}>
          Your entries save automatically on this device.
        </p>
      </div>

      {timer !== null && (
        <Suspense fallback={null}>
          <RestTimer key={timerKey} seconds={timer} onClose={() => setTimer(null)} />
        </Suspense>
      )}
    </div>
  );
}
