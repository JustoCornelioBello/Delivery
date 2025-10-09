// ───────────────────────────────────────────────────────────────
// file: src/components/ui/Modal.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import Button from "@/components/ui/button/Button";
import { useOutsideClose } from "@/hooks/useOutsideClose";
export default function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
const ref = useOutsideClose<HTMLDivElement>(onClose);
return (
<div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
<div ref={ref} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
<div className="mb-3 flex items-center justify-between">
<h3 className="text-base font-semibold">{title}</h3>
<Button variant="secondary" onClick={onClose}>Cerrar</Button>
</div>
{children}
</div>
</div>
);
}