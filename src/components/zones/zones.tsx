"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/* ─────────── Tipos ─────────── */
type Point = { x: number; y: number }; // coordenadas en el mundo virtual (0..2000)
type Zone = {
  id: string;
  name: string;
  color: string;
  active: boolean;
  fee: number;        // tarifa base
  minOrder: number;   // pedido mínimo
  windows?: string[]; // horarios tipo "09:00-18:00"
  notes?: string;
  polygon: Point[];
  createdAt: string;
  updatedAt: string;
};

type Mode = "idle" | "panning" | "drawing" | "editing";

/* ─────────── Utils ─────────── */
const uid = () => Math.random().toString(36).slice(2, 9);
const fmtMoney = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(n);
const LS_KEY = "delivery_zones_v1";

/* ─────────── Datos mock ─────────── */
const MOCK_ZONES: Zone[] = [
  {
    id: "z1",
    name: "Centro",
    color: "#22c55e",
    active: true,
    fee: 1.5,
    minOrder: 8,
    windows: ["09:00-22:00"],
    notes: "Alta demanda en almuerzo.",
    polygon: [
      { x: 820, y: 880 },
      { x: 1080, y: 860 },
      { x: 1120, y: 1040 },
      { x: 900, y: 1100 },
      { x: 820, y: 980 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "z2",
    name: "Norte",
    color: "#3b82f6",
    active: true,
    fee: 2.2,
    minOrder: 10,
    windows: ["10:00-21:00"],
    polygon: [
      { x: 1080, y: 680 },
      { x: 1340, y: 640 },
      { x: 1380, y: 820 },
      { x: 1120, y: 860 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "z3",
    name: "Sur",
    color: "#f97316",
    active: false,
    fee: 2.8,
    minOrder: 12,
    windows: ["11:00-20:00"],
    polygon: [
      { x: 920, y: 1140 },
      { x: 1200, y: 1100 },
      { x: 1220, y: 1260 },
      { x: 940, y: 1280 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/* ─────────── Componentes base ─────────── */
function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

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

/* ─────────── Formulario Zona ─────────── */
function ZoneForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: Zone;
  onSubmit: (z: Zone) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [color, setColor] = useState(initial.color);
  const [fee, setFee] = useState(initial.fee);
  const [minOrder, setMinOrder] = useState(initial.minOrder);
  const [active, setActive] = useState(initial.active);
  const [windows, setWindows] = useState((initial.windows || []).join(", "));
  const [notes, setNotes] = useState(initial.notes || "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...initial,
          name: name.trim() || "Zona sin nombre",
          color,
          fee: Number(fee) || 0,
          minOrder: Number(minOrder) || 0,
          active,
          windows: windows
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          notes: notes.trim() || undefined,
          updatedAt: new Date().toISOString(),
        });
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            placeholder="Ej: Centro"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-[38px] w-full rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Tarifa base</label>
          <input
            type="number"
            step="0.1"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            placeholder="1.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Pedido mínimo</label>
          <input
            type="number"
            step="0.1"
            value={minOrder}
            onChange={(e) => setMinOrder(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            placeholder="8"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Horarios (coma separados)</label>
        <input
          value={windows}
          onChange={(e) => setWindows(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          placeholder="09:00-22:00, 12:00-15:00"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-gray-500">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[90px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          placeholder="Observaciones de la zona…"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span>Zona activa</span>
        </label>
        <div className="flex items-center gap-2">
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
      </div>
    </form>
  );
}

/* ─────────── Página Zonas ─────────── */
export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Mapa estado (pan/zoom)
  const [mode, setMode] = useState<Mode>("idle");
  const [zoom, setZoom] = useState(1); // 0.5 .. 3
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: -600, y: -500 }); // translate
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(
    null
  );

  // Dibujo
  const [draft, setDraft] = useState<Point[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  // Modales
  const [openEdit, setOpenEdit] = useState(false);
  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedId) || null,
    [zones, selectedId]
  );

  // Cargar / Persistir
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Zone[];
        setZones(parsed);
        return;
      } catch {}
    }
    setZones(MOCK_ZONES);
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(zones));
  }, [zones]);

  /* ─────────── Handlers mapa ─────────── */
  const worldW = 2000;
  const worldH = 2000;

  const screenToWorld = (clientX: number, clientY: number, svg: SVGSVGElement): Point => {
    const rect = svg.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const startPan = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "idle" && mode !== "panning") return;
    setMode("panning");
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };

  const movePan = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "panning" || !isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
  };

  const endPan = () => {
    if (mode === "panning") {
      setIsDragging(false);
      setMode("idle");
      dragRef.current = null;
    }
  };

  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(3, Math.max(0.5, Number((z + dir).toFixed(2)))));
  };

  const onMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== "drawing") return;
    const svg = e.currentTarget;
    const p = screenToWorld(e.clientX, e.clientY, svg);
    setDraft((prev) => [...prev, clampPoint(p)]);
  };

  const clampPoint = (p: Point): Point => ({
    x: Math.max(0, Math.min(worldW, p.x)),
    y: Math.max(0, Math.min(worldH, p.y)),
  });

  const finishDraft = () => {
    if (draft.length < 3) return alert("La zona debe tener al menos 3 puntos.");
    const z: Zone = {
      id: `z_${uid()}`,
      name: "Nueva zona",
      color: "#14b8a6",
      active: true,
      fee: 2,
      minOrder: 10,
      polygon: draft,
      windows: ["09:00-22:00"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setZones((prev) => [z, ...prev]);
    setSelectedId(z.id);
    setDraft([]);
    setMode("idle");
    setOpenEdit(true); // abrir edición de metadatos
  };

  const cancelDraft = () => {
    setDraft([]);
    setMode("idle");
  };

  /* ─────────── Acciones zonas ─────────── */
  const toggleActive = (id: string) =>
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, active: !z.active, updatedAt: new Date().toISOString() } : z))
    );

  const removeZone = (id: string) => {
    if (!confirm("¿Eliminar zona?")) return;
    setZones((prev) => prev.filter((z) => z.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateZone = (nz: Zone) => {
    setZones((prev) => prev.map((z) => (z.id === nz.id ? nz : z)));
  };

  const exportGeoJSON = () => {
    const fc = {
      type: "FeatureCollection",
      features: zones.map((z) => ({
        type: "Feature",
        properties: {
          id: z.id,
          name: z.name,
          color: z.color,
          active: z.active,
          fee: z.fee,
          minOrder: z.minOrder,
          windows: z.windows || [],
          notes: z.notes || "",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            z.polygon.map((p) => [p.x, p.y]), // CRS ficticio (px mundo virtual)
          ],
        },
      })),
    };
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zones.geojson";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ─────────── UI Derivados ─────────── */
  const selected = selectedZone;
  const sorted = useMemo(
    () => zones.slice().sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name)),
    [zones]
  );

  /* ─────────── Render ─────────── */
  return (
    <section className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Zonas de entrega</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Define áreas operativas, tarifas y pedidos mínimos. Interfaz tipo “mapa” con pan/zoom y dibujo de polígonos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setMode("drawing");
              setDraft([]);
            }}
            className={`rounded-lg px-3 py-2 text-sm border ${
              mode === "drawing"
                ? "bg-brand-500 text-white border-brand-600"
                : "bg-white border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            }`}
          >
            {mode === "drawing" ? "Dibujando… click para puntos" : "Nueva zona"}
          </button>
          {mode === "drawing" && (
            <>
              <button
                onClick={finishDraft}
                className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                disabled={draft.length < 3}
              >
                Finalizar
              </button>
              <button
                onClick={cancelDraft}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Cancelar
              </button>
            </>
          )}
          <button
            onClick={exportGeoJSON}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Exportar GeoJSON
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Mapa */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Toolbar mapa */}
          <div className="flex items-center justify-between border-b border-gray-200 p-3 text-sm dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span className="rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-800">
                Modo: <b>{mode === "drawing" ? "Dibujo" : "Navegación"}</b>
              </span>
              <span className="hidden sm:inline text-xs text-gray-500">
                {mode === "drawing" ? "Click para agregar puntos, Finalizar para guardar" : "Arrastra para mover"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                −
              </button>
              <span className="w-14 text-center text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                +
              </button>
              <button
                onClick={() => setPan({ x: -600, y: -500 })}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Centrar
              </button>
            </div>
          </div>

          {/* SVG Map */}
          <div className="relative h-[560px]">
            <svg
              role="img"
              aria-label="Mapa de zonas"
              className="h-full w-full cursor-grab active:cursor-grabbing"
              onMouseDown={startPan}
              onMouseMove={movePan}
              onMouseUp={endPan}
              onMouseLeave={endPan}
              onWheel={onWheel}
            >
              {/* Fondo cuadriculado */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="40" height="40" fill="transparent" />
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeOpacity="0.15" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Viewport transform */}
              <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
                {/* Marco mundo */}
                <rect x={0} y={0} width={2000} height={2000} fill="url(#grid)" />
                {/* “Ríos / vías” decorativas */}
                <path
                  d="M 200 400 C 500 450, 800 350, 1200 420 S 1800 520, 1900 480"
                  fill="none"
                  stroke="#93c5fd"
                  strokeOpacity="0.35"
                  strokeWidth="12"
                />
                <path
                  d="M 300 1200 C 700 1100, 900 1300, 1500 1250"
                  fill="none"
                  stroke="#fda4af"
                  strokeOpacity="0.25"
                  strokeWidth="10"
                />

                {/* Zonas existentes (polígonos) */}
                {zones.map((z) => {
                  const d = z.polygon.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";
                  const selected = z.id === selectedId;
                  return (
                    <g key={z.id} onClick={(e) => { e.stopPropagation(); setSelectedId(z.id); }}>
                      <path
                        d={d}
                        fill={z.color}
                        fillOpacity={z.active ? (selected ? 0.28 : 0.18) : 0.08}
                        stroke={z.color}
                        strokeWidth={selected ? 3 : 2}
                        strokeDasharray={z.active ? "0" : "6 6"}
                      />
                      {/* etiqueta */}
                      {z.polygon.length > 0 && (
                        <text
                          x={z.polygon.reduce((a, b) => a + b.x, 0) / z.polygon.length}
                          y={z.polygon.reduce((a, b) => a + b.y, 0) / z.polygon.length}
                          textAnchor="middle"
                          className="fill-gray-800 dark:fill-gray-100"
                          fontSize={12}
                        >
                          {z.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Borrador de dibujo */}
                {mode === "drawing" && draft.length > 0 && (
                  <>
                    <polyline
                      points={draft.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth={2}
                    />
                    {draft.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r={4} fill="#14b8a6" />
                    ))}
                  </>
                )}
              </g>
              {/* Clic para agregar puntos */}
              {mode === "drawing" && (
                <rect
                  x={0}
                  y={0}
                  width="100%"
                  height="100%"
                  fill="transparent"
                  onClick={onMapClick}
                />
              )}
            </svg>
          </div>
        </div>

        {/* Panel lateral */}
        <aside className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Zonas ({zones.length})</h3>
            <div className="text-xs text-gray-500">Zoom {Math.round(zoom * 100)}%</div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedId(null)}
              className={`rounded-md px-2 py-1 text-xs ${
                selectedId === null
                  ? "bg-brand-500 text-white"
                  : "border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedId(zones.find((z) => z.active)?.id ?? null)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              Primera activa
            </button>
          </div>

          {/* Lista */}
          <ul className="space-y-2">
            {sorted.map((z) => (
              <li
                key={z.id}
                className={`rounded-xl border p-3 text-sm transition ${
                  selectedId === z.id
                    ? "border-brand-500/40 bg-brand-50 dark:border-brand-500/30 dark:bg-white/5"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 inline-block h-4 w-4 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: z.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        className="truncate text-left font-medium"
                        onClick={() => setSelectedId(z.id)}
                        title="Seleccionar en el mapa"
                      >
                        {z.name}
                      </button>
                      <div className="flex items-center gap-2">
                        <Pill className={z.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}>
                          {z.active ? "Activa" : "Inactiva"}
                        </Pill>
                      </div>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div>Tarifa: <b>{fmtMoney(z.fee)}</b></div>
                      <div>Mínimo: <b>{fmtMoney(z.minOrder)}</b></div>
                      <div className="col-span-2 truncate">Horarios: {(z.windows || []).join(", ") || "—"}</div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedId(z.id);
                          setOpenEdit(true);
                        }}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleActive(z.id)}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      >
                        {z.active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => removeZone(z.id)}
                        className="rounded-md border border-red-300 bg-white px-3 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {sorted.length === 0 && (
              <li className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
                No hay zonas aún. Crea una con “Nueva zona”.
              </li>
            )}
          </ul>

          {/* Detalle de selección */}
          {selected && (
            <div className="mt-3 rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-800">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">Detalle seleccionado</h4>
                <span className="text-xs text-gray-500">
                  {new Date(selected.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div>Nombre: <b>{selected.name}</b></div>
                <div>Tarifa: <b>{fmtMoney(selected.fee)}</b></div>
                <div>Pedido mínimo: <b>{fmtMoney(selected.minOrder)}</b></div>
                <div>Activa: <b>{selected.active ? "Sí" : "No"}</b></div>
                <div>Horarios: {(selected.windows || []).join(", ") || "—"}</div>
                <div className="truncate">Notas: {selected.notes || "—"}</div>
                <div>Puntos: {selected.polygon.length}</div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Modal editar zona */}
      <Modal
        open={openEdit && !!selected}
        onClose={() => setOpenEdit(false)}
        title={`Editar zona · ${selected?.name ?? ""}`}
      >
        {selected && (
          <ZoneForm
            initial={selected}
            onCancel={() => setOpenEdit(false)}
            onSubmit={(nz) => {
              updateZone(nz);
              setOpenEdit(false);
            }}
          />
        )}
      </Modal>
    </section>
  );
}
