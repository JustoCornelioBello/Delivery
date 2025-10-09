// ───────────────────────────────────────────────────────────────
// file: src/components/ui/ToastViewport.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import { Toast } from "@/hooks/useToasts";
import { cls } from "@/lib/utils";
export default function ToastViewport({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
const palette: Record<Toast["kind"], string> = { success: "bg-emerald-600", error: "bg-rose-600", info: "bg-slate-700" };
return (
<div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
{toasts.map((t) => (
<div key={t.id} className={cls("pointer-events-auto flex items-start gap-3 rounded-xl p-3 text-white shadow-lg", palette[t.kind])}>
<span className="text-sm">{t.msg}</span>
<button className="ml-auto opacity-80 hover:opacity-100" onClick={() => remove(t.id)}>✕</button>
</div>
))}
</div>
);
}