// ───────────────────────────────────────────────────────────────
// file: src/components/mensagge/ChatHeader.tsx
// ───────────────────────────────────────────────────────────────
"use client";
import { Conversation } from "./types";
import Avatar from "./Avatar";
import IconButton from "./IconButton";
import { MoreVertical, Phone, Video } from "lucide-react";


export default function ChatHeader({ convo }: { convo: Conversation }) {
const other = !convo.isGroup && convo.participants.find((p) => p.id !== "me");
return (
<header className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-800">
<div className="flex items-center gap-3">
<Avatar name={convo.name} />
<div>
<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{convo.name}</h2>
<p className="text-[11px] text-gray-500">{convo.isGroup ? `${convo.participants.length} participantes` : other?.online ? "En línea" : "Desconectado"}</p>
</div>
</div>
<div className="flex items-center gap-2">
<IconButton title="Llamar"><Phone size={18} /></IconButton>
<IconButton title="Videollamada"><Video size={18} /></IconButton>
<IconButton title="Más acciones"><MoreVertical size={18} /></IconButton>
</div>
</header>
);
}