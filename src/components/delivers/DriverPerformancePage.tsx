"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

/* ----------------------------- Tipos y mock ----------------------------- */
type DriverPerf = {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  rating: number; // 0-5
  deliveries: number; // total periodo
  onTimeRate: number; // 0-1
  avgMinutes: number; // tiempo medio de entrega
  km: number; // km recorridos
  cancellations: number; // cancelaciones
  trend: number[]; // 30 días entregas/día
};

const DRIVERS: DriverPerf[] = [
  {
    id: "d1",
    name: "Carlos Pérez",
    phone: "+1 555-1234",
    active: true,
    rating: 4.8,
    deliveries: 156,
    onTimeRate: 0.92,
    avgMinutes: 28,
    km: 420,
    cancellations: 2,
    trend: Array.from({ length: 30 }, (_, i) => (i % 6 === 0 ? 2 : 5 + Math.floor(Math.random() * 7))),
  },
  {
    id: "d2",
    name: "María López",
    phone: "+1 555-5678",
    active: true,
    rating: 4.6,
    deliveries: 131,
    onTimeRate: 0.88,
    avgMinutes: 31,
    km: 355,
    cancellations: 3,
    trend: Array.from({ length: 30 }, () => 4 + Math.floor(Math.random() * 8)),
  },
  {
    id: "d3",
    name: "José Martínez",
    phone: "+1 555-9999",
    active: false,
    rating: 4.9,
    deliveries: 189,
    onTimeRate: 0.95,
    avgMinutes: 26,
    km: 502,
    cancellations: 1,
    trend: Array.from({ length: 30 }, () => 5 + Math.floor(Math.random() * 10)),
  },
  {
    id: "d4",
    name: "Lucía Gómez",
    phone: "+1 555-7777",
    active: true,
    rating: 4.3,
    deliveries: 110,
    onTimeRate: 0.83,
    avgMinutes: 34,
    km: 310,
    cancellations: 5,
    trend: Array.from({ length: 30 }, () => 3 + Math.floor(Math.random() * 7)),
  },
];

/* ----------------------------- Utils UI ----------------------------- */
const fmtPct = (n: number) => `${Math.round(n * 100)}%`;
const fmtMin = (n: number) => `${n} min`;
const fmtKm = (n: number) => `${n.toFixed(0)} km`;

const exportCSV = (rows: (string | number)[][], filename = "drivers_performance.csv") => {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* ----------------------------- Modal genérico ----------------------------- */
function Modal({
  open,
  title,
  onClose,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${width} overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Cerrar
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

/* ----------------------------- Menú contextual ----------------------------- */
function ActionMenu({
  close,
  onReport,
  onMessage,
  onToggleActive,
  active,
  onView,
}: {
  close: () => void;
  onReport: () => void;
  onMessage: () => void;
  onToggleActive: () => void;
  active: boolean;
  onView: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [close]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-7 z-[55] w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <button
        onClick={() => {
          onView();
          close();
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <CheckBadgeIcon className="h-4 w-4 text-emerald-500" />
        Ver detalle
      </button>
      <button
        onClick={() => {
          onMessage();
          close();
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <MagnifyingGlassIcon className="h-4 w-4 text-blue-500 rotate-90" />
        Enviar mensaje
      </button>
      <button
        onClick={() => {
          onReport();
          close();
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
        Reportar problema
      </button>
      <button
        onClick={() => {
        onToggleActive();
        close();
      }}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <EllipsisVerticalIcon className="h-4 w-4 text-gray-500" />
        {active ? "Marcar inactivo" : "Marcar activo"}
      </button>
    </div>
  );
}

/* ----------------------------- Mini gráficos SVG ----------------------------- */
function LineChart({
  data,
  height = 120,
  strokeWidth = 2,
  padding = 8,
}: {
  data: number[];
  height?: number;
  strokeWidth?: number;
  padding?: number;
}) {
  const max = Math.max(1, ...data);
  const w = Math.max(100, data.length * 12);
  const h = height;
  const points = data.map((v, i) => {
    const x = padding + (i * (w - padding * 2)) / (data.length - 1 || 1);
    const y = h - padding - (v / max) * (h - padding * 2);
    return [x, y];
  });
  const d = points
    .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <polyline points={`${padding},${h - padding} ${w - padding},${h - padding}`} stroke="currentColor" strokeOpacity="0.1" fill="none" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-brand-500" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" className="text-brand-500" fill="currentColor" />
      ))}
    </svg>
  );
}

function BarChart({
  series,
  height = 140,
  maxValue,
}: {
  series: { label: string; value: number }[];
  height?: number;
  maxValue?: number;
}) {
  const max = Math.max(maxValue ?? 0, ...series.map((s) => s.value), 1);
  const w = Math.max(160, series.length * 36);
  const h = height;
  const barW = 20;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {series.map((s, i) => {
        const x = 16 + i * 36;
        const barH = ((s.value / max) * (h - 30)) | 0;
        const y = h - 20 - barH;
        return (
          <g key={s.label}>
            <rect x={x} y={y} width={barW} height={barH} className="fill-gray-300 dark:fill-gray-700" rx="4" />
            <text x={x + barW / 2} y={h - 6} textAnchor="middle" className="fill-gray-500 text-[10px]">
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ----------------------------- Página principal ----------------------------- */
export default function DriverPerformancePage() {
  const [drivers, setDrivers] = useState<DriverPerf[]>(DRIVERS);
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [reportModal, setReportModal] = useState<{ open: boolean; driver?: DriverPerf }>({
    open: false,
  });

  // Datos agregados (filtrados)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter((d) => {
      const matchesQ =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        String(d.deliveries).includes(q);
      const matchesActive = !onlyActive || d.active;
      return matchesQ && matchesActive;
    });
  }, [drivers, search, onlyActive]);

  const totals = useMemo(() => {
    const d = filtered;
    const deliveries = d.reduce((a, b) => a + b.deliveries, 0);
    const onTime = d.length ? d.reduce((a, b) => a + b.onTimeRate, 0) / d.length : 0;
    const avgTime = d.length ? Math.round(d.reduce((a, b) => a + b.avgMinutes, 0) / d.length) : 0;
    const km = d.reduce((a, b) => a + b.km, 0);
    return { deliveries, onTime, avgTime, km };
  }, [filtered]);

  // Export
  const handleExport = () => {
    const header = [
      "ID",
      "Nombre",
      "Teléfono",
      "Activo",
      "Entregas",
      "A tiempo %",
      "Tiempo medio (min)",
      "KM",
      "Cancelaciones",
      "Rating",
    ];
    const data = filtered.map((d) => [
      d.id,
      d.name,
      d.phone,
      d.active ? "Sí" : "No",
      d.deliveries,
      Math.round(d.onTimeRate * 100),
      d.avgMinutes,
      d.km.toFixed(0),
      d.cancellations,
      d.rating.toFixed(1),
    ]);
    exportCSV([header, ...data]);
  };

  // Acciones
  const toggleActive = (id: string) =>
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));
  const viewDetail = (id: string) => alert("Detalle de " + id);
  const sendMessage = (id: string) => alert("Mensaje a " + id);
  const reportDriver = (driver: DriverPerf) => setReportModal({ open: true, driver });

  // Gráficos agregados
  const trend30 = useMemo(() => {
    const len = drivers[0]?.trend.length ?? 30;
    const arr = Array.from({ length: len }, (_, i) =>
      filtered.reduce((acc, d) => acc + (d.trend[i] ?? 0), 0)
    );
    return arr;
  }, [filtered, drivers]);

  const onTimeSeries = useMemo(
    () => filtered.map((d) => ({ label: d.name.split(" ")[0], value: Math.round(d.onTimeRate * 100) })),
    [filtered]
  );

  /* ----------------------------- Render ----------------------------- */
  return (
    <section className="space-y-6 p-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Rendimiento</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Métricas, tendencias y acciones para gestionar el desempeño de tus repartidores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono o # entregas…"
              className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="onlyActive"
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            <label htmlFor="onlyActive" className="text-sm text-gray-700 dark:text-gray-300">
              Mostrar solo activos
            </label>
          </div>
          <div className="self-center text-sm text-gray-500 dark:text-gray-4 00">
            {filtered.length} repartidor(es) encontrados
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Entregas</span>
            <TrophyIcon className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{totals.deliveries}</div>
          <div className="text-xs text-gray-500">Últimos 30 días</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">A tiempo</span>
            <ClockIcon className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{fmtPct(totals.onTime)}</div>
          <div className="text-xs text-gray-500">Promedio del equipo</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Tiempo medio</span>
            <ClockIcon className="h-5 w-5 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{fmtMin(totals.avgTime)}</div>
          <div className="text-xs text-gray-500">Por entrega</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Distancia</span>
            <MapPinIcon className="h-5 w-5 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{fmtKm(totals.km)}</div>
          <div className="text-xs text-gray-500">Recorridos (30d)</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Tendencia de entregas (equipo · 30 días)</h3>
            <span className="text-xs text-gray-500">Total/día</span>
          </div>
          <LineChart data={trend30} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">% Entregas a tiempo por repartidor</h3>
            <span className="text-xs text-gray-500">Mayor es mejor</span>
          </div>
          <BarChart series={onTimeSeries} height={150} maxValue={100} />
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {filtered.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1 dark:bg-gray-800">
                <span className="truncate">{d.name}</span>
                <span className="font-medium">{fmtPct(d.onTimeRate)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Repartidor</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Entregas</th>
              <th className="px-4 py-3">A tiempo</th>
              <th className="px-4 py-3">Tiempo medio</th>
              <th className="px-4 py-3">Cancelaciones</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((d) => (
              <tr key={d.id} className="relative hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: d.active ? "#22c55e" : "#94a3b8" }}
                      title={d.name}
                    >
                      {d.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{d.name}</div>
                      <div className="text-xs text-gray-500">{d.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {d.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">{d.deliveries}</td>
                <td className="px-4 py-3">{fmtPct(d.onTimeRate)}</td>
                <td className="px-4 py-3">{fmtMin(d.avgMinutes)}</td>
                <td className="px-4 py-3">{d.cancellations}</td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    {d.rating.toFixed(1)}
                  </div>
                </td>
                <td className="relative px-4 py-3 text-right">
                  <button
                    onClick={() => setOpenMenu((prev) => (prev === d.id ? null : d.id))}
                    className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  {openMenu === d.id && (
                    <ActionMenu
                      close={() => setOpenMenu(null)}
                      onView={() => viewDetail(d.id)}
                      onMessage={() => sendMessage(d.id)}
                      onReport={() => reportDriver(d)}
                      onToggleActive={() => toggleActive(d.id)}
                      active={d.active}
                    />
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                  No hay repartidores con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Reportar problema */}
      <Modal
        open={reportModal.open}
        onClose={() => setReportModal({ open: false })}
        title={`Reportar problema · ${reportModal.driver?.name ?? ""}`}
        width="max-w-xl"
      >
        <ReportForm
          driver={reportModal.driver}
          onSubmit={() => setReportModal({ open: false })}
          onCancel={() => setReportModal({ open: false })}
        />
      </Modal>
    </section>
  );
}

/* ----------------------------- Formulario de reporte ----------------------------- */
function ReportForm({
  driver,
  onSubmit,
  onCancel,
}: {
  driver?: DriverPerf;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState("Retraso");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState<"baja" | "media" | "alta">("media");

  const canSend = desc.trim().length >= 8;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        alert(`Reporte enviado para ${driver?.name}:\n${type} (${severity})\n${desc}`);
        onSubmit();
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option>Retraso</option>
            <option>Mal trato</option>
            <option>Ausencia</option>
            <option>Incidente de tránsito</option>
            <option>Otro</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Severidad</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as "baja" | "media" | "alta")}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Descripción</label>
        <textarea
          className="min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          placeholder="Describe lo sucedido con detalles (mínimo 8 caracteres)…"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!canSend}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          Enviar reporte
        </button>
      </div>
    </form>
  );
}
