// ───────────────────────────────────────────────────────────────
// file: src/app/mensajes/page.tsx
// (Página principal usando los componentes — área de lista fija + chat con scroll)
// ───────────────────────────────────────────────────────────────
"use client";
import { useEffect, useMemo, useState } from "react";
import { Composer, MessageList, Sidebar, ChatHeader } from "@/components/menssages";
import type { Conversation, Participant } from "@/components/menssages";


const me: Participant = { id: "me", name: "Tú", online: true };
const mockConvos = (): Conversation[] => {
const p1: Participant = { id: "u1", name: "María López", online: true };
const p2: Participant = { id: "u2", name: "Juan Pérez", online: false };
const g1: Participant = { id: "u3", name: "Soporte" };
const now = new Date();
const earlier = new Date(now.getTime() - 1000 * 60 * 30).toISOString();
const earlier2 = new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString();
const yest = new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString();
return [
{ id: "c1", name: "Grupo VIP Clientes", isGroup: true, participants: [me, p1, p2, g1], lastMessageAt: now.toISOString(), unread: 2, messages: [ { id: "m1", authorId: "u1", text: "¿Hay promo este fin?", sentAt: yest, status: "read" }, { id: "m2", authorId: "me", text: "Sí, 15% en envíos.", sentAt: earlier2, status: "read" }, { id: "m3", authorId: "u2", text: "Genial, gracias.", sentAt: earlier, status: "read" }, { id: "m4", authorId: "u3", text: "Les confirmo horarios: 9am–8pm.", sentAt: now.toISOString(), status: "sent" } ] },
{ id: "c2", name: "María López", isGroup: false, participants: [me, p1], lastMessageAt: earlier, unread: 0, messages: [ { id: "m1", authorId: "u1", text: "Hola, necesito cambiar la dirección de entrega.", sentAt: yest, status: "read" }, { id: "m2", authorId: "me", text: "Claro, pásame la nueva dirección.", sentAt: earlier2, status: "read" }, { id: "m3", authorId: "u1", text: "Av. Central 123, Torre B.", sentAt: earlier, status: "read" } ] },
{ id: "c3", name: "Juan Pérez", isGroup: false, participants: [me, p2], lastMessageAt: earlier2, unread: 1, messages: [ { id: "m1", authorId: "u2", text: "¿Pueden emitir factura a nombre de MiPyme?", sentAt: earlier2, status: "sent" } ] }
];
};


export default function MensajesPage() {
const [conversations, setConversations] = useState<Conversation[]>(mockConvos());
const [activeId, setActiveId] = useState<string>(conversations[0]?.id);
const active = useMemo(() => conversations.find((c) => c.id === activeId)!, [conversations, activeId]);


const handleSend = (text: string) => {
setConversations((prev) => prev.map((c) => c.id === active.id ? { ...c, lastMessageAt: new Date().toISOString(), messages: [...c.messages, { id: Math.random().toString(36).slice(2, 9), authorId: "me", text, sentAt: new Date().toISOString(), status: "sent" }], unread: 0 } : c));
};


useEffect(() => {
const t = setInterval(() => {
setConversations((prev) => prev.map((c) => { if (!c.isGroup || Math.random() > 0.25) return c; return { ...c, lastMessageAt: new Date().toISOString(), messages: [...c.messages, { id: Math.random().toString(36).slice(2, 9), authorId: c.participants.find((p) => p.id !== "me")?.id || "uX", text: "👍", sentAt: new Date().toISOString(), status: "read" }] }; }));
}, 18000);
return () => clearInterval(t);
}, []);


return (
  <div className="mx-auto grid h-[85vh] min-h-0 max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 md:grid-cols-[360px_1fr]">
    <Sidebar conversations={conversations} activeId={activeId} onSelect={setActiveId} />
    <section className="flex h-full min-h-0 flex-col">
      <ChatHeader convo={active} />
      {/* Listado con scroll interno fijo */}
      <MessageList convo={active} meId="me" />
      <Composer onSend={handleSend} />
    </section>
  </div>
);
}