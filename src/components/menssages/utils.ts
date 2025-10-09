// ───────────────────────────────────────────────────────────────
// file: src/components/mensagge/utils.ts
// ───────────────────────────────────────────────────────────────
export const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");
export const timeHHMM = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
export const dateLabel = (iso: string) => {
const d = new Date(iso); const today = new Date();
const y = new Date(); y.setDate(today.getDate() - 1);
if (d.toDateString() === today.toDateString()) return "Hoy";
if (d.toDateString() === y.toDateString()) return "Ayer";
return d.toLocaleDateString();
};