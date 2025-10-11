// src/components/layout/search/SuggestionList.tsx
"use client";
import React from "react";
import type { Suggestion } from "./types";
import { iconFor } from "./searchProvider";

type Props = {
  query: string;
  loading: boolean;
  suggestions: Suggestion[];
  recent: string[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (value: string) => void;
  onClearRecent: () => void;
};

export default function SuggestionList({
  query,
  loading,
  suggestions,
  recent,
  activeIndex,
  onHover,
  onSelect,
  onClearRecent,
}: Props) {
  const showRecent = !query.trim() && recent.length > 0;
  const list = showRecent
    ? recent.map<Suggestion>((r, i) => ({ id: `rec-${i}`, text: r, type: "general" }))
    : suggestions;

  return (
    <div className="absolute z-[80] mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      {/* cabecera */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
        <span>{showRecent ? "Búsquedas recientes" : "Sugerencias"}</span>
        {loading && <span className="animate-pulse">buscando…</span>}
      </div>

      <ul role="listbox" className="max-h-[60vh] overflow-auto py-1">
        {list.map((sug, i) => {
          const active = i === activeIndex;
          return (
            <li key={sug.id}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                onMouseEnter={() => onHover(i)}
                onClick={() => onSelect(sug.text)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                  active
                    ? "bg-brand-50 text-gray-900 dark:bg-brand-500/10 dark:text-white"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-gray-100 text-base dark:bg-gray-800">
                  {iconFor(sug.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{sug.text}</div>
                  {sug.hint && (
                    <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {sug.hint}
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}

        {list.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-gray-500">
            Sin sugerencias.
          </li>
        )}
      </ul>

      {/* pie */}
      <div className="border-t border-gray-200 px-3 py-2 text-[11px] text-gray-500 dark:border-gray-800 dark:text-gray-400">
        {showRecent ? (
          <button onClick={onClearRecent} className="rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            Limpiar recientes
          </button>
        ) : (
          <span>Enter para buscar · ↑/↓ para navegar · Esc para cerrar</span>
        )}
      </div>
    </div>
  );
}
