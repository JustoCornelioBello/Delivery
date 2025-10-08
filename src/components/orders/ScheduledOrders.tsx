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
type Tag = "prioridad" | "programado" | "corporativo";

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
  tags?: Tag[];
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

/* Conductores simulados (si en otra vista los usas) */
const mockDrivers = (): Driver[] => [
  { id: "d1", name: "Mario Ruiz", phone: "+1 555 222-7788", avatarColor: "#0ea5e9" },
  { id: "d2", name: "Carla León", phone: "+1 555 111-1234", avatarColor: "#22c55e" },
  { id: "d3", name: "Pablo Sena", phone: "+1 555 333-9080", avatarColor: "#f97316" },
];

/* Helpers de fecha */
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, 1);
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const formatYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const pad2 = (n: number) => String(n).padStart(2, "0");
const uid = () => Math.random().toString(36).slice(2, 10);

/* Catálogo simple para el modal del cliente */
type CatalogItem = { id: string; name: string; price: number; color: string };
const CATALOG: CatalogItem[] = [
  { id: "c1", name: "Hamburguesa Clásica", price: 8, color: "#f97316" },
  { id: "c2", name: "Pizza Pepperoni", price: 12, color: "#ef4444" },
  { id: "c3", name: "Ensalada César", price: 7, color: "#10b981" },
  { id: "c4", name: "Wrap de Pollo", price: 6, color: "#3b82f6" },
  { id: "c5", name: "Papas Fritas", price: 3, color: "#a855f7" },
  { id: "c6", name: "Refresco 500ml", price: 2, color: "#eab308" },
];

/* “Imagen” simulada en SVG base64 para items */
const svgThumb = (name: string, fill: string) => {
  const short = name.split(" ")[0].slice(0, 6);
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='8' fill='${fill}'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='11' font-family='sans-serif'>${short}</text></svg>`
  );
  return `data:image/svg+xml;utf8,${svg}`;
};

/* ───────────── Modal Genérico ───────────── */
const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Cerrar
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

/* ───────────── Componente principal ───────────── */
export default function ScheduledOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers] = useState<Driver[]>(() => mockDrivers());

  // Calendario
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [q, setQ] = useState<string>("");

  // Modal crear pedido (cliente)
  const [openCreate, setOpenCreate] = useState<boolean>(false);

  // Form modal
  const [formName, setFormName] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [formAddress, setFormAddress] = useState<string>("");
  const [formTime, setFormTime] = useState<string>(() => {
    const now = new Date();
    return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  });
  const [formChannel, setFormChannel] = useState<Channel>("web");
  const [formPayment, setFormPayment] = useState<Payment>("tarjeta");
  const [formNotes, setFormNotes] = useState<string>("");
  const [cart, setCart] = useState<Record<string, number>>({});

  // Cargar pedidos
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      setOrders(JSON.parse(raw) as Order[]);
    } catch {
      // no-op
    }
  }, []);

  // Persistir pedidos
  useEffect(() => {
    if (orders.length) localStorage.setItem(LS_KEY, JSON.stringify(orders));
  }, [orders]);

  // Solo programados (scheduledFor y no cancelado)
  const scheduled = useMemo(
    () => orders.filter((o) => !!o.scheduledFor && o.status !== "cancelado"),
    [orders]
  );

  // Conteo por día
  const countsByDay = useMemo(() => {
    const map = new Map<string, number>();
    scheduled.forEach((o) => {
      const d = new Date(o.scheduledFor as string);
      const key = formatYmd(d);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [scheduled]);

  // Calendario grid
  const monthStart = startOfMonth(monthCursor);
  const monthEnd = endOfMonth(monthCursor);
  const firstCell = new Date(monthStart);
  const weekday = (monthStart.getDay() + 6) % 7; // lunes = 0
  firstCell.setDate(monthStart.getDate() - weekday);

  const gridDays: Date[] = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(firstCell);
      d.setDate(firstCell.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [firstCell]);

  // Lista del día seleccionado
  const dayList = useMemo(() => {
    const words = q.trim().toLowerCase();
    return scheduled
      .filter((o) => isSameDay(new Date(o.scheduledFor as string), selectedDay))
      .filter((o) => {
        if (!words) return true;
        return (
          o.id.toLowerCase().includes(words) ||
          o.customer.name.toLowerCase().includes(words) ||
          o.customer.address.toLowerCase().includes(words) ||
          o.items.some((it) => it.name.toLowerCase().includes(words))
        );
      })
      .sort((a, b) => +new Date(a.scheduledFor as string) - +new Date(b.scheduledFor as string));
  }, [scheduled, selectedDay, q]);

  // Acciones existentes
  const assignDriver = (id: string, driverId: string | "") => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, driverId: driverId || undefined } : o))
    );
  };
  const setStatus = (id: string, s: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: s } : o)));
  };

  // Abrir modal al hacer click en día
  const onDayClick = (d: Date) => {
    setSelectedDay(d);
    setOpenCreate(true);
  };

  // Helpers carrito
  const cartItems = useMemo(() => {
    return CATALOG.filter((c) => (cart[c.id] ?? 0) > 0).map<OrderItem>((c) => ({
      id: c.id,
      name: c.name,
      qty: cart[c.id] ?? 0,
      price: c.price,
      img: svgThumb(c.name, c.color),
    }));
  }, [cart]);

  const cartTotal = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.qty * it.price, 0),
    [cartItems]
  );

  const resetForm = () => {
    setFormName("");
    setFormPhone("");
    setFormAddress("");
    setFormNotes("");
    const now = new Date();
    setFormTime(`${pad2(now.getHours())}:${pad2(now.getMinutes())}`);
    setFormChannel("web");
    setFormPayment("tarjeta");
    setCart({});
  };

  // Crear pedido programado (cliente)
  const createScheduledOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return alert("Ingresa tu nombre.");
    if (!formAddress.trim()) return alert("Ingresa tu dirección.");
    if (cartItems.length === 0) return alert("Agrega al menos un producto.");

    const [hh, mm] = formTime.split(":").map((n) => parseInt(n, 10));
    const date = new Date(selectedDay);
    date.setHours(hh || 0, mm || 0, 0, 0);

    const newOrder: Order = {
      id: `ORD-${uid().toUpperCase()}`,
      createdAt: new Date().toISOString(),
      scheduledFor: date.toISOString(),
      customer: {
        name: formName.trim(),
        phone: formPhone.trim() || undefined,
        address: formAddress.trim(),
        avatarColor: "#0ea5e9",
      },
      channel: formChannel,
      payment: formPayment,
      status: "nuevo",
      tags: ["programado"],
      notes: formNotes.trim() || undefined,
      distanceKm: Number((Math.random() * 8 + 1).toFixed(1)),
      etaMin: 30,
      total: cartTotal,
      items: cartItems,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setOpenCreate(false);
    resetForm();
  };

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pedidos programados</h1>
          <p className="text-sm text-gray-500">Calendario, agenda y creación como cliente.</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total programados: {scheduled.length}
        </div>
      </div>

      {/* Controles principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Calendario */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <button
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              onClick={() => setMonthCursor((d) => addMonths(d, -1))}
            >
              ← Mes anterior
            </button>
            <div className="text-sm font-medium">
              {monthCursor.toLocaleString("es-ES", { month: "long", year: "numeric" })}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                onClick={() => {
                  const now = new Date();
                  setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
                  setSelectedDay(new Date());
                }}
              >
                Hoy
              </button>
              <button
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                onClick={() => setMonthCursor((d) => addMonths(d, 1))}
              >
                Mes siguiente →
              </button>
            </div>
          </div>

          {/* Semana header (L a D) */}
          <div className="grid grid-cols-7 gap-2 text-xs text-gray-500">
            {["L", "M", "X", "J", "V", "S", "D"].map((w) => (
              <div key={w} className="text-center">
                {w}
              </div>
            ))}
          </div>

          {/* Celdas */}
          <div className="mt-2 grid grid-cols-7 gap-2">
            {gridDays.map((day) => {
              const inMonth = day.getMonth() === monthCursor.getMonth();
              const key = formatYmd(day);
              const count = countsByDay.get(key) ?? 0;
              const isSelected = isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={key + String(inMonth)}
                  onClick={() => onDayClick(day)}
                  className={[
                    "h-24 rounded-xl border p-2 text-left transition",
                    inMonth
                      ? "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                      : "border-gray-100 dark:border-gray-800/60 bg-gray-50/60 dark:bg-gray-800",
                    isSelected ? "ring-2 ring-brand-500 ring-offset-0" : "",
                    "hover:shadow-sm",
                  ].join(" ")}
                  aria-label={`Seleccionar ${day.toLocaleDateString()}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={inMonth ? "text-gray-700 dark:text-gray-200" : "text-gray-400"}>
                      {day.getDate()}
                    </span>
                    {isToday && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                        Hoy
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                    {count > 0 ? (
                      <span className="rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-800">
                        {count} pedido(s)
                      </span>
                    ) : (
                      <span className="text-gray-400">Crear pedido…</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Agenda del día seleccionado */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3">
            <div className="text-sm font-medium">
              {selectedDay.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="text-xs text-gray-500">{dayList.length} pedido(s)</div>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs text-gray-500">Buscar en el día</label>
            <input
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="ID, cliente, dirección o producto…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {dayList.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
              No hay pedidos programados para este día.
            </div>
          ) : (
            <ul className="space-y-3">
              {dayList.map((o) => {
                const date = new Date(o.scheduledFor as string);
                const hh = pad2(date.getHours());
                const mm = pad2(date.getMinutes());
                return (
                  <li
                    key={o.id}
                    className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start gap-3">
                      <CircleAvatar color={o.customer.avatarColor} label={o.customer.name} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{o.customer.name}</span>
                          <span className="text-xs text-gray-500">({o.id})</span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {STATUS_LABEL[o.status]}
                          </span>
                          <span className="text-xs text-gray-500">{o.customer.address}</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Programado: {hh}:{mm} · Total: <b>{money(o.total)}</b>
                        </div>

                        {/* Productos (primeros 2) */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {o.items.slice(0, 2).map((it) => (
                            <div key={it.id} className="flex items-center gap-2 rounded-md border border-gray-200 p-1.5 text-xs dark:border-gray-700">
                              <div className="h-6 w-6 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={it.img} alt={it.name} className="h-full w-full object-cover" />
                              </div>
                              <span className="truncate max-w-[120px]">{it.name}</span>
                              <span className="text-gray-500">x{it.qty}</span>
                            </div>
                          ))}
                          {o.items.length > 2 && (
                            <span className="text-[11px] text-gray-500">+{o.items.length - 2} más</span>
                          )}
                        </div>

                        {/* Controles rápidos (internos) */}
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={o.driverId ?? ""}
                              onChange={(e) => assignDriver(o.id, e.target.value)}
                              className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-800"
                            >
                              <option value="">Sin repartidor</option>
                              {drivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => setStatus(o.id, "aceptado")}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={() => setStatus(o.id, "cancelado")}
                              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Modal Crear Pedido (cliente) */}
      <Modal
        open={openCreate}
        title={`Programar pedido · ${selectedDay.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`}
        onClose={() => setOpenCreate(false)}
      >
        <form
          onSubmit={createScheduledOrder}
          className="grid grid-cols-1 gap-4 md:grid-cols-5"
        >
          {/* Datos del cliente */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-sm font-semibold">Datos del cliente</h4>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nombre *</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Teléfono</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+1 555 555-5555"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Dirección *</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Calle, número, referencias…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Hora *</label>
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Canal</label>
                <select
                  value={formChannel}
                  onChange={(e) => setFormChannel(e.target.value as Channel)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="web">Web</option>
                  <option value="app">App</option>
                  <option value="telefono">Teléfono</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Pago</label>
              <select
                value={formPayment}
                onChange={(e) => setFormPayment(e.target.value as Payment)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="tarjeta">Tarjeta</option>
                <option value="efectivo">Efectivo</option>
                <option value="billetera">Billetera</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Notas</label>
              <textarea
                className="min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Indicaciones especiales, alergias, timbre, etc."
              />
            </div>
          </div>

          {/* Catálogo / carrito */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-semibold">Productos</h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {CATALOG.map((p) => {
                const qty = cart[p.id] ?? 0;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={svgThumb(p.name, p.color)} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm">{p.name}</p>
                        <span className="text-xs text-gray-500">{money(p.price)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCart((prev) => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1) }))
                          }
                          className="h-8 w-8 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                          aria-label={`Quitar ${p.name}`}
                        >
                          −
                        </button>
                        <input
                          inputMode="numeric"
                          value={qty}
                          onChange={(e) => {
                            const v = Number(e.target.value.replace(/\D/g, ""));
                            setCart((prev) => ({ ...prev, [p.id]: isNaN(v) ? 0 : v }));
                          }}
                          className="w-14 rounded-lg border border-gray-300 bg-white px-2 py-1 text-center text-sm dark:border-gray-700 dark:bg-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setCart((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }))}
                          className="h-8 w-8 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                          aria-label={`Agregar ${p.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen */}
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-800">
              <span className="text-gray-500">
                {cartItems.reduce((acc, it) => acc + it.qty, 0)} artículo(s)
              </span>
              <span className="font-semibold">{money(cartTotal)}</span>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setOpenCreate(false);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                disabled={!formName.trim() || !formAddress.trim() || cartItems.length === 0}
                title={!formName.trim() ? "Ingresa tu nombre" : !formAddress.trim() ? "Ingresa tu dirección" : ""}
              >
                Programar pedido
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </section>
  );
}
