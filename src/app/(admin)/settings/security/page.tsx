"use client";

import React from "react";

/* ──────────────────────────────────────────────────────────────
   Átomos de UI (display-only)
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

const Pill = ({ children, tone = "default" as "default" | "ok" | "warn" | "danger" }) => {
  const styles =
    tone === "ok"
      ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
      : tone === "warn"
      ? "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300"
      : tone === "danger"
      ? "border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300"
      : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${styles}`}>
      {children}
    </span>
  );
};

const Callout = ({
  title,
  children,
  tone = "info" as "info" | "success" | "warning" | "danger",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
}) => {
  const palette: Record<string, string> = {
    info: "border-sky-300/40 bg-sky-50 text-sky-900 dark:border-sky-700/50 dark:bg-sky-900/30 dark:text-sky-200",
    success: "border-emerald-300/40 bg-emerald-50 text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-200",
    warning: "border-amber-300/40 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-200",
    danger: "border-rose-300/40 bg-rose-50 text-rose-900 dark:border-rose-700/50 dark:bg-rose-900/30 dark:text-rose-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${palette[tone]}`}>
      <p className="mb-1 text-sm font-semibold">{title}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
};

const KPI = ({ k, v, note }: { k: string; v: string; note?: string }) => (
  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
    <p className="text-[11px] uppercase tracking-wide text-gray-500">{k}</p>
    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{v}</p>
    {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Visual liviano — Diagrama de controles (identidad, datos, capa app)
─────────────────────────────────────────────────────────────── */
const MiniControls = () => (
  <svg viewBox="0 0 680 160" className="w-full max-w-5xl">
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="g2" x1="0" x2="1">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>
    </defs>
    <rect x="20" y="20" width="200" height="120" rx="12" fill="url(#g1)" opacity="0.95" />
    <text x="120" y="55" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">
      Identidad & Accesos
    </text>
    <text x="120" y="80" textAnchor="middle" fontSize="11" fill="white">
      SSO · 2FA · RBAC · Password Policy
    </text>

    <rect x="240" y="20" width="200" height="120" rx="12" fill="#0EA5E9" opacity="0.92" />
    <text x="340" y="55" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">
      Capa Aplicación
    </text>
    <text x="340" y="80" textAnchor="middle" fontSize="11" fill="white">
      Rate limiting · Logs · Alertas · CSP
    </text>

    <rect x="460" y="20" width="200" height="120" rx="12" fill="url(#g2)" opacity="0.95" />
    <text x="560" y="55" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">
      Datos & Transporte
    </text>
    <text x="560" y="80" textAnchor="middle" fontSize="11" fill="white">
      TLS 1.2+ · AES-256 · Backups · DLP
    </text>
  </svg>
);

/* ──────────────────────────────────────────────────────────────
   Página: Seguridad (informativa, con texto resaltado)
─────────────────────────────────────────────────────────────── */
export default function SecuritySettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Encabezado */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Seguridad</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Políticas y controles para proteger cuentas, datos y operaciones. Aquí se
          detallan <strong className="text-gray-900 dark:text-white">contraseñas</strong>,{" "}
          <strong className="text-gray-900 dark:text-white">2FA</strong>,{" "}
          <strong className="text-gray-900 dark:text-white">bloqueo de sesión</strong>,
          registros de acceso, cifrado, gestión de dispositivos y respuesta a incidentes.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="ok">MFA Requerido</Pill>
          <Pill>RBAC</Pill>
          <Pill tone="warn">Rotación credenciales</Pill>
          <Pill tone="danger">Auditoría obligatoria</Pill>
        </div>
      </div>

      {/* KPIs de higiene */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KPI k="2FA habilitado" v="> 95%" note="Usuarios con factor adicional" />
        <KPI k="Rotación de contraseñas" v="90 días" note="o ante incidente" />
        <KPI k="Tiempo de bloqueo (idle)" v="15–30 min" note="según rol/sensibilidad" />
        <KPI k="Logs retenidos" v="180 días" note="auditoría & forense" />
      </section>

      {/* Controles base */}
      <Section
        title="Identidad & acceso"
        description="Definición de quién entra, con qué garantías, y hasta dónde puede llegar."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">Política de contraseñas</h3>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>Mínimo <strong>12 caracteres</strong>; recomendable 14–16.</li>
              <li>Incluir <strong>mayúsculas, minúsculas, números y símbolos</strong>.</li>
              <li>Prohibido reutilizar últimas <strong>5 contraseñas</strong>.</li>
              <li>Bloqueo tras <strong>5 intentos fallidos</strong> (cooldown progresivo).</li>
              <li>Usar <strong>gestores de contraseñas</strong>; evitar compartir credenciales.</li>
            </ul>
            <Callout title="Requisito crítico" tone="warning">
              Para roles sensibles (Admin/Finanzas), exigir <strong>passphrase 16+</strong> + 2FA.
            </Callout>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h3 className="mb-2 font-medium text-gray-800 dark:text-white">2FA / MFA</h3>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>Preferir <strong>App TOTP</strong> (Google Authenticator, Authy).</li>
              <li>Permitir <strong>WebAuthn</strong> (llaves físicas) para admins.</li>
              <li>SMS solo como <strong>fallback</strong> y con alertas de cambio de SIM.</li>
              <li>Entregar <strong>códigos de respaldo</strong> y forzar su almacenamiento seguro.</li>
            </ul>
            <Callout title="Importante" tone="success">
              Activar 2FA de manera <strong>obligatoria</strong> para Administradores, Finanzas y cuentas de servicio.
            </Callout>
          </div>
        </div>
      </Section>

      {/* Sesiones, dispositivos, bloqueo */}
      <Section
        title="Sesiones, bloqueo & dispositivos"
        description="Protección contra uso indebido por sesiones largas o equipos compartidos."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Bloqueo por inactividad</h4>
            <ul className="list-disc pl-5">
              <li>Cierre automático: <strong>15–30 min</strong> sin actividad.</li>
              <li>Expiración de refresh tokens a las <strong>8–12 h</strong>.</li>
              <li>Bloqueo inmediato al cerrar navegador o cambiar IP (opcional).</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Gestión de dispositivos</h4>
            <ul className="list-disc pl-5">
              <li>Panel de sesiones activas con <strong>revocación 1 clic</strong>.</li>
              <li>Etiqueta de <strong>dispositivo confiable</strong> (máximo 30 días).</li>
              <li>Alertas por inicio desde <strong>nuevo dispositivo/ubicación</strong>.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Controles del navegador</h4>
            <ul className="list-disc pl-5">
              <li><strong>CSP</strong>, <strong>X-Frame-Options</strong>, <strong>SameSite</strong> y <strong>Secure cookies</strong>.</li>
              <li>Deshabilitar autocompletado en credenciales sensibles.</li>
              <li>Forzar <strong>HTTPS</strong> con HSTS (incl. subdominios).</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Cifrado & datos */}
      <Section
        title="Cifrado y protección de datos"
        description="End-to-end en tránsito y cifrado fuerte en reposo, con rotación planificada."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Transporte</h4>
            <ul className="list-disc pl-5">
              <li>TLS <strong>1.2+</strong> (recomendado 1.3) con suites modernas.</li>
              <li>Pinning opcional en apps móviles.</li>
              <li>Desactivar protocolos/algoritmos obsoletos.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">En reposo</h4>
            <ul className="list-disc pl-5">
              <li><strong>AES-256</strong> para datos en bases, volúmenes y backups.</li>
              <li>Gestión de llaves en <strong>KMS</strong>, con rotación <strong>anual</strong> o ante incidente.</li>
              <li>Clasificar datos: <em>Público / Interno / Sensible</em> · aplicar DLP.</li>
            </ul>
          </div>
        </div>
        <Callout title="Dato crítico" tone="info">
          Evitar almacenar <strong>PII</strong> innecesaria. Minimización y retención limitada (rule of least data).
        </Callout>
      </Section>

      {/* Logs, auditoría y monitoreo */}
      <Section
        title="Registros de acceso & monitoreo"
        description="Lo que no se registra, no existe. Observabilidad para prevenir y reaccionar."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">Qué registrar</h4>
            <ul className="list-disc pl-5">
              <li>Logins (IP, agente, resultado) y cambios de credenciales.</li>
              <li>Acciones sensibles: <strong>exportar datos</strong>, <strong>roles</strong>, <strong>reembolsos</strong>.</li>
              <li>Integraciones: errores, timeouts, reintentos.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">Alertas & respuestas</h4>
            <ul className="list-disc pl-5">
              <li>Detección de <strong>fuerza bruta</strong> y <strong>anomalías</strong>.</li>
              <li>Alertas en <strong>tiempo real</strong> para Admin/SecOps.</li>
              <li>Runbooks: pasos de mitigación y contacto de guardia.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">Retención</h4>
            <ul className="list-disc pl-5">
              <li>Logs app: <strong>90–180 días</strong> (según norma local).</li>
              <li>Auditoría crítica: <strong>12–24 meses</strong>.</li>
              <li>Hashing/integridad para evidencias forenses.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Incidentes: severidad y flujo */}
      <Section
        title="Gestión de incidentes"
        description="Clasificación, comunicación y resolución, con lecciones aprendidas."
      >
        <div className="overflow-x-auto rounded-xl border border-gray-200 text-sm dark:border-gray-800">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-left text-gray-700 dark:text-gray-300">
                <th className="px-4 py-3">Severidad</th>
                <th className="px-4 py-3">Ejemplos</th>
                <th className="px-4 py-3">SLA respuesta</th>
                <th className="px-4 py-3">Notificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="px-4 py-3"><Pill tone="danger">CRÍTICO</Pill></td>
                <td className="px-4 py-3">Exfiltración de datos, compromiso de llaves, caída total</td>
                <td className="px-4 py-3"><strong>T10</strong> min (respuesta) · <strong>T60</strong> min (contención)</td>
                <td className="px-4 py-3">Stakeholders + posible autoridad regulatoria</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Pill tone="warn">ALTO</Pill></td>
                <td className="px-4 py-3">Fugas parciales, DoS mitigable, errores masivos</td>
                <td className="px-4 py-3"><strong>T30</strong> min · contención <strong> 4h</strong></td>
                <td className="px-4 py-3">Equipos internos afectados</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Pill>MEDIO</Pill></td>
                <td className="px-4 py-3">Incidencias aisladas, errores de permisos</td>
                <td className="px-4 py-3">Dentro del día laboral</td>
                <td className="px-4 py-3">Equipo responsable</td>
              </tr>
              <tr>
                <td className="px-4 py-3"><Pill>BAJO</Pill></td>
                <td className="px-4 py-3">Alertas benignas, falsos positivos</td>
                <td className="px-4 py-3">Backlog</td>
                <td className="px-4 py-3">N/A</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">Flujo recomendado</h4>
            <ol className="list-decimal pl-5 text-gray-700 dark:text-gray-300">
              <li>Detección & triage (clasificar severidad).</li>
              <li>Contención (aislar sistemas/llaves comprometidas).</li>
              <li>Erradicación & remediación (parches, rotación, hardening).</li>
              <li>Recuperación (restaurar servicios con monitoreo reforzado).</li>
              <li>Post-mortem: causas raíz y acciones preventivas.</li>
            </ol>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">Comunicaciones</h4>
            <ul className="list-disc pl-5">
              <li>Mensaje claro, sin tecnicismos innecesarios.</li>
              <li>Indicar alcance, datos afectados y pasos para el usuario.</li>
              <li>Seguimiento con tiempos estimados y cierre formal.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Secure SDLC, dependencias y terceros */}
      <Section
        title="Secure SDLC & terceros"
        description="Seguridad desde el diseño y cadena de suministro controlada."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Desarrollo seguro</h4>
            <ul className="list-disc pl-5">
              <li>Revisión de código y escaneo SAST/DAST.</li>
              <li>Secretos fuera del repo; usar <strong>vault/KMS</strong>.</li>
              <li>Entornos separados: Dev/Stag/Prod.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Dependencias</h4>
            <ul className="list-disc pl-5">
              <li>Bloquear versiones; permitir solo repos confiables.</li>
              <li>Actualizar CVEs críticas en <strong> 48 h</strong>.</li>
              <li>SBOM para visibilidad y auditoría.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-1 font-medium text-gray-800 dark:text-white">Partners & SaaS</h4>
            <ul className="list-disc pl-5">
              <li>Evaluación de riesgos y cláusulas de seguridad.</li>
              <li>Principio de <strong>mínimo privilegio</strong> en integraciones.</li>
              <li>Logs dedicados por integración.</li>
            </ul>
          </div>
        </div>
        <div className="mt-4">
          <MiniControls />
        </div>
      </Section>

      {/* Educación y anti-phishing */}
      <Section
        title="Concienciación & anti-phishing"
        description="La primera línea de defensa son las personas."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">Buenas prácticas</h4>
            <ul className="list-disc pl-5">
              <li>No abrir adjuntos/enlaces sospechosos.</li>
              <li>Verificar dominios y certificados al iniciar sesión.</li>
              <li>Reportar intentos de phishing al canal de seguridad.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800">
            <h4 className="mb-2 font-medium text-gray-800 dark:text-white">Simulaciones & feedback</h4>
            <ul className="list-disc pl-5">
              <li>Simulaciones trimestrales con métricas de mejora.</li>
              <li>Refuerzo inmediato para equipos con mayor riesgo.</li>
              <li>Reconocimiento a buenas prácticas (gamificación).</li>
            </ul>
          </div>
        </div>
        <Callout title="Recordatorio clave" tone="warning">
          <strong>Nunca</strong> compartas códigos 2FA ni contraseñas, incluso si el mensaje parece “urgente”.
        </Callout>
      </Section>

      {/* Resumen ejecutivo con bullets fuertes */}
      <Section title="Resumen ejecutivo">
        <ul className="grid list-disc grid-cols-1 gap-3 pl-5 text-sm text-gray-800 dark:text-gray-200 md:grid-cols-2">
          <li><strong>2FA obligatorio</strong> para roles críticos; TOTP/WebAuthn preferidos.</li>
          <li><strong>Contraseñas 12+</strong> con complejidad; rotación y bloqueo por intentos.</li>
          <li><strong>Sesiones cortas</strong> + revocación de dispositivos 1-clic.</li>
          <li><strong>Cifrado TLS 1.2+</strong> en tránsito y <strong>AES-256</strong> en reposo.</li>
          <li><strong>Logs 180 días</strong> y tabla de severidad para incidentes.</li>
          <li><strong>Secure SDLC</strong>, secretos en vault y parches rápidos de CVEs.</li>
        </ul>
      </Section>
    </div>
  );
}
