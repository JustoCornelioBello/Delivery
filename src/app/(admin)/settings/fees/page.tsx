"use client";

import { useMemo } from "react";

/** -------------------- Config base (informativo) -------------------- */
// Moneda usada en la interfaz (solo display)
const CURRENCY = "DOP";

// Políticas y parámetros informativos (solo lectura en UI)
const POLICY = {
  shipping: {
    baseFee: 120,               // tarifa base
    includedKm: 3,              // kilómetros incluidos en la base
    perKmAfter: 25,             // recargo por km adicional
    freeShippingFrom: 2500,     // envío gratis desde
    minFee: 100,                // mínimo absoluto de envío
    maxFee: 450,                // techo máximo de envío
  },
  courier: {
    commissionPerOrder: 12,     // % sobre subtotal (sin impuestos)
    minPerOrder: 35,            // comisión mínima
    capPerOrder: 150,           // comisión máxima
  },
  platform: {
    paymentProcessing: 2.95,    // % sobre total cobrado (incluye impuestos)
    fixedGateway: 10,           // costo fijo por transacción
  },
  surge: {
    enabled: true,
    windows: [
      { label: "Almuerzo (12–14h)", multiplier: 1.10 },
      { label: "Pico tarde (18–20h)", multiplier: 1.15 },
      { label: "Lluvia o alta demanda", multiplier: 1.25 },
    ],
  },
  tax: {
    itbisRate: 18,              // ITBIS RD
    applyOnShipping: true,      // si ITBIS aplica sobre envío
  },
  rounding: {
    toNearest: 5,               // redondeo al múltiplo más cercano (ej.: 5 DOP)
  },
};

/** -------------------- Utils display (informativo) -------------------- */
const fmt = (n: number) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", maximumFractionDigits: 0 }).format(n);

const roundToNearest = (n: number, step: number) => Math.round(n / step) * step;

/** -------------------- Modelo de cálculo (solo demo) --------------------
 * Nota: Esto es ilustrativo. Ajusta a tu backend/rules reales.
 ------------------------------------------------------------------------ */
function estimateShipping(distanceKm: number, orderSubtotal: number, surgeMultiplier = 1) {
  const { baseFee, includedKm, perKmAfter, minFee, maxFee, freeShippingFrom } = POLICY.shipping;

  if (orderSubtotal >= freeShippingFrom) return 0;

  const extraKm = Math.max(0, distanceKm - includedKm);
  let fee = baseFee + extraKm * perKmAfter;
  fee *= surgeMultiplier;

  // límites
  fee = Math.max(minFee, Math.min(maxFee, fee));

  // redondeo
  fee = roundToNearest(fee, POLICY.rounding.toNearest);
  return fee;
}

function estimateCommission(subtotal: number) {
  const { commissionPerOrder, minPerOrder, capPerOrder } = POLICY.courier;
  let fee = (subtotal * commissionPerOrder) / 100;
  fee = Math.max(minPerOrder, Math.min(capPerOrder, fee));
  return roundToNearest(fee, POLICY.rounding.toNearest);
}

function estimateProcessing(totalCharged: number) {
  const { paymentProcessing, fixedGateway } = POLICY.platform;
  const pct = (totalCharged * paymentProcessing) / 100;
  return roundToNearest(pct + fixedGateway, POLICY.rounding.toNearest);
}

function computeExample(orderSubtotal: number, distanceKm: number, surgeMultiplier = 1) {
  const shipping = estimateShipping(distanceKm, orderSubtotal, surgeMultiplier);

  // impuestos
  const itbisBase = orderSubtotal + (POLICY.tax.applyOnShipping ? shipping : 0);
  const itbis = Math.round((itbisBase * POLICY.tax.itbisRate) / 100);

  const total = orderSubtotal + shipping + itbis;

  const courierCommission = estimateCommission(orderSubtotal);
  const processing = estimateProcessing(total);

  return { shipping, itbis, total, courierCommission, processing };
}

/** -------------------- Mini chart (SVG) -------------------- */
function MiniChart() {
  // Distancias para ilustrar (0–12 km)
  const xs = Array.from({ length: 13 }, (_, i) => i);
  const ys = xs.map((km) => estimateShipping(km, 1000, 1)); // subtotal de ejemplo 1000

  // Escalas simples
  const width = 260;
  const height = 100;
  const maxY = Math.max(...ys) || 1;
  const pad = 8;

  const points = ys
    .map((y, i) => {
      const xPos = pad + (i / (xs.length - 1)) * (width - pad * 2);
      const yPos = height - pad - (y / maxY) * (height - pad * 2);
      return `${xPos},${yPos}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[320px]">
      {/* fondo */}
      <rect x="0" y="0" width={width} height={height} className="fill-gray-50 dark:fill-gray-900" />
      {/* eje X simple */}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} className="stroke-gray-300" />
      {/* línea */}
      <polyline points={points} className="fill-none stroke-blue-500" strokeWidth="2" />
      {/* puntos */}
      {ys.map((y, i) => {
        const xPos = pad + (i / (xs.length - 1)) * (width - pad * 2);
        const yPos = height - pad - (y / maxY) * (height - pad * 2);
        return <circle key={i} cx={xPos} cy={yPos} r="2.5" className="fill-blue-500" />;
      })}
      {/* labels mínimos */}
      <text x={pad} y={height - 2} className="fill-gray-500 text-[9px]">0 km</text>
      <text x={width - pad - 24} y={height - 2} className="fill-gray-500 text-[9px]">12 km</text>
    </svg>
  );
}

/** -------------------- Página -------------------- */
export default function FeesSettingsPage() {
  // Ejemplos explicativos (no editables)
  const demo = useMemo(() => {
    return [
      { subtotal: 800, km: 1, surge: 1, label: "Pedido pequeño, cerca" },
      { subtotal: 1600, km: 5, surge: 1, label: "Pedido medio, distancia media" },
      { subtotal: 3200, km: 8, surge: 1.15, label: "Pedido grande, hora pico" },
      { subtotal: 2600, km: 2, surge: 1, label: "Envío gratis aplicado" },
    ].map((c) => ({ ...c, ...computeExample(c.subtotal, c.km, c.surge) }));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Tarifas & comisiones</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Define y comunica cómo se calculan los costos de envío, las comisiones por pedido y los recargos por distancia.
          Esta sección es informativa para alinear a negocio, atención al cliente y repartidores.
        </p>
      </div>

      {/* Resumen de políticas */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Resumen de reglas vigentes</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">Envío</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300">
              <li>Base: {fmt(POLICY.shipping.baseFee)} incluye {POLICY.shipping.includedKm} km</li>
              <li>+ {fmt(POLICY.shipping.perKmAfter)} por km adicional</li>
              <li>Mín.: {fmt(POLICY.shipping.minFee)} · Máx.: {fmt(POLICY.shipping.maxFee)}</li>
              <li>Gratis desde: {fmt(POLICY.shipping.freeShippingFrom)}</li>
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">Comisión repartidor</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300">
              <li>{POLICY.courier.commissionPerOrder}% sobre subtotal</li>
              <li>Mín.: {fmt(POLICY.courier.minPerOrder)} · Tope: {fmt(POLICY.courier.capPerOrder)}</li>
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">Procesamiento de pago</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300">
              <li>{POLICY.platform.paymentProcessing}% sobre total cobrado</li>
              <li>+ fijo de {fmt(POLICY.platform.fixedGateway)}</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">ITBIS</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Tasa: {POLICY.tax.itbisRate}% {POLICY.tax.applyOnShipping ? "aplica también al envío" : "no aplica al envío"}.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">Redondeo</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Al múltiplo de {fmt(POLICY.rounding.toNearest)} para precios más limpios.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">Horas pico</h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300">
              {POLICY.surge.enabled ? POLICY.surge.windows.map((w) => (
                <li key={w.label}>{w.label}: ×{w.multiplier}</li>
              )) : <li>Desactivado</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* Fórmulas (display) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Cómo se calcula</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h3 className="mb-2 font-medium">Costo de envío (estimado)</h3>
            <p>
              <strong>Envio</strong> = redondeo( min(max( (base + max(0, km - kmIncluidos) × porKm) × multiplicadorPico, mínimo ), máximo ) )
            </p>
            <p className="mt-2 text-gray-500">
              Si el subtotal supera {fmt(POLICY.shipping.freeShippingFrom)}, el envío es <strong>gratis</strong>.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h3 className="mb-2 font-medium">Comisiones & procesamiento</h3>
            <p>
              <strong>Comisión repartidor</strong> = redondeo( min(max( subtotal × {POLICY.courier.commissionPerOrder}%, mín.), tope ) )
            </p>
            <p className="mt-2">
              <strong>Procesamiento</strong> = redondeo( totalCobrado × {POLICY.platform.paymentProcessing}% + {fmt(POLICY.platform.fixedGateway)} )
            </p>
          </div>
        </div>
      </section>

      {/* Mini gráfico + ejemplos */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Envío vs distancia (ejemplo)
          </h2>
          <span className="text-xs text-gray-500">Moneda: {CURRENCY}</span>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr]">
          <MiniChart />
          <div className="overflow-x-auto">
            <table className="min-w-[520px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-3">Caso</th>
                  <th className="py-2 pr-3">Subtotal</th>
                  <th className="py-2 pr-3">Distancia</th>
                  <th className="py-2 pr-3">Pico</th>
                  <th className="py-2 pr-3">Envío</th>
                  <th className="py-2 pr-3">ITBIS</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2">Repartidor</th>
                </tr>
              </thead>
              <tbody>
                {demo.map((d, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="py-2 pr-3">{d.label}</td>
                    <td className="py-2 pr-3">{fmt(d.subtotal)}</td>
                    <td className="py-2 pr-3">{d.km} km</td>
                    <td className="py-2 pr-3">×{d.surge}</td>
                    <td className="py-2 pr-3">{fmt(d.shipping)}</td>
                    <td className="py-2 pr-3">{fmt(d.itbis)}</td>
                    <td className="py-2 pr-3">{fmt(d.total)}</td>
                    <td className="py-2">{fmt(d.courierCommission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-500">
              * Los ejemplos son ilustrativos. El total cobrado puede variar por promociones, propinas o tarifas especiales.
            </p>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes / Notas operativas */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Notas operativas & FAQ</h2>
        <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>¿El envío suma ITBIS?</strong>{" "}
            {POLICY.tax.applyOnShipping
              ? "Sí. El ITBIS se calcula sobre productos + envío."
              : "No. El ITBIS se calcula solo sobre productos."}
          </li>
          <li>
            <strong>Envío gratis:</strong> aplica automáticamente a partir de {fmt(POLICY.shipping.freeShippingFrom)} de subtotal (sin contar propinas).
          </li>
          <li>
            <strong>Horas pico:</strong> cuando hay alta demanda o lluvia, se aplica un multiplicador al envío (ver tabla de picos).
          </li>
          <li>
            <strong>Redondeo:</strong> se redondean importes a múltiplos de {fmt(POLICY.rounding.toNearest)} para mejorar legibilidad y cobro en efectivo.
          </li>
          <li>
            <strong>Comisión del repartidor:</strong> se calcula sobre el <em>subtotal</em> y respeta mínimo y tope por pedido.
          </li>
          <li>
            <strong>Procesamiento de pago:</strong> se aplica sobre el <em>total cobrado</em> (productos + envío + impuestos).
          </li>
          <li>
            <strong>Devoluciones y ajustes:</strong> las comisiones y el procesamiento pueden no ser reembolsables según el estado del pedido y las políticas del proveedor de pagos.
          </li>
        </ul>
      </section>
    </div>
  );
}
