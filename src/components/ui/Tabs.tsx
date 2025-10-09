// ───────────────────────────────────────────────────────────────
// file: src/components/ui/Tabs.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import { cls } from "@/lib/utils";
export default function Tabs({ tabs, value, onChange }: { tabs: { key: string; label: string }[]; value: string; onChange: (k: string) => void; }) {
return (
<div className="flex overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
{tabs.map((t) => {
const active = value === t.key;
return (
<button key={t.key} onClick={() => onChange(t.key)} className={cls("min-w-[120px] flex-1 rounded-lg px-3 py-2 text-sm transition", active ? "bg-brand-500 font-medium text-white" : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60")}>{t.label}</button>
);
})}
</div>
);
}