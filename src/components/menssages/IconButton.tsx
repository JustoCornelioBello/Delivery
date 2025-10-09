// ───────────────────────────────────────────────────────────────
// file: src/components/mensagge/IconButton.tsx
// ───────────────────────────────────────────────────────────────
"use client";
export default function IconButton({ title, children, onClick }: { title: string; children: React.ReactNode; onClick?: () => void }) {
return (
<button title={title} onClick={onClick} className="inline-grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
{children}
</button>
);
}