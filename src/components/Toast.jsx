const VARIANT_COLOR = {
  info: "var(--accent)",
  error: "var(--danger)",
  success: "var(--done)",
};

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 448,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--surface-glass)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${VARIANT_COLOR[t.variant] ?? "var(--border-hi)"}`,
            borderLeft: `3px solid ${VARIANT_COLOR[t.variant] ?? "var(--border-hi)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "12px 14px",
            boxShadow: "var(--shadow-md)",
            animation: "bannerIn .3s cubic-bezier(.34,1.56,.64,1) both",
          }}
        >
          <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{t.message}</span>
          {t.actionLabel && (
            <button
              type="button"
              onClick={() => {
                t.onAction?.();
                onDismiss(t.id);
              }}
              style={{
                flexShrink: 0,
                minHeight: 32,
                padding: "6px 10px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: VARIANT_COLOR[t.variant] ?? "var(--accent)",
                color: "var(--bg)",
                fontSize: 11.5,
                fontWeight: 800,
              }}
            >
              {t.actionLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              padding: 0,
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: "var(--dim)",
              fontSize: 15,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
