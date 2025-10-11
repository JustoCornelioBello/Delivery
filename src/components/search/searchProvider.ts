// src/components/layout/search/searchProvider.ts
"use client";
import type { Suggestion } from "./types";

const ICON_ORDER: Record<NonNullable<Suggestion["type"]>, string> = {
  pedido: "📦",
  cliente: "👤",
  tienda: "🏪",
  repartidor: "🛵",
  factura: "🧾",
  general: "🔎",
};




export async function fetchSuggestions(q: string): Promise<Suggestion[]> {
  const url = `/api/search?q=${encodeURIComponent(q)}&pageSize=5`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));

    const json = await res.json(); // { suggestions: string[], items: [] }
    const sug: Suggestion[] = (json.suggestions ?? []).map((s: string, i: number) => ({
      id: `sug-${i}`,
      text: s,
      type: "general",
    }));

    // añade 1–3 sugerencias contextuales por tipo (si hay items)
    const byType = new Map<string, number>();
    (json.items ?? []).forEach((it: any) => {
      if (!it?.type) return;
      const n = byType.get(it.type) ?? 0;
      if (n >= 1) return; // máximo 1 por tipo para no saturar
      byType.set(it.type, n + 1);
      sug.push({
        id: `itm-${it.id}`,
        text: it.title,
        type: it.type,
        hint: it.subtitle ?? it.highlight ?? "",
      });
    });

    // Si no hay nada, devolvemos al menos el query literal
    if (sug.length === 0) {
      sug.push({ id: "literal", text: q, type: "general" });
    }

    // opcional: reordenar para poner “generales” arriba
    return sug.sort((a, b) => {
      const aw = a.type === "general" ? 0 : 1;
      const bw = b.type === "general" ? 0 : 1;
      return aw - bw;
    });
  } catch {
    return [{ id: "literal", text: q, type: "general" }];
  }
}

export function iconFor(type?: Suggestion["type"]) {
  return ICON_ORDER[type ?? "general"] ?? "🔎";
}
