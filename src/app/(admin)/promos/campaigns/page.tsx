"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ═════════════════ Types ═════════════════ */
type CampaignStatus = "draft" | "scheduled" | "active" | "paused" | "completed";
type Channel = "email" | "push" | "sms" | "inapp" | "banner";
type Segment = "nuevos" | "frecuentes" | "vip" | "inactivos" | "zona";
type DiscountType = "percent" | "amount" | "free_delivery";

type KPIs = {
  sent?: number; // envíos/mensajes/notifs
  impressions?: number;
  clicks?: number;
  orders?: number;
  revenue?: number; // USD sim
};

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  channels: Channel[];
  segment: Segment;
  discountType?: DiscountType;
  discountValue?: number;
  couponCode?: string;
  budget?: number;
  startAt?: string; // ISO
  endAt?: string;   // ISO
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  kpis?: KPIs;
  note?: string;
};

/* ═════════════════ Utils ═════════════════ */
const LS_KEY = "campaigns_mock_v1";
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const money = (n = 0) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(n);

const STATUS_META: Record<CampaignStatus, { label: string; cls: string }> = {
  draft:     { label: "Borrador",   cls: "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300" },
  scheduled: { label: "Programada", cls: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300" },
  active:    { label: "Activa",     cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300" },
  paused:    { label: "Pausada",    cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300" },
  completed: { label: "Finalizada", cls: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300" },
};

const CHANNEL_LABEL: Record<Channel, string> = {
  email: "Email",
  push: "Push",
  sms: "SMS",
  inapp: "In-App",
  banner: "Banner",
};

const SEGMENT_LABEL: Record<Segment, string> = {
  nuevos: "Nuevos",
  frecuentes: "Frecuentes",
  vip: "VIP",
  inactivos: "Inactivos",
  zona: "Por zona",
};

const DISC_LABEL: Record<DiscountType, string> = {
  percent: "% Descuento",
  amount: "Descuento fijo",
  free_delivery: "Entrega gratis",
};

const nowIso = () => new Date().toISOString();

/* ═════════════════ Mock generator (first run) ═════════════════ */
function seed(): Campaign[] {
  const base = (p: Partial<Campaign>): Campaign => ({
    id: `CMP-${uid()}`,
    name: "Campaña sin título",
    status: "draft",
    channels: ["email"],
    segment: "nuevos",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...p,
  });

  return [
    base({
      name: "Bienvenida nuevos · 10% OFF",
      status: "active",
      channels: ["email", "push"],
      segment: "nuevos",
      discountType: "percent",
      discountValue: 10,
      couponCode: "WELCOME10",
      budget: 150,
      startAt: new Date(Date.now() - 7 * 864e5).toISOString(),
      endAt: new Date(Date.now() + 7 * 864e5).toISOString(),
      tags: ["onboarding", "primer pedido"],
      kpis: { sent: 4800, impressions: 11000, clicks: 870, orders: 260, revenue: 4200 },
      note: "Secuencia 2 emails + 1 push",
    }),
    base({
      name: "Frecuentes · 2x1 Bebidas",
      status: "paused",
      channels: ["banner", "inapp"],
      segment: "frecuentes",
      discountType: "amount",
      discountValue: 3,
      budget: 80,
      startAt: new Date(Date.now() - 3 * 864e5).toISOString(),
      endAt: new Date(Date.now() + 14 * 864e5).toISOString(),
      tags: ["combo", "bebidas"],
      kpis: { impressions: 22000, clicks: 900, orders: 180, revenue: 2100 },
    }),
    base({
      name: "Recuperación inactivos",
      status: "scheduled",
      channels: ["sms", "email"],
      segment: "inactivos",
      discountType: "free_delivery",
      budget: 100,
      startAt: new Date(Date.now() + 2 * 864e5).toISOString(),
      endAt: new Date(Date.now() + 9 * 864e5).toISOString(),
      tags: ["winback"],
    }),
    base({
      name: "VIP · Embutidos premium",
      status: "completed",
      channels: ["email", "banner"],
      segment: "vip",
      discountType: "percent",
      discountValue: 15,
      couponCode: "VIP15",
      budget: 200,
      startAt: new Date(Date.now() - 30 * 864e5).toISOString(),
      endAt: new Date(Date.now() - 25 * 864e5).toISOString(),
      tags: ["alto ticket"],
      kpis: { sent: 1200, impressions: 5000, clicks: 620, orders: 210, revenue: 5200 },
      note: "AB test subject line",
    }),
  ];
}

/* ═════════════════ Small UI helpers ═════════════════ */
const StatusBadge = ({ status }: { status: CampaignStatus }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ${STATUS_META[status].cls}`}>
    {STATUS_META[status].label}
  </span>
);

const Chip = ({ label }: { label: string }) => (
  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
    {label}
  </span>
);

const Kpi = ({
  title,
  value,
  sub,
}: {
  title: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
    {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
  </div>
);

/* Popover (3 puntos) con cierre por click afuera */
function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

/* Modal genérico */
const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxW?: string;
}> = ({ open, title, onClose, children, maxW = "max-w-3xl" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`w-full ${maxW} overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900`}
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
        <div className="max-h-[78vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

/* ═════════════════ Page ═════════════════ */
export default function CampaignsPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CampaignStatus | "all">("all");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [segment, setSegment] = useState<Segment | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "start" | "revenue">("updated");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  // row menu popover
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // modals
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: "activate" | "pause" | "complete" | "delete" } | null>(null);

  // Load / seed
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
        return;
      } catch {}
    }
    const s = seed();
    setItems(s);
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  // Filters
  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const words = q.trim().toLowerCase();

    const list = items.filter((c) => {
      const matchesQ =
        !words ||
        c.name.toLowerCase().includes(words) ||
        (c.couponCode || "").toLowerCase().includes(words) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(words));
      const matchesStatus = status === "all" || c.status === status;
      const matchesChannel = channel === "all" || c.channels.includes(channel as Channel);
      const matchesSegment = segment === "all" || c.segment === segment;

      const start = c.startAt ? new Date(c.startAt) : null;
      const end = c.endAt ? new Date(c.endAt) : null;

      const inRange =
        (!from || (start && start >= from) || (end && end && end >= from)) &&
        (!to || (start && start <= to) || (end && end && end <= to));

      return matchesQ && matchesStatus && matchesChannel && matchesSegment && inRange;
    });

    list.sort((a, b) => {
      const cmp = (x = 0, y = 0) => (sortDir === "asc" ? x - y : y - x);
      if (sortBy === "updated") return cmp(+new Date(a.updatedAt), +new Date(b.updatedAt));
      if (sortBy === "start") return cmp(+new Date(a.startAt || 0), +new Date(b.startAt || 0));
      if (sortBy === "revenue") return cmp(a.kpis?.revenue || 0, b.kpis?.revenue || 0);
      return 0;
    });

    return list;
  }, [items, q, status, channel, segment, dateFrom, dateTo, sortBy, sortDir]);

  // Totals KPIs (period)
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, c) => {
        acc.sent += c.kpis?.sent || 0;
        acc.impressions += c.kpis?.impressions || 0;
        acc.clicks += c.kpis?.clicks || 0;
        acc.orders += c.kpis?.orders || 0;
        acc.revenue += c.kpis?.revenue || 0;
        return acc;
      },
      { sent: 0, impressions: 0, clicks: 0, orders: 0, revenue: 0 }
    );
  }, [filtered]);

  const ctr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;
  const conv = totals.clicks ? (totals.orders / totals.clicks) * 100 : 0;
  const aov = totals.orders ? totals.revenue / totals.orders : 0;

  // Actions
  const upsertCampaign = (data: Omit<Campaign, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    if (data.id) {
      setItems((prev) =>
        prev.map((x) => (x.id === data.id ? { ...x, ...data, updatedAt: nowIso() } as Campaign : x))
      );
    } else {
      const c: Campaign = {
        ...(data as Campaign),
        id: `CMP-${uid()}`,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      setItems((prev) => [c, ...prev]);
    }
    setOpenForm(false);
    setEditing(null);
  };

  const duplicate = (id: string) => {
    const src = items.find((x) => x.id === id);
    if (!src) return;
    const copy: Campaign = {
      ...src,
      id: `CMP-${uid()}`,
      name: `${src.name} (copia)`,
      status: "draft",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setItems((prev) => [copy, ...prev]);
  };

  const applyConfirm = () => {
    if (!confirm) return;
    const { id, action } = confirm;
    setItems((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c;
          if (action === "delete") return null as any;
          if (action === "activate") return { ...c, status: "active", updatedAt: nowIso() };
          if (action === "pause") return { ...c, status: "paused", updatedAt: nowIso() };
          if (action === "complete") return { ...c, status: "completed", updatedAt: nowIso() };
          return c;
        })
        .filter(Boolean) as Campaign[]
    );
    setConfirm(null);
  };

  /* ═════════════════ Form Modal ═════════════════ */
  const [fName, setFName] = useState("");
  const [fChannels, setFChannels] = useState<Channel[]>(["email"]);
  const [fSegment, setFSegment] = useState<Segment>("nuevos");
  const [fDiscountType, setFDiscountType] = useState<DiscountType | "">("");
  const [fDiscountValue, setFDiscountValue] = useState<number | "">("");
  const [fCoupon, setFCoupon] = useState("");
  const [fBudget, setFBudget] = useState<number | "">("");
  const [fStart, setFStart] = useState("");
  const [fEnd, setFEnd] = useState("");
  const [fNote, setFNote] = useState("");
  const [fTags, setFTags] = useState<string>("");

  const openCreate = () => {
    setEditing(null);
    setFName("");
    setFChannels(["email"]);
    setFSegment("nuevos");
    setFDiscountType("");
    setFDiscountValue("");
    setFCoupon("");
    setFBudget("");
    setFStart("");
    setFEnd("");
    setFNote("");
    setFTags("");
    setOpenForm(true);
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    setFName(c.name);
    setFChannels(c.channels);
    setFSegment(c.segment);
    setFDiscountType(c.discountType || "");
    setFDiscountValue(c.discountValue ?? "");
    setFCoupon(c.couponCode || "");
    setFBudget(c.budget ?? "");
    setFStart(c.startAt ? c.startAt.slice(0, 16) : "");
    setFEnd(c.endAt ? c.endAt.slice(0, 16) : "");
    setFNote(c.note || "");
    setFTags((c.tags || []).join(", "));
    setOpenForm(true);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim()) return alert("Ingresa un nombre de campaña.");
    const payload: Omit<Campaign, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      id: editing?.id,
      name: fName.trim(),
      status: editing?.status ?? (fStart ? "scheduled" : "draft"),
      channels: fChannels,
      segment: fSegment,
      discountType: (fDiscountType as DiscountType) || undefined,
      discountValue: typeof fDiscountValue === "number" ? fDiscountValue : undefined,
      couponCode: fCoupon.trim() || undefined,
      budget: typeof fBudget === "number" ? fBudget : undefined,
      startAt: fStart ? new Date(fStart).toISOString() : undefined,
      endAt: fEnd ? new Date(fEnd).toISOString() : undefined,
      tags: fTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      kpis: editing?.kpis || { impressions: 0, clicks: 0, orders: 0, revenue: 0 },
      note: fNote.trim() || undefined,
    };
    upsertCampaign(payload);
  };

  /* ═════════════════ Render ═════════════════ */
  return (
    <section className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Campañas</h1>
          <p className="text-sm text-gray-500">
            Organiza y administra promociones, cupones y mensajes por canal y segmento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Nueva campaña
          </button>
          <button
            onClick={() => {
              // Export CSV de campañas filtradas
              const rows = [
                ["id","name","status","channels","segment","discount","value","coupon","budget","start","end","revenue"],
                ...filtered.map((c) => [
                  c.id,
                  c.name,
                  c.status,
                  c.channels.join("|"),
                  c.segment,
                  c.discountType || "",
                  c.discountValue ?? "",
                  c.couponCode || "",
                  c.budget ?? "",
                  c.startAt ? new Date(c.startAt).toLocaleString() : "",
                  c.endAt ? new Date(c.endAt).toLocaleString() : "",
                  c.kpis?.revenue ?? 0,
                ]),
              ];
              const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `campaigns_${Date.now()}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi title="Ingresos (filtro)" value={money(totals.revenue)} sub={`${filtered.length} campañas`} />
        <Kpi title="Órdenes" value={totals.orders} sub={`AOV ${money(aov)}`} />
        <Kpi title="Impresiones" value={totals.impressions} sub={`${totals.sent ? `${totals.sent} envíos` : "—"}`} />
        <Kpi title="CTR" value={`${ctr.toFixed(1)}%`} sub={`${totals.clicks} clics`} />
        <Kpi title="Conversión" value={`${conv.toFixed(1)}%`} sub="Pedidos / Clics" />
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-8">
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Nombre, cupón o tag…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
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
              {Object.keys(STATUS_META).map((k) => (
                <option key={k} value={k}>
                  {STATUS_META[k as CampaignStatus].label}
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
              {Object.keys(CHANNEL_LABEL).map((k) => (
                <option key={k} value={k}>
                  {CHANNEL_LABEL[k as Channel]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Segmento</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              {Object.keys(SEGMENT_LABEL).map((k) => (
                <option key={k} value={k}>
                  {SEGMENT_LABEL[k as Segment]}
                </option>
              ))}
            </select>
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

          <div>
            <label className="mb-1 block text-xs text-gray-500">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="updated">Actualizado</option>
              <option value="start">Inicio</option>
              <option value="revenue">Ingresos</option>
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

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800">
            <tr>
              <th className="p-3">Campaña</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Canales</th>
              <th className="p-3">Segmento</th>
              <th className="p-3">Oferta</th>
              <th className="p-3">Ventana</th>
              <th className="p-3">Rendimiento</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-[340px]">{c.name}</span>
                      {(c.tags || []).slice(0, 3).map((t) => (
                        <Chip key={t} label={t} />
                      ))}
                    </div>
                    {c.note && <div className="text-xs text-gray-500 line-clamp-1">{c.note}</div>}
                  </div>
                </td>
                <td className="p-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {c.channels.map((ch) => (
                      <span
                        key={ch}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {CHANNEL_LABEL[ch]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">{SEGMENT_LABEL[c.segment]}</td>
                <td className="p-3 text-xs">
                  {c.discountType ? (
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                        {DISC_LABEL[c.discountType]}
                      </span>
                      {typeof c.discountValue === "number" && (
                        <span className="text-gray-700 dark:text-gray-300">
                          {c.discountType === "percent" ? `${c.discountValue}%` : money(c.discountValue)}
                        </span>
                      )}
                      {c.couponCode && <Chip label={`Cupón: ${c.couponCode}`} />}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-600 dark:text-gray-400">
                  {c.startAt ? new Date(c.startAt).toLocaleString() : "—"} <span className="mx-1">→</span>{" "}
                  {c.endAt ? new Date(c.endAt).toLocaleString() : "—"}
                </td>
                <td className="p-3 text-xs">
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <div className="text-gray-500">Clicks</div>
                      <div className="font-medium">{c.kpis?.clicks ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Órdenes</div>
                      <div className="font-medium">{c.kpis?.orders ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Ingresos</div>
                      <div className="font-medium">{money(c.kpis?.revenue ?? 0)}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <RowMenu
                    open={openMenuId === c.id}
                    onOpen={() => setOpenMenuId(c.id)}
                    onClose={() => setOpenMenuId(null)}
                    onAction={(action) => {
                      if (action === "edit") openEdit(c);
                      if (action === "duplicate") duplicate(c.id);
                      if (action === "activate") setConfirm({ id: c.id, action: "activate" });
                      if (action === "pause") setConfirm({ id: c.id, action: "pause" });
                      if (action === "complete") setConfirm({ id: c.id, action: "complete" });
                      if (action === "delete") setConfirm({ id: c.id, action: "delete" });
                    }}
                    status={c.status}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={8}>
                  Sin resultados con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editing ? "Editar campaña" : "Crear campaña"}
      >
        <form onSubmit={submitForm} className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nombre *</label>
              <input
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder="Ej: Bienvenida nuevos · 10% OFF"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Canales *</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CHANNEL_LABEL).map((k) => {
                  const ch = k as Channel;
                  const checked = fChannels.includes(ch);
                  return (
                    <label key={k} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm
                      ${checked ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "border-gray-300 dark:border-gray-700"}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setFChannels((prev) =>
                            prev.includes(ch) ? prev.filter((x) => x !== ch) : [...prev, ch]
                          )
                        }
                        className="mr-2 align-middle"
                      />
                      {CHANNEL_LABEL[ch]}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Segmento *</label>
                <select
                  value={fSegment}
                  onChange={(e) => setFSegment(e.target.value as Segment)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  {Object.keys(SEGMENT_LABEL).map((k) => (
                    <option key={k} value={k}>
                      {SEGMENT_LABEL[k as Segment]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Presupuesto (opcional)</label>
                <input
                  inputMode="decimal"
                  value={fBudget}
                  onChange={(e) => setFBudget(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ej: 150"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Inicio</label>
                <input
                  type="datetime-local"
                  value={fStart}
                  onChange={(e) => setFStart(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Fin</label>
                <input
                  type="datetime-local"
                  value={fEnd}
                  onChange={(e) => setFEnd(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Notas internas</label>
              <textarea
                value={fNote}
                onChange={(e) => setFNote(e.target.value)}
                placeholder="Estrategia, secuencia, audiencias excluidas…"
                className="min-h-[80px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Tipo de descuento</label>
              <select
                value={fDiscountType}
                onChange={(e) => setFDiscountType(e.target.value as any)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="">Sin descuento</option>
                <option value="percent">% Descuento</option>
                <option value="amount">Descuento fijo</option>
                <option value="free_delivery">Entrega gratis</option>
              </select>
            </div>

            {fDiscountType && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    {fDiscountType === "percent" ? "Porcentaje" : fDiscountType === "amount" ? "Monto" : "—"}
                  </label>
                  {fDiscountType !== "free_delivery" ? (
                    <input
                      inputMode="decimal"
                      value={fDiscountValue}
                      onChange={(e) => setFDiscountValue(e.target.value ? Number(e.target.value) : "")}
                      placeholder={fDiscountType === "percent" ? "Ej: 10" : "Ej: 3"}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                  ) : (
                    <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 dark:border-gray-700">
                      Entrega gratis habilitada
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Cupón (opcional)</label>
                  <input
                    value={fCoupon}
                    onChange={(e) => setFCoupon(e.target.value)}
                    placeholder="WELCOME10"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs text-gray-500">Tags</label>
              <input
                value={fTags}
                onChange={(e) => setFTags(e.target.value)}
                placeholder="ej: bebidas, onboarding, winback"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <p className="mt-1 text-[11px] text-gray-500">Separar por coma</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                {editing ? "Guardar cambios" : "Crear campaña"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirm modal */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Confirmar acción"
        maxW="max-w-md"
      >
        {confirm && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ¿Seguro que deseas{" "}
              <b>
                {confirm.action === "activate"
                  ? "activar"
                  : confirm.action === "pause"
                  ? "pausar"
                  : confirm.action === "complete"
                  ? "finalizar"
                  : "eliminar"}
              </b>{" "}
              esta campaña?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={applyConfirm}
                className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${
                  confirm.action === "delete"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-brand-500 hover:bg-brand-600"
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

/* ═════════════════ Row Menu (3 dots) ═════════════════ */
function RowMenu({
  open,
  onOpen,
  onClose,
  onAction,
  status,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAction: (a: "edit" | "duplicate" | "activate" | "pause" | "complete" | "delete") => void;
  status: CampaignStatus;
}) {
  const ref = useOutsideClose<HTMLDivElement>(onClose);
  const actions: { key: Parameters<typeof onAction>[0]; label: string; danger?: boolean; show?: boolean }[] = [
    { key: "edit", label: "Editar", show: true },
    { key: "duplicate", label: "Duplicar", show: true },
    { key: "activate", label: "Activar", show: status === "draft" || status === "paused" || status === "scheduled" },
    { key: "pause", label: "Pausar", show: status === "active" },
    { key: "complete", label: "Finalizar", show: status === "active" || status === "paused" },
    { key: "delete", label: "Eliminar", danger: true, show: status !== "active" },
  ];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={open ? onClose : onOpen}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        aria-label="Más acciones"
        title="Más acciones"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <ul className="py-1 text-sm">
            {actions.filter((a) => a.show).map((a) => (
              <li key={a.key}>
                <button
                  onClick={() => {
                    onAction(a.key);
                    onClose();
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 ${
                    a.danger ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
