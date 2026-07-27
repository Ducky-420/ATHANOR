import { DAYS } from "../data/days.js";
import { computeStreak } from "../lib/sessionHistory.js";
import { fmtDate } from "../lib/dateUtils.js";
import { TAB_BAR_CLEARANCE } from "../lib/layout.js";
import EmptyState from "../components/EmptyState.jsx";

function StatCard({ value, label }) {
  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: 12,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{value}</p>
      <p style={{ margin: 0, fontSize: 9.5, color: "var(--faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
        {label}
      </p>
    </div>
  );
}

export default function ProgressScreen({ history }) {
  const streak = computeStreak(history);
  const avgComplete = history.length ? Math.round(history.reduce((a, h) => a + h.pct, 0) / history.length) : 0;

  const chartEntries = history.slice(-8);
  const recent = [...history].reverse().slice(0, 8);

  return (
    <div style={{ padding: `4px 20px ${TAB_BAR_CLEARANCE}` }}>
      <h1 style={{ margin: "22px 0 3px", fontSize: 25, fontWeight: 800, letterSpacing: "-.03em" }}>Progress</h1>
        <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--accent)", fontWeight: 700 }}>
          {history.length ? `${history.length} session${history.length === 1 ? "" : "s"} logged` : "No sessions yet"}
        </p>

        {history.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            message="Finish a workout and tap Reset day on the Log tab to start tracking your history here."
          />
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <StatCard value={streak} label="Day streak" />
              <StatCard value={history.length} label="Sessions" />
              <StatCard value={`${avgComplete}%`} label="Avg. complete" />
            </div>

            <div
              style={{
                padding: "16px 14px",
                marginBottom: 20,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <p style={{ margin: "0 0 10px", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>
                Completion by session
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
                {chartEntries.map((h, i) => (
                  <div key={h.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${Math.max(h.pct, 3)}%`,
                        borderRadius: "4px 4px 0 0",
                        background: i === chartEntries.length - 1 ? "var(--accent)" : "var(--accent-dim)",
                        transition: "height .35s var(--ease-sheet)",
                      }}
                    />
                    <span style={{ fontSize: 8.5, color: "var(--faint)", fontWeight: 700 }}>{DAYS[h.dayId]?.tag.replace("DAY ", "D") ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ margin: "0 0 8px", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>
              Recent sessions
            </p>
            {recent.map((h) => (
              <div
                key={h.id}
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
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--accent-bd)",
                    color: "var(--accent)",
                    fontSize: 10.5,
                    fontWeight: 800,
                  }}
                >
                  {h.pct}%
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{h.dayName}</p>
                  <p style={{ margin: 0, fontSize: 10.5, color: "var(--faint)", fontWeight: 600 }}>{fmtDate(h.dateISO)}</p>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--dim)",
                    background: "var(--surface-hi)",
                    padding: "3px 8px",
                    borderRadius: 999,
                  }}
                >
                  {h.doneSets}/{h.totalSets} sets
                </span>
              </div>
            ))}
          </>
        )}
    </div>
  );
}
