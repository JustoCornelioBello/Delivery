"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { EntityType } from "./types";

type ActiveFilter = { key: string; value: string; label?: string };

type Props = {
  query: string;
  suggestions?: string[];
  onPick: (value: string) => void;
  onClearFilters?: () => void;
  activeFilters?: ActiveFilter[];              // ⬅️ nuevo: chips activos
  onRemoveFilter?: (key: string, value: string) => void;
  onAddType?: (t: EntityType) => void;         // ⬅️ nuevo: atajo para tipo
};

export default function EmptyState({
  query,
  suggestions = [],
  onPick,
  onClearFilters,
  activeFilters = [],
  onRemoveFilter,
  onAddType,
}: Props) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("search_recent");
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const popular = useMemo(
    () => [
      "Pedidos de hoy",
      "Clientes frecuentes",
      "Tiendas activas",
      "Repartidores disponibles",
      "Facturas del mes",
      "Pagos fallidos",
      "Zonas sin cobertura",
      "Entregas urgentes",
    ],
    []
  );

  const entityActions: { key: EntityType; label: string }[] = [
    { key: "pedido", label: "Buscar pedidos" },
    { key: "cliente", label: "Buscar clientes" },
    { key: "tienda", label: "Buscar tiendas" },
    { key: "repartidor", label: "Buscar repartidores" },
    { key: "factura", label: "Buscar facturas" },
  ];

  const hasSuggestions = suggestions.length > 0;
  const hasRecent = recent.length > 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* icono */}
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
        <svg width="22" height="22" viewBox="0 0 24 24" className="fill-current">
          <path d="M10 2a8 8 0 0 1 6.32 12.9l4.39 4.39a1 1 0 0 1-1.42 1.42l-4.39-4.39A8 8 0 1 1 10 2Zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4Z" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Sin resultados para <span className="text-brand-600 dark:text-brand-400">“{query || "—"}”</span>
      </h2>

      <p className="mx-auto mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
        Puede deberse a filtros muy estrictos, un error tipográfico o que aún no existe contenido con ese criterio.
      </p>

      {/* chips de filtros activos */}
      {activeFilters.length > 0 && (
        <div className="mx-auto mt-4 max-w-2xl">
          <div className="mb-2 text-left text-xs font-medium text-gray-500">Filtros activos:</div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span key={`${f.key}:${f.value}`} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                <span className="font-medium">{f.label ?? f.key}:</span>
                <span>{f.value}</span>
                {onRemoveFilter && (
                  <button
                    onClick={() => onRemoveFilter(f.key, f.value)}
                    className="rounded-full bg-gray-200 px-1.5 text-[10px] hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    aria-label="Quitar filtro"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
          </div>
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="mt-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Atajos por tipo de entidad */}
      <div className="mx-auto mt-6 max-w-3xl">
        <h4 className="mb-2 text-left text-sm font-medium text-gray-800 dark:text-gray-100">Buscar por tipo</h4>
        <div className="flex flex-wrap gap-2">
          {entityActions.map((e) => (
            <button
              key={e.key}
              onClick={() => onAddType?.(e.key)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sugerencias del backend */}
      {hasSuggestions && (
        <section className="mx-auto mt-6 max-w-3xl">
          <h4 className="mb-2 text-left text-sm font-medium text-gray-800 dark:text-gray-100">
            ¿Quizás quisiste decir…?
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => onPick(s)}
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recientes */}
      {hasRecent && (
        <section className="mx-auto mt-6 max-w-3xl">
          <h4 className="mb-2 text-left text-sm font-medium text-gray-800 dark:text-gray-100">
            Búsquedas recientes
          </h4>
          <div className="flex flex-wrap gap-2">
            {recent.slice(0, 8).map((r) => (
              <button
                key={r}
                onClick={() => onPick(r)}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {r}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Populares */}
      <section className="mx-auto mt-6 max-w-3xl">
        <h4 className="mb-2 text-left text-sm font-medium text-gray-800 dark:text-gray-100">
          Búsquedas populares
        </h4>
        <div className="flex flex-wrap gap-2">
          {popular.map((p) => (
            <button
              key={p}
              onClick={() => onPick(p)}
              className="rounded-full bg-white px-3 py-1.5 text-sm text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-800"
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Ejemplos */}
      <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-gray-200 bg-white p-4 text-left text-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="mb-2 font-medium text-gray-800 dark:text-gray-100">Ejemplos:</p>
        <ul className="list-inside list-disc space-y-1 text-gray-600 dark:text-gray-400">
          <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">pedido 10293</code> — ID exacto.</li>
          <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">cliente maría lópez</code> — nombre + apellido.</li>
          <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">tienda central cdmx</code> — nombre + zona.</li>
          <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">repartidor disponible</code> — estado operativo.</li>
          <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">factura sep 2025 pagada</code> — periodo + estado.</li>
        </ul>
      </div>
    </div>
  );
}
