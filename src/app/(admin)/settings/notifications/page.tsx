"use client";

import React from "react";

/* ──────────────────────────────────────────────────────────────
   Pequeños átomos de UI (solo display)
─────────────────────────────────────────────────────────────── */
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
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
    {children}
  </section>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs dark:border-gray-700">
    {children}
  </span>
);

const InfoCard = ({ title, lines }: { title: string; lines: string[] }) => (
  <div className="rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-700">
    <h3 className="mb-2 font-medium text-gray-800 dark:text-white">{title}</h3>
    <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
      {lines.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Visuales livianos (SVG)
─────────────────────────────────────────────────────────────── */
// Flujo de notificaciones (Evento → Evaluación → Canal → Entrega → Registro)
const FlowMini = () => {
  const steps = [
    { label: "Evento", x: 12 },
    { label: "Evaluación", x: 102 },
    { label: "Canal", x: 190 },
    { label: "Entrega", x: 260 },
    { label: "Registro", x: 330 },
  ];
  return (
    <svg viewBox="0 0 360 80" className="w-full max-w-[520px]">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill="#9CA3AF" />
        </marker>
      </defs>
      {steps.slice(0, -1).map((s, i) => (
        <line
          key={i}
          x1={s.x + 38}
          y1={40}
          x2={steps[i + 1].x - 8}
          y2={40}
          stroke="#D1D5DB"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
      ))}
      {steps.map((s, i) => (
        <g key={s.label}>
          <rect
            x={s.x}
            y={22}
            rx={10}
            width={70}
            height={36}
            fill={i === steps.length - 1 ? "#22C55E" : i === 0 ? "#6366F1" : "#06B6D4"}
            opacity="0.95"
          />
          <text
            x={s.x + 35}
            y={42}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#FFFFFF"
            fontWeight={600}
          >
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// Distribución recomendada por canal
const MixMini = () => {
  const parts = [
    { label: "Push", value: 45, color: "#6366F1" },
    { label: "Email", value: 35, color: "#06B6D4" },
    { label: "SMS", value: 20, color: "#22C55E" },
  ];
  const total = parts.reduce((a, b) => a + b.value, 0);
  const size = 140;
  const r = 52;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={12} />
        {parts.map((p) => {
          const frac = p.value / total;
          const len = frac * circ;
          const dasharray = `${len} ${circ - len}`;
          const dashoffset = -offset;
          offset += len;
          return (
            <circle
              key={p.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth={12}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#374151">
          Mix
        </text>
      </svg>
      <ul className="space-y-1 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: p.color }} />
            {p.label}: <strong className="ml-1">{p.value}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Página — Notificaciones (informativa)
─────────────────────────────────────────────────────────────── */
export default function Page() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Notificaciones</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Guía informativa para comunicaciones transaccionales y operativas. Aquí definimos
          el propósito, canales, tiempos y buenas prácticas para que cada mensaje sea útil,
          oportuno y respetuoso con el usuario.
        </p>
      </div>

      {/* Resumen en 4 tarjetas */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <InfoCard
          title="Propósito"
          lines={[
            "Informar estado de pedidos y seguridad de cuenta.",
            "Reducir ansiedad del cliente con visibilidad.",
            "Prevenir incidencias (entrega, pagos).",
          ]}
        />
        <InfoCard
          title="Tono"
          lines={[
            "Claro y breve, sin jergas.",
            "Amable y orientado a la acción.",
            "Evitar mayúsculas sostenidas.",
          ]}
        />
        <InfoCard
          title="Frecuencia"
          lines={[
            "Solo eventos relevantes.",
            "Evitar duplicidad entre canales.",
            "Respetar horarios locales.",
          ]}
        />
        <InfoCard
          title="Privacidad"
          lines={[
            "No incluir PII innecesaria.",
            "Enlaces firmados/seguros.",
            "Cumplir preferencias del usuario.",
          ]}
        />
      </section>

      {/* Flujo y mezcla de canales */}
      <Section
        title="Cómo fluye una notificación"
        description="De un evento del sistema a un mensaje concreto y trazable."
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <FlowMini />
            <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li><strong>Evento:</strong> ocurre un cambio (pedido creado, 2FA, reembolso).</li>
              <li><strong>Evaluación:</strong> reglas, preferencias del usuario y ventanas de envío.</li>
              <li><strong>Canal:</strong> push / email / SMS según urgencia e impacto.</li>
              <li><strong>Entrega:</strong> mensaje corto + CTA útil (ver pedido, confirmar, etc.).</li>
              <li><strong>Registro:</strong> guardamos quién, cuándo y por qué (auditoría).</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">Mezcla recomendada</h3>
            <MixMini />
            <p className="mt-3 text-xs text-gray-500">
              Ajusta el mix por país, preferencia y sensibilidad del mensaje (seguridad → más push/SMS).
            </p>
          </div>
        </div>
      </Section>

      {/* Tipos de notificaciones */}
      <Section
        title="Tipos y ejemplos"
        description="Agrupamos por intención para mantener consistencia y evitar saturación."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InfoCard
            title="Transaccionales"
            lines={[
              "Pedido confirmado, preparado, en camino, entregado.",
              "Factura/NCF disponible, reembolso emitido.",
              "Citas o ventanas programadas.",
            ]}
          />
        <InfoCard
            title="Cuenta & seguridad"
            lines={[
              "Inicio de sesión nuevo dispositivo.",
              "Cambio de contraseña, 2FA, códigos de respaldo.",
              "Alertas de actividad inusual.",
            ]}
          />
          <InfoCard
            title="Operativas"
            lines={[
              "Recordatorios de entrega: ETA y contacto del repartidor.",
              "Incidencias: dirección, clima, reintento.",
              "Encuesta breve post-entrega.",
            ]}
          />
        </div>
        <div className="mt-6 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-700">
          <h3 className="mb-2 font-medium text-gray-800 dark:text-white">Ejemplo de contenido mínimo</h3>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
            <li><strong>Asunto/Título:</strong> “Tu pedido #A123 está en camino (llega 16:10–16:40)”</li>
            <li><strong>Cuerpo:</strong> ETA, nombre del repartidor, botón “Ver seguimiento”.</li>
            <li><strong>Footer:</strong> por qué recibes esto + enlace a preferencias.</li>
          </ul>
        </div>
      </Section>

      {/* Preferencias y ventanas de envío */}
      <Section
        title="Preferencias & ventanas"
        description="Respeta la elección del usuario y evita interrupciones innecesarias."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InfoCard
            title="Preferencias"
            lines={[
              "Email pedidos ✓, seguridad ✓, promos (opt-in).",
              "Push operativas ✓, push promos (opt-in).",
              "SMS solo para críticos o confirmaciones.",
            ]}
          />
          <InfoCard
            title="Ventanas"
            lines={[
              "Evitar 22:00–07:00 para no críticos.",
              "Reintentos espaciados y con contexto.",
              "Silenciar promos en días festivos/lluvia intensa.",
            ]}
          />
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <Pill>Consejo</Pill> Centraliza las preferencias en un único perfil y sincroniza con todos los canales.
        </div>
      </Section>

      {/* Calidad, accesibilidad y métricas */}
      <Section
        title="Calidad, accesibilidad & métricas"
        description="Enfócate en que el mensaje sea legible, accionable y medible."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <InfoCard
            title="Calidad"
            lines={[
              "Longitud breve y clara (≤ 300 caracteres).",
              "CTA visible y único.",
              "Evitar adjuntos pesados.",
            ]}
          />
          <InfoCard
            title="Accesibilidad"
            lines={[
              "Contraste adecuado, tamaños legibles.",
              "Textos alternativos en imágenes.",
              "Evitar emoji como única señal.",
            ]}
          />
          <InfoCard
            title="Métricas"
            lines={[
              "Entrega, apertura, clic (CTR).",
              "Tiempo a la acción y resolución.",
              "Desuscripciones/opt-out.",
            ]}
          />
        </div>
      </Section>

      {/* Legal & privacidad */}
      <Section
        title="Legal & privacidad"
        description="Lo mínimo para estar tranquilos: consentimiento, seguridad y trazabilidad."
      >
        <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
            <li>Consentimiento claro para promociones (opt-in).</li>
            <li>Enlaces firmados/expiran para acciones sensibles.</li>
            <li>Retención limitada: guarda solo lo necesario para auditoría.</li>
            <li>Cumplir políticas internas y normativa local aplicable.</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Nota: evita incluir datos de tarjetas o credenciales en cualquier canal.
          </p>
        </div>
      </Section>
    </div>
  );
}
