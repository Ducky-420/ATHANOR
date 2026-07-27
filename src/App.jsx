import { useCallback, useEffect, useState } from "react";
import { loadStore, saveStore } from "./lib/storage.js";
import { upsertEntry } from "./lib/bodyLog.js";
import { useToast } from "./hooks/useToast.js";
import TabBar from "./components/TabBar.jsx";
import LogScreen from "./screens/LogScreen.jsx";
import ProgressScreen from "./screens/ProgressScreen.jsx";
import BodyScreen from "./screens/BodyScreen.jsx";

export default function App() {
  const { showToast } = useToast();
  const stored = loadStore();
  const [screen, setScreen] = useState("log");
  const [history, setHistory] = useState(() => stored?.history ?? []);
  const [bodyLog, setBodyLog] = useState(() => stored?.bodyLog ?? []);

  useEffect(() => {
    saveStore({ history, bodyLog }, (msg) => {
      showToast({ message: msg, variant: "error", duration: 6000 });
    });
  }, [history, bodyLog, showToast]);

  const onArchiveSession = useCallback((summary) => {
    setHistory((prev) => [...prev, summary]);
  }, []);

  const onUndoArchiveSession = useCallback((id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const onAddBodyEntry = useCallback((entry) => {
    setBodyLog((prev) => upsertEntry(prev, entry));
  }, []);

  return (
    <div
      className="app-shell"
      style={{
        background: "var(--bg)",
        maxWidth: 480,
        margin: "0 auto",
        color: "var(--text-primary)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {screen === "log" && <LogScreen onArchiveSession={onArchiveSession} onUndoArchiveSession={onUndoArchiveSession} />}
      {screen === "progress" && <ProgressScreen history={history} />}
      {screen === "body" && <BodyScreen bodyLog={bodyLog} onAddEntry={onAddBodyEntry} />}

      <TabBar screen={screen} onChange={setScreen} />
    </div>
  );
}
