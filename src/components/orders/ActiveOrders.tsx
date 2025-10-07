"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ───────────────────── Tipos ───────────────────── */
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

type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  img?: string;
};

type Driver = {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
};

type Order = {
  id: string;
  createdAt: string;
  scheduledFor?: string;
  customer: {
    name: string;
    phone?: string;
    address: string;
    avatarColor: string;
  };
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

/* ───────────────────── Type Guards ───────────────────── */
const isOrderStatus = (v: string): v is OrderStatus =>
  ["nuevo", "aceptado", "preparando", "listo", "en_ruta", "entregado", "cancelado"].includes(v);

/* ───────────────────── Constantes / Utils ───────────────────── */
const LS_KEY = "orders_mock_v2";
const uid = () => Math.random().toString(36).slice(2, 10);
const dateIso = (d = new Date()) => d.toISOString();
const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(n);

const STATUS_META: Record<
  OrderStatus,
  { label: string; className: string; next?: OrderStatus[] }
> = {
  nuevo: {
    label: "Nuevo",
    className:
      "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
    next: ["aceptado", "cancelado"],
  },
  aceptado: {
    label: "Aceptado",
    className:
      "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-900/20 dark:text-sky-300",
    next: ["preparando", "cancelado"],
  },
  preparando: {
    label: "Preparando",
    className:
      "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
    next: ["listo", "cancelado"],
  },
  listo: {
    label: "Listo",
    className:
      "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300",
    next: ["en_ruta", "cancelado"],
  },
  en_ruta: {
    label: "En ruta",
    className:
      "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 dark:bg-purple-900/20 dark:text-purple-300",
    next: ["entregado", "cancelado"],
  },
  entregado: {
    label: "Entregado",
    className:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  cancelado: {
    label: "Cancelado",
    className:
      "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300",
  },
};

/* Avatar simple */
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

/* ───────────────────── Generador Mock ───────────────────── */
const NAMES = ["Ana", "Luis", "Carla", "Mauro", "Sofía", "Daniel", "Valeria", "Pedro", "Lucía", "Iván"];
const STREETS = ["Av. Central 123", "Calle 8 #45", "Av. Norte 900", "Diag. 12"];
const COLORS = ["#f97316", "#10b981", "#3b82f6", "#a855f7", "#ef4444", "#eab308"];
const PRODUCTS = [
  "Hamburguesa Clásica",
  "Pizza Pepperoni",
  "Combo Familiar",
  "Ensalada César",
  "Wrap Pollo",
  "Papas Fritas",
  "Refresco 500ml",
  "Helado Vainilla",
];

const randomOf = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function mockItem(): OrderItem {
  const name = randomOf(PRODUCTS);
  const qty = randomInt(1, 3);
  const price = randomInt(3, 18);
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='${
      COLORS[randomInt(0, COLORS.length - 1)]
    }'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='11' font-family='sans-serif'>${name
      .split(" ")[0]
      .slice(0, 6)}</text></svg>`
  );
  const img = `data:image/svg+xml;utf8,${svg}`;
  return { id: uid(), name, qty, price, img };
}

function mockOrder(i: number): Order {
  const items = new Array(randomInt(1, 4)).fill(0).map(() => mockItem());
  const total = items.reduce((a, b) => a + b.qty * b.price, 0);
  const status = randomOf<OrderStatus>([
    "nuevo",
    "aceptado",
    "preparando",
    "listo",
    "en_ruta",
    "entregado",
    "cancelado",
  ]);
  const now = new Date();
  const createdAt = new Date(
    now.getTime() - randomInt(0, 7) * 24 * 60 * 60 * 1000 - randomInt(0, 120) * 60000
  );

  const isScheduled = Math.random() < 0.2;
  const scheduledFor = isScheduled ? new Date(now.getTime() + randomInt(1, 48) * 60 * 60000) : undefined;

  return {
    id: `ORD-${String(1000 + i)}`,
    createdAt: dateIso(createdAt),
    scheduledFor: scheduledFor ? dateIso(scheduledFor) : undefined,
    customer: {
      name: randomOf(NAMES),
      phone: `+1 555 ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
      address: randomOf(STREETS),
      avatarColor: randomOf(COLORS),
    },
    channel: randomOf<Channel>(["app", "web", "telefono"]),
    payment: randomOf<Payment>(["tarjeta", "efectivo", "billetera"]),
    status,
    total,
    items,
  };
}

function mockDrivers(): Driver[] {
  return [
    { id: "d1", name: "Mario Ruiz", phone: "+1 555 222-7788", avatarColor: "#0ea5e9" },
    { id: "d2", name: "Carla León", phone: "+1 555 111-1234", avatarColor: "#22c55e" },
    { id: "d3", name: "Pablo Sena", phone: "+1 555 333-9080", avatarColor: "#f97316" },
  ];
}

/* ───────────────────── Componente ───────────────────── */
export default function OrdersMockStrict() {
  // Datos
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers] = useState<Driver[]>(() => mockDrivers());

  // UI / filtros (simplificados)
  const [q, setQ] = useState<string>("");
  const [status, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"fecha" | "total">("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  // Init
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed: Order[] = JSON.parse(raw);
        setOrders(parsed);
        return;
      } catch {
        // no-op
      }
    }
    const mock = Array.from({ length: 28 }, (_, i) => mockOrder(i));
    setOrders(mock);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(orders));
  }, [orders]);

  // Filtrado + ordenamiento (simplificado)
  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase();
    const list = orders.filter((o) => {
      const matchesQ =
        !words ||
        o.id.toLowerCase().includes(words) ||
        o.customer.name.toLowerCase().includes(words) ||
        o.customer.address.toLowerCase().includes(words) ||
        o.items.some((it) => it.name.toLowerCase().includes(words));
      const matchesStatus = status === "all" || o.status === status;
      return matchesQ && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === "fecha") {
        const da = +new Date(a.createdAt);
        const db = +new Date(b.createdAt);
        return sortDir === "asc" ? da - db : db - da;
      }
      return sortDir === "asc" ? a.total - b.total : b.total - a.total;
    });

    return list;
  }, [orders, q, status, sortBy, sortDir]);

  const activeStatuses: OrderStatus[] = ["nuevo", "aceptado", "preparando", "listo", "en_ruta"];
  const activeOrders = useMemo(() => filtered.filter((o) => activeStatuses.includes(o.status)), [filtered]);
  // (Se eliminó la sección de historial, no se requiere separar otras órdenes)


  
  const bulkAssign = (driverId: string) => {
    if (!selected.length) {
      alert("Selecciona al menos un pedido.");
      return;
    }
    setOrders((prev) => prev.map((o) => (selected.includes(o.id) ? { ...o, driverId } : o)));
    setSelected([]);
  };

  const bulkStatus = (s: OrderStatus) => {
    if (!selected.length) {
      alert("Selecciona al menos un pedido.");
      return;
    }
    setOrders((prev) => prev.map((o) => (selected.includes(o.id) ? { ...o, status: s } : o)));
    setSelected([]);
  };

  const updateOrderStatus = (id: string, s: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: s } : o)));
  };

  const detail = useMemo(() => (detailId ? orders.find((o) => o.id === detailId) ?? null : null), [
    detailId,
    orders,
  ]);

  /* ───────────────────── Render ───────────────────── */
  return (
    <div className="space-y-5">
      {/* Header (eliminamos subtítulo innecesario) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pedidos</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const rows: string[][] = [
                ["id", "fecha", "cliente", "direccion", "estado", "total"],
                ...filtered.map((o) => [
                  o.id,
                  new Date(o.createdAt).toLocaleString(),
                  o.customer.name,
                  o.customer.address,
                  o.status,
                  String(o.total),
                ]),
              ];
              const csv = rows
                .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `orders_${Date.now()}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros (mucho menos) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
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
            <label className="mb-1 block text-xs text-gray-500">Estado</label>
            <select
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value === "all" ? "all" : isOrderStatus(e.target.value) ? e.target.value : "all")
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              {(["nuevo", "aceptado", "preparando", "listo", "en_ruta", "entregado", "cancelado"] as OrderStatus[]).map((k) => (
                <option key={k} value={k}>
                  {STATUS_META[k].label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSortBy(e.target.value === "total" ? "total" : "fecha")
                }
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSortDir(e.target.value === "asc" ? "asc" : "desc")
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Acciones masivas (con botón compacto) */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Seleccionados: {selected.length}</span>
          <div className="flex gap-2">
            <select
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const id = e.target.value;
                if (id) bulkAssign(id);
                e.currentTarget.selectedIndex = 0;
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              defaultValue=""
              aria-label="Asignar repartidor"
            >
              <option value="" disabled>
                Asignar repartidor…
              </option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const v = e.target.value;
                if (isOrderStatus(v)) bulkStatus(v);
                e.currentTarget.selectedIndex = 0;
              }}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              defaultValue=""
              aria-label="Cambiar estado"
            >
              <option value="" disabled>
                Cambiar estado…
              </option>
              {(["nuevo", "aceptado", "preparando", "listo", "en_ruta", "entregado", "cancelado"] as OrderStatus[]).map((k) => (
                <option key={k} value={k}>
                  {STATUS_META[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ACTIVO: sección destacada */}
      <section>
        {activeOrders.length ? (
          <div className="grid grid-cols-1 gap-4">
            {activeOrders.map((o) => (
              <div
                key={o.id}
                className="relative overflow-hidden rounded-2xl border border-indigo-300 bg-white p-5 shadow-md ring-2 ring-indigo-200 transition hover:shadow-lg dark:border-indigo-900/40 dark:bg-gray-900 dark:ring-indigo-900/40"
              >
                {/* Marca visual de activo */}
                <div className="pointer-events-none absolute -right-14 -top-10 rotate-45 select-none">
                  <div className="w-[220px] bg-indigo-600/10 p-6 text-center text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                    Activa
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CircleAvatar color={o.customer.avatarColor} label={o.customer.name} size={42} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-base font-semibold">{o.customer.name}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${STATUS_META[o.status].className}`}>
                        {STATUS_META[o.status].label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-gray-500">{o.customer.address}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-lg font-semibold">{money(o.total)}</div>
                    <div className="text-xs text-gray-500">
                      {o.scheduledFor ? (
                        <span title="Programado">⏰ {new Date(o.scheduledFor).toLocaleString()}</span>
                      ) : (
                        <span>🕒 {new Date(o.createdAt).toLocaleString()}</span>
                      )}
                      {o.etaMin ? <span className="ml-1">· ETA {o.etaMin}m</span> : null}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  {o.items.slice(0, 3).map((it) => (
                    <div key={it.id} className="flex items-center gap-2">
                      <div className="h-11 w-11 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                        <img src={it.img} alt={it.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-gray-700 dark:text-gray-200">{it.name}</p>
                        <p className="text-[11px] text-gray-500">x{it.qty} · {money(it.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <select
                      value={o.driverId ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setOrders((prev) =>
                          prev.map((x) => (x.id === o.id ? { ...x, driverId: e.target.value || undefined } : x))
                        )
                      }
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
                        color={drivers.find((d) => d.id === o.driverId)?.avatarColor || "#94a3b8"}
                        label={drivers.find((d) => d.id === o.driverId)?.name || "R"}
                        size={24}
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(STATUS_META[o.status].next || []).map((n) => (
                      <button
                        key={n}
                        onClick={() => updateOrderStatus(o.id, n)}
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      >
                        {STATUS_META[n].label}
                      </button>
                    ))}
                    <button
                      onClick={() => setDetailId(o.id)}
                      className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    >
                      Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700">
            No hay órdenes activas.
          </div>
        )}
      </section>

      

      {/* Panel lateral detalle (sin títulos repetidos) */}
      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/30"
          onClick={() => setDetailId(null)}
        >
          <div
            className="h-full w-full max-w-lg overflow-y-auto border-l border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{detail.id}</h3>
              <button
                onClick={() => setDetailId(null)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <CircleAvatar color={detail.customer.avatarColor} label={detail.customer.name} size={42} />
                  <div className="min-w-0">
                    <p className="font-medium">{detail.customer.name}</p>
                    <p className="truncate text-xs text-gray-500">{detail.customer.address}</p>
                    {detail.customer.phone && <p className="text-xs text-gray-500">{detail.customer.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_META[detail.status].className}`}>
                    {STATUS_META[detail.status].label}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {detail.scheduledFor ? (
                    <p>Programado: {new Date(detail.scheduledFor).toLocaleString()}</p>
                  ) : (
                    <p>Creado: {new Date(detail.createdAt).toLocaleString()}</p>
                  )}
                  {detail.etaMin ? <p>ETA: {detail.etaMin} min</p> : null}
                  {detail.distanceKm != null ? <p>Distancia: {detail.distanceKm} km</p> : null}
                  {detail.notes && <p>Notas: {detail.notes}</p>}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <ul className="space-y-2">
                  {detail.items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                        <img src={it.img} alt={it.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm">{it.name}</p>
                        <p className="text-xs text-gray-500">x{it.qty} · {money(it.price)}</p>
                      </div>
                      <div className="ml-auto font-semibold">{money(it.qty * it.price)}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-dashed pt-3 text-right text-sm">
                  <span className="text-gray-500">Total: </span>
                  <span className="font-semibold">{money(detail.total)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <select
                    value={detail.driverId ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setOrders((prev) =>
                        prev.map((x) => (x.id === detail.id ? { ...x, driverId: e.target.value || undefined } : x))
                      )
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <option value="">Sin asignar</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {detail.driverId && (
                    <div className="flex items-center gap-2">
                      <CircleAvatar
                        color={drivers.find((d) => d.id === detail.driverId)?.avatarColor || "#64748b"}
                        label={drivers.find((d) => d.id === detail.driverId)?.name || "R"}
                        size={28}
                      />
                      <span className="text-sm">{drivers.find((d) => d.id === detail.driverId)?.name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(STATUS_META[detail.status].next || []).map((n) => (
                    <button
                      key={n}
                      onClick={() => updateOrderStatus(detail.id, n)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    >
                      Marcar como “{STATUS_META[n].label}”
                    </button>
                  ))}
                  <button
                    onClick={() => setDetailId(null)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
