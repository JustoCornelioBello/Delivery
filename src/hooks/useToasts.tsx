"use client";
import { useState } from "react";
export type Toast = { id: string; kind: "success" | "error" | "info"; msg: string };
export function useToasts() {
const [toasts, setToasts] = useState<Toast[]>([]);
const push = (t: Omit<Toast, "id">) => {
const id = Math.random().toString(36).slice(2, 9);
setToasts((prev) => [...prev, { ...t, id }]);
setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
};
const remove = (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id));
return { toasts, push, remove };
}