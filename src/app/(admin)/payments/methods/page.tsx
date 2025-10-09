"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ───────────────────────────── Types ───────────────────────────── */
type Currency = "USD" | "EUR" | "MXN";
type Provider = "stripe" | "paypal" | "mercadopago" | "square" | "adyen" | "transfer" | "cash" | "wallet";
type MethodKind = "online" | "offline";

type PaymentMethod = {
  id: string;
  name: string;
  provider: Provider;
  kind: MethodKind;
  enabled: boolean;
  isDefault?: boolean;
  currencies: Currency[];
  feePercent: number;
  feeFixed: number;
  minAmount?: number;
  maxAmount?: number;
  testMode?: boolean;
  settlementDelayDays?: number;
  webhookUrl?: string;
  webhookSecret?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/* ───────────────────────────── Utils ───────────────────────────── */
const LS_KEY = "payment_methods_v2";
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const nowIso = () => new Date().toISOString();
const money = (n: number, ccy: Currency = "USD") =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: ccy }).format(n);
const pct = (n: number) => `${n.toFixed(2)}%`;

const CCY_OPTS: Currency[] = ["USD", "EUR", "MXN"];

const PROVIDER_META: Record<
  Provider,
  { label: string; color: string; description: string; kind: MethodKind; markets: string[] }
> = {
  stripe: { label: "Stripe", color: "#635bff", description: "Tarjetas y wallets globales.", kind: "online", markets: ["Global"] },
  paypal: { label: "PayPal", color: "#1e477a", description: "Cartera y pay-by-email.", kind: "online", markets: ["Global"] },
  mercadopago: { label: "Mercado Pago", color: "#00a8e0", description: "Pagos en LATAM.", kind: "online", markets: ["LatAm"] },
  square: { label: "Square", color: "#1a1a1a", description: "POS y online.", kind: "online", markets: ["US", "CA", "JP", "AU"] },
  adyen: { label: "Adyen", color: "#0abf53", description: "Enterprise y métodos locales.", kind: "online", markets: ["Global"] },
  transfer: { label: "Transferencia", color: "#0ea5e9", description: "Depósito/transferencia manual.", kind: "offline", markets: ["Local"] },
  cash: { label: "Efectivo", color: "#f59e0b", description: "Pago contra entrega.", kind: "offline", markets: ["Local"] },
  wallet: { label: "Billetera", color: "#8b5cf6", description: "Saldo prepagado del cliente.", kind: "online", markets: ["App"] },
};

function seed(): PaymentMethod[] {
  const base = (p: Partial<PaymentMethod>): PaymentMethod => ({
    id: `PM-${uid()}`,
    name: "Método",
    provider: "stripe",
    kind: "online",
    enabled: true,
    isDefault: false,
    currencies: ["USD"],
    feePercent: 3.49,
    feeFixed: 0.3,
    testMode: true,
    settlementDelayDays: 2,
    notes: "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...p,
  });
  return [
    base({
      name: "Tarjeta (Stripe)",
      provider: "stripe",
      isDefault: true,
      feePercent: 3.2,
      feeFixed: 0.35,
      currencies: ["USD", "EUR"],
      webhookUrl: "https://tuapp.com/api/webhooks/stripe",
      webhookSecret: "whsec_**********",
      notes: "3D Secure activo.",
    }),
    base({
      name: "PayPal",
      provider: "paypal",
      feePercent: 3.8,
      feeFixed: 0.49,
      currencies: ["USD", "EUR", "MXN"],
      testMode: false,
    }),
    base({
      name: "Mercado Pago",
      provider: "mercadopago",
      feePercent: 4.2,
      feeFixed: 0.0,
      currencies: ["MXN"],
      notes: "Cuotas habilitadas.",
    }),
    base({
      name: "Efectivo (contra entrega)",
      provider: "cash",
      kind: "offline",
      feePercent: 0,
      feeFixed: 0,
      currencies: ["USD", "MXN"],
      settlementDelayDays: 0,
      notes: "Recordatorio: solicitar cambio.",
    }),
    base({
      name: "Transferencia bancaria",
      provider: "transfer",
      kind: "offline",
      feePercent: 0,
      feeFixed: 0,
      currencies: ["USD"],
      notes: "Validación manual del comprobante.",
    }),
    base({
      name: "Billetera del cliente",
      provider: "wallet",
      feePercent: 0,
      feeFixed: 0,
      currencies: ["USD"],
      notes: "Top-ups vía gateway online.",
    }),
  ];
}

/* ───────────────────────────── UI helpers ───────────────────────────── */
const Pill = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`rounded-full px-2 py-0.5 text-[10px] ${className}`}>{children}</span>
);

const Switch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
    aria-pressed={checked}
  >
    <span className={`h-5 w-5 transform rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-1"}`} />
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
  onAction: (a: "edit" | "make-default" | "copy-webhook" | "view-keys" | "delete") => void;
}) {
  const ref = useOutsideClose<HTMLDivElement>(onClose);
  const items = [
    { key: "edit", label: "Editar" },
    { key: "make-default", label: "Marcar como predeterminado" },
    { key: "copy-webhook", label: "Copiar webhook" },
    { key: "view-keys", label: "Ver credenciales" },
    { key: "delete", label: "Eliminar", danger: true },
  ] as const;

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={open ? onClose : onOpen}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        title="Más acciones"
        aria-haspopup="menu"
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

/* ───────────────────────────── Add/Edit form ───────────────────────────── */
function MethodForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: PaymentMethod | null;
  onCancel: () => void;
  onSubmit: (m: PaymentMethod) => void;
}) {
  const isEditing = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [provider, setProvider] = useState<Provider>(initial?.provider ?? "stripe");
  const [enabled, setEnabled] = useState<boolean>(initial?.enabled ?? true);
  const [isDefault, setIsDefault] = useState<boolean>(initial?.isDefault ?? false);
  const [currencies, setCurrencies] = useState<Currency[]>(initial?.currencies ?? ["USD"]);
  const [feePercent, setFeePercent] = useState<number>(initial?.feePercent ?? 0);
  const [feeFixed, setFeeFixed] = useState<number>(initial?.feeFixed ?? 0);
  const [minAmount, setMinAmount] = useState<number | undefined>(initial?.minAmount);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(initial?.maxAmount);
  const [testMode, setTestMode] = useState<boolean>(initial?.testMode ?? true);
  const [settlementDelayDays, setSettlementDelayDays] = useState<number>(initial?.settlementDelayDays ?? 0);
  const [webhookUrl, setWebhookUrl] = useState(initial?.webhookUrl ?? "");
  const [webhookSecret, setWebhookSecret] = useState(initial?.webhookSecret ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const meta = PROVIDER_META[provider];
  const toggleCurrency = (c: Currency) =>
    setCurrencies((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <form
      className="grid grid-cols-1 gap-4 md:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return alert("Ingresa un nombre para el método.");
        const base: PaymentMethod = {
          id: initial?.id || `PM-${uid()}`,
          name: name.trim(),
          provider,
          kind: meta.kind,
          enabled,
          isDefault,
          currencies: currencies.length ? currencies : ["USD"],
          feePercent: Number(feePercent) || 0,
          feeFixed: Number(feeFixed) || 0,
          minAmount: minAmount || undefined,
          maxAmount: maxAmount || undefined,
          testMode,
          settlementDelayDays: Number(settlementDelayDays) || 0,
          webhookUrl: webhookUrl.trim() || undefined,
          webhookSecret: webhookSecret.trim() || undefined,
          notes: notes.trim() || undefined,
          createdAt: initial?.createdAt ?? nowIso(),
          updatedAt: nowIso(),
        };
        onSubmit(base);
      }}
    >
      <div className="md:col-span-2 space-y-3">
        <h4 className="text-sm font-semibold">Configuración básica</h4>

        <div>
          <label className="mb-1 block text-xs text-gray-500">Nombre visible *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Tarjeta (Stripe)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Proveedor</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {Object.keys(PROVIDER_META).map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_META[p as Provider].label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500">{meta.description}</p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Estado</label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
              <Switch checked={enabled} onChange={setEnabled} />
              <span className="text-sm">{enabled ? "Habilitado" : "Deshabilitado"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <label className="mb-2 block text-xs text-gray-500">Monedas</label>
          <div className="flex flex-wrap gap-2">
            {CCY_OPTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCurrency(c)}
                className={`rounded-lg border px-3 py-1 text-sm ${
                  currencies.includes(c)
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <label className="mb-2 block text-xs text-gray-500">Límites (opcionales)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              inputMode="decimal"
              placeholder="Mínimo"
              value={minAmount ?? ""}
              onChange={(e) => setMinAmount(Number(e.target.value || 0))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              inputMode="decimal"
              placeholder="Máximo"
              value={maxAmount ?? ""}
              onChange={(e) => setMaxAmount(Number(e.target.value || 0))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <label className="mb-2 block text-xs text-gray-500">Notas internas</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: activar 3DS, pedir comprobante para transferencia, etc."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="md:col-span-3 space-y-3">
        <h4 className="text-sm font-semibold">Costos y liquidación</h4>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">% Comisión</label>
            <input
              inputMode="decimal"
              value={feePercent}
              onChange={(e) => setFeePercent(Number(e.target.value || 0))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Tarifa fija</label>
            <input
              inputMode="decimal"
              value={feeFixed}
              onChange={(e) => setFeeFixed(Number(e.target.value || 0))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Liquidación (días)</label>
            <input
              inputMode="numeric"
              value={settlementDelayDays}
              onChange={(e) => setSettlementDelayDays(Number(e.target.value || 0))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        {meta.kind === "online" && (
          <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
            <label className="mb-2 block text-xs text-gray-500">Modo de pruebas & Webhooks</label>
            <div className="mb-3 flex items-center gap-3">
              <Switch checked={testMode ?? false} onChange={setTestMode} />
              <span className="text-sm">{testMode ? "Test/Sandbox" : "Producción"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="URL de webhook"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <input
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Secreto de webhook"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <label className="mb-2 block text-xs text-gray-500">Predeterminado</label>
          <div className="flex items-center gap-3">
            <Switch checked={isDefault ?? false} onChange={setIsDefault} />
            <span className="text-sm">Usar por defecto en checkout</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Cancelar
          </button>
          <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            {isEditing ? "Guardar cambios" : "Crear método"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ───────────────────────────── Quick Checkout (mock) ───────────────────────────── */
function luhnValid(num: string) {
  const s = num.replace(/\D/g, "");
  let sum = 0;
  let dbl = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = parseInt(s[i], 10);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0 && s.length >= 12;
}

function detectBrand(num: string): "visa" | "mastercard" | "amex" | "other" {
  const n = num.replace(/\s+/g, "");
  if (/^4\d{12,18}$/.test(n)) return "visa";
  if (/^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/.test(n)) return "mastercard";
  if (/^3[47]\d{13}$/.test(n)) return "amex";
  return "other";
}

function CardBrandBadge({ num }: { num: string }) {
  const brand = detectBrand(num);
  const map: Record<string, { label: string; bg: string }> = {
    visa: { label: "VISA", bg: "bg-blue-600" },
    mastercard: { label: "Mastercard", bg: "bg-orange-500" },
    amex: { label: "AmEx", bg: "bg-cyan-600" },
    other: { label: "Card", bg: "bg-gray-500" },
  };
  const meta = map[brand];
  return <span className={`rounded px-2 py-0.5 text-xs font-medium text-white ${meta.bg}`}>{meta.label}</span>;
}

/* ───────────────────────────── Page ───────────────────────────── */
export default function PaymentMethodsPage() {
  const [rows, setRows] = useState<PaymentMethod[]>([]);
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState<Provider | "all">("all");
  const [kind, setKind] = useState<MethodKind | "all">("all");
  const [ccy, setCcy] = useState<Currency | "all">("all");
  const [onlyEnabled, setOnlyEnabled] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: "delete" | "disable" } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Quick Charge
  const [qcOpen, setQcOpen] = useState(false);
  const [qcAmount, setQcAmount] = useState(24.9);
  const [qcCurrency, setQcCurrency] = useState<Currency>("USD");
  const [qcCard, setQcCard] = useState("");
  const [qcExp, setQcExp] = useState("");
  const [qcCvv, setQcCvv] = useState("");
  const [qcRemember, setQcRemember] = useState(true);

  // seed
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        setRows(JSON.parse(raw));
        return;
      } catch {}
    }
    const seeded = seed();
    setRows(seeded);
    localStorage.setItem(LS_KEY, JSON.stringify(seeded));
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  }, [rows]);

  const editing = useMemo(() => rows.find((r) => r.id === editId) ?? null, [editId, rows]);

  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase();
    return rows.filter((m) => {
      const mQ =
        !words ||
        m.name.toLowerCase().includes(words) ||
        m.id.toLowerCase().includes(words) ||
        PROVIDER_META[m.provider].label.toLowerCase().includes(words) ||
        (m.notes || "").toLowerCase().includes(words);
      const mP = provider === "all" || m.provider === provider;
      const mK = kind === "all" || m.kind === kind;
      const mC = ccy === "all" || m.currencies.includes(ccy);
      const mE = !onlyEnabled || m.enabled;
      return mQ && mP && mK && mC && mE;
    });
  }, [rows, q, provider, kind, ccy, onlyEnabled]);

  const totals = useMemo(() => {
    return {
      total: rows.length,
      enabled: rows.filter((x) => x.enabled).length,
      online: rows.filter((x) => x.kind === "online").length,
      offline: rows.filter((x) => x.kind === "offline").length,
      defaultName: rows.find((x) => x.isDefault)?.name || "—",
    };
  }, [rows]);

  const setDefault = (id: string) => setRows((prev) => prev.map((x) => ({ ...x, isDefault: x.id === id })));
  const toggleEnabled = (id: string, v: boolean) =>
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: v, updatedAt: nowIso() } : x)));
  const remove = (id: string) => setRows((prev) => prev.filter((x) => x.id !== id));
  const copyToClipboard = (text?: string) => {
    if (!text) return alert("No hay webhook para copiar.");
    navigator.clipboard.writeText(text).then(() => alert("Copiado al portapapeles."));
  };

  /* ────────── Provider gallery (conectar rápido) ────────── */
  const providersGallery: Provider[] = ["stripe", "paypal", "mercadopago", "square", "adyen", "transfer", "cash", "wallet"];
  const connectProvider = (p: Provider) => {
    // Mock: agrega un método básico si no existe
    const exists = rows.some((r) => r.provider === p);
    if (exists) return alert("Este proveedor ya está configurado.");
    const meta = PROVIDER_META[p];
    const it: PaymentMethod = {
      id: `PM-${uid()}`,
      name: p === "transfer" ? "Transferencia bancaria" : meta.label,
      provider: p,
      kind: meta.kind,
      enabled: true,
      isDefault: false,
      currencies: ["USD"],
      feePercent: p === "cash" || p === "transfer" || p === "wallet" ? 0 : 3.5,
      feeFixed: p === "cash" || p === "transfer" || p === "wallet" ? 0 : 0.35,
      testMode: p !== "cash" && p !== "transfer",
      settlementDelayDays: p === "cash" || p === "transfer" ? 0 : 2,
      notes: `Conectado rápido (${meta.label}).`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setRows((prev) => [it, ...prev]);
  };

  /* ────────── Quick checkout submit (mock) ────────── */
  const submitQuickCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (qcAmount <= 0) return alert("Monto inválido.");
    const n = qcCard.replace(/\s/g, "");
    if (!luhnValid(n)) return alert("Tarjeta inválida (Luhn).");
    if (!/^\d{2}\/\d{2}$/.test(qcExp)) return alert("Fecha inválida. Usa MM/AA.");
    if (!/^\d{3,4}$/.test(qcCvv)) return alert("CVV inválido.");
    const def = rows.find((r) => r.isDefault && r.enabled && r.kind === "online");
    if (!def) return alert("Configura un método online predeterminado y habilitado.");
    alert(
      `Cobro simulado: ${money(qcAmount, qcCurrency)} con ${def.name}.
• Tarjeta: **** **** **** ${qcCard.slice(-4)}
• Resultado: Aprobado (demo)
${qcRemember ? "• Tarjeta recordada para este cliente (mock)" : ""}`
    );
    setQcOpen(false);
    setQcCard("");
    setQcExp("");
    setQcCvv("");
  };

  return (
    <section className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Métodos de pago</h1>
          <p className="text-sm text-gray-500">Pasarelas, comisiones, monedas y un checkout rápido para probar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditId(null);
              setOpenCreate(true);
            }}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Nuevo método
          </button>
          <button
            onClick={() => setQcOpen(true)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Cobro rápido
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Total</p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{totals.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Habilitados</p>
          <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-300">{totals.enabled}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Online</p>
          <p className="mt-1 text-xl font-semibold">{totals.online}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Offline</p>
          <p className="mt-1 text-xl font-semibold">{totals.offline}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Predeterminado</p>
          <p className="mt-1 truncate text-sm text-gray-900 dark:text-white">{totals.defaultName}</p>
        </div>
      </div>

      {/* Pasarelas disponibles (gallery) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className="text-sm font-semibold">Pasarelas disponibles</h3>
            <p className="text-xs text-gray-500">Conecta en 1 clic o edita una existente.</p>
          </div>
          <div className="text-xs text-gray-500">Sugerencia: Stripe o Mercado Pago según tu país.</div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {providersGallery.map((p) => {
            const m = PROVIDER_META[p];
            const connected = rows.some((r) => r.provider === p);
            return (
              <div
                key={p}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded" style={{ backgroundColor: m.color }} />
                  <div>
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-[11px] text-gray-500">{m.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  {connected ? (
                    <span className="text-xs text-emerald-600">Conectado</span>
                  ) : (
                    <button
                      onClick={() => connectProvider(p)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    >
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
              placeholder="Nombre, proveedor, ID o notas…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Proveedor</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider | "all")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              {Object.keys(PROVIDER_META).map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_META[p as Provider].label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Tipo</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as MethodKind | "all")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
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
              {CCY_OPTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex items-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={onlyEnabled} onChange={(e) => setOnlyEnabled(e.target.checked)} />
              Solo habilitados
            </label>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800">
            <tr>
              <th className="p-3">Método</th>
              <th className="p-3">Proveedor</th>
              <th className="p-3">Comisiones</th>
              <th className="p-3">Monedas</th>
              <th className="p-3">Liquidación</th>
              <th className="p-3">Webhook</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((m) => {
              const meta = PROVIDER_META[m.provider];
              return (
                <tr key={m.id}>
                  <td className="p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded" style={{ backgroundColor: meta.color }} />
                        <span className="font-medium">{m.name}</span>
                        {m.isDefault && (
                          <Pill className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">
                            Predeterminado
                          </Pill>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{m.id}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{meta.label}</div>
                    <div className="text-xs text-gray-500 capitalize">{m.kind}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {pct(m.feePercent)} + {money(m.feeFixed, (m.currencies[0] ?? "USD") as Currency)}
                    </div>
                    {(m.minAmount || m.maxAmount) && (
                      <div className="text-xs text-gray-500">
                        {m.minAmount ? `Mín ${money(m.minAmount as number, m.currencies[0] as Currency)}` : ""}
                        {m.minAmount && m.maxAmount ? " · " : ""}
                        {m.maxAmount ? `Máx ${money(m.maxAmount as number, m.currencies[0] as Currency)}` : ""}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {m.currencies.map((c) => (
                        <Pill key={c} className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {c}
                        </Pill>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{m.settlementDelayDays ?? 0} día(s)</div>
                    {m.testMode && <div className="text-xs text-amber-600">Sandbox</div>}
                  </td>
                  <td className="p-3">
                    {m.webhookUrl ? (
                      <button
                        className="text-xs text-brand-600 underline underline-offset-2 hover:opacity-80 dark:text-brand-400"
                        onClick={() => copyToClipboard(m.webhookUrl)}
                        title="Copiar URL de webhook"
                      >
                        Copiar URL
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={m.enabled}
                        onChange={(v) => (v ? toggleEnabled(m.id, true) : setConfirm({ id: m.id, action: "disable" }))}
                      />
                      <span className="text-sm">{m.enabled ? "Habilitado" : "Deshabilitado"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <RowMenu
                      open={openMenuId === m.id}
                      onOpen={() => setOpenMenuId(m.id)}
                      onClose={() => setOpenMenuId(null)}
                      onAction={(a) => {
                        if (a === "edit") {
                          setEditId(m.id);
                          setOpenCreate(true);
                        }
                        if (a === "make-default") setDefault(m.id);
                        if (a === "copy-webhook") copyToClipboard(m.webhookUrl);
                        if (a === "view-keys") alert("Mock: mostrar credenciales seguras del proveedor.");
                        if (a === "delete") setConfirm({ id: m.id, action: "delete" });
                      }}
                    />
                  </td>
                </tr>
              );
            })}
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

      {/* Modal crear/editar */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title={editing ? "Editar método de pago" : "Nuevo método de pago"}>
        <MethodForm
          initial={editing}
          onCancel={() => setOpenCreate(false)}
          onSubmit={(m) => {
            setRows((prev) => {
              let next = [...prev];
              if (m.isDefault) next = next.map((x) => ({ ...x, isDefault: x.id === m.id }));
              const idx = next.findIndex((x) => x.id === m.id);
              if (idx >= 0) next[idx] = m;
              else next.unshift(m);
              return next;
            });
            setOpenCreate(false);
            setEditId(null);
          }}
        />
      </Modal>

      {/* Modal confirmación */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.action === "delete" ? "Eliminar método" : "Deshabilitar método"}
        maxW="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {confirm?.action === "delete"
              ? "Esta acción eliminará el método permanentemente. Las órdenes en curso no podrán usarlo."
              : "El método quedará no disponible para nuevas órdenes. ¿Deseas continuar?"}
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
                if (!confirm) return;
                if (confirm.action === "delete") remove(confirm.id);
                if (confirm.action === "disable") toggleEnabled(confirm.id, false);
                setConfirm(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                confirm?.action === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Checkout rápido (intuitivo, mínimo) */}
      <Modal open={qcOpen} onClose={() => setQcOpen(false)} title="Cobro rápido (demo)">
        <form onSubmit={submitQuickCharge} className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-sm font-semibold">Importe</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                inputMode="decimal"
                value={qcAmount}
                onChange={(e) => setQcAmount(Number(e.target.value || 0))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <select
                value={qcCurrency}
                onChange={(e) => setQcCurrency(e.target.value as Currency)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {CCY_OPTS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <p className="mb-1 text-xs text-gray-500">Se cobrará con el método <b>predeterminado</b> habilitado.</p>
              <p className="text-xs text-gray-500">Este flujo es de demostración (no real).</p>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-semibold">Tarjeta</h4>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Número</label>
              <div className="flex items-center gap-2">
                <input
                  value={qcCard}
                  onChange={(e) => setQcCard(e.target.value.replace(/[^\d\s]/g, ""))}
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm tracking-widest dark:border-gray-700 dark:bg-gray-800"
                />
                <CardBrandBadge num={qcCard} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Vencimiento</label>
                <input
                  value={qcExp}
                  onChange={(e) => setQcExp(e.target.value.replace(/[^\d/]/g, "").slice(0, 5))}
                  placeholder="MM/AA"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">CVV</label>
                <input
                  value={qcCvv}
                  onChange={(e) => setQcCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={qcRemember} onChange={(e) => setQcRemember(e.target.checked)} />
                  Recordar
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setQcOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Cobrar {money(qcAmount, qcCurrency)}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </section>
  );
}
