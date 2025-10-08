"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ───────────── Tipos ───────────── */
type OrderStatus =
  | "nuevo"
  | "aceptado"
  | "preparando"
  | "listo"
  | "en_ruta"
  | "entregado"
  | "cancelado";
type Channel = "app" | "web" | "telefono";
type Payment = "tarjeta" | "efectivo" | "billetera";

type OrderItem = { id: string; name: string; qty: number; price: number; img?: string };
type Driver = { id: string; name: string; phone: string; avatarColor: string };
type Order = {
  id: string;
  createdAt: string;
  scheduledFor?: string;
  customer: { name: string; phone?: string; address: string; avatarColor: string };
  channel: Channel;
  payment: Payment;
  status: OrderStatus;
  tags?: ("prioridad" | "programado" | "corporativo")[];
  notes?: string;
  distanceKm?: number;
  etaMin?: number;
  total: number;
  items: OrderItem[];
  driverId?: string;
};

/* ───────────── Utils ───────────── */
const LS_KEY = "orders_mock_v2";
const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(n);

const STATUS_LABEL: Record<OrderStatus, string> = {
  nuevo: "Nuevo",
  aceptado: "Aceptado",
  preparando: "Preparando",
  listo: "Listo",
  en_ruta: "En ruta",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const CircleAvatar: React.FC<{ color: string; label?: string; size?: number }> = ({
  color,
  label = "",
  size = 36,
}) => (
  <div
    className="inline-flex items-center justify-center rounded-full text-white text-xs font-medium select-none"
    style={{ width: size, height: size, backgroundColor: color }}
    title={label}
    aria-label={label}
  >
    {label?.[0]?.toUpperCase() ?? "?"}
  </div>
);

/* (Opcional) Conductores simulados si no existen en otros módulos */
const mockDrivers = (): Driver[] => [
  { id: "d1", name: "Mario Ruiz", phone: "+1 555 222-7788", avatarColor: "#0ea5e9" },
  { id: "d2", name: "Carla León", phone: "+1 555 111-1234", avatarColor: "#22c55e" },
  { id: "d3", name: "Pablo Sena", phone: "+1 555 333-9080", avatarColor: "#f97316" },
];

export default function NewOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers] = useState<Driver[]>(() => mockDrivers());

  // Filtros
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Cargar pedidos del localStorage (misma clave del mock general)
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed: Order[] = JSON.parse(raw);
      setOrders(parsed);
    } catch {
      // no-op
    }
  }, []);

  // Guardar de vuelta si hay cambios (por aceptar/cancelar/asignar)
  useEffect(() => {
    if (orders.length) localStorage.setItem(LS_KEY, JSON.stringify(orders));
  }, [orders]);

  // Solo "nuevo" + filtros
  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return orders
      .filter((o) => o.status === "nuevo")
      .filter((o) => {
        const matchesQ =
          !words ||
          o.id.toLowerCase().includes(words) ||
          o.customer.name.toLowerCase().includes(words) ||
          o.customer.address.toLowerCase().includes(words) ||
          o.items.some((i) => i.name.toLowerCase().includes(words));
        const created = new Date(o.createdAt);
        const matchesFrom = !from || created >= from;
        const matchesTo = !to || created <= to;
        return matchesQ && matchesFrom && matchesTo;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, q, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [q, dateFrom, dateTo]);

  // Acciones
  const setStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const assignDriver = (id: string, driverId: string | "") => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, driverId: driverId || undefined } : o))
    );
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pedidos nuevos</h2>
          <p className="text-sm text-gray-500">
            Revisa y gestiona pedidos entrantes. Acepta, asigna y programa el flujo inicial.
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} pedido(s) nuevos
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-gray-500">Buscar</label>
          <input
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            placeholder="ID, cliente, dirección, producto…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800">
            <tr>
              <th className="p-3">Pedido</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Canal / Pago</th>
              <th className="p-3">Fecha/Hora</th>
              <th className="p-3">Artículos</th>
              <th className="p-3">Total</th>
              <th className="p-3">Repartidor</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {pageData.map((o) => (
              <tr key={o.id} className="align-top">
                <td className="p-3 font-semibold">{o.id}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <CircleAvatar color={o.customer.avatarColor} label={o.customer.name} />
                    <div className="min-w-0">
                      <div className="truncate">{o.customer.name}</div>
                      <div className="truncate text-xs text-gray-500">{o.customer.address}</div>
                      {o.customer.phone && (
                        <div className="text-xs text-gray-500">{o.customer.phone}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] dark:bg-gray-800">
                      {o.channel.toUpperCase()}
                    </span>{" "}
                    · {o.payment}
                  </div>
                </td>
                <td className="p-3 text-xs text-gray-600 dark:text-gray-300">
                  <div>Creado: {new Date(o.createdAt).toLocaleString()}</div>
                  {o.scheduledFor && <div>Programado: {new Date(o.scheduledFor).toLocaleString()}</div>}
                  {o.etaMin && <div>ETA: {o.etaMin} min</div>}
                </td>
                <td className="p-3">
                  <ul className="space-y-1 text-xs">
                    {o.items.slice(0, 3).map((it) => (
                      <li key={it.id} className="flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.img} alt={it.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="truncate">
                          {it.name} · x{it.qty}
                        </div>
                      </li>
                    ))}
                    {o.items.length > 3 && (
                      <li className="text-[11px] text-gray-500">+ {o.items.length - 3} más…</li>
                    )}
                  </ul>
                </td>
                <td className="p-3 font-semibold">{money(o.total)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={o.driverId ?? ""}
                      onChange={(e) => assignDriver(o.id, e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                    >
                      <option value="">Sin asignar</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {o.driverId && (
                      <CircleAvatar
                        size={24}
                        color={drivers.find((d) => d.id === o.driverId)?.avatarColor || "#94a3b8"}
                        label={drivers.find((d) => d.id === o.driverId)?.name || "R"}
                      />
                    )}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                      {STATUS_LABEL[o.status]}
                    </span>
                    <button
                      onClick={() => setStatus(o.id, "aceptado")}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => setStatus(o.id, "cancelado")}
                      className="rounded-lg border border-red-300 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={8}>
                  No hay pedidos nuevos con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
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
    </section>
  );
}
