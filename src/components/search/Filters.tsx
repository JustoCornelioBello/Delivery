"use client";
import React from "react";
import type { Facets } from "./types";

type Props = {
  facets: Facets;
  onToggle?: (facetKey: keyof Facets, bucketKey: string) => void; // opcional
};

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      {children}
    </section>
  );
}

export default function Filters({ facets, onToggle }: Props) {
  return (
    <div className="sticky top-[88px] space-y-3">
      {/* Tipo */}
      <Section title="Tipo">
        <ul className="space-y-1 text-sm">
          {facets.type.map((b) => (
            <li key={b.key}>
              <button
                onClick={() => onToggle?.("type", b.key)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${b.selected ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "text-gray-700 dark:text-gray-200"}`}
              >
                <span>{b.label}</span>
                <span className="text-xs text-gray-500">({b.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {/* Estado (si aplica) */}
      {facets.estado && facets.estado.length > 0 && (
        <Section title="Estado">
          <div className="flex flex-wrap gap-2">
            {facets.estado.map((b) => (
              <button
                key={b.key}
                onClick={() => onToggle?.("estado", b.key)}
                className={`rounded-full px-3 py-1.5 text-xs ring-1 ring-inset ${b.selected ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700"}`}
              >
                {b.label} <span className="opacity-60">({b.count})</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Zonas (si aplica) */}
      {facets.zona && facets.zona.length > 0 && (
        <Section title="Zona">
          <ul className="space-y-1 text-sm">
            {facets.zona.map((b) => (
              <li key={b.key}>
                <button
                  onClick={() => onToggle?.("zona", b.key)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${b.selected ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "text-gray-700 dark:text-gray-200"}`}
                >
                  <span>{b.label}</span>
                  <span className="text-xs text-gray-500">({b.count})</span>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
