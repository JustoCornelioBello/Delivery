// ───────────────────────────────────────────────────────────────
// file: src/components/mensagge/Badge.tsx
// ───────────────────────────────────────────────────────────────
"use client";
export default function Badge({ children }: { children: React.ReactNode }) {
return <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white">{children}</span>;
}