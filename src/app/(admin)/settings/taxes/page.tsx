"use client";

import { useMemo, useState } from "react";

/* =========================================================================
   CONFIGURACIÓN INFORMATIVA (ajústalo a tu operación real)
   * Nota: Esto NO es asesoría legal/fiscal; úsalo como guía operativa.
=========================================================================== */
const TAX_PROFILE = {
  country: "República Dominicana",
  currency: "DOP",
  itbisRate: 18,          // % ITBIS general
  itbisOnShipping: true,  // ¿aplica ITBIS sobre el envío?
  roundingTo: 5,          // redondeo a múltiplos (5 DOP)
  exentas: [
    "Medicamentos humanos",
    "Libros y periódicos",
    "Servicios educativos",
  ],
  reducedOrZeroNotes:
    "Existen bienes y servicios exentos o con tasa cero según DGII y leyes especiales.",
};

// NCFs más comunes (informativo, simplificado)
const NCF_TYPES = [
  { code: "B01", label: "Factura de crédito fiscal" },
  { code: "B02", label: "Factura de Consumo" },
  { code: "B14", label: "Comprobante Regímenes Especiales" },
  { code: "B15", label: "Comprobante Gubernamental" },
] as const;

type NCFCode = (typeof NCF_TYPES)[number]["code"];

/* =========================================================================
   HELPERS
=========================================================================== */
const fmt = (n: number) =>
  new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }).format(n);

const roundTo = (n: number, step = TAX_PROFILE.roundingTo) =>
  Math.round(n / step) * step;

/** Calcula ITBIS y totales ilustrativos (no sustituye tu backend). */
function computeTax({
  subtotal,
  shipping,
  itbisRate = TAX_PROFILE.itbisRate,
  itbisOnShipping = TAX_PROFILE.itbisOnShipping,
  exempt = false,
}: {
  subtotal: number;
  shipping: number;
  itbisRate?: number;
  itbisOnShipping?: boolean;
  exempt?: boolean;
}) {
  const base = subtotal + (itbisOnShipping ? shipping : 0);
  const itbis = exempt ? 0 : Math.round((base * itbisRate) / 100);
  const total = roundTo(subtotal + shipping + itbis);
  return { itbis, total, base };
}

/* =========================================================================
   SUBCOMPONENTES UI LIGEROS
=========================================================================== */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
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
}

function InfoRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="text-gray-500">{k}</span>
      <span className="text-gray-800 dark:text-gray-200">{v}</span>
    </li>
  );
}

/** Donut mini: composición Subtotal / Envío / ITBIS (solo display). */
function Donut({
  subtotal,
  shipping,
  itbis,
}: {
  subtotal: number;
  shipping: number;
  itbis: number;
}) {
  const total = Math.max(1, subtotal + shipping + itbis);
  const parts = [
    { label: "Subtotal", value: subtotal },
    { label: "Envío", value: shipping },
    { label: "ITBIS", value: itbis },
  ];

  // Construimos un donut con segmentos proporcionales
  const size = 140;
  const r = 52;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const segs = parts.map((p, idx) => {
    const frac = p.value / total;
    const len = frac * circ;
    const dasharray = `${len} ${circ - len}`;
    const dashoffset = -offset;
    offset += len;
    // Colores (Tailwind no aplica dentro de SVG; usamos atributos)
    const color = idx === 0 ? "#6366f1" : idx === 1 ? "#06b6d4" : "#22c55e";
    return { ...p, dasharray, dashoffset, color };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={12} />
        {segs.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={12}
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.dashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        ))}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill="#374151"
        >
          {fmt(total)}
        </text>
      </svg>
      <ul className="space-y-1 text-sm">
        <li className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: "#6366f1" }} />
          Subtotal: <strong className="ml-1">{fmt(subtotal)}</strong>
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: "#06b6d4" }} />
          Envío: <strong className="ml-1">{fmt(shipping)}</strong>
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-sm" style={{ background: "#22c55e" }} />
          ITBIS: <strong className="ml-1">{fmt(itbis)}</strong>
        </li>
      </ul>
    </div>
  );
}

/* =========================================================================
   PÁGINA
=========================================================================== */
export default function Page() {
  // Pequeño simulador informativo (sin persistencia)
  const [ncf, setNcf] = useState<NCFCode>("B02");
  const [subtotal, setSubtotal] = useState(1500);
  const [shipping, setShipping] = useState(120);
  const [exempt, setExempt] = useState(false);

  const calc = useMemo(
    () =>
      computeTax({
        subtotal,
        shipping,
        exempt,
      }),
    [subtotal, shipping, exempt]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Impuestos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configuración y criterios de cálculo para ITBIS, manejo de NCF y
            consideraciones fiscales. Orientado a operaciones en {TAX_PROFILE.country}.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-2 font-medium text-gray-800 dark:text-white">
            Resumen rápido
          </h3>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
            <InfoRow k="País" v={TAX_PROFILE.country} />
            <InfoRow k="Moneda" v={TAX_PROFILE.currency} />
            <InfoRow k="ITBIS" v={`${TAX_PROFILE.itbisRate}%`} />
            <InfoRow
              k="ITBIS sobre envío"
              v={TAX_PROFILE.itbisOnShipping ? "Sí" : "No"}
            />
            <InfoRow
              k="Redondeo"
              v={`Múltiplos de ${TAX_PROFILE.roundingTo} ${TAX_PROFILE.currency}`}
            />
          </ul>
        </div>
      </div>

      {/* MARCO FISCAL */}
      <Section
        title="Marco fiscal e ítems exentos"
        description="Notas operativas para atención, facturación y auditorías."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">
              ITBIS General
            </h3>
            <ul className="list-disc pl-4 text-sm text-gray-700 dark:text-gray-300">
              <li>Tarifa estándar: {TAX_PROFILE.itbisRate}%.</li>
              <li>
                {TAX_PROFILE.itbisOnShipping
                  ? "Aplica sobre el envío."
                  : "No se aplica sobre el envío."}
              </li>
              <li>Redondeo operativo a múltiplos de {TAX_PROFILE.roundingTo}.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">
              Exentos / tasa cero
            </h3>
            <ul className="list-disc pl-4 text-sm text-gray-700 dark:text-gray-300">
              {TAX_PROFILE.exentas.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              {TAX_PROFILE.reducedOrZeroNotes}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">
              NCF (informativo)
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300">
              {NCF_TYPES.map((t) => (
                <li key={t.code}>
                  <span className="font-medium">{t.code}</span> — {t.label}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Las series y secuencias se gestionan en DGII. Asegura la correcta
              asignación por tipo de cliente.
            </p>
          </div>
        </div>
      </Section>

      {/* FÓRMULAS Y CRITERIOS */}
      <Section
        title="Criterios de cálculo (display)"
        description="Cómo se arma el total cobrado al cliente."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h3 className="mb-2 font-medium">ITBIS</h3>
            <p>
              <strong>Base ITBIS</strong> = Subtotal{" "}
              {TAX_PROFILE.itbisOnShipping ? "+ Envío " : " "}
              → <strong>ITBIS</strong> = Base × {TAX_PROFILE.itbisRate}% (aprox.)
            </p>
            <p className="mt-2">
              <strong>Total</strong> = Subtotal + Envío + ITBIS → redondeo a {TAX_PROFILE.roundingTo}.
            </p>
            <p className="mt-2 text-gray-500">
              Si el ítem/servicio es <em>exento</em>, el ITBIS será 0.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h3 className="mb-2 font-medium">Percepciones / retenciones</h3>
            <p>
              Según el tipo de cliente y régimen, pueden aplicar percepciones
              o retenciones adicionales. Este apartado es informativo; si tu
              operación las requiere, define reglas en tu backend.
            </p>
            <ul className="mt-2 list-disc pl-4 text-gray-700 dark:text-gray-300">
              <li>Percepción a tarjetas / pagos electrónicos (según acuerdos).</li>
              <li>Retenciones a proveedores según clasificación.</li>
              <li>Documentar en NCF y en reportes a DGII.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* MINI CALCULADOR (INFORMATIVO) */}
      <Section
        title="Simulador ilustrativo"
        description="Ajusta valores para entender la composición del total. No guarda ni impacta tu configuración."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1fr]">
          {/* Inputs simples */}
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  Tipo de NCF (display)
                </label>
                <select
                  value={ncf}
                  onChange={(e) => setNcf(e.target.value as NCFCode)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  {NCF_TYPES.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.code} — {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                    Subtotal (sin ITBIS)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={subtotal}
                    onChange={(e) => setSubtotal(Number(e.target.value || 0))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                    Envío
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={shipping}
                    onChange={(e) => setShipping(Number(e.target.value || 0))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-200">
                  Ítems exentos (simulación)
                </span>
                <input
                  type="checkbox"
                  checked={exempt}
                  onChange={(e) => setExempt(e.target.checked)}
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ITBIS</span>
                <span className="font-medium">{fmt(calc.itbis)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total (redondeado)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {fmt(calc.total)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Base ITBIS: {fmt(calc.base)} · NCF: {ncf}
              </p>
            </div>
          </div>

          {/* Donut */}
          <div className="grid place-items-center">
            <Donut subtotal={subtotal} shipping={shipping} itbis={calc.itbis} />
          </div>
        </div>
      </Section>

      {/* NCF y numeración */}
      <Section
        title="NCF y numeración"
        description="Buenas prácticas para series, secuencias y asignación por tipo de cliente."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h3 className="mb-2 font-medium">Series y control</h3>
            <ul className="list-disc pl-4 text-gray-700 dark:text-gray-300">
              <li>
                Gestiona series por tipo de NCF (ej.: B01, B02) con correlativos
                independientes.
              </li>
              <li>
                Verifica disponibilidad y vigencia de rangos autorizados en DGII.
              </li>
              <li>
                Evita saltos o duplicados; audita secuencias mensualmente.
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h3 className="mb-2 font-medium">Asignación por cliente</h3>
            <ul className="list-disc pl-4 text-gray-700 dark:text-gray-300">
              <li>Consumidor final (B02) vs. Crédito fiscal (B01).</li>
              <li>
                Requiere datos fiscales del cliente para B01 (RNC, razón social).
              </li>
              <li>
                Documenta anulaciones con nota de crédito donde aplique.
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* FAQ / NOTAS */}
      <Section title="Notas y preguntas frecuentes">
        <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>¿Puedo desactivar ITBIS en el envío?</strong> Sí, depende de
            tu criterio fiscal y del tipo de servicio. Ajusta la lógica en tu
            backend; esta vista es informativa.
          </li>
          <li>
            <strong>¿Qué pasa con promociones o cupones?</strong> Aplica el
            descuento al subtotal antes de ITBIS. El envío puede tener reglas
            propias (gratis desde X monto).
          </li>
          <li>
            <strong>Redondeo:</strong> recomendamos múltiplos de{" "}
            {TAX_PROFILE.roundingTo} {TAX_PROFILE.currency} para cobros en
            efectivo y claridad al cliente.
          </li>
          <li>
            <strong>Reportería:</strong> armoniza tus reportes (ventas, NCF,
            anulaciones) con la periodicidad y formatos exigidos por DGII.
          </li>
          <li>
            <strong>Exenciones:</strong> valida caso por caso (producto/servicio)
            y guarda evidencia/documentación.
          </li>
        </ul>
      </Section>
    </div>
  );
}
