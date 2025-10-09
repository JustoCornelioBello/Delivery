// ───────────────────────────────────────────────────────────────
// file: src/components/mensagge/Sidebar.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import { useMemo, useState } from "react";
import { Conversation } from "./types";
import Avatar from "./Avatar";
import Badge from "./Badge";
import IconButton from "./IconButton";
import { cls, dateLabel, timeHHMM } from "./utils";
import { MoreVertical, Plus, Search, Users, User as UserIcon } from "lucide-react";


export default function Sidebar({ conversations, activeId, onSelect }: { conversations: Conversation[]; activeId?: string; onSelect: (id: string) => void; }) {
const [q, setQ] = useState("");
const [tab, setTab] = useState<"all" | "groups" | "clients">("all");
const filtered = useMemo(() => {
const base = conversations.filter((c) => {
const matchQ = q ? c.name.toLowerCase().includes(q.toLowerCase()) || c.participants.some((p) => p.name.toLowerCase().includes(q.toLowerCase())) : true;
const matchTab = tab === "all" ? true : tab === "groups" ? c.isGroup : !c.isGroup;
return matchQ && matchTab;
});
return base.sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt));
}, [conversations, q, tab]);


return (
<aside className="flex h-full w-full max-w-sm flex-col border-r border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/60">
<div className="flex items-center gap-2 p-3">
<div className="relative w-full">
<Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2" size={16} />
<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar clientes, grupos…" className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-gray-700 dark:bg-gray-800" />
</div>
<IconButton title="Nueva conversación"><Plus size={18} /></IconButton>
</div>


<div className="mx-3 mb-2 grid grid-cols-3 gap-1">
<button onClick={() => setTab("all")} className={cls("flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs", tab === "all" ? "bg-brand-500 text-white" : "border border-gray-200 dark:border-gray-700")}>Todos</button>
<button onClick={() => setTab("groups")} className={cls("flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs", tab === "groups" ? "bg-brand-500 text-white" : "border border-gray-200 dark:border-gray-700")}><Users size={14}/> Grupos</button>
<button onClick={() => setTab("clients")} className={cls("flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs", tab === "clients" ? "bg-brand-500 text-white" : "border border-gray-200 dark:border-gray-700")}><UserIcon size={14}/> Clientes</button>
</div>


<ul className="flex-1 overflow-y-auto px-2 pb-2">
{filtered.map((c) => (
<li key={c.id}>
<button onClick={() => onSelect(c.id)} className={cls("group flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800/70", activeId === c.id && "bg-gray-100 dark:bg-gray-800")}>
<Avatar name={c.name} />
<div className="min-w-0 flex-1">
<div className="flex items-center gap-2">
<p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
{c.unread > 0 && <Badge>{c.unread}</Badge>}
</div>
<p className="truncate text-xs text-gray-500">{dateLabel(c.lastMessageAt)} · {timeHHMM(c.lastMessageAt)}</p>
</div>
<MoreVertical size={16} className="opacity-60 group-hover:opacity-100" />
</button>
</li>
))}
{filtered.length === 0 && <div className="px-3 py-10 text-center text-sm text-gray-500">Sin resultados para {q}</div>}
</ul>
</aside>
);
}