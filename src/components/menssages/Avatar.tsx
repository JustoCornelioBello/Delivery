// ───────────────────────────────────────────────────────────────
// file: src/components/mensagge/Avatar.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import { useMemo } from "react";
export default function Avatar({ name, online }: { name: string; online?: boolean }) {
const initials = useMemo(() => name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase(), [name]);
return (
<div className="relative inline-grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500/90 to-indigo-600 text-white">
<span className="text-xs font-semibold">{initials}</span>
{online && <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
</div>
);
}