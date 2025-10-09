// ───────────────────────────────────────────────────────────────
// file: src/hooks/useOutsideClose.ts
// ───────────────────────────────────────────────────────────────
"use client";
import { useEffect, useRef } from "react";
export function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
const ref = useRef<T | null>(null);
useEffect(() => {
const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onClose();
document.addEventListener("mousedown", h);
return () => document.removeEventListener("mousedown", h);
}, [onClose]);
return ref;
}