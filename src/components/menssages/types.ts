// ───────────────────────────────────────────────────────────────
// file: src/components/mensagge/types.ts
// ───────────────────────────────────────────────────────────────
export type Participant = { id: string; name: string; avatar?: string; role?: string; online?: boolean };
export type Message = { id: string; authorId: string; text: string; sentAt: string; status: "sending" | "sent" | "read" };
export type Conversation = { id: string; name: string; isGroup: boolean; participants: Participant[]; lastMessageAt: string; unread: number; messages: Message[] };