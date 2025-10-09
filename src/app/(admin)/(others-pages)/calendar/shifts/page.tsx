"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ─────────── Tipos ─────────── */
type ShiftStatus = "programado" | "en_curso" | "completado" | "cancelado";
type Driver = { id: string; name: string; phone: string; avatarColor: string };
type Shift = {
  id: string;
  driverId: string;
  date: string;        // YYYY-MM-DD
  start: string;       // HH:mm
  end: string;         // HH:mm
  status: ShiftStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/* ─────────── Utils ─────────── */
const uid = () => Math.random().toString(36).slice(2, 10);
const pad2 = (n: number) => String(n).padStart(2, "0");
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseTime = (t: string) => {
  const [h, m] = t.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const LS_SHIFTS = "delivery_shifts_v1";
const LS_DRIVERS = "delivery_drivers_v1";

/* ─────────── Datos mock ─────────── */
const mockDrivers = (): Driver[] => [
  { id: "d1", name: "Mario Ruiz", phone: "+1 555 222-7788", avatarColor: "#0ea5e9" },
  { id: "d2", name: "Carla León", phone: "+1 555 111-1234", avatarColor: "#22c55e" },
  { id: "d3", name: "Pablo Sena", phone: "+1 555 333-9080", avatarColor: "#f97316" },
  { id: "d4", name: "Laura Mena", phone: "+1 555 444-2233", avatarColor: "#a855f7" },
];

const mockShifts = (todayYmd: string): Shift[] => {
  const nowIso = new Date().toISOString();
  return [
    {
      id: "s1",
      driverId: "d1",
      date: todayYmd,
      start: "09:00",
      end: "13:00",
      status: "programado",
      notes: "Cobertura zona Centro",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "s2",
      driverId: "d2",
      date: todayYmd,
      start: "12:00",
      end: "18:00",
      status: "programado",
      notes: "Pico almuerzo",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "s3",
      driverId: "d3",
      date: toYMD(new Date(new Date().getTime() + 86400000)), // mañana
      start: "10:00",
      end: "16:00",
      status: "programado",
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
};

/* ─────────── UI helpers ─────────── */
const CircleAvatar: React.FC<{ color: string; label?: string; size?: number }> = ({
  color,
  label = "",
  size = 28,
}) => (
  <div
    className="inline-flex items-center justify-center rounded-full text-white text-xs font-medium select-none"
    style={{ width: size, height: size, backgroundColor: color }}
    aria-label={label}
    title={label}
  >
    {label?.[0]?.toUpperCase() ?? "?"}
  </div>
);

const STATUS_META: Record<ShiftStatus, { label: string; cls: string }> = {
  programado: {
    label: "Programado",
    cls: "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-300",
  },
  en_curso: {
    label: "En curso",
    cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
  },
  completado: {
    label: "Completado",
    cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
  },
  cancelado: {
    label: "Cancelado",
    cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300",
  },
};

/* ─────────── Modal genérico ─────────── */
function Modal({
  open,
  title,
  onClose,
  children,
  maxW = "max-w-2xl",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxW?: string;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxW} overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900`}
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

/* ─────────── Formulario turno ─────────── */
function ShiftForm({
  drivers,
  initial,
  onSubmit,
  onCancel,
}: {
  drivers: Driver[];
  initial: Shift;
  onSubmit: (s: Shift) => void;
  onCancel: () => void;
}) {
  const [driverId, setDriverId] = useState(initial.driverId);
  const [date, setDate] = useState(initial.date);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [status, setStatus] = useState<ShiftStatus>(initial.status);
  const [notes, setNotes] = useState(initial.notes || "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!driverId) return alert("Selecciona un repartidor.");
        if (!date) return alert("Selecciona una fecha.");
        if (parseTime(end) <= parseTime(start)) {
          return alert("La hora de fin debe ser mayor a la de inicio.");
        }
        onSubmit({
          ...initial,
          driverId,
          date,
          start,
          end,
          status,
          notes: notes.trim() || undefined,
          updatedAt: new Date().toISOString(),
        });
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Repartidor *</label>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="">Selecciona…</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Fecha *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Inicio *</label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Fin *</label>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ShiftStatus)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            {Object.keys(STATUS_META).map((k) => (
              <option key={k} value={k}>
                {STATUS_META[k as ShiftStatus].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[90px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          placeholder="Observaciones del turno…"
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
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

/* ─────────── Página Turnos ─────────── */
export default function ShiftsPage() {
  /* Estado base */
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  /* Semana visible */
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date();
    const dow = (d.getDay() + 6) % 7; // lunes=0
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - dow);
    return d;
  });

  /* Filtros */
  const [q, setQ] = useState("");
  const [filterDriver, setFilterDriver] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<ShiftStatus | "all">("all");
  const [hourFrom, setHourFrom] = useState("06:00");
  const [hourTo, setHourTo] = useState("24:00");

  /* Modales */
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);

  /* Cargar/Persistir */
  useEffect(() => {
    const rawD = localStorage.getItem(LS_DRIVERS);
    if (rawD) {
      try {
        setDrivers(JSON.parse(rawD) as Driver[]);
      } catch {
        setDrivers(mockDrivers());
      }
    } else {
      const md = mockDrivers();
      setDrivers(md);
      localStorage.setItem(LS_DRIVERS, JSON.stringify(md));
    }

    const today = toYMD(new Date());
    const rawS = localStorage.getItem(LS_SHIFTS);
    if (rawS) {
      try {
        setShifts(JSON.parse(rawS) as Shift[]);
      } catch {
        const ms = mockShifts(today);
        setShifts(ms);
        localStorage.setItem(LS_SHIFTS, JSON.stringify(ms));
      }
    } else {
      const ms = mockShifts(today);
      setShifts(ms);
      localStorage.setItem(LS_SHIFTS, JSON.stringify(ms));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_SHIFTS, JSON.stringify(shifts));
  }, [shifts]);

  /* Derivados: semana y timeline */
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const timeline = useMemo(() => {
    const from = parseTime(hourFrom);
    const to = parseTime(hourTo);
    const marks: { label: string; minute: number }[] = [];
    for (let m = from; m <= to; m += 60) {
      const h = Math.floor(m / 60);
      marks.push({ label: `${pad2(h)}:00`, minute: m });
    }
    return { from, to, marks, span: to - from };
  }, [hourFrom, hourTo]);

  /* Filtro + búsqueda */
  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase();
    const list = shifts.filter((s) => {
      const inDriver = filterDriver === "all" || s.driverId === filterDriver;
      const inStatus = filterStatus === "all" || s.status === filterStatus;
      const dr = drivers.find((d) => d.id === s.driverId);
      const byQ =
        !words ||
        s.notes?.toLowerCase().includes(words) ||
        dr?.name.toLowerCase().includes(words) ||
        s.date.includes(words);
      return inDriver && inStatus && byQ;
    });
    return list;
  }, [shifts, filterDriver, filterStatus, q, drivers]);

  /* Agrupar por día visible */
  const byDay: Record<string, Shift[]> = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    for (const d of days) {
      map[toYMD(d)] = [];
    }
    for (const s of filtered) {
      if (map[s.date]) map[s.date].push(s);
    }
    // ordenar por inicio
    Object.keys(map).forEach((k) =>
      map[k].sort((a, b) => parseTime(a.start) - parseTime(b.start))
    );
    return map;
  }, [filtered, days]);

  /* Acciones */
  const openCreate = (date: string, minute?: number) => {
    const startMin = clamp(minute ?? parseTime("09:00"), parseTime("06:00"), parseTime("23:00"));
    const endMin = clamp(startMin + 240, parseTime("06:30"), parseTime("24:00")); // 4h por defecto
    const now = new Date().toISOString();
    setEditing({
      id: `s_${uid()}`,
      driverId: "",
      date,
      start: `${pad2(Math.floor(startMin / 60))}:${pad2(startMin % 60)}`,
      end: `${pad2(Math.floor(endMin / 60))}:${pad2(endMin % 60)}`,
      status: "programado",
      createdAt: now,
      updatedAt: now,
    });
    setOpenModal(true);
  };

  const openEdit = (s: Shift) => {
    setEditing({ ...s });
    setOpenModal(true);
  };

  const removeShift = (id: string) => {
    if (!confirm("¿Eliminar este turno?")) return;
    setShifts((prev) => prev.filter((x) => x.id !== id));
  };

  const saveShift = (s: Shift) => {
    setShifts((prev) => {
      const exists = prev.some((x) => x.id === s.id);
      if (exists) return prev.map((x) => (x.id === s.id ? s : x));
      return [s, ...prev];
    });
    setOpenModal(false);
    setEditing(null);
  };

  const setStatus = (id: string, st: ShiftStatus) => {
    setShifts((prev) => prev.map((x) => (x.id === id ? { ...x, status: st, updatedAt: new Date().toISOString() } : x)));
  };

  /* Posicionamiento en columnas (timeline) */
  const colHeight = 72; // px por fila
  const minuteToX = (m: number) => {
    const rel = clamp(m - timeline.from, 0, timeline.span);
    return (rel / timeline.span) * 100; // porcentaje
  };
  const widthByTimes = (start: string, end: string) => {
    const s = parseTime(start);
    const e = parseTime(end);
    const w = ((e - s) / timeline.span) * 100;
    return clamp(w, 1, 100);
  };

  const dayHeaderLabel = (d: Date) =>
    d.toLocaleDateString("es-ES", { weekday: "short", month: "short", day: "numeric" });

  /* Render */
  return (
    <section className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Turnos</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestiona los turnos de tus repartidores: agenda semanal, creación, edición y estados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const d = new Date();
              const dow = (d.getDay() + 6) % 7;
              d.setHours(0, 0, 0, 0);
              d.setDate(d.getDate() - dow);
              setWeekStart(d);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Esta semana
          </button>
          <button
            onClick={() => setWeekStart((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            ← Semana previa
          </button>
          <button
            onClick={() => setWeekStart((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Semana siguiente →
          </button>
          <button
            onClick={() => openCreate(toYMD(new Date()))}
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Nuevo turno
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Repartidor, fecha (YYYY-MM-DD) o notas…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Repartidor</label>
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              {Object.keys(STATUS_META).map((k) => (
                <option key={k} value={k}>
                  {STATUS_META[k as ShiftStatus].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Rango horario</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={hourFrom}
                onChange={(e) => setHourFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <input
                type="time"
                value={hourTo}
                onChange={(e) => setHourTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calendario semanal */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Cabecera días + timeline */}
        <div className="grid grid-cols-8 border-b border-gray-200 text-xs dark:border-gray-800">
          <div className="p-3 text-gray-500">Día</div>
          <div className="col-span-7 grid grid-cols-12">
            {timeline.marks.map((mk) => (
              <div key={mk.minute} className="border-l border-gray-100 p-3 text-gray-500 dark:border-gray-800">
                {mk.label}
              </div>
            ))}
          </div>
        </div>

        {/* Filas por día */}
        <div>
          {days.map((d) => {
            const ymd = toYMD(d);
            const dayShifts = byDay[ymd] || [];
            const isToday = ymd === toYMD(new Date());
            return (
              <div key={ymd} className="grid grid-cols-8 border-b border-gray-100 last:border-0 dark:border-gray-800">
                {/* Columna día */}
                <div className="flex items-center gap-2 p-3">
                  <div className="min-w-10 text-sm font-medium">
                    {dayHeaderLabel(d)}
                    {isToday && (
                      <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                        Hoy
                      </span>
                    )}
                  </div>
                  <button
                    title="Crear turno este día"
                    onClick={() => openCreate(ymd)}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    + turno
                  </button>
                </div>

                {/* Timeline del día */}
                <div className="relative col-span-7 border-l border-gray-100 p-3 dark:border-gray-800">
                  {/* Guías verticales */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="grid h-full grid-cols-12">
                      {timeline.marks.map((mk, idx) => (
                        <div key={idx} className="border-l border-dashed border-gray-100 dark:border-gray-800" />
                      ))}
                    </div>
                  </div>

                  {/* Turnos como “bloques” */}
                  <div className="relative space-y-1">
                    {dayShifts.length === 0 ? (
                      <div className="text-xs text-gray-400">— Sin turnos —</div>
                    ) : (
                      dayShifts.map((s) => {
                        const left = minuteToX(parseTime(s.start));
                        const width = widthByTimes(s.start, s.end);
                        const dr = drivers.find((d) => d.id === s.driverId);
                        return (
                          <div
                            key={s.id}
                            className="group relative"
                            style={{
                              marginTop: 6,
                              height: colHeight - 18,
                            }}
                          >
                            <div
                              className="absolute top-0 h-10 rounded-md border text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                minWidth: 80,
                                borderColor: "rgb(229 231 235 / 1)",
                                background:
                                  "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)",
                              }}
                            >
                              <div className="flex h-full items-center gap-2 px-2">
                                <CircleAvatar color={dr?.avatarColor || "#94a3b8"} label={dr?.name} size={22} />
                                <div className="min-w-0">
                                  <div className="truncate">{dr?.name || "Sin asignar"}</div>
                                  <div className="text-[10px] text-gray-500">
                                    {s.start}–{s.end}
                                  </div>
                                </div>
                                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${STATUS_META[s.status].cls}`}>
                                  {STATUS_META[s.status].label}
                                </span>
                              </div>

                              {/* Menú acciones */}
                              <div className="absolute right-1 top-1 opacity-0 transition group-hover:opacity-100">
                                <div className="relative">
                                  <details className="relative">
                                    <summary className="list-none rounded-md border border-gray-300 bg-white px-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-pointer">
                                      •••
                                    </summary>
                                    <div
                                      className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={() => openEdit(s)}
                                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                      >
                                        Editar turno
                                      </button>
                                      <button
                                        onClick={() => setStatus(s.id, "en_curso")}
                                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                      >
                                        Marcar en curso
                                      </button>
                                      <button
                                        onClick={() => setStatus(s.id, "completado")}
                                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                      >
                                        Marcar completado
                                      </button>
                                      <button
                                        onClick={() => setStatus(s.id, "cancelado")}
                                        className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-300"
                                      >
                                        Cancelar
                                      </button>
                                      <hr className="border-gray-200 dark:border-gray-700" />
                                      <button
                                        onClick={() => removeShift(s.id)}
                                        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-gray-800"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </details>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Click para crear según posición (opcional) */}
                  <GridClickCapture
                    onPick={(minute) => openCreate(ymd, minute)}
                    from={timeline.from}
                    to={timeline.to}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        open={openModal && !!editing}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        title={editing?.id?.startsWith("s_") ? "Nuevo turno" : "Editar turno"}
      >
        {editing && (
          <ShiftForm
            drivers={drivers}
            initial={editing}
            onCancel={() => {
              setOpenModal(false);
              setEditing(null);
            }}
            onSubmit={saveShift}
          />
        )}
      </Modal>
    </section>
  );
}

/* ─────────── Captura de clicks en timeline para crear turno por hora ─────────── */
function GridClickCapture({
  onPick,
  from,
  to,
}: {
  onPick: (minute: number) => void;
  from: number;
  to: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = clamp(e.clientX - rect.left, 0, rect.width);
    const minute = Math.round(from + (relX / rect.width) * (to - from));
    onPick(minute - (minute % 30)); // redondeo a 30 min
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="absolute inset-0 cursor-crosshair"
      title="Click para crear turno en esta hora"
    />
  );
}
