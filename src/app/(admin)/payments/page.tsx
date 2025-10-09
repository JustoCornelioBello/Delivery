"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ═════════════════ Types ═════════════════ */
type Currency = "USD" | "EUR" | "MXN";
type Channel = "web" | "app" | "telefono";
type Method = "card" | "cash" | "wallet" | "transfer";
type TxType = "charge" | "refund" | "payout" | "adjustment";
type TxStatus = "succeeded" | "pending" | "failed" | "refunded" | "disputed" | "paid_out";

type Transaction = {
  id: string;            // TX-XXXX
  orderId?: string;      // ORD-XXXX (para cargos/reembolsos)
  driverId?: string;     // d1.. (para payouts)
  customer?: { id: string; name: string; email?: string };
  channel: Channel;
  method: Method;
  type: TxType;
  status: TxStatus;

  amount: number;      // importe bruto (+ para charge, - para refund)
  fee: number;         // comisión gateway (>= 0)
  net: number;         // amount - fee (para payout es negativo del egreso)
  currency: Currency;

  cardLast4?: string;  // si method card
  cardBrand?: string;

  createdAt: string;   // ISO
  updatedAt: string;   // ISO
  note?: string;
  reference?: string;  // ref externa
};

/* ═════════════════ Utils ═════════════════ */
const LS_KEY = "payments_mock_v1";
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const nowIso = () => new Date().toISOString();
const money = (n: number, ccy: Currency = "USD") =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: ccy }).format(n);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

const METHOD_LABEL: Record<Method, string> = {
  card: "Tarjeta",
  cash: "Efectivo",
  wallet: "Billetera",
  transfer: "Transferencia",
};
const TYPE_LABEL: Record<TxType, string> = {
  charge: "Cobro",
  refund: "Reembolso",
  payout: "Liquidación",
  adjustment: "Ajuste",
};
const STATUS_META: Record<TxStatus, { label: string; cls: string }> = {
  succeeded: {
    label: "Exitoso",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  pending: {
    label: "Pendiente",
    cls: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300",
  },
  failed: {
    label: "Fallido",
    cls: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300",
  },
  refunded: {
    label: "Reembolsado",
    cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
  },
  disputed: {
    label: "En disputa",
    cls: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
  },
  paid_out: {
    label: "Pagado",
    cls: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
};

const CHIPS = (txt: string) => (
  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 dark:bg-gray-800 dark:text-gray-300">
    {txt}
  </span>
);

const maskCard = (brand?: string, last4?: string) =>
  brand && last4 ? `${brand.toUpperCase()} •••• ${last4}` : "—";

/* ═════════════════ Mock Seed ═════════════════ */
function seed(): Transaction[] {
  const base = (p: Partial<Transaction>): Transaction => ({
    id: `TX-${uid()}`,
    orderId: undefined,
    driverId: undefined,
    customer: undefined,
    channel: "web",
    method: "card",
    type: "charge",
    status: "succeeded",
    amount: 20,
    fee: 1,
    net: 19,
    currency: "USD",
    cardLast4: "4242",
    cardBrand: "visa",
    createdAt: new Date(Date.now() - Math.random() * 10 * 864e5).toISOString(),
    updatedAt: nowIso(),
    note: "",
    reference: `REF-${uid()}`,
    ...p,
  });

  const arr: Transaction[] = [
    base({
      orderId: "ORD-1024",
      customer: { id: "c1", name: "Ana Gómez", email: "ana@example.com" },
      amount: 38.5,
      fee: 1.15,
      net: 37.35,
      channel: "app",
      method: "card",
      cardBrand: "visa",
      cardLast4: "4242",
      status: "succeeded",
    }),
    base({
      orderId: "ORD-1025",
      customer: { id: "c2", name: "Luis Pérez", email: "luis@example.com" },
      amount: 15,
      fee: 0.5,
      net: 14.5,
      channel: "web",
      method: "wallet",
      status: "pending",
    }),
    base({
      orderId: "ORD-1022",
      customer: { id: "c3", name: "Valeria Soto", email: "val@example.com" },
      amount: -15,
      fee: 0,
      net: -15,
      method: "card",
      type: "refund",
      status: "refunded",
      note: "Producto no entregado",
      cardBrand: "mastercard",
      cardLast4: "4444",
    }),
    base({
      driverId: "d2",
      amount: -120.0,
      fee: 0,
      net: -120.0,
      method: "transfer",
      type: "payout",
      status: "paid_out",
      note: "Liquidación semanal repartidor d2",
      cardBrand: undefined,
      cardLast4: undefined,
    }),
    base({
      orderId: "ORD-1019",
      customer: { id: "c4", name: "Pedro Ruiz", email: "pedro@example.com" },
      amount: 22,
      fee: 0.66,
      net: 21.34,
      method: "card",
      status: "disputed",
      cardBrand: "amex",
      cardLast4: "0005",
      note: "Contracargo en investigación",
    }),
    base({
      orderId: "ORD-1007",
      customer: { id: "c5", name: "Lucía Díaz", email: "lucia@example.com" },
      amount: 12,
      fee: 0,
      net: 12,
      method: "cash",
      channel: "telefono",
      status: "succeeded",
      note: "Pagado en efectivo contraentrega",
      cardBrand: undefined,
      cardLast4: undefined,
    }),
    base({
      amount: 5,
      fee: 0,
      net: 5,
      type: "adjustment",
      method: "wallet",
      status: "succeeded",
      note: "Ajuste positivo por cashback",
    }),
  ];

  // más transacciones aleatorias
  for (let i = 0; i < 18; i++) {
    const isRefund = Math.random() < 0.18;
    const isPayout = Math.random() < 0.16;
    const isAdj = Math.random() < 0.08;

    const type: TxType = isPayout ? "payout" : isAdj ? "adjustment" : isRefund ? "refund" : "charge";
    const method: Method = ["card", "wallet", "cash", "transfer"][Math.floor(Math.random() * 4)] as Method;
    const amount =
      type === "refund" ? -clamp(Math.round(Math.random() * 35) + 5, 6, 40) :
      type === "payout" ? -clamp(Math.round(Math.random() * 180) + 20, 40, 220) :
      clamp(Math.round(Math.random() * 40) + 6, 6, 50);

    const fee = type === "charge" && method !== "cash" ? +(amount * 0.03).toFixed(2) : 0;
    const net = +(amount - fee).toFixed(2);

    const status: TxStatus =
      type === "payout" ? "paid_out" :
      type === "refund" ? "refunded" :
      ["succeeded", "pending", "failed", "disputed"][Math.floor(Math.random() * 4)] as TxStatus;

    arr.push(
      base({
        id: `TX-${uid()}`,
        orderId: type === "charge" || type === "refund" ? `ORD-${1000 + i}` : undefined,
        driverId: type === "payout" ? `d${1 + (i % 5)}` : undefined,
        customer:
          type === "charge" || type === "refund"
            ? { id: `c${1 + (i % 10)}`, name: ["Ana","Luis","Carla","Mauro","Sofía","Daniel"][i % 6] }
            : undefined,
        channel: ["web", "app", "telefono"][i % 3] as Channel,
        method,
        type,
        amount,
        fee,
        net,
        status,
        cardBrand: method === "card" ? (["visa","mastercard","amex"][i % 3] as any) : undefined,
        cardLast4: method === "card" ? String(1000 + (i % 9000)).slice(-4) : undefined,
        createdAt: new Date(Date.now() - Math.random() * 25 * 864e5).toISOString(),
        updatedAt: nowIso(),
      })
    );
  }
  // orden por fecha
  return arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/* ═════════════════ Hooks/Helpers UI ═════════════════ */
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

const StatusBadge = ({ s }: { s: TxStatus }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ${STATUS_META[s].cls}`}>
    {STATUS_META[s].label}
  </span>
);

/* ═════════════════ Components ═════════════════ */
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

function RowMenu({
  open,
  onOpen,
  onClose,
  onAction,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAction: (a: "receipt" | "refund" | "dispute" | "mark-paid" | "payout-details" | "delete") => void;
}) {
  const ref = useOutsideClose<HTMLDivElement>(onClose);
  const items = [
    { key: "receipt", label: "Descargar recibo" },
    { key: "refund", label: "Reembolsar", guard: true },
    { key: "dispute", label: "Abrir disputa" },
    { key: "mark-paid", label: "Marcar efectivo recibido" },
    { key: "payout-details", label: "Ver liquidación" },
    { key: "delete", label: "Eliminar", danger: true },
  ] as const;

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

function Kpi({
  title,
  value,
  hint,
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

/* ═════════════════ Form Add Manual Tx ═════════════════ */
function AddTxForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (t: Omit<Transaction, "id" | "updatedAt">) => void;
}) {
  const [type, setType] = useState<TxType>("charge");
  const [status, setStatus] = useState<TxStatus>("succeeded");
  const [method, setMethod] = useState<Method>("cash");
  const [channel, setChannel] = useState<Channel>("web");
  const [amount, setAmount] = useState<number | "">("");
  const [fee, setFee] = useState<number | "">("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [orderId, setOrderId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        const amt = typeof amount === "number" ? amount : 0;
        const f = typeof fee === "number" ? fee : 0;
        const net =
          type === "refund" || type === "payout" ? +(amt - f).toFixed(2) : +(amt - f).toFixed(2);
        onSubmit({
          id: `TX-${uid()}`,
          type,
          status,
          method,
          channel,
          amount: type === "refund" || type === "payout" ? -Math.abs(amt) : Math.abs(amt),
          fee: f,
          net: type === "refund" || type === "payout" ? -Math.abs(net) : Math.abs(net),
          currency,
          orderId: orderId.trim() || undefined,
          driverId: driverId.trim() || undefined,
          customer: name.trim() ? { id: `c-${uid()}`, name: name.trim(), email: email.trim() || undefined } : undefined,
          cardBrand: method === "card" ? "visa" : undefined,
          cardLast4: method === "card" ? "4242" : undefined,
          createdAt: nowIso(),
          note: note.trim() || undefined,
          reference: `MAN-${uid()}`,
        } as Transaction);
      }}
    >
      <div className="md:col-span-3 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TxType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="charge">Cobro</option>
              <option value="refund">Reembolso</option>
              <option value="payout">Liquidación</option>
              <option value="adjustment">Ajuste</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TxStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="succeeded">Exitoso</option>
              <option value="pending">Pendiente</option>
              <option value="failed">Fallido</option>
              <option value="refunded">Reembolsado</option>
              <option value="disputed">En disputa</option>
              <option value="paid_out">Pagado</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Método</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="card">Tarjeta</option>
              <option value="cash">Efectivo</option>
              <option value="wallet">Billetera</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Canal</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="web">Web</option>
              <option value="app">App</option>
              <option value="telefono">Teléfono</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Monto</label>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              placeholder="Ej: 25.50"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Comisión</label>
            <input
              inputMode="decimal"
              value={fee}
              onChange={(e) => setFee(e.target.value ? Number(e.target.value) : "")}
              placeholder="Ej: 0.50"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Moneda</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="MXN">MXN</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Orden</label>
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ORD-1234"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Repartidor</label>
            <input
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              placeholder="d1/d2… (para liquidación)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Nota</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Detalles internos…"
            className="min-h-[80px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="md:col-span-2 space-y-3">
        <h4 className="text-sm font-semibold">Cliente (opcional)</h4>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre cliente"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@cliente.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
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
            Guardar transacción
          </button>
        </div>
      </div>
    </form>
  );
}

/* ═════════════════ Page ═════════════════ */
export default function PaymentsPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TxStatus | "all">("all");
  const [type, setType] = useState<TxType | "all">("all");
  const [method, setMethod] = useState<Method | "all">("all");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [ccy, setCcy] = useState<Currency | "all">("all");
  const [minAmt, setMinAmt] = useState<string>("");
  const [maxAmt, setMaxAmt] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "amount" | "net">("createdAt");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  // UI
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        setTxs(JSON.parse(raw) as Transaction[]);
        return;
      } catch {}
    }
    const seeded = seed();
    setTxs(seeded);
    localStorage.setItem(LS_KEY, JSON.stringify(seeded));
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(txs));
  }, [txs]);

  /* Filtrado + ordenamiento */
  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const min = minAmt ? Number(minAmt) : null;
    const max = maxAmt ? Number(maxAmt) : null;

    const list = txs.filter((t) => {
      const matchesQ =
        !words ||
        (t.orderId || "").toLowerCase().includes(words) ||
        t.id.toLowerCase().includes(words) ||
        (t.customer?.name || "").toLowerCase().includes(words) ||
        (t.reference || "").toLowerCase().includes(words);

      const matchesStatus = status === "all" || t.status === status;
      const matchesType = type === "all" || t.type === type;
      const matchesMethod = method === "all" || t.method === method;
      const matchesChannel = channel === "all" || t.channel === channel;
      const matchesCcy = ccy === "all" || t.currency === ccy;

      const inAmount = (min === null || t.amount >= min) && (max === null || t.amount <= max);
      const created = new Date(t.createdAt);
      const inRange = (!from || created >= (from as Date)) && (!to || created <= (to as Date));

      return (
        matchesQ &&
        matchesStatus &&
        matchesType &&
        matchesMethod &&
        matchesChannel &&
        matchesCcy &&
        inAmount &&
        inRange
      );
    });

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "createdAt") return dir * (+new Date(a.createdAt) - +new Date(b.createdAt));
      if (sortBy === "amount") return dir * (a.amount - b.amount);
      if (sortBy === "net") return dir * (a.net - b.net);
      return 0;
    });

    return list;
  }, [txs, q, status, type, method, channel, ccy, minAmt, maxAmt, dateFrom, dateTo, sortBy, sortDir]);

  const totals = useMemo(() => {
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const grossIn = sum(filtered.filter((t) => t.type === "charge").map((t) => t.amount));
    const refunds = -sum(filtered.filter((t) => t.type === "refund").map((t) => t.amount)); // positivo
    const fees = sum(filtered.map((t) => t.fee));
    const payouts = -sum(filtered.filter((t) => t.type === "payout").map((t) => t.amount)); // positivo
    const net = sum(filtered.map((t) => t.net));
    const succeeded = filtered.filter((t) => t.status === "succeeded").length;
    const failed = filtered.filter((t) => t.status === "failed").length;
    const successRate = filtered.length ? (succeeded / filtered.length) * 100 : 0;
    return { grossIn, refunds, fees, payouts, net, successRate: +successRate.toFixed(1), failed };
  }, [filtered]);

  /* Actions */
  const exportCSV = () => {
    const rows = [
      [
        "id",
        "orderId",
        "driverId",
        "type",
        "status",
        "method",
        "channel",
        "amount",
        "fee",
        "net",
        "currency",
        "card",
        "customer",
        "reference",
        "createdAt",
      ],
      ...filtered.map((t) => [
        t.id,
        t.orderId ?? "",
        t.driverId ?? "",
        t.type,
        t.status,
        t.method,
        t.channel,
        t.amount,
        t.fee,
        t.net,
        t.currency,
        maskCard(t.cardBrand, t.cardLast4),
        t.customer?.name ?? "",
        t.reference ?? "",
        t.createdAt,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addManualTx = (t: Omit<Transaction, "id" | "updatedAt">) => {
    const tx: Transaction = { ...t, id: t.id || `TX-${uid()}`, updatedAt: nowIso() };
    setTxs((prev) => [tx, ...prev]);
    setOpenAdd(false);
  };

  const openReceipt = (t: Transaction) => {
    const lines = [
      "RECIBO DE PAGO",
      `Transacción: ${t.id}`,
      `Fecha: ${new Date(t.createdAt).toLocaleString()}`,
      t.orderId ? `Orden: ${t.orderId}` : "",
      `Tipo: ${TYPE_LABEL[t.type]} · Estado: ${STATUS_META[t.status].label}`,
      `Método: ${METHOD_LABEL[t.method]} ${maskCard(t.cardBrand, t.cardLast4)}`,
      `Importe: ${money(t.amount, t.currency)}`,
      `Comisión: ${money(t.fee, t.currency)}`,
      `Neto: ${money(t.net, t.currency)}`,
      t.customer ? `Cliente: ${t.customer.name}${t.customer.email ? ` <${t.customer.email}>` : ""}` : "",
      t.reference ? `Referencia: ${t.reference}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${t.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const requestRefund = (id: string) => {
    setTxs((prev) =>
      prev.map((t) =>
        t.id === id && t.type === "charge" && t.status === "succeeded"
          ? {
              ...t,
              status: "refunded",
              updatedAt: nowIso(),
            }
          : t
      )
    );
  };

  const markCashPaid = (id: string) => {
    setTxs((prev) =>
      prev.map((t) =>
        t.id === id && t.method === "cash"
          ? {
              ...t,
              status: "succeeded",
              updatedAt: nowIso(),
              reference: `CASH-${uid()}`,
            }
          : t
      )
    );
  };

  const deleteTx = (id: string) => setTxs((prev) => prev.filter((t) => t.id !== id));

  /* Detail */
  const detail = useMemo(() => (detailId ? txs.find((t) => t.id === detailId) : null), [detailId, txs]);

  /* Render */
  return (
    <section className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Transacciones</h1>
          <p className="text-sm text-gray-500">
            Revisa cobros, reembolsos y liquidaciones. Exporta, filtra y audita movimientos sensibles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOpenAdd(true)}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Agregar transacción
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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <Kpi title="Ingresos brutos (cobros)" value={money(totals.grossIn)} />
        <Kpi title="Reembolsos" value={`-${money(totals.refunds)}`} />
        <Kpi title="Comisiones" value={`-${money(totals.fees)}`} />
        <Kpi title="Liquidado a repartidores" value={`-${money(totals.payouts)}`} />
        <Kpi title="Neto total" value={money(totals.net)} />
        <Kpi title="Tasa de éxito" value={`${totals.successRate}%`} hint={`${totals.failed} fallidos`} />
      </div>

      {/* Filtros avanzados */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-12">
          <div className="col-span-3">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="TX, ORD, cliente, referencia…"
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
                  {STATUS_META[k as TxStatus].label}
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
              <option value="charge">Cobro</option>
              <option value="refund">Reembolso</option>
              <option value="payout">Liquidación</option>
              <option value="adjustment">Ajuste</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Método</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="card">Tarjeta</option>
              <option value="cash">Efectivo</option>
              <option value="wallet">Billetera</option>
              <option value="transfer">Transferencia</option>
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
              <option value="web">Web</option>
              <option value="app">App</option>
              <option value="telefono">Teléfono</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Moneda</label>
            <select
              value={ccy}
              onChange={(e) => setCcy(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todas</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="MXN">MXN</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Mín</label>
              <input
                inputMode="decimal"
                value={minAmt}
                onChange={(e) => setMinAmt(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Máx</label>
              <input
                inputMode="decimal"
                value={maxAmt}
                onChange={(e) => setMaxAmt(e.target.value)}
                placeholder="999.99"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
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
              <option value="createdAt">Fecha</option>
              <option value="amount">Importe</option>
              <option value="net">Neto</option>
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

        {/* Acciones selección */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Seleccionados: {selected.length}</span>
          <div className="flex gap-2">
            <button
              onClick={() => selected.forEach((id) => openReceipt(txs.find((t) => t.id === id)!))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              Recibos
            </button>
            <button
              onClick={() => {
                selected.forEach((id) => requestRefund(id));
                setSelected([]);
              }}
              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-gray-800 dark:text-amber-300"
            >
              Reembolsar
            </button>
            <button
              onClick={() => {
                selected.forEach((id) => markCashPaid(id));
                setSelected([]);
              }}
              className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-gray-800 dark:text-emerald-300"
            >
              Marcar efectivo
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
                <input
                  type="checkbox"
                  onChange={(e) => setSelected(e.target.checked ? filtered.map((t) => t.id) : [])}
                  checked={selected.length > 0 && selected.length === filtered.length}
                  aria-label="Seleccionar todos"
                />
              </th>
              <th className="p-3">Transacción</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Método</th>
              <th className="p-3">Importe</th>
              <th className="p-3">Comisión</th>
              <th className="p-3">Neto</th>
              <th className="p-3">Fecha</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((t) => (
              <tr key={t.id} className="align-top">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(t.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id]
                      )
                    }
                  />
                </td>
                <td className="p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailId(t.id)}
                        className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
                        title="Ver detalle"
                      >
                        {t.id}
                      </button>
                      {t.orderId && CHIPS(t.orderId)}
                      {t.channel && CHIPS(t.channel)}
                      {t.currency && CHIPS(t.currency)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t.customer ? `${t.customer.name}` : t.driverId ? `Repartidor ${t.driverId}` : "—"} ·{" "}
                      {t.reference || "sin ref."}
                    </div>
                  </div>
                </td>
                <td className="p-3">{TYPE_LABEL[t.type]}</td>
                <td className="p-3">
                  <StatusBadge s={t.status} />
                </td>
                <td className="p-3">
                  <div className="text-xs">
                    {METHOD_LABEL[t.method]}
                    {t.method === "card" ? ` · ${maskCard(t.cardBrand, t.cardLast4)}` : ""}
                  </div>
                </td>
                <td className="p-3 font-medium">{money(t.amount, t.currency)}</td>
                <td className="p-3">{t.fee ? money(t.fee, t.currency) : "—"}</td>
                <td className={`p-3 font-semibold ${t.net < 0 ? "text-rose-600 dark:text-rose-400" : ""}`}>
                  {money(t.net, t.currency)}
                </td>
                <td className="p-3 text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <RowMenu
                    open={openMenuId === t.id}
                    onOpen={() => setOpenMenuId(t.id)}
                    onClose={() => setOpenMenuId(null)}
                    onAction={(a) => {
                      if (a === "receipt") openReceipt(t);
                      if (a === "refund") requestRefund(t.id);
                      if (a === "mark-paid") markCashPaid(t.id);
                      if (a === "delete") deleteTx(t.id);
                      if (a === "payout-details") setDetailId(t.id);
                      if (a === "dispute") alert("Disputa iniciada (simulado).");
                    }}
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

      {/* Detalle lateral */}
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
              <h3 className="text-lg font-semibold">Detalle {detail.id}</h3>
              <button
                onClick={() => setDetailId(null)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-2">
                  {CHIPS(TYPE_LABEL[detail.type])}
                  <StatusBadge s={detail.status} />
                  {CHIPS(METHOD_LABEL[detail.method])}
                  {detail.channel && CHIPS(detail.channel)}
                  {detail.currency && CHIPS(detail.currency)}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Importe</div>
                    <div className="font-semibold">{money(detail.amount, detail.currency)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Comisión</div>
                    <div className="font-semibold">{money(detail.fee, detail.currency)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Neto</div>
                    <div className={`font-semibold ${detail.net < 0 ? "text-rose-600 dark:text-rose-400" : ""}`}>
                      {money(detail.net, detail.currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Fecha</div>
                    <div className="font-semibold">{new Date(detail.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                {detail.method === "card" && (
                  <p className="mt-2 text-xs text-gray-500">Tarjeta: {maskCard(detail.cardBrand, detail.cardLast4)}</p>
                )}
                {detail.orderId && <p className="mt-1 text-xs text-gray-500">Orden: {detail.orderId}</p>}
                {detail.driverId && <p className="mt-1 text-xs text-gray-500">Repartidor: {detail.driverId}</p>}
                {detail.customer && (
                  <p className="mt-1 text-xs text-gray-500">
                    Cliente: {detail.customer.name} {detail.customer.email ? `· ${detail.customer.email}` : ""}
                  </p>
                )}
                {detail.reference && <p className="mt-1 text-xs text-gray-500">Referencia: {detail.reference}</p>}
                {detail.note && <p className="mt-1 text-xs text-gray-500">Nota: {detail.note}</p>}
              </div>

              {/* Acciones rápidas */}
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <h4 className="mb-2 text-sm font-semibold">Acciones</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openReceipt(detail)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    Descargar recibo
                  </button>
                  {detail.type === "charge" && detail.status === "succeeded" && (
                    <button
                      onClick={() => requestRefund(detail.id)}
                      className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-gray-800 dark:text-amber-300"
                    >
                      Reembolsar
                    </button>
                  )}
                  {detail.method === "cash" && detail.status !== "succeeded" && (
                    <button
                      onClick={() => markCashPaid(detail.id)}
                      className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-gray-800 dark:text-emerald-300"
                    >
                      Marcar efectivo recibido
                    </button>
                  )}
                  <button
                    onClick={() => alert("Disputa abierta (simulado).")}
                    className="rounded-lg border border-purple-300 bg-white px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:bg-gray-800 dark:text-purple-300"
                  >
                    Abrir disputa
                  </button>
                  <button
                    onClick={() => {
                      deleteTx(detail.id);
                      setDetailId(null);
                    }}
                    className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-gray-800 dark:text-rose-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Auditoría (simulada) */}
              <div className="rounded-xl border border-gray-200 p-3 text-xs dark:border-gray-700">
                <h4 className="mb-2 text-sm font-semibold">Auditoría</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Creado: {new Date(detail.createdAt).toLocaleString()}</li>
                  <li>• Actualizado: {new Date(detail.updatedAt).toLocaleString()}</li>
                  <li>• IP/Gateway: sandbox-gw-01 (simulado)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar transacción */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Agregar transacción manual">
        <AddTxForm
          onCancel={() => setOpenAdd(false)}
          onSubmit={(t) => addManualTx(t)}
        />
      </Modal>
    </section>
  );
}
