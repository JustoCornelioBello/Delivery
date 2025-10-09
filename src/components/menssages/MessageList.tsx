// ───────────────────────────────────────────────────────────────
// file: src/components/mensagge/MessageList.tsx
// (scroll interno fijo para no expandir la página)
// ───────────────────────────────────────────────────────────────
"use client";
import { useEffect, useMemo, useRef } from "react";
import { Conversation, Message } from "./types";
import { Check, CheckCheck } from "lucide-react";
import { cls, dateLabel, timeHHMM } from "./utils";


function DateSeparator({ when }: { when: string }) {
    return (
        <div className="my-4 text-center">
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-800">{dateLabel(when)}</span>
        </div>
    );
}


function Bubble({ message, isMe }: { message: Message; isMe: boolean }) {
    const palette = isMe ? "bg-brand-500 text-white rounded-2xl rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm dark:bg-gray-800 dark:text-gray-100";
    return (
        <div className={cls("max-w-[75%] p-2  text-sm shadow-sm", palette)}>
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
            <div className={cls("mt-1 flex items-center gap-1 text-[10px] opacity-80", isMe ? "text-white" : "text-gray-500")}>
                <span>{timeHHMM(message.sentAt)}</span>
                {isMe && (message.status === "sending" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> : message.status === "sent" ? <Check size={12} /> : <CheckCheck size={12} />)}
            </div>
        </div>
    );
}

export default function MessageList({ convo, meId }: { convo: Conversation; meId: string }) {
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const groups = useMemo(() => {
        const byDay: { label: string; items: Message[] }[] = [];
        for (const m of [...convo.messages].sort((a, b) => +new Date(a.sentAt) - +new Date(b.sentAt))) {
            const label = dateLabel(m.sentAt);
            const last = byDay[byDay.length - 1];
            if (!last || last.label !== label) byDay.push({ label, items: [m] }); else last.items.push(m);
        }
        return byDay;
    }, [convo.messages]);


    useEffect(() => {
        scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
    }, [convo.messages.length]);


    return (
        <div ref={scrollerRef} className="h-[calc(100vh-280px)] flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 p-4 dark:from-gray-950 dark:to-gray-900 md:h-auto">
            {groups.map((g) => (
                <div key={g.label}>
                    <DateSeparator when={g.items[0].sentAt} />
                    <div className="space-y-2">
                        {g.items.map((m) => {
                            const isMe = m.authorId === meId;
                            return (
                                <div key={m.id} className={cls("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                    <Bubble message={m} isMe={isMe} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            {convo.messages.length === 0 && <div className="grid h-full place-items-center text-sm text-gray-500">No hay mensajes todavía.</div>}
        </div>
    );
}