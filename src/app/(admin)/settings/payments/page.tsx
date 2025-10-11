"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================================================
   Tipos
=========================================================================== */
type GatewayKey = "stripe" | "paypal";
type Currency = "DOP" | "USD" | "EUR";
type PayoutFrequency = "daily" | "weekly" | "biweekly" | "monthly";

type GatewayConfig = {
  enabled: boolean;
  testMode: boolean;
  publishableKey?: string;
  secretKey?: string;
  accountId?: string;
};

type PaymentMethods = {
  card: boolean;
  cashOnDelivery: boolean;
  bankTransfer: boolean;
  wallet: boolean;
};

type Webhook = {
  id: string;
  url: string;
  description?: string;
  events: string[];
  active: boolean;
  lastStatus?: "ok" | "error" | "pending";
  lastPingAt?: string;
};

type SettingsState = {
  environment: "test" | "live";
  defaultCurrency: Currency;
  supportedCurrencies: Currency[];
  roundingTo: number; // múltiplos (p.ej. 5 DOP)
  fxPolicy: "gateway" | "internal" | "disabled";
  gateways: Record<GatewayKey, GatewayConfig>;
  paymentMethods: PaymentMethods;
  payout: {
    frequency: PayoutFrequency;
    bankName?: string;
    bankAccount?: string;
    beneficiary?: string;
  };
  refundPolicy: {
    autoWindowHours: number; // ventana auto-refund
    partialAllowed: boolean;
    notes: string;
  };
  disputePolicy: {
    contactEmail?: string;
    evidenceSlaHours: number;
    notes: string;
  };
  webhooks: Webhook[];
};

/* =========================================================================
   Helpers
=========================================================================== */
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString() : "—";
const mask = (s?: string, keep = 4) =>
  !s ? "—" : s.length <= keep ? "*".repeat(keep) : `${"*".repeat(Math.max(0, s.length - keep))}${s.slice(-keep)}`;

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
);

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
    <div>{children}</div>
  </div>
);

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
      checked ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
    }`}
    aria-pressed={checked}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
        checked ? "translate-x-5" : "translate-x-1"
      }`}
    />
  </button>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs dark:border-gray-700">
    {children}
  </span>
);

/* =========================================================================
   Página
=========================================================================== */
export default function SettingsPaymentsPage() {
  const [state, setState] = useState<SettingsState>({
    environment: "test",
    defaultCurrency: "DOP",
    supportedCurrencies: ["DOP", "USD"],
    roundingTo: 5,
    fxPolicy: "gateway",
    gateways: {
      stripe: {
        enabled: true,
        testMode: true,
        publishableKey: "pk_test_1234567890",
        secretKey: "sk_test_0987654321",
        accountId: "acct_1ABCXYZ",
      },
      paypal: {
        enabled: false,
        testMode: true,
        publishableKey: "",
        secretKey: "",
        accountId: "",
      },
    },
    paymentMethods: {
      card: true,
      cashOnDelivery: true,
      bankTransfer: true,
      wallet: false,
    },
    payout: {
      frequency: "weekly",
      bankName: "Banco Popular",
      bankAccount: "032-0012345-6",
      beneficiary: "Mi Negocio SRL",
    },
    refundPolicy: {
      autoWindowHours: 24,
      partialAllowed: true,
      notes:
        "Reembolsos automáticos dentro de 24h si el pedido no fue despachado. Fuera de ventana, requiere autorización.",
    },
    disputePolicy: {
      contactEmail: "cobranzas@minegocio.do",
      evidenceSlaHours: 72,
      notes:
        "Responde a contracargos con evidencia (pruebas de entrega, firma, conversación). Mantener trazabilidad.",
    },
    webhooks: [
      {
        id: uid(),
        url: "https://api.minegocio.do/webhooks/stripe",
        description: "Stripe checkout & payouts",
        events: ["payment_intent.succeeded", "charge.refunded", "payout.paid"],
        active: true,
        lastStatus: "ok",
        lastPingAt: new Date().toISOString(),
      },
      {
        id: uid(),
        url: "https://api.minegocio.do/webhooks/paypal",
        description: "PayPal capture",
        events: ["PAYMENT.CAPTURE.COMPLETED", "PAYMENT.CAPTURE.DENIED"],
        active: false,
        lastStatus: "pending",
      },
    ],
  });

  // Persistencia simple
  useEffect(() => {
    const raw = localStorage.getItem("pay_settings");
    if (raw) {
      try {
        setState(JSON.parse(raw));
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("pay_settings", JSON.stringify(state));
  }, [state]);

  const gatewaysEnabled = useMemo(
    () =>
      (Object.keys(state.gateways) as GatewayKey[]).filter(
        (k) => state.gateways[k].enabled
      ),
    [state.gateways]
  );

  /* ------------------- Handlers ------------------- */
  const setGateway = (key: GatewayKey, patch: Partial<GatewayConfig>) =>
    setState((s) => ({
      ...s,
      gateways: { ...s.gateways, [key]: { ...s.gateways[key], ...patch } },
    }));

  const setPaymentMethods = (patch: Partial<PaymentMethods>) =>
    setState((s) => ({ ...s, paymentMethods: { ...s.paymentMethods, ...patch } }));

  const addWebhook = () =>
    setState((s) => ({
      ...s,
      webhooks: [
        ...s.webhooks,
        {
          id: uid(),
          url: "",
          description: "",
          events: [],
          active: true,
          lastStatus: "pending",
        },
      ],
    }));

  const updateWebhook = (id: string, patch: Partial<Webhook>) =>
    setState((s) => ({
      ...s,
      webhooks: s.webhooks.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }));

  const removeWebhook = (id: string) =>
    setState((s) => ({ ...s, webhooks: s.webhooks.filter((w) => w.id !== id) }));

  const pingWebhook = (id: string) =>
    updateWebhook(id, { lastStatus: "ok", lastPingAt: new Date().toISOString() });

  /* ------------------- Render ------------------- */
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Header + resumen */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Pagos & pasarelas
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configura pasarelas, métodos de pago, monedas, políticas de
            reembolso, liquidaciones y webhooks. Esta sección centraliza la
            “capa de dinero” de tu operación.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-2 font-medium text-gray-800 dark:text-white">
            Resumen rápido
          </h3>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
            <Row label="Entorno">
              <Chip>{state.environment === "test" ? "Modo prueba" : "Modo live"}</Chip>
            </Row>
            <Row label="Moneda por defecto">
              <Chip>{state.defaultCurrency}</Chip>
            </Row>
            <Row label="Pasarelas activas">
              <span className="text-gray-800 dark:text-gray-200">
                {gatewaysEnabled.length > 0 ? gatewaysEnabled.join(", ") : "Ninguna"}
              </span>
            </Row>
            <Row label="Redondeo">
              <span>×{state.roundingTo}</span>
            </Row>
          </ul>
        </div>
      </div>

      {/* Pasarelas */}
      <Section
        title="Pasarelas"
        description="Habilita y configura tus proveedores de cobro. Guarda las claves en una bóveda segura."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Stripe */}
          <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-700">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white">Stripe</h3>
              <Toggle
                checked={state.gateways.stripe.enabled}
                onChange={(v) => setGateway("stripe", { enabled: v })}
              />
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Modo prueba">
                <Toggle
                  checked={state.gateways.stripe.testMode}
                  onChange={(v) => setGateway("stripe", { testMode: v })}
                />
              </Row>
              <Row label="Publishable key">
                <span className="font-mono">{mask(state.gateways.stripe.publishableKey)}</span>
              </Row>
              <Row label="Secret key">
                <span className="font-mono">{mask(state.gateways.stripe.secretKey)}</span>
              </Row>
              <Row label="Account ID">
                <span className="font-mono">{state.gateways.stripe.accountId || "—"}</span>
              </Row>
              <p className="mt-2 text-xs text-gray-500">
                Sugerencia: usa cuentas conectadas para separar fondos por negocio/sucursal.
              </p>
            </div>
          </div>

          {/* PayPal */}
          <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-700">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white">PayPal</h3>
              <Toggle
                checked={state.gateways.paypal.enabled}
                onChange={(v) => setGateway("paypal", { enabled: v })}
              />
            </div>
            <div className="space-y-3 text-sm">
              <Row label="Modo prueba">
                <Toggle
                  checked={state.gateways.paypal.testMode}
                  onChange={(v) => setGateway("paypal", { testMode: v })}
                />
              </Row>
              <Row label="Client ID">
                <span className="font-mono">{mask(state.gateways.paypal.publishableKey)}</span>
              </Row>
              <Row label="Secret">
                <span className="font-mono">{mask(state.gateways.paypal.secretKey)}</span>
              </Row>
              <Row label="Account ID">
                <span className="font-mono">{state.gateways.paypal.accountId || "—"}</span>
              </Row>
              <p className="mt-2 text-xs text-gray-500">
                Asegura el correo de comercio en PayPal para conciliación.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Monedas */}
      <Section
        title="Monedas & redondeo"
        description="Moneda por defecto, soportadas y política de conversión."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Moneda por defecto</h4>
            <select
              value={state.defaultCurrency}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  defaultCurrency: e.target.value as Currency,
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            >
              {(["DOP", "USD", "EUR"] as Currency[]).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Monedas soportadas</h4>
            <div className="flex flex-wrap gap-2">
              {(["DOP", "USD", "EUR"] as Currency[]).map((c) => {
                const enabled = state.supportedCurrencies.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        supportedCurrencies: enabled
                          ? s.supportedCurrencies.filter((x) => x !== c)
                          : [...s.supportedCurrencies, c],
                      }))
                    }
                    className={`rounded-full px-3 py-1 text-xs ${
                      enabled
                        ? "bg-brand-500 text-white"
                        : "border border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Multi-moneda requiere definir tipo de cambio. Política:
              <strong> {state.fxPolicy}</strong>.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Redondeo</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">×</span>
              <input
                type="number"
                min={1}
                step={1}
                value={state.roundingTo}
                onChange={(e) =>
                  setState((s) => ({ ...s, roundingTo: Number(e.target.value || 1) }))
                }
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Recomendado: 5 en DOP para efectivo.
            </p>
          </div>
        </div>
      </Section>

      {/* Métodos de pago */}
      <Section
        title="Métodos de pago"
        description="Habilita los métodos disponibles para tus clientes."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <span>Tarjeta (Visa/Master/AMEX)</span>
            <Toggle
              checked={state.paymentMethods.card}
              onChange={(v) => setPaymentMethods({ card: v })}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <span>Contraentrega (efectivo)</span>
            <Toggle
              checked={state.paymentMethods.cashOnDelivery}
              onChange={(v) => setPaymentMethods({ cashOnDelivery: v })}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <span>Transferencia bancaria</span>
            <Toggle
              checked={state.paymentMethods.bankTransfer}
              onChange={(v) => setPaymentMethods({ bankTransfer: v })}
            />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <span>Wallet/Billetera</span>
            <Toggle
              checked={state.paymentMethods.wallet}
              onChange={(v) => setPaymentMethods({ wallet: v })}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Nota: algunos métodos dependen de la pasarela y el país.
        </p>
      </Section>

      {/* Liquidaciones / Payouts */}
      <Section
        title="Liquidaciones (Payouts)"
        description="Frecuencia y cuenta de destino para tus cobros."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Frecuencia</h4>
            <select
              value={state.payout.frequency}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  payout: { ...s.payout, frequency: e.target.value as PayoutFrequency },
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quincenal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Cuenta destino</h4>
            <div className="grid grid-cols-1 gap-3">
              <input
                placeholder="Banco"
                value={state.payout.bankName || ""}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    payout: { ...s.payout, bankName: e.target.value },
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
              <input
                placeholder="Cuenta"
                value={state.payout.bankAccount || ""}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    payout: { ...s.payout, bankAccount: e.target.value },
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
              <input
                placeholder="Beneficiario"
                value={state.payout.beneficiary || ""}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    payout: { ...s.payout, beneficiary: e.target.value },
                  }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Reembolsos & Disputas */}
      <Section
        title="Reembolsos & disputas"
        description="Criterios operativos para devoluciones y contracargos."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Reembolsos</h4>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <span>Permitir parciales</span>
                <Toggle
                  checked={state.refundPolicy.partialAllowed}
                  onChange={(v) =>
                    setState((s) => ({
                      ...s,
                      refundPolicy: { ...s.refundPolicy, partialAllowed: v },
                    }))
                  }
                />
              </label>
              <div>
                <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  Ventana auto-refund (horas)
                </span>
                <input
                  type="number"
                  min={0}
                  value={state.refundPolicy.autoWindowHours}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      refundPolicy: {
                        ...s.refundPolicy,
                        autoWindowHours: Number(e.target.value || 0),
                      },
                    }))
                  }
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <textarea
                placeholder="Notas de política (visible a soporte)."
                value={state.refundPolicy.notes}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    refundPolicy: { ...s.refundPolicy, notes: e.target.value },
                  }))
                }
                className="min-h-[88px] w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Disputas / contracargos</h4>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  Email de contacto
                </span>
                <input
                  value={state.disputePolicy.contactEmail || ""}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      disputePolicy: {
                        ...s.disputePolicy,
                        contactEmail: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  SLA de evidencia (horas)
                </span>
                <input
                  type="number"
                  min={1}
                  value={state.disputePolicy.evidenceSlaHours}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      disputePolicy: {
                        ...s.disputePolicy,
                        evidenceSlaHours: Number(e.target.value || 1),
                      },
                    }))
                  }
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <textarea
                placeholder="Notas operativas para responder contracargos."
                value={state.disputePolicy.notes}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    disputePolicy: { ...s.disputePolicy, notes: e.target.value },
                  }))
                }
                className="min-h-[88px] w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Webhooks */}
      <Section
        title="Webhooks"
        description="Recepción de eventos de pago (capturas, reembolsos, liquidaciones)."
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mantén tus webhooks activos y monitoreados.
          </p>
          <button
            onClick={addWebhook}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Añadir webhook
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-3">URL</th>
                <th className="py-2 pr-3">Descripción</th>
                <th className="py-2 pr-3">Eventos</th>
                <th className="py-2 pr-3">Activo</th>
                <th className="py-2 pr-3">Último ping</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {state.webhooks.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                >
                  <td className="py-2 pr-3">
                    <input
                      value={w.url}
                      onChange={(e) =>
                        updateWebhook(w.id, { url: e.target.value })
                      }
                      placeholder="https://tudominio.com/webhooks/xxx"
                      className="w-full rounded-lg border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      value={w.description || ""}
                      onChange={(e) =>
                        updateWebhook(w.id, { description: e.target.value })
                      }
                      placeholder="Descripción"
                      className="w-full rounded-lg border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      value={w.events.join(", ")}
                      onChange={(e) =>
                        updateWebhook(w.id, {
                          events: e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="event.a, event.b"
                      className="w-full rounded-lg border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <Toggle
                      checked={w.active}
                      onChange={(v) => updateWebhook(w.id, { active: v })}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`mr-2 inline-block h-2 w-2 rounded-full ${
                        w.lastStatus === "ok"
                          ? "bg-emerald-500"
                          : w.lastStatus === "error"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span className="text-xs text-gray-500">
                      {fmtDateTime(w.lastPingAt)}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => pingWebhook(w.id)}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      >
                        Probar
                      </button>
                      <button
                        onClick={() => removeWebhook(w.id)}
                        className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/20"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {state.webhooks.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-gray-500" colSpan={6}>
                    Sin webhooks registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Seguridad & cumplimiento */}
      <Section
        title="Seguridad & cumplimiento"
        description="Buenas prácticas para proteger datos y cumplir estándares."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">PCI-DSS</h4>
            <p className="text-gray-700 dark:text-gray-300">
              No almacenes datos de tarjeta en tu servidor. Usa tokens de la
              pasarela y formularios embebidos. Limita el alcance (SAQ-A).
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">3DS/SCA</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Habilita autenticación reforzada (3D Secure) para reducir fraude y
              contracargos. Verifica soporte por pasarela/país.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">PII & Logs</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Minimiza PII en logs. Enmascara datos sensibles. Establece
              retenciones y acceso por roles.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
