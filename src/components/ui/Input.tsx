// ───────────────────────────────────────────────────────────────
// file: src/components/ui/Input.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import React from "react";
import { cls } from "@/lib/utils";
export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
return (
<input
{...props}
className={cls(
"w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-gray-700 dark:bg-gray-800",
props.className
)}
/>
);
}