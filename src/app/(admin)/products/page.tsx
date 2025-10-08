"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ConfirmModal from "@/components/orders/ConfirmModal";

/* Tipos */
export type ProductStatus = "active" | "draft" | "archived";
export type UnitType = "unidad" | "paquete";

export type Product = {
  id: string;
  name: string;
  sku?: string;
  category: string;
  price: number;
  stock?: number;
  status: ProductStatus;
  image?: string;     // dataURL o ruta pública
  unitType?: UnitType; // “unidad” o “paquete”
  variants?: number;
  createdAt?: string;
  updatedAt?: string;
};

const LS_KEYS = ["delivery_products_v2", "delivery_products_v1"]; // compat. con tu creador

/* Utils */
const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(
    isNaN(n) ? 0 : n
  );

const statusBadge: Record<ProductStatus, { label: string; cn: string }> = {
  active: {
    label: "Activo",
    cn: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  draft: {
    label: "Borrador",
    cn: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  },
  archived: {
    label: "Archivado",
    cn: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-gray-800 dark:text-gray-300",
  },
};

/* Página */
export default function ProductsPage() {
  const [all, setAll] = useState<Product[]>([]);
  const [q, setQ] = useState<string>("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [unitType, setUnitType] = useState<UnitType | "all">("all");

  // paginación
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // confirmación
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Cargar productos desde localStorage (compatibles con tus formularios de creación)
  useEffect(() => {
    for (const key of LS_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Product[];
          if (Array.isArray(parsed)) {
            setAll(parsed);
            break;
          }
        } catch {
          // no-op
        }
      }
    }
  }, []);

  // Guardar al eliminar
  useEffect(() => {
    // guarda en el primero por simplicidad
    localStorage.setItem(LS_KEYS[0], JSON.stringify(all));
  }, [all]);

  // Derivar categorías únicas
  const categories = useMemo(() => {
    const set = new Set<string>();
    all.forEach((p) => set.add(p.category));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [all]);

  // Filtrado
  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase();
    return all.filter((p) => {
      const mQ =
        !words ||
        p.name.toLowerCase().includes(words) ||
        (p.sku ?? "").toLowerCase().includes(words) ||
        p.category.toLowerCase().includes(words);
      const mCat = cat === "all" || p.category === cat;
      const mSt = status === "all" || p.status === status;
      const mUnit = unitType === "all" || p.unitType === unitType;
      return mQ && mCat && mSt && mUnit;
    });
  }, [all, q, cat, status, unitType]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [q, cat, status, unitType, pageSize]);
  const pageData = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  // Acciones
  const askDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = () => {
    if (!pendingDeleteId) return;
    setAll((prev) => prev.filter((p) => p.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Productos
          </h1>
          <p className="text-sm text-gray-500">
            Búsqueda, filtros y paginación para grandes catálogos. 
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {filtered.length} resultado(s)
        </div>
      </div>

      {/* Controles */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, SKU o categoría…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Categoría</label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Todas" : c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus | "all")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="active">Activo</option>
              <option value="draft">Borrador</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Tipo</label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as UnitType | "all")}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="unidad">Unidad</option>
              <option value="paquete">Paquete</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Tamaño página</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {[12, 24, 48, 96].map((n) => (
                <option key={n} value={n}>
                  {n} / página
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {pageData.map((p) => (
          <article
            key={p.id}
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              {p.image ? (
                <Image
                  alt={p.name}
                  src={p.image}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  Sin imagen
                </div>
              )}
              <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${statusBadge[p.status].cn}`}
                >
                  {statusBadge[p.status].label}
                </span>
                {p.unitType && (
                  <span className="rounded-full bg-gray-900/70 px-2 py-0.5 text-[10px] text-white">
                    {p.unitType}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="line-clamp-1 font-medium">{p.name}</h4>
                  <p className="text-xs text-gray-500">
                    {p.sku ?? "—"} · {p.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{money(p.price)}</p>
                  <p className="text-xs text-gray-500">
                    Stock: {typeof p.stock === "number" ? p.stock : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  onClick={() => alert(`Editar ${p.name} (engancha tu modal/route)`)}
                >
                  Editar
                </button>
                <button
                  className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300"
                  onClick={() => askDelete(p.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}

        {pageData.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700">
            No hay resultados con esos filtros.
          </div>
        )}
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {filtered.length} resultado(s) · Página {page} de {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Anterior
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        open={confirmOpen}
        title="Eliminar producto"
        message="Esta acción no se puede deshacer. ¿Eliminar el producto seleccionado?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={doDelete}
        onClose={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </section>
  );
}
