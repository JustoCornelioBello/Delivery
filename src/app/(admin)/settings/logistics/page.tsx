"use client";

import React from "react";

/* =========================================================================
   Pequeños átomos de UI (solo display)
=========================================================================== */
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

const StatCard = ({
  k,
  v,
  note,
}: {
  k: string;
  v: string;
  note?: string;
}) => (
  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
    <p className="text-xs uppercase tracking-wide text-gray-500">{k}</p>
    <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
      {v}
    </p>
    {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs dark:border-gray-700">
    {children}
  </span>
);

/* =========================================================================
   Visuales informativos (SVG livianos)
=========================================================================== */
// Línea de tiempo (Pedido → Preparación → Asignación → En camino → Entregado)
const MiniTimeline = () => {
  const steps = [
    { label: "Pedido", x: 10 },
    { label: "Preparación", x: 88 },
    { label: "Asignación", x: 186 },
    { label: "En camino", x: 270 },
    { label: "Entregado", x: 350 },
  ];
  return (
    <svg viewBox="0 0 380 80" className="w-full max-w-[520px]">
      <line x1="10" y1="40" x2="370" y2="40" stroke="#D1D5DB" strokeWidth="2" />
      {steps.map((s, i) => (
        <g key={s.label}>
          <circle
            cx={s.x}
            cy={40}
            r={10}
            fill={i < 4 ? "#3B82F6" : "#10B981"}
            stroke="#F9FAFB"
            strokeWidth="2"
          />
          <text
            x={s.x}
            y={65}
            fontSize="11"
            textAnchor="middle"
            fill="#6B7280"
          >
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// Minimapa de zonas (A/B/C) para SLA y cobertura
const MiniZones = () => {
  const cells = [
    { x: 0, y: 0, zone: "A", sla: "≤30m", color: "#10B981" },
    { x: 1, y: 0, zone: "A", sla: "≤30m", color: "#10B981" },
    { x: 2, y: 0, zone: "B", sla: "≤45m", color: "#60A5FA" },
    { x: 0, y: 1, zone: "B", sla: "≤45m", color: "#60A5FA" },
    { x: 1, y: 1, zone: "B", sla: "≤45m", color: "#60A5FA" },
    { x: 2, y: 1, zone: "C", sla: "≤60m", color: "#F59E0B" },
    { x: 0, y: 2, zone: "C", sla: "≤60m", color: "#F59E0B" },
    { x: 1, y: 2, zone: "C", sla: "≤60m", color: "#F59E0B" },
    { x: 2, y: 2, zone: "C", sla: "≤60m", color: "#F59E0B" },
  ];
  const size = 66;
  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[220px]">
      <rect width="220" height="220" fill="#111827" rx="12" />
      {cells.map((c, i) => (
        <g key={i}>
          <rect
            x={c.x * size + 8}
            y={c.y * size + 8}
            width={size - 12}
            height={size - 12}
            fill={c.color}
            rx="8"
            opacity="0.9"
          />
          <text
            x={c.x * size + 8 + (size - 12) / 2}
            y={c.y * size + 8 + (size - 12) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fill="#0B1220"
            fontWeight={700}
          >
            {c.zone}
          </text>
          <text
            x={c.x * size + 8 + (size - 12) / 2}
            y={c.y * size + 8 + (size - 12) / 2 + 16}
            textAnchor="middle"
            fontSize="10"
            fill="#111827"
          >
            {c.sla}
          </text>
        </g>
      ))}
    </svg>
  );
};

/* =========================================================================
   Página — Entrega & Logística (informativa)
=========================================================================== */
export default function Page() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Entrega & logística
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Lineamientos operativos para preparación, despacho y entrega:
          ventanas, SLA, zonas, políticas de reintento, devoluciones, seguridad
          y comunicación. Esta página es informativa y estandariza criterios.
        </p>
      </div>

      {/* KPIs / SLA resumidos */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard k="SLA urbano" v="≤ 45 min" note="Promesa cliente Zona A/B" />
        <StatCard k="SLA periurbano" v="≤ 60 min" note="Zona C" />
        <StatCard k="Tasa de éxito" v="≥ 96%" note="Entregas en primer intento" />
        <StatCard k="Reintentos" v="Máx. 2" note="Luego, retorno a origen" />
      </section>

      {/* Flujo y Zonas (visuales) */}
      <Section
        title="Flujo operativo & coberturas"
        description="Secuencia estándar de una orden y zonas de cobertura con su promesa de entrega."
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">
              Cadena de entrega (alto nivel)
            </h3>
            <MiniTimeline />
            <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <strong>Preparación</strong>: picking/packing ≤ 10–15 min según
                complejidad.
              </li>
              <li>
                <strong>Asignación</strong>: despacho automático por cercanía,
                capacidad y carga (evitar viajes vacíos).
              </li>
              <li>
                <strong>En camino</strong>: navegación con rutas seguras y
                restricción de zonas rojas si aplica.
              </li>
              <li>
                <strong>Prueba de entrega</strong> (POD): foto, firma o PIN.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">
              Zonas & promesa
            </h3>
            <div className="flex items-center gap-6">
              <MiniZones />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <Pill>Zona A</Pill> Centros densos, ≤ 30 min
                </p>
                <p className="mt-1">
                  <Pill>Zona B</Pill> Intermedia, ≤ 45 min
                </p>
                <p className="mt-1">
                  <Pill>Zona C</Pill> Periferia, ≤ 60 min
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  * Las promesas dependen de clima, tráfico y demanda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Ventanas, cortes y franjas */}
      <Section
        title="Ventanas de entrega & cortes operativos"
        description="Definición de ventanas, cortes (cut-off) y manejo de picos."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Ventanas estándar</h4>
            <ul className="space-y-1">
              <li>08:00–12:00 · Mañana</li>
              <li>12:00–16:00 · Tarde</li>
              <li>16:00–20:00 · Vespertino</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              SLA variable por zona y clima.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Cortes (cut-off)</h4>
            <ul className="space-y-1">
              <li>Pedidos antes de 11:30 → salen en ventana AM/PM</li>
              <li>Pedidos después → próxima ventana disponible</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              En picos (almuerzo/lluvia) puede aplicarse extensión de ventana.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Prioridades</h4>
            <ul className="space-y-1">
              <li>Pedidos perecederos → prioridad alta</li>
              <li>Fragilidad/alto valor → requiere POD estricto</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Algoritmo pondera urgencia, ruta y carga.
            </p>
          </div>
        </div>
      </Section>

      {/* Políticas de intento, ausencia y devoluciones */}
      <Section
        title="Políticas de intento, ausencia y devoluciones"
        description="Qué hacer si el cliente no está, cómo reintentar y cuándo retornar."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Intentos de entrega</h4>
            <ul className="list-disc pl-5">
              <li>Máximo 2 intentos por pedido.</li>
              <li>Tiempo entre intentos: 30–60 min (misma jornada).</li>
              <li>Se contacta al cliente antes del 2.º intento.</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Tras 2 fallidos → retorno a origen y notificación.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Ausente / dirección incorrecta</h4>
            <ul className="list-disc pl-5">
              <li>Prueba de visita (foto/mapa) en cada intento.</li>
              <li>Reprogramación con nueva ventana si cliente confirma.</li>
              <li>Cambio de dirección: evaluar costo extra por km.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 md:col-span-2">
            <h4 className="mb-2 font-medium">Devoluciones & retornos</h4>
            <ul className="list-disc pl-5">
              <li>Retorno controlado a bodega con POD inverso.</li>
              <li>Para perecederos: protocolo de descarte/merma.</li>
              <li>Reembolso según política financiera (ver Pagos).</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Preparación, empaque y seguridad */}
      <Section
        title="Preparación, empaque y seguridad"
        description="Buenas prácticas para preservar calidad y trazabilidad."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Preparación</h4>
            <ul className="list-disc pl-5">
              <li>Checklist por categoría (frío/sec/fragil).</li>
              <li>Etiquetado con código de pedido y zona.</li>
              <li>Control de tiempos de picking.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Empaque</h4>
            <ul className="list-disc pl-5">
              <li>Separación por temperatura y fragilidad.</li>
              <li>Sello de seguridad y prueba de integridad.</li>
              <li>Guías de manipulación visibles.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Seguridad del repartidor</h4>
            <ul className="list-disc pl-5">
              <li>Rutas seguras y contacto de soporte 24/7.</li>
              <li>Equipamiento: casco, chaleco, iluminación.</li>
              <li>Protocolos ante incidentes y zonas restringidas.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Comunicación al cliente */}
      <Section
        title="Comunicación al cliente"
        description="Momentos clave y contenido mínimo sugerido."
      >
        <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
          <ul className="list-disc pl-5">
            <li>
              <strong>Confirmación de pedido</strong>: ventana estimada y datos
              de contacto.
            </li>
            <li>
              <strong>Pedido en preparación</strong>: número de seguimiento.
            </li>
            <li>
              <strong>Repartidor en camino</strong>: ETA, nombre y placa.
            </li>
            <li>
              <strong>Entrega realizada</strong>: POD (foto/firma/PIN) y
              encuesta breve.
            </li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Reintento/ausencia: avisos con nueva hora o instrucciones.
          </p>
        </div>
      </Section>

      {/* KPIs y salud operativa */}
      <Section
        title="KPIs y salud operativa"
        description="Indicadores para medir y mejorar la logística."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Servicio</h4>
            <ul className="list-disc pl-5">
              <li>On-time delivery (OTD)</li>
              <li>Primer intento exitoso</li>
              <li>Cancelaciones por logística</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Eficiencia</h4>
            <ul className="list-disc pl-5">
              <li>Tiempo de preparación</li>
              <li>Km por pedido / hora activa</li>
              <li>Utilización por franja</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
            <h4 className="mb-2 font-medium">Calidad</h4>
            <ul className="list-disc pl-5">
              <li>Incidentes (daños/mermas)</li>
              <li>Reclamos por entrega</li>
              <li>NPS post-entrega</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Riesgos y contingencias */}
      <Section
        title="Riesgos y contingencias"
        description="Pautas para eventos fuera de control."
      >
        <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
          <ul className="list-disc pl-5">
            <li>
              <strong>Clima severo</strong>: extender ventanas, priorizar
              seguridad, comunicar demoras.
            </li>
            <li>
              <strong>Picos de demanda</strong>: activar franjas adicionales o
              multiplicador logístico (interno).
            </li>
            <li>
              <strong>Incidentes de ruta</strong>: protocolo de soporte y cambio
              de ruta inmediato.
            </li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Toda excepción debe registrarse con timestamp y responsable.
          </p>
        </div>
      </Section>

      {/* Checklist de implementación */}
      <Section
        title="Checklist de implementación"
        description="Elementos mínimos antes de salir a producción."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <span>Matriz de zonas y tarifas definida</span>
            <Pill>Listo</Pill>
          </label>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <span>Protocolos de POD y reintento</span>
            <Pill>Listo</Pill>
          </label>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <span>Capacitación de repartidores</span>
            <Pill>En curso</Pill>
          </label>
          <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
            <span>Mensajería al cliente (plantillas)</span>
            <Pill>Listo</Pill>
          </label>
        </div>
      </Section>
    </div>
  );
}
