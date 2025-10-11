"use client";
import React from "react";
import type { SearchItem } from "./types";

export default function ResultCard({ item }: { item: SearchItem }) {
  const base = (
    <header className="mb-2">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">
        {item.type}
      </div>
      <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white">
        {item.title}
      </h3>
      {item.subtitle && (
        <p className="line-clamp-1 text-xs text-gray-500">{item.subtitle}</p>
      )}
    </header>
  );

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {base}

      {/* body según tipo */}
      <div className="min-h-[44px] text-sm text-gray-700 dark:text-gray-200">
        {item.type === "pedido" && "Pedido relacionado con cliente y estado del envío."}
        {item.type === "cliente" && "Cliente con datos de contacto y actividad reciente."}
        {item.type === "tienda" && "Tienda con ubicación, estado y horario."}
        {item.type === "repartidor" && "Repartidor con disponibilidad, rating y zonas."}
        {item.type === "factura" && "Factura con importe y estado de pago."}
        {item.highlight && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {item.highlight}
          </p>
        )}
      </div>

      {/* footer */}
      <footer className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {item.tags?.slice(0, 3).map((t) => (
            <span key={t} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {t}
            </span>
          ))}
        </div>
        {item.updatedAt && (
          <time className="text-xs text-gray-500">
            {new Date(item.updatedAt).toLocaleString()}
          </time>
        )}
      </footer>
    </article>
  );
}
