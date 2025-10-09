// ───────────────────────────────────────────────────────────────
// file: src/components/ui/FormSection.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import React from "react";
export default function FormSection({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
return (
<section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
<div className="flex items-center justify-between">
<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
{right}
</div>
{children}
</section>
);
}