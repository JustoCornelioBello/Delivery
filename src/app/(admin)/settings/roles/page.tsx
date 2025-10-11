"use client";

import React from "react";

/* ────────────────────────────── UI atomicos ────────────────────────────── */
const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
    {children}
  </section>
);

const Kpi = ({ k, v, note }: { k: string; v: string; note?: string }) => (
  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
    <p className="text-xs uppercase tracking-wide text-gray-500">{k}</p>
    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{v}</p>
    {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs dark:border-gray-700">
    {children}
  </span>
);

/* ────────────────────────────── Visual liviano ───────────────────────────── */
const FlowMini = () => {
  const steps = [
    { x: 14,  w: 96,  label: "Invitación" },
    { x: 128, w: 112, label: "Asignar rol" },
    { x: 260, w: 110, label: "Revisiones" },
    { x: 390, w: 96,  label: "Baja/Offboard" },
  ];
  return (
    <svg viewBox="0 0 500 110" className="w-full max-w-3xl">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill="#9CA3AF" />
        </marker>
      </defs>
      {steps.slice(0, -1).map((s, i) => (
        <line
          key={i}
          x1={s.x + s.w}
          y1={55}
          x2={steps[i + 1].x - 8}
          y2={55}
          stroke="#D1D5DB"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
      ))}
      {steps.map((s, i) => (
        <g key={s.label}>
          <rect
            x={s.x}
            y={32}
            rx={12}
            width={s.w}
            height={46}
            fill={i === 0 ? "#6366F1" : i === steps.length - 1 ? "#EF4444" : "#06B6D4"}
            opacity="0.95"
          />
          <text
            x={s.x + s.w / 2}
            y={55}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
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

/* ────────────────────────────── Página ───────────────────────────── */
export default function Page() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Encabezado */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Usuarios & Roles
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Modelo de permisos basado en roles para mantener la operación segura y ordenada.
          Esta sección describe responsabilidades, alcances y buenas prácticas para gestionar
          accesos a nivel de negocio, operaciones y finanzas.
        </p>
      </div>

      {/* KPIs/Resumen */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Kpi k="Modelo" v="RBAC" note="Role-Based Access Control" />
        <Kpi k="Revisión de accesos" v="Trimestral" note="o ante cambio de puesto" />
        <Kpi k="2FA Requerido" v="Sí" note="Administradores y Finanzas" />
        <Kpi k="Registros" v="100% auditoría" note="altas, cambios y bajas" />
      </section>

      {/* Roles predefinidos */}
      <Section
        title="Roles predefinidos"
        description="Conjunto mínimo recomendado. Puedes ampliarlos según tu operación."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <h3 className="font-medium text-gray-800 dark:text-white">Administrador</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Acceso total a configuraciones y seguridad.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>Gestión de usuarios y roles</li>
              <li>Parámetros del sistema</li>
              <li>Auditoría y reportes globales</li>
            </ul>
            <div className="mt-3 space-x-2">
              <Pill>2FA</Pill> <Pill>Crítico</Pill>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <h3 className="font-medium text-gray-800 dark:text-white">Operaciones</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gestión de pedidos, rutas y repartidores.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>Ver/editar pedidos</li>
              <li>Asignar repartidores</li>
              <li>Consultar incidencias</li>
            </ul>
            <div className="mt-3 space-x-2">
              <Pill>Producción</Pill> <Pill>POD</Pill>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <h3 className="font-medium text-gray-800 dark:text-white">Finanzas</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Liquidaciones, cobros y conciliaciones.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>Ver/emitir facturas</li>
              <li>Reembolsos y abonos</li>
              <li>Reportes contables</li>
            </ul>
            <div className="mt-3 space-x-2">
              <Pill>Sensible</Pill> <Pill>2FA</Pill>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <h3 className="font-medium text-gray-800 dark:text-white">Atención al cliente</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Consulta de estado y resolución de tickets.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>Leer pedidos</li>
              <li>Registrar incidencias</li>
              <li>Reprogramaciones</li>
            </ul>
            <div className="mt-3 space-x-2">
              <Pill>Lectura</Pill> <Pill>Limitado</Pill>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <h3 className="font-medium text-gray-800 dark:text-white">Marketing</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Contenido, promociones y notificaciones.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>Campañas y cupones</li>
              <li>Plantillas de email/push</li>
              <li>Acceso limitado a métricas</li>
            </ul>
            <div className="mt-3 space-x-2">
              <Pill>Opt-in</Pill> <Pill>Restringido</Pill>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <h3 className="font-medium text-gray-800 dark:text-white">Repartidor</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              App móvil con acceso al reparto asignado.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>Ver paradas y rutas</li>
              <li>Capturar POD (foto/firma/PIN)</li>
              <li>Reportar incidencias</li>
            </ul>
            <div className="mt-3 space-x-2">
              <Pill>Móvil</Pill> <Pill>POD</Pill>
            </div>
          </div>
        </div>
      </Section>

      {/* Matriz de permisos (display) */}
      <Section
        title="Matriz de permisos (vista informativa)"
        description="Acciones clave por rol. Ajusta la matriz a tu realidad operativa."
      >
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Recurso / Acción</th>
                <th className="px-4 py-3 text-left">Admin</th>
                <th className="px-4 py-3 text-left">Ops</th>
                <th className="px-4 py-3 text-left">Finanzas</th>
                <th className="px-4 py-3 text-left">Soporte</th>
                <th className="px-4 py-3 text-left">Mkt</th>
                <th className="px-4 py-3 text-left">Repart.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {[
                ["Usuarios: crear/editar/bajar", "✓", "—", "—", "—", "—", "—"],
                ["Pedidos: ver", "✓", "✓", "✓", "✓", "✓ (limitado)", "✓ (asignados)"],
                ["Pedidos: editar/reasignar", "✓", "✓", "—", "—", "—", "—"],
                ["Finanzas: reembolsos", "✓", "—", "✓", "—", "—", "—"],
                ["Marketing: campañas", "✓", "—", "—", "—", "✓", "—"],
                ["Notificaciones: plantillas", "✓", "—", "—", "—", "✓", "—"],
                ["Rutas: ver", "✓", "✓", "—", "✓", "—", "✓ (propias)"],
                ["POD: capturar", "—", "—", "—", "—", "—", "✓"],
                ["Auditoría: leer", "✓", "✓ (limitado)", "✓", "—", "—", "—"],
              ].map((row, i) => (
                <tr key={i} className="text-gray-700 dark:text-gray-300">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Leyenda: ✓ permitido · — no permitido · “limitado” indica filtros o solo lectura.
        </p>
      </Section>

      {/* Ciclo de vida del usuario */}
      <Section
        title="Ciclo de vida del usuario"
        description="Puntos de control recomendados para mantener la higiene de accesos."
      >
        <FlowMini />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Alta</h4>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>Invitación por email/SSO</li>
              <li>2FA y contraseña fuerte</li>
              <li>Rol inicial acorde a funciones</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Mantenimiento</h4>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>Revisión trimestral de permisos</li>
              <li>Rotación de credenciales sensibles</li>
              <li>Capacitación continua</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Baja/Offboarding</h4>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>Revocar accesos de inmediato</li>
              <li>Transferir ownership de recursos</li>
              <li>Registro de auditoría</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Principios y buenas prácticas */}
      <Section
        title="Principios & buenas prácticas"
        description="Estándares para minimizar riesgos y mantener trazabilidad."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">Principios</h4>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li><strong>Mínimo privilegio:</strong> solo lo necesario para realizar el trabajo.</li>
              <li><strong>Separación de funciones:</strong> evita conflictos de interés (p. ej. Ops vs Finanzas).</li>
              <li><strong>Trazabilidad:</strong> registra quién, qué y cuándo en acciones sensibles.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">Buenas prácticas</h4>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>Revisar accesos ante cambios de puesto o baja.</li>
              <li>Habilitar 2FA para roles críticos.</li>
              <li>Usar grupos para asignaciones masivas y consistentes.</li>
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}
