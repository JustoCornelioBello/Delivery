"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ═════════════════ Types ═════════════════ */
type CouponStatus = "active" | "scheduled" | "expired" | "paused" | "archived";
type CouponType = "percent" | "amount" | "free_delivery";
type Channel = "web" | "app" | "telefono";
type Segment = "nuevos" | "frecuentes" | "vip" | "inactivos" | "todos";

type Coupon = {
  id: string;
  code: string;
  name: string;
  description?: string;

  type: CouponType;
  value?: number; // % o monto
  minAmount?: number;
  maxDiscount?: number; // tope al descontar

  startAt?: string; // ISO
  endAt?: string; // ISO

  status: CouponStatus;
  channels: Channel[];
  segment: Segment;

  usageLimit?: number; // total máximo redenciones
  usagePerUser?: number; // por usuario
  used: number;

  stackable?: boolean; // combina con otras promos
  autoApply?: boolean; // se aplica sin código

  createdAt: string; // ISO
  updatedAt: string; // ISO
  tags?: string[];
};

type ConfirmAction = { id: string; action: "activate" | "pause" | "archive" | "delete" };

/* ═════════════════ Utils ═════════════════ */
const LS_KEY = "coupons_mock_v1";
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const nowIso = () => new Date().toISOString();
const money = (n = 0) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(n);

const STATUS_META: Record<CouponStatus, { label: string; cls: string }> = {
  active: {
    label: "Activa",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  scheduled: {
    label: "Programada",
    cls: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300",
  },
  expired: {
    label: "Expirada",
    cls: "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300",
  },
  paused: {
    label: "Pausada",
    cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
  },
  archived: {
    label: "Archivada",
    cls: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
};

const TYPE_LABEL: Record<CouponType, string> = {
  percent: "% Descuento",
  amount: "Descuento fijo",
  free_delivery: "Entrega gratis",
};

const CH_LABEL: Record<Channel, string> = {
  web: "Web",
  app: "App",
  telefono: "Teléfono",
};
const SEG_LABEL: Record<Segment, string> = {
  nuevos: "Nuevos",
  frecuentes: "Frecuentes",
  vip: "VIP",
  inactivos: "Inactivos",
  todos: "Todos",
};

const computeStatus = (c: Coupon): CouponStatus => {
  if (c.status === "archived") return "archived";
  if (c.status === "paused") return "paused";
  const now = Date.now();
  const start = c.startAt ? new Date(c.startAt).getTime() : undefined;
  const end = c.endAt ? new Date(c.endAt).getTime() : undefined;

  if (typeof c.usageLimit === "number" && c.used >= c.usageLimit) return "expired";
  if (end && now > end) return "expired";
  if (start && now < start) return "scheduled";
  return "active";
};

const withComputedStatus = (c: Coupon): Coupon => {
  const next = computeStatus(c);
  return next === c.status ? c : { ...c, status: next, updatedAt: nowIso() };
};

/* ═════════════════ Mock Seed ═════════════════ */
function seed(): Coupon[] {
  const base = (p: Partial<Coupon>): Coupon => ({
    id: `CPN-${uid()}`,
    code: "WELCOME10",
    name: "Cupón sin título",
    description: "",
    type: "percent",
    value: 10,
    minAmount: 15,
    maxDiscount: 8,
    startAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    endAt: new Date(Date.now() + 10 * 864e5).toISOString(),
    status: "active",
    channels: ["web", "app"],
    segment: "nuevos",
    usageLimit: 1000,
    usagePerUser: 1,
    used: 120,
    stackable: false,
    autoApply: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    tags: ["bienvenida"],
    ...p,
  });

  return [
    base({
      code: "WELCOME10",
      name: "Bienvenida 10%",
      tags: ["onboarding", "primer pedido"],
      used: 320,
      usageLimit: 1500,
      segment: "nuevos",
      status: "active",
    }),
    base({
      code: "BEBIDAS2X1",
      name: "2x1 Bebidas",
      type: "amount",
      value: 3,
      minAmount: 10,
      channels: ["web", "app", "telefono"],
      segment: "frecuentes",
      used: 88,
      tags: ["bebidas", "combo"],
      status: "paused",
    }),
    base({
      code: "ENVIOGRATIS",
      name: "Entrega Gratis ZONA A",
      type: "free_delivery",
      value: undefined,
      minAmount: 12,
      channels: ["app"],
      segment: "todos",
      used: 0,
      startAt: new Date(Date.now() + 2 * 864e5).toISOString(),
      endAt: new Date(Date.now() + 8 * 864e5).toISOString(),
      status: "scheduled",
      tags: ["logística"],
      autoApply: true,
    }),
    base({
      code: "VIP15",
      name: "VIP 15% Off",
      type: "percent",
      value: 15,
      segment: "vip",
      used: 210,
      endAt: new Date(Date.now() - 1 * 864e5).toISOString(),
      status: "expired",
      tags: ["alto ticket"],
    }),
    base({
      code: "BLACK10",
      name: "Black Week 10 USD",
      type: "amount",
      value: 10,
      minAmount: 40,
      maxDiscount: 10,
      usageLimit: 500,
      used: 12,
      segment: "todos",
      status: "archived",
      tags: ["histórico"],
    }),
  ].map(withComputedStatus);
}

/* ═════════════════ Mini UI helpers ═════════════════ */
const StatusBadge = ({ s }: { s: CouponStatus }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ${STATUS_META[s].cls}`}>
    {STATUS_META[s].label}
  </span>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 dark:bg-gray-800 dark:text-gray-300">
    {children}
  </span>
);

function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

/* ═════════════════ Modales ═════════════════ */
const Modal: React.FC<{ open: boolean; title: string; onClose: () => void; children: React.ReactNode; maxW?: string }> = ({
  open,
  title,
  onClose,
  children,
  maxW = "max-w-3xl",
}) => {
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
export default function CouponsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CouponStatus | "all">("all");
  const [type, setType] = useState<CouponType | "all">("all");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [segment, setSegment] = useState<Segment | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "start" | "end" | "used">("updated");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  // menú fila
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // modales
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [openImport, setOpenImport] = useState(false);

  /* Load / seed */
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed: Coupon[] = JSON.parse(raw);
        setItems(parsed.map(withComputedStatus));
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

  /* Filtrado */
  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const words = q.trim().toLowerCase();

    const list = items
      .map(withComputedStatus)
      .filter((c) => {
        const matchesQ =
          !words ||
          c.code.toLowerCase().includes(words) ||
          c.name.toLowerCase().includes(words) ||
          (c.tags || []).some((t) => t.toLowerCase().includes(words));
        const matchesStatus = status === "all" || c.status === status;
        const matchesType = type === "all" || c.type === type;
        const matchesChannel = channel === "all" || c.channels.includes(channel as Channel);
        const matchesSegment = segment === "all" || c.segment === segment;

        const start = c.startAt ? new Date(c.startAt) : null;
        const end = c.endAt ? new Date(c.endAt) : null;
        const inRange =
          (!from || (start && start >= from) || (end && end && end >= from)) &&
          (!to || (start && start <= to) || (end && end && end <= to));

        return matchesQ && matchesStatus && matchesType && matchesChannel && matchesSegment && inRange;
      });

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "updated")
        return dir * ((+new Date(a.updatedAt)) - (+new Date(b.updatedAt)));
      if (sortBy === "start")
        return dir * ((+new Date(a.startAt || 0)) - (+new Date(b.startAt || 0)));
      if (sortBy === "end")
        return dir * ((+new Date(a.endAt || 0)) - (+new Date(b.endAt || 0)));
      if (sortBy === "used") return dir * ((a.used || 0) - (b.used || 0));
      return 0;
    });

    return list;
  }, [items, q, status, type, channel, segment, dateFrom, dateTo, sortBy, sortDir]);

  const totals = useMemo(() => {
    const count = filtered.length;
    const active = filtered.filter((c) => c.status === "active").length;
    const scheduled = filtered.filter((c) => c.status === "scheduled").length;
    const paused = filtered.filter((c) => c.status === "paused").length;
    const expired = filtered.filter((c) => c.status === "expired").length;
    const archived = filtered.filter((c) => c.status === "archived").length;
    const used = filtered.reduce((a, c) => a + (c.used || 0), 0);
    return { count, active, scheduled, paused, expired, archived, used };
  }, [filtered]);

  /* CRUD helpers */
  const upsert = (data: Omit<Coupon, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    const normalized: Coupon = withComputedStatus({
      ...(data as Coupon),
      id: data.id || `CPN-${uid()}`,
      createdAt: data.id ? items.find((x) => x.id === data.id)?.createdAt || nowIso() : nowIso(),
      updatedAt: nowIso(),
    });
    setItems((prev) => {
      const exists = prev.some((x) => x.id === normalized.id);
      return exists ? prev.map((x) => (x.id === normalized.id ? normalized : x)) : [normalized, ...prev];
    });
    setOpenForm(false);
    setEditing(null);
  };

  const bulk = (action: ConfirmAction["action"]) => {
    if (!selected.length) return alert("Selecciona al menos un cupón.");
    if (action === "delete") {
      setItems((prev) => prev.filter((x) => !selected.includes(x.id)));
    } else {
      setItems((prev) =>
        prev.map((x) => {
          if (!selected.includes(x.id)) return x;
          if (action === "activate") return withComputedStatus({ ...x, status: "active", updatedAt: nowIso() });
          if (action === "pause") return withComputedStatus({ ...x, status: "paused", updatedAt: nowIso() });
          if (action === "archive") return withComputedStatus({ ...x, status: "archived", updatedAt: nowIso() });
          return x;
        })
      );
    }
    setSelected([]);
  };

  const duplicate = (id: string) => {
    const src = items.find((x) => x.id === id);
    if (!src) return;
    const copy: Coupon = withComputedStatus({
      ...src,
      id: `CPN-${uid()}`,
      code: `${src.code}-COPY`,
      name: `${src.name} (copia)`,
      used: 0,
      status: "draft" as CouponStatus, // recalculará a scheduled/active al upsert si tiene fechas
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
    setItems((prev) => [copy, ...prev]);
  };

  const applyConfirm = () => {
    if (!confirm) return;
    const { id, action } = confirm;
    setItems((prev) =>
      prev
        .map((x) => {
          if (x.id !== id) return x;
          if (action === "delete") return null as any;
          if (action === "activate") return withComputedStatus({ ...x, status: "active", updatedAt: nowIso() });
          if (action === "pause") return withComputedStatus({ ...x, status: "paused", updatedAt: nowIso() });
          if (action === "archive") return withComputedStatus({ ...x, status: "archived", updatedAt: nowIso() });
          return x;
        })
        .filter(Boolean) as Coupon[]
    );
    setConfirm(null);
  };

  /* ── Form state ── */
  const [fCode, setFCode] = useState("");
  const [fName, setFName] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fType, setFType] = useState<CouponType>("percent");
  const [fValue, setFValue] = useState<number | "">("");
  const [fMin, setFMin] = useState<number | "">("");
  const [fMax, setFMax] = useState<number | "">("");
  const [fStart, setFStart] = useState("");
  const [fEnd, setFEnd] = useState("");
  const [fChannels, setFChannels] = useState<Channel[]>(["web", "app"]);
  const [fSegment, setFSegment] = useState<Segment>("todos");
  const [fLimit, setFLimit] = useState<number | "">("");
  const [fPerUser, setFPerUser] = useState<number | "">("");
  const [fUsed, setFUsed] = useState<number | "">("");
  const [fStack, setFStack] = useState(false);
  const [fAuto, setFAuto] = useState(false);
  const [fTags, setFTags] = useState("");

  const resetForm = () => {
    setEditing(null);
    setFCode("");
    setFName("");
    setFDesc("");
    setFType("percent");
    setFValue("");
    setFMin("");
    setFMax("");
    setFStart("");
    setFEnd("");
    setFChannels(["web", "app"]);
    setFSegment("todos");
    setFLimit("");
    setFPerUser("");
    setFUsed("");
    setFStack(false);
    setFAuto(false);
    setFTags("");
  };

  const openCreate = () => {
    resetForm();
    setOpenForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setFCode(c.code);
    setFName(c.name);
    setFDesc(c.description || "");
    setFType(c.type);
    setFValue(typeof c.value === "number" ? c.value : "");
    setFMin(typeof c.minAmount === "number" ? c.minAmount : "");
    setFMax(typeof c.maxDiscount === "number" ? c.maxDiscount : "");
    setFStart(c.startAt ? c.startAt.slice(0, 16) : "");
    setFEnd(c.endAt ? c.endAt.slice(0, 16) : "");
    setFChannels(c.channels);
    setFSegment(c.segment);
    setFLimit(typeof c.usageLimit === "number" ? c.usageLimit : "");
    setFPerUser(typeof c.usagePerUser === "number" ? c.usagePerUser : "");
    setFUsed(typeof c.used === "number" ? c.used : "");
    setFStack(!!c.stackable);
    setFAuto(!!c.autoApply);
    setFTags((c.tags || []).join(", "));
    setOpenForm(true);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fCode.trim()) return alert("Ingresa un código.");
    if (!fName.trim()) return alert("Ingresa un nombre.");
    if (fType !== "free_delivery" && (!fValue || Number(fValue) <= 0)) {
      return alert("Ingresa un valor válido para el descuento.");
    }
    const payload: Omit<Coupon, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      id: editing?.id,
      code: fCode.trim().toUpperCase(),
      name: fName.trim(),
      description: fDesc.trim() || undefined,
      type: fType,
      value: fType === "free_delivery" ? undefined : Number(fValue),
      minAmount: fMin === "" ? undefined : Number(fMin),
      maxDiscount: fMax === "" ? undefined : Number(fMax),
      startAt: fStart ? new Date(fStart).toISOString() : undefined,
      endAt: fEnd ? new Date(fEnd).toISOString() : undefined,
      // status provisional, luego computeStatus decide:
      status: editing?.status ?? "active",
      channels: fChannels,
      segment: fSegment,
      usageLimit: fLimit === "" ? undefined : Number(fLimit),
      usagePerUser: fPerUser === "" ? undefined : Number(fPerUser),
      used: fUsed === "" ? 0 : Number(fUsed),
      stackable: fStack,
      autoApply: fAuto,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      tags: fTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    upsert(payload);
  };

  /* Import/Export */
  const exportCSV = () => {
    const rows = [
      [
        "id",
        "code",
        "name",
        "status",
        "type",
        "value",
        "minAmount",
        "maxDiscount",
        "startAt",
        "endAt",
        "channels",
        "segment",
        "usageLimit",
        "usagePerUser",
        "used",
        "stackable",
        "autoApply",
        "tags",
      ],
      ...filtered.map((c) => [
        c.id,
        c.code,
        c.name,
        c.status,
        c.type,
        c.value ?? "",
        c.minAmount ?? "",
        c.maxDiscount ?? "",
        c.startAt || "",
        c.endAt || "",
        c.channels.join("|"),
        c.segment,
        c.usageLimit ?? "",
        c.usagePerUser ?? "",
        c.used,
        c.stackable ? 1 : 0,
        c.autoApply ? 1 : 0,
        (c.tags || []).join("|"),
      ]),
    ];
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coupons_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (text: string) => {
    try {
      const arr = JSON.parse(text) as Partial<Coupon>[];
      const mapped = arr
        .map((r) =>
          withComputedStatus({
            id: r.id || `CPN-${uid()}`,
            code: (r.code || "").toUpperCase(),
            name: r.name || "Cupón importado",
            description: r.description || "",
            type: (r.type as CouponType) || "percent",
            value: typeof r.value === "number" ? r.value : undefined,
            minAmount: typeof r.minAmount === "number" ? r.minAmount : undefined,
            maxDiscount: typeof r.maxDiscount === "number" ? r.maxDiscount : undefined,
            startAt: r.startAt,
            endAt: r.endAt,
            status: (r.status as CouponStatus) || "active",
            channels: (r.channels as Channel[]) || ["web", "app"],
            segment: (r.segment as Segment) || "todos",
            usageLimit: typeof r.usageLimit === "number" ? r.usageLimit : undefined,
            usagePerUser: typeof r.usagePerUser === "number" ? r.usagePerUser : undefined,
            used: typeof r.used === "number" ? r.used : 0,
            stackable: !!r.stackable,
            autoApply: !!r.autoApply,
            createdAt: r.createdAt || nowIso(),
            updatedAt: nowIso(),
            tags: r.tags || [],
          } as Coupon)
        )
        .filter((c) => !!c.code);
      if (!mapped.length) return alert("No se encontraron cupones válidos.");
      setItems((prev) => [...mapped, ...prev]);
      setOpenImport(false);
    } catch (e) {
      alert("JSON inválido.");
    }
  };

  /* Render */
  return (
    <section className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Cupones</h1>
          <p className="text-sm text-gray-500">
            Gestiona códigos, condiciones, vigencias y uso por segmento y canal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreate}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Nuevo cupón
          </button>
          <button
            onClick={exportCSV}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => setOpenImport(true)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Importar JSON
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <Kpi title="Total (filtro)" value={totals.count} />
        <Kpi title="Activos" value={totals.active} />
        <Kpi title="Programados" value={totals.scheduled} />
        <Kpi title="Pausados" value={totals.paused} />
        <Kpi title="Expirados" value={totals.expired} />
        <Kpi title="Redenciones" value={totals.used} />
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-10">
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Código, nombre o tag…"
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
              {Object.keys(STATUS_META).map((k) => (
                <option key={k} value={k}>
                  {STATUS_META[k as CouponStatus].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="percent">% Descuento</option>
              <option value="amount">Descuento fijo</option>
              <option value="free_delivery">Entrega gratis</option>
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
              {Object.keys(CH_LABEL).map((k) => (
                <option key={k} value={k}>
                  {CH_LABEL[k as Channel]}
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
              {Object.keys(SEG_LABEL).map((k) => (
                <option key={k} value={k}>
                  {SEG_LABEL[k as Segment]}
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
              <option value="end">Fin</option>
              <option value="used">Usos</option>
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

        {/* Acciones masivas */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Seleccionados: {selected.length}</span>
          <div className="flex gap-2">
            <button
              onClick={() => bulk("activate")}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              Activar
            </button>
            <button
              onClick={() => bulk("pause")}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              Pausar
            </button>
            <button
              onClick={() => bulk("archive")}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              Archivar
            </button>
            <button
              onClick={() => bulk("delete")}
              className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:bg-gray-800 dark:text-rose-300"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800">
            <tr>
              <th className="p-3">
                {/* seleccionar página (simple) */}
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(e.target.checked ? filtered.map((c) => c.id) : [])
                  }
                  checked={selected.length > 0 && selected.length === filtered.length}
                  aria-label="Seleccionar todos"
                />
              </th>
              <th className="p-3">Cupón</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Condiciones</th>
              <th className="p-3">Vigencia</th>
              <th className="p-3">Uso</th>
              <th className="p-3">Segmento</th>
              <th className="p-3">Canales</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                      )
                    }
                    aria-label={`Seleccionar ${c.code}`}
                  />
                </td>
                <td className="p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{c.code}</span>
                      {(c.tags || []).slice(0, 3).map((t) => (
                        <Chip key={t}>{t}</Chip>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-1">{c.name}</div>
                  </div>
                </td>
                <td className="p-3">
                  <StatusBadge s={c.status} />
                </td>
                <td className="p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                      {TYPE_LABEL[c.type]}
                    </span>
                    {typeof c.value === "number" && (
                      <span className="text-gray-700 dark:text-gray-300">
                        {c.type === "percent" ? `${c.value}%` : money(c.value)}
                      </span>
                    )}
                    {c.autoApply && <Chip>Auto-aplicar</Chip>}
                    {c.stackable && <Chip>Acumulable</Chip>}
                  </div>
                </td>
                <td className="p-3 text-xs">
                  <div className="space-y-0.5">
                    {typeof c.minAmount === "number" && (
                      <div className="text-gray-600 dark:text-gray-300">Mín: {money(c.minAmount)}</div>
                    )}
                    {typeof c.maxDiscount === "number" && (
                      <div className="text-gray-600 dark:text-gray-300">Tope: {money(c.maxDiscount)}</div>
                    )}
                    {typeof c.usageLimit === "number" && (
                      <div className="text-gray-600 dark:text-gray-300">Límite total: {c.usageLimit}</div>
                    )}
                    {typeof c.usagePerUser === "number" && (
                      <div className="text-gray-600 dark:text-gray-300">Por usuario: {c.usagePerUser}</div>
                    )}
                  </div>
                </td>
                <td className="p-3 text-xs text-gray-600 dark:text-gray-400">
                  {c.startAt ? new Date(c.startAt).toLocaleString() : "—"} <span className="mx-1">→</span>{" "}
                  {c.endAt ? new Date(c.endAt).toLocaleString() : "—"}
                </td>
                <td className="p-3 text-xs">
                  <div className="space-y-0.5">
                    <div>
                      Usados: <span className="font-medium">{c.used}</span>
                    </div>
                    {typeof c.usageLimit === "number" && (
                      <div className="text-gray-500">
                        Restantes: {Math.max(0, c.usageLimit - c.used)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3">{SEG_LABEL[c.segment]}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {c.channels.map((ch) => (
                      <span
                        key={ch}
                        className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {CH_LABEL[ch]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <RowMenu
                    open={openMenuId === c.id}
                    onOpen={() => setOpenMenuId(c.id)}
                    onClose={() => setOpenMenuId(null)}
                    onAction={(a) => {
                      if (a === "edit") openEdit(c);
                      if (a === "duplicate") duplicate(c.id);
                      if (a === "activate") setConfirm({ id: c.id, action: "activate" });
                      if (a === "pause") setConfirm({ id: c.id, action: "pause" });
                      if (a === "archive") setConfirm({ id: c.id, action: "archive" });
                      if (a === "delete") setConfirm({ id: c.id, action: "delete" });
                    }}
                    status={c.status}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={10}>
                  Sin resultados con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? "Editar cupón" : "Crear cupón"}>
        <form onSubmit={submitForm} className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-3 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-gray-500">Código *</label>
                <div className="flex gap-2">
                  <input
                    value={fCode}
                    onChange={(e) => setFCode(e.target.value.toUpperCase())}
                    placeholder="EJ: WELCOME10"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setFCode(`CPN${uid().slice(0, 5)}`)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    Generar
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Tipo *</label>
                <select
                  value={fType}
                  onChange={(e) => setFType(e.target.value as CouponType)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="percent">% Descuento</option>
                  <option value="amount">Descuento fijo</option>
                  <option value="free_delivery">Entrega gratis</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Nombre *</label>
              <input
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder="Ej: Bienvenida 10%"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Descripción</label>
              <textarea
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                placeholder="Notas internas, restricciones, etc."
                className="min-h-[80px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            {fType !== "free_delivery" && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    {fType === "percent" ? "Porcentaje *" : "Monto *"}
                  </label>
                  <input
                    inputMode="decimal"
                    value={fValue}
                    onChange={(e) => setFValue(e.target.value ? Number(e.target.value) : "")}
                    placeholder={fType === "percent" ? "Ej: 10" : "Ej: 5"}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Mínimo</label>
                  <input
                    inputMode="decimal"
                    value={fMin}
                    onChange={(e) => setFMin(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Ej: 15"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Tope</label>
                  <input
                    inputMode="decimal"
                    value={fMax}
                    onChange={(e) => setFMax(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Ej: 8"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>
            )}

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
          </div>

          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Canales *</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CH_LABEL).map((k) => {
                  const ch = k as Channel;
                  const checked = fChannels.includes(ch);
                  return (
                    <label
                      key={k}
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm ${
                        checked
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setFChannels((prev) => (checked ? prev.filter((x) => x !== ch) : [...prev, ch]))
                        }
                        className="mr-2 align-middle"
                      />
                      {CH_LABEL[ch]}
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
                  {Object.keys(SEG_LABEL).map((k) => (
                    <option key={k} value={k}>
                      {SEG_LABEL[k as Segment]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Usos totales</label>
                <input
                  inputMode="numeric"
                  value={fLimit}
                  onChange={(e) => setFLimit(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ej: 1000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Por usuario</label>
                <input
                  inputMode="numeric"
                  value={fPerUser}
                  onChange={(e) => setFPerUser(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ej: 1"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Usados</label>
                <input
                  inputMode="numeric"
                  value={fUsed}
                  onChange={(e) => setFUsed(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Ej: 0"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={fStack} onChange={(e) => setFStack(e.target.checked)} />
                Acumulable
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={fAuto} onChange={(e) => setFAuto(e.target.checked)} />
                Auto-aplicar
              </label>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Tags</label>
              <input
                value={fTags}
                onChange={(e) => setFTags(e.target.value)}
                placeholder="ej: bienvenida, bebidas, logística"
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
                {editing ? "Guardar cambios" : "Crear cupón"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Import JSON */}
      <Modal open={openImport} onClose={() => setOpenImport(false)} title="Importar cupones (JSON)" maxW="max-w-2xl">
        <ImportJSON onCancel={() => setOpenImport(false)} onImport={importJSON} />
      </Modal>

      {/* Confirmación */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Confirmar acción" maxW="max-w-md">
        {confirm && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ¿Seguro que deseas{" "}
              <b>
                {confirm.action === "activate"
                  ? "activar"
                  : confirm.action === "pause"
                  ? "pausar"
                  : confirm.action === "archive"
                  ? "archivar"
                  : "eliminar"}
              </b>{" "}
              este cupón?
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
                  confirm.action === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-brand-500 hover:bg-brand-600"
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

/* ═════════════════ Row menu (3 puntos) ═════════════════ */
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
  onAction: (a: "edit" | "duplicate" | "activate" | "pause" | "archive" | "delete") => void;
  status: CouponStatus;
}) {
  const ref = useOutsideClose<HTMLDivElement>(onClose);
  const actions: { key: Parameters<typeof onAction>[0]; label: string; danger?: boolean; show?: boolean }[] = [
    { key: "edit", label: "Editar", show: true },
    { key: "duplicate", label: "Duplicar", show: true },
    { key: "activate", label: "Activar", show: status === "paused" || status === "scheduled" || status === "expired" },
    { key: "pause", label: "Pausar", show: status === "active" },
    { key: "archive", label: "Archivar", show: status !== "archived" },
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
            {actions
              .filter((a) => a.show)
              .map((a) => (
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

/* ═════════════════ Blocks ═════════════════ */
function Kpi({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function ImportJSON({ onCancel, onImport }: { onCancel: () => void; onImport: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Pega un arreglo JSON de cupones. Campos soportados: <code>code, name, type, value, minAmount, maxDiscount, startAt, endAt, status, channels, segment, usageLimit, usagePerUser, used, stackable, autoApply, tags</code>.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='[{"code":"WELCOME10","name":"Bienvenida","type":"percent","value":10}]'
        className="min-h-[220px] w-full rounded-xl border border-gray-300 p-3 text-sm dark:border-gray-700 dark:bg-gray-800"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          onClick={() => onImport(text)}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Importar
        </button>
      </div>
    </div>
  );
}
