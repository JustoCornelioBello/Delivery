// ───────────────────────────────────────────────────────────────
// file: src/components/ui/RowMenu.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import { useOutsideClose } from "@/hooks/useOutsideClose";
import { cls } from "@/lib/utils";
export default function RowMenu({ open, onClose, actions }: { open: boolean; onClose: () => void; actions: { label: string; danger?: boolean; onClick: () => void }[]; }) {
const ref = useOutsideClose<HTMLDivElement>(onClose);
if (!open) return null;
return (
<div ref={ref} className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
<ul className="py-1 text-sm">
{actions.map((a) => (
<li key={a.label}>
<button onClick={() => { a.onClick(); onClose(); }} className={cls("flex w-full items-center px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5", a.danger ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-200")}>{a.label}</button>
</li>
))}
</ul>
</div>
);
}