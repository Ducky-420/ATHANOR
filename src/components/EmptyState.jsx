export default function EmptyState({ title, message }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "28px 16px",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>{title}</p>
      {message && (
        <p style={{ margin: 0, fontSize: 11, color: "var(--dim)", lineHeight: 1.5 }}>{message}</p>
      )}
    </div>
  );
}
