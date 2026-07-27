// en-CA formats as YYYY-MM-DD using the browser's local timezone, unlike
// Date#toISOString (UTC), which can land on the wrong calendar day near midnight.
export const todayISO = () => new Date().toLocaleDateString("en-CA");

export const fmtDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
