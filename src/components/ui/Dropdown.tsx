"use client";
import { useRef, useState } from "react";
import { cls } from "@/lib/utils";
import { useOutsideClose } from "@/hooks/useOutsideClose";
export type Option<T extends string = string> = { label: string; value: T };
export default function Dropdown<T extends string = string>({ value, onChange, options, placeholder, className }: { value: T; onChange: (v: T) => void; options: Option<T>[]; placeholder?: string; className?: string; }) {
const [open, setOpen] = useState(false);
const btnRef = useRef<HTMLButtonElement | null>(null);
const ref = useOutsideClose<HTMLDivElement>(() => setOpen(false));
const current = options.find((o) => o.value === value);
return (
<div className={cls("relative", className)} ref={ref}>
<button ref={btnRef} type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((s) => !s)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm dark:border-gray-700 dark:bg-gray-800">
<span className={cls(!current && "text-gray-400")}>{current?.label ?? placeholder ?? "Seleccionar"}</span>
<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="opacity-70">
<path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
</svg>
</button>
{open && (
<ul role="listbox" className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900">
{options.map((o) => (
<li key={o.value} role="option" aria-selected={o.value === value} onClick={() => { onChange(o.value); setOpen(false); btnRef.current?.focus(); }} className={cls("cursor-pointer rounded-md px-2 py-1.5 hover:bg-gray-50 focus:bg-gray-50 dark:hover:bg-gray-800", o.value === value && "bg-gray-50 dark:bg-gray-800")}>{o.label}</li>
))}
</ul>
)}
</div>
);
}