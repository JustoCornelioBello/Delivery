"use client";

import React, { useEffect, useMemo, useState } from "react";

/* === Tipos (alineados al mock previo) === */
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
type Tag = "prioridad" | "programado" | "corporativo";

type OrderItem = { id: string; name: string; qty: number; price: number; img?: string };

type Order = {
  id: string;
  createdAt: string;
  scheduledFor?: string;
  customer: { name: string; phone?: string; address: string; avatarColor: string };
  channel: Channel;
  payment: Payment;
  status: OrderStatus;
  tags?: Tag[];
  notes?: string;
  distanceKm?: number;
  etaMin?: number;
  total: number;
  items: OrderItem[];
  driverId?: string;
};

/* === Constantes/Utils === */
const LS_KEY = "orders_mock_v2";

const STATUS_LABEL: Record<OrderStatus, string> = {
  nuevo: "Nuevo",
  aceptado: "Aceptado",
  preparando: "Preparando",
  listo: "Listo",
  en_ruta: "En ruta",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
const CHANNEL_LABEL: Record<Channel, string> = {
  app: "App",
  web: "Web",
  telefono: "Teléfono",
};
const PAYMENT_LABEL: Record<Payment, string> = {
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
  billetera: "Billetera",
};
const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(n);

/* === Componente === */
export default function HistoryOrders() {
  // Estado Base
  const [orders, setOrders] = useState<Order[]>([]);

  // Filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [payment, setPayment] = useState<Payment | "all">("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Orden y páginación
  const [sortBy, setSortBy] = useState<"fecha" | "total">("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Carga desde localStorage
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Order[];
      setOrders(parsed);
    } catch {
      // ignore
    }
  }, []);

  // Filtrado, orden y memo
  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    const list = orders.filter((o) => {
      // Sólo historial: entregados o cancelados (puedes ampliar si quieres ver todos)
      const isHistory = o.status === "entregado" || o.status === "cancelado";

      const matchesQ =
        !words ||
        o.id.toLowerCase().includes(words) ||
        o.customer.name.toLowerCase().includes(words) ||
        o.customer.address.toLowerCase().includes(words) ||
        o.items.some((it) => it.name.toLowerCase().includes(words));

      const matchesStatus = status === "all" || o.status === status;
      const matchesChannel = channel === "all" || o.channel === channel;
      const matchesPayment = payment === "all" || o.payment === payment;

      const dateRef = o.scheduledFor ? new Date(o.scheduledFor) : new Date(o.createdAt);
      const matchesFrom = !from || dateRef >= from;
      const matchesTo = !to || dateRef <= to;

      return (
        isHistory &&
        matchesQ &&
        matchesStatus &&
        matchesChannel &&
        matchesPayment &&
        matchesFrom &&
        matchesTo
      );
    });

    list.sort((a, b) => {
      if (sortBy === "fecha") {
        const da = +(a.scheduledFor ? new Date(a.scheduledFor) : new Date(a.createdAt));
        const db = +(b.scheduledFor ? new Date(b.scheduledFor) : new Date(b.createdAt));
        return sortDir === "asc" ? da - db : db - da;
      }
      if (sortBy === "total") {
        return sortDir === "asc" ? a.total - b.total : b.total - a.total;
      }
      return 0;
    });

    return list;
  }, [orders, q, status, channel, payment, dateFrom, dateTo, sortBy, sortDir]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [q, status, channel, payment, dateFrom, dateTo, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  // Totales visibles
  const summary = useMemo(() => {
    const total = filtered.reduce((acc, o) => acc + o.total, 0);
    const delivered = filtered.filter((o) => o.status === "entregado").length;
    const cancelled = filtered.filter((o) => o.status === "cancelado").length;
    return { total, delivered, cancelled };
  }, [filtered]);

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ["id", "fecha", "cliente", "direccion", "canal", "pago", "estado", "total"],
      ...filtered.map((o) => [
        o.id,
        new Date(o.scheduledFor ?? o.createdAt).toLocaleString(),
        o.customer.name,
        o.customer.address,
        o.channel,
        o.payment,
        o.status,
        String(o.total),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Historial de pedidos</h1>
          <p className="text-sm text-gray-500">
            Consulta, filtra y exporta pedidos entregados o cancelados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
            Entregados: <b>{summary.delivered}</b> · Cancelados: <b>{summary.cancelled}</b> · Total facturado:{" "}
            <b>{money(summary.total)}</b>
          </div>
          <button
            onClick={exportCSV}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-8">
          <div className="col-span-2 md:col-span-3">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ID, cliente, dirección o producto…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              {Object.keys(STATUS_LABEL).map((k) => (
                <option key={k} value={k}>
                  {STATUS_LABEL[k as OrderStatus]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Canal</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="app">App</option>
              <option value="web">Web</option>
              <option value="telefono">Teléfono</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Pago</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="efectivo">Efectivo</option>
              <option value="billetera">Billetera</option>
            </select>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-3">
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

          <div className="col-span-2 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="fecha">Fecha</option>
                <option value="total">Total</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Dirección</label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800">
            <tr>
              <th className="p-3">Pedido</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Canal</th>
              <th className="p-3">Pago</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Total</th>
              <th className="p-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {pageData.map((o) => {
              const date = new Date(o.scheduledFor ?? o.createdAt);
              return (
                <tr key={o.id} className="align-top">
                  <td className="p-3 font-medium">{o.id}</td>
                  <td className="p-3">
                    <div className="min-w-0">
                      <div className="truncate">{o.customer.name}</div>
                      <div className="truncate text-xs text-gray-500">{o.customer.address}</div>
                    </div>
                  </td>
                  <td className="p-3">{CHANNEL_LABEL[o.channel]}</td>
                  <td className="p-3">{PAYMENT_LABEL[o.payment]}</td>
                  <td className="p-3">
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs",
                        o.status === "entregado"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300"
                          : o.status === "cancelado"
                          ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300"
                          : "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-gray-800 dark:text-gray-300",
                      ].join(" ")}
                    >
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{money(o.total)}</td>
                  <td className="p-3 text-xs text-gray-500">
                    {date.toLocaleString()}
                  </td>
                </tr>
              );
            })}

            {pageData.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={7}>
                  Sin resultados con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    </section>
  );
}
