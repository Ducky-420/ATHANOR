const TABS = [
  { id: "log", label: "Log", icon: "M4 17h2v3H4v-3zm14 0h2v3h-2v-3zM8 13h8v7H8v-7zm-2-6h12v2H6V7z" },
  { id: "progress", label: "Progress", icon: "M4 20V10m6 10V4m6 16v-7" },
  { id: "body", label: "Body", icon: "M12 3v2M6 5h12l-2 9a6 6 0 01-8 0L6 5z" },
];

export default function TabBar({ screen, onChange }) {
  return (
    <nav
      aria-label="Main"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "calc(14px + env(safe-area-inset-bottom))",
        width: "calc(100% - 32px)",
        maxWidth: 448,
        height: 60,
        boxSizing: "border-box",
        display: "flex",
        gap: 4,
        padding: "8px 10px",
        zIndex: 40,
        background: "var(--surface-glass)",
        backdropFilter: "blur(12px) saturate(140%)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-float)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {TABS.map((t) => {
        const active = screen === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              minHeight: 44,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              border: "none",
              cursor: "pointer",
              borderRadius: 14,
              background: active ? "#A78BFA24" /* --accent at 14% */ : "transparent",
              color: active ? "var(--accent)" : "var(--faint)",
              transition: "transform .12s var(--ease-pop), background .15s ease",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={t.icon} />
            </svg>
            <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 600 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
