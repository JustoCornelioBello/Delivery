"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────── Tipos ─────────────────────────── */
type PartyType = "repartidor" | "socio";
type SettlementStatus = "pendiente" | "procesando" | "pagado" | "fallido";
type Currency = "USD" | "EUR" | "MXN";

type Party = {
  id: string;
  type: PartyType;
  name: string;
  doc?: string; // RUT/INE/ID opcional
};

type PayoutMethod = "transferencia" | "efectivo" | "wallet" | "paypal";

type Settlement = {
  id: string; // STL-XXXX
  party: Party;
  periodFrom: string; // ISO
  periodTo: string; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status: SettlementStatus;
  currency: Currency;

  orders: number;
  gross: number; // total ventas
  fees: number; // comisiones plataforma
  adjustments: number; // ajustes +/-
  taxes: number; // retenciones/impuestos
  net: number; // a pagar

  payoutMethod: PayoutMethod;
  payoutRef?: string; // folio de pago/tx id
  notes?: string;
};

/* ─────────────────────────── Utils ─────────────────────────── */
const LS_KEY = "settlements_mock_v1";
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const nowIso = () => new Date().toISOString();
const money = (n: number, ccy: Currency = "USD") =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: ccy }).format(n);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "2-digit" });

/* ──────────────── Componentes UI pequeños sin dependencias ──────────────── */
const Switch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`inline-flex h-6 w-11 items-center rounded-full transition ${
      checked ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
    }`}
    aria-pressed={checked}
  >
    <span
      className={`h-5 w-5 transform rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-1"}`}
    />
  </button>
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

function RowMenu({
  open,
  onOpen,
  onClose,
  onAction,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAction: (a: "ver" | "pagar" | "procesar" | "fallar" | "eliminar") => void;
}) {
  const ref = useOutsideClose<HTMLDivElement>(onClose);
  const items = [
    { key: "ver", label: "Ver detalle" },
    { key: "pagar", label: "Marcar como pagado" },
    { key: "procesar", label: "Marcar como procesando" },
    { key: "fallar", label: "Marcar como fallido" },
    { key: "eliminar", label: "Eliminar", danger: true },
  ] as const;

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={open ? onClose : onOpen}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        aria-haspopup="menu"
        title="Más acciones"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <ul className="py-1 text-sm">
            {items.map((m) => (
              <li key={m.key}>
                <button
                  onClick={() => {
                    onAction(m.key);
                    onClose();
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5 ${
                    m.danger ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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

/* ─────────────────────────── Datos simulados ─────────────────────────── */
function seed(): Settlement[] {
  const parties: Party[] = [
    { id: "P-DRI-01", type: "repartidor", name: "Mario Ruiz", doc: "INE 12345678" },
    { id: "P-DRI-02", type: "repartidor", name: "Carla León", doc: "INE 87654321" },
    { id: "P-PAR-01", type: "socio", name: "Rest. Don Pepe", doc: "RUT 12.345.678-9" },
  ];
  const mk = (i: number): Settlement => {
    const party = parties[i % parties.length];
    const from = new Date();
    from.setDate(from.getDate() - 14 - i * 7);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    const orders = 40 + (i % 7) * 5;
    const gross = orders * (8 + (i % 3));
    const fees = gross * 0.12;
    const adjustments = (i % 2 ? -1 : 1) * 5;
    const taxes = gross * 0.05;
    const net = Math.max(0, Math.round((gross - fees + adjustments - taxes) * 100) / 100);
    const statusPool: SettlementStatus[] = ["pendiente", "procesando", "pagado", "fallido"];
    return {
      id: `STL-${uid()}`,
      party,
      periodFrom: from.toISOString(),
      periodTo: to.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: statusPool[i % statusPool.length],
      currency: ["USD", "MXN", "EUR"][i % 3] as Currency,
      orders,
      gross,
      fees: Math.round(fees * 100) / 100,
      adjustments,
      taxes: Math.round(taxes * 100) / 100,
      net,
      payoutMethod: (["transferencia", "wallet", "efectivo", "paypal"][i % 4] as PayoutMethod),
      payoutRef: i % 4 === 2 ? undefined : `TX-${uid()}`,
      notes: i % 3 === 0 ? "Incluye propinas del periodo." : undefined,
    };
  };
  return Array.from({ length: 18 }, (_, i) => mk(i));
}

/* ─────────────────────────── Página ─────────────────────────── */
export default function SettlementsPage() {
  const [rows, setRows] = useState<Settlement[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<SettlementStatus | "all">("all");
  const [type, setType] = useState<PartyType | "all">("all");
  const [ccy, setCcy] = useState<Currency | "all">("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [onlyWithPayoutRef, setOnlyWithPayoutRef] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; action: "delete" } | null>(null);

  // seed inicial
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        setRows(JSON.parse(raw));
        return;
      } catch {}
    }
    const s = seed();
    setRows(s);
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  }, [rows]);

  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return rows.filter((r) => {
      const matchesQ =
        !words ||
        r.id.toLowerCase().includes(words) ||
        r.party.name.toLowerCase().includes(words) ||
        (r.notes || "").toLowerCase().includes(words) ||
        (r.payoutRef || "").toLowerCase().includes(words);

      const matchesStatus = status === "all" || r.status === status;
      const matchesType = type === "all" || r.party.type === type;
      const matchesCcy = ccy === "all" || r.currency === ccy;
      const created = new Date(r.createdAt);
      const matchesFrom = !from || created >= from;
      const matchesTo = !to || created <= to;
      const matchesRef = !onlyWithPayoutRef || !!r.payoutRef;

      return matchesQ && matchesStatus && matchesType && matchesCcy && matchesFrom && matchesTo && matchesRef;
    });
  }, [rows, q, status, type, ccy, dateFrom, dateTo, onlyWithPayoutRef]);

  const totals = useMemo(() => {
    const sum = (fn: (r: Settlement) => number) => filtered.reduce((a, b) => a + fn(b), 0);
    return {
      count: filtered.length,
      gross: sum((x) => x.gross),
      net: sum((x) => x.net),
      orders: sum((x) => x.orders),
      paid: filtered.filter((x) => x.status === "pagado").length,
      pending: filtered.filter((x) => x.status === "pendiente").length,
    };
  }, [filtered]);

  const changeStatus = (id: string, s: SettlementStatus) =>
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status: s, updatedAt: nowIso() } : x)));

  const remove = (id: string) => setRows((prev) => prev.filter((x) => x.id !== id));

  const exportCSV = () => {
    const header = [
      "id",
      "partyId",
      "partyType",
      "partyName",
      "periodFrom",
      "periodTo",
      "createdAt",
      "status",
      "currency",
      "orders",
      "gross",
      "fees",
      "adjustments",
      "taxes",
      "net",
      "payoutMethod",
      "payoutRef",
    ];
    const rowsCsv = filtered.map((r) => [
      r.id,
      r.party.id,
      r.party.type,
      r.party.name,
      r.periodFrom,
      r.periodTo,
      r.createdAt,
      r.status,
      r.currency,
      r.orders,
      r.gross,
      r.fees,
      r.adjustments,
      r.taxes,
      r.net,
      r.payoutMethod,
      r.payoutRef || "",
    ]);
    const csv =
      header.join(",") +
      "\n" +
      rowsCsv.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `liquidaciones_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const detail = useMemo(() => rows.find((r) => r.id === detailId) || null, [detailId, rows]);

  /* ───────────── Crear liquidación (simple) ───────────── */
  const [cPartyName, setCPartyName] = useState("");
  const [cPartyType, setCPartyType] = useState<PartyType>("repartidor");
  const [cCcy, setCCcy] = useState<Currency>("USD");
  const [cOrders, setCOrders] = useState<number>(20);
  const [cGross, setCGross] = useState<number>(160);
  const [cFees, setCFees] = useState<number>(20);
  const [cAdj, setCAdj] = useState<number>(0);
  const [cTaxes, setCTaxes] = useState<number>(5);
  const [cMethod, setCMethod] = useState<PayoutMethod>("transferencia");
  const [cFrom, setCFrom] = useState<string>(() => new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10));
  const [cTo, setCTo] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const createSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cPartyName.trim()) return alert("Ingresa un nombre para el beneficiario.");
    const net = Math.max(0, Math.round((cGross - cFees + cAdj - cTaxes) * 100) / 100);
    const it: Settlement = {
      id: `STL-${uid()}`,
      party: { id: `P-${uid()}`, type: cPartyType, name: cPartyName.trim(), doc: undefined },
      periodFrom: new Date(cFrom).toISOString(),
      periodTo: new Date(cTo).toISOString(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      status: "pendiente",
      currency: cCcy,
      orders: cOrders,
      gross: cGross,
      fees: cFees,
      adjustments: cAdj,
      taxes: cTaxes,
      net,
      payoutMethod: cMethod,
      payoutRef: undefined,
    };
    setRows((prev) => [it, ...prev]);
    setOpenCreate(false);
  };

  return (
    <section className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Liquidaciones</h1>
          <p className="text-sm text-gray-500">
            Consulta y gestiona pagos hacia repartidores y socios. Marca estados, exporta y crea nuevas liquidaciones.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOpenCreate(true)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Nueva liquidación
          </button>
          <button
            onClick={exportCSV}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Registros</p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{totals.count}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Órdenes</p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{totals.orders}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Bruto</p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{money(totals.gross as number)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">A pagar</p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{money(totals.net as number)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Estado</p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
            {totals.paid} pagadas · {totals.pending} pendientes
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-12">
          <div className="col-span-4">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ID, beneficiario, nota o folio…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SettlementStatus | "all")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="procesando">Procesando</option>
              <option value="pagado">Pagado</option>
              <option value="fallido">Fallido</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PartyType | "all")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="repartidor">Repartidor</option>
              <option value="socio">Socio</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Moneda</label>
            <select
              value={ccy}
              onChange={(e) => setCcy(e.target.value as Currency | "all")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todas</option>
              <option value="USD">USD</option>
              <option value="MXN">MXN</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Hasta</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
          <div className="col-span-2 flex items-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={onlyWithPayoutRef}
                onChange={(e) => setOnlyWithPayoutRef(e.target.checked)}
              />
              Solo con folio/tx
            </label>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800">
            <tr>
              <th className="p-3">Liquidación</th>
              <th className="p-3">Beneficiario</th>
              <th className="p-3">Periodo</th>
              <th className="p-3">Órdenes</th>
              <th className="p-3">Bruto</th>
              <th className="p-3">A pagar</th>
              <th className="p-3">Pago</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="p-3">
                  <div className="font-medium">{r.id}</div>
                  <div className="text-xs text-gray-500">Creado: {fmtDate(r.createdAt)}</div>
                </td>
                <td className="p-3">
                  <div className="font-medium">{r.party.name}</div>
                  <div className="text-xs text-gray-500">
                    {r.party.type} {r.party.doc ? `· ${r.party.doc}` : ""}
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-sm">
                    {fmtDate(r.periodFrom)} – {fmtDate(r.periodTo)}
                  </div>
                </td>
                <td className="p-3">{r.orders}</td>
                <td className="p-3">{money(r.gross, r.currency)}</td>
                <td className="p-3 font-semibold">{money(r.net, r.currency)}</td>
                <td className="p-3">
                  <div className="text-sm capitalize">{r.payoutMethod}</div>
                  <div className="text-xs text-gray-500">{r.payoutRef || "—"}</div>
                </td>
                <td className="p-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs " +
                      (r.status === "pagado"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300"
                        : r.status === "procesando"
                        ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-300"
                        : r.status === "pendiente"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300")
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <RowMenu
                    open={openMenuId === r.id}
                    onOpen={() => setOpenMenuId(r.id)}
                    onClose={() => setOpenMenuId(null)}
                    onAction={(a) => {
                      if (a === "ver") setDetailId(r.id);
                      if (a === "pagar") changeStatus(r.id, "pagado");
                      if (a === "procesar") changeStatus(r.id, "procesando");
                      if (a === "fallar") changeStatus(r.id, "fallido");
                      if (a === "eliminar") setConfirm({ id: r.id, action: "delete" });
                    }}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-8 text-center text-sm text-gray-500" colSpan={9}>
                  Sin resultados con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detalle */}
      <Modal open={!!detail} onClose={() => setDetailId(null)} title={`Detalle de ${detail?.id || ""}`}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-xs text-gray-500">Beneficiario</p>
                <p className="mt-1 text-sm font-medium">{detail.party.name}</p>
                <p className="text-xs text-gray-500 capitalize">{detail.party.type}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-xs text-gray-500">Periodo</p>
                <p className="mt-1 text-sm">
                  {fmtDate(detail.periodFrom)} – {fmtDate(detail.periodTo)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-xs text-gray-500">Órdenes</p>
                <p className="mt-1 text-sm font-semibold">{detail.orders}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-xs text-gray-500">Estado</p>
                <div className="mt-1">
                  <Switch
                    checked={detail.status === "pagado"}
                    onChange={(v) => changeStatus(detail.id, v ? "pagado" : "pendiente")}
                  />
                  <span className="ml-2 text-sm">{detail.status}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 text-sm font-semibold">Resumen</h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <div>
                  <p className="text-xs text-gray-500">Bruto</p>
                  <p className="mt-1 text-sm">{money(detail.gross, detail.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Comisiones</p>
                  <p className="mt-1 text-sm">− {money(detail.fees, detail.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ajustes</p>
                  <p className="mt-1 text-sm">
                    {detail.adjustments >= 0 ? "+" : "−"} {money(Math.abs(detail.adjustments), detail.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Impuestos</p>
                  <p className="mt-1 text-sm">− {money(detail.taxes, detail.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Neto a pagar</p>
                  <p className="mt-1 text-sm font-semibold">{money(detail.net, detail.currency)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 text-sm font-semibold">Pago</h4>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Método</p>
                  <p className="mt-1 text-sm capitalize">{detail.payoutMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Folio/Tx</p>
                  <p className="mt-1 text-sm">{detail.payoutRef || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Creado</p>
                  <p className="mt-1 text-sm">{fmtDate(detail.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Actualizado</p>
                  <p className="mt-1 text-sm">{fmtDate(detail.updatedAt)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => changeStatus(detail.id, "procesando")}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                >
                  Marcar procesando
                </button>
                <button
                  onClick={() => changeStatus(detail.id, "fallido")}
                  className="rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:bg-gray-800 dark:text-rose-300"
                >
                  Marcar fallido
                </button>
                <button
                  onClick={() => changeStatus(detail.id, "pagado")}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Marcar pagado
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Crear */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Nueva liquidación">
        <form onSubmit={createSettlement} className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-sm font-semibold">Beneficiario</h4>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nombre *</label>
              <input
                value={cPartyName}
                onChange={(e) => setCPartyName(e.target.value)}
                placeholder="Ej: Juan Pérez / Restaurante X"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Tipo</label>
              <select
                value={cPartyType}
                onChange={(e) => setCPartyType(e.target.value as PartyType)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="repartidor">Repartidor</option>
                <option value="socio">Socio</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Desde *</label>
                <input
                  type="date"
                  value={cFrom}
                  onChange={(e) => setCFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Hasta *</label>
                <input
                  type="date"
                  value={cTo}
                  onChange={(e) => setCTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-semibold">Cálculos</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Órdenes</label>
                <input
                  inputMode="numeric"
                  value={cOrders}
                  onChange={(e) => setCOrders(Number(e.target.value || 0))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Bruto</label>
                <input
                  inputMode="decimal"
                  value={cGross}
                  onChange={(e) => setCGross(Number(e.target.value || 0))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Comisiones</label>
                <input
                  inputMode="decimal"
                  value={cFees}
                  onChange={(e) => setCFees(Number(e.target.value || 0))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Ajustes</label>
                <input
                  inputMode="decimal"
                  value={cAdj}
                  onChange={(e) => setCAdj(Number(e.target.value || 0))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Impuestos</label>
                <input
                  inputMode="decimal"
                  value={cTaxes}
                  onChange={(e) => setCTaxes(Number(e.target.value || 0))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Moneda</label>
                <select
                  value={cCcy}
                  onChange={(e) => setCCcy(e.target.value as Currency)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="USD">USD</option>
                  <option value="MXN">MXN</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <label className="mb-2 block text-xs text-gray-500">Pago</label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={cMethod}
                  onChange={(e) => setCMethod(e.target.value as PayoutMethod)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="wallet">Billetera</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="paypal">PayPal</option>
                </select>
                <div className="rounded-lg border border-gray-200 p-2 text-sm dark:border-gray-700">
                  Neto estimado:{" "}
                  <b>
                    {money(Math.max(0, Math.round((cGross - cFees + cAdj - cTaxes) * 100) / 100), cCcy)}
                  </b>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenCreate(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Crear liquidación
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirmación eliminar */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Eliminar liquidación"
        maxW="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Esta acción eliminará la liquidación seleccionada. No afectará los pedidos históricos,
            pero no podrás recuperar este registro. ¿Deseas continuar?
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setConfirm(null)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (confirm) remove(confirm.id);
                setConfirm(null);
              }}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
