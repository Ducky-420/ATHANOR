export function Chev({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="var(--dim)"
      strokeWidth="1.6"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        transition: "transform .2s",
        transform: `rotate(${open ? 180 : 0}deg)`,
      }}
    >
      <path d="M3.5 5.5L7 9l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
