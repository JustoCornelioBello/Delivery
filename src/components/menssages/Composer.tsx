// ───────────────────────────────────────────────────────────────
// file: src/components/mensagge/Composer.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import { useRef, useState } from "react";
import { Paperclip, Send, Smile } from "lucide-react";


export default function Composer({ onSend }: { onSend: (text: string) => void }) {
const [text, setText] = useState("");
const textareaRef = useRef<HTMLTextAreaElement | null>(null);
const handleSend = () => { const value = text.trim(); if (!value) return; onSend(value); setText(""); textareaRef.current?.focus(); };
return (
<div className="border-t border-gray-200 p-3 dark:border-gray-800">
<div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
<button title="Adjuntar" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><Paperclip size={18} /></button>
<textarea ref={textareaRef} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} rows={1} placeholder="Escribe un mensaje…" className="min-h-[40px] w-full resize-none bg-transparent p-2 text-sm focus:outline-none" />
<button title="Emoji" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><Smile size={18} /></button>
<button onClick={handleSend} className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-white hover:bg-brand-600"><Send size={18} /></button>
</div>
<p className="mt-1 text-[11px] text-gray-500">Enter para enviar · Shift+Enter para salto de línea</p>
</div>
);
}