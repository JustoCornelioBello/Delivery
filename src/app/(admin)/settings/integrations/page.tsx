"use client";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Integración de la App
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Conecta la aplicación con tus sistemas, APIs y herramientas favoritas para 
          automatizar procesos, sincronizar datos y mejorar la experiencia de tus clientes.
        </p>
      </div>

      {/* Beneficios */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white">
            Sincronización
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Actualiza inventario, pedidos y usuarios en tiempo real entre plataformas.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white">
            Automatización
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dispara notificaciones, reportes o flujos de trabajo sin intervención manual.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white">
            Escalabilidad
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Conecta con nuevas apps y servicios a medida que tu negocio crece.
          </p>
        </div>
      </section>

      {/* Tipos de integración */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Métodos de integración
        </h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>API REST:</strong> para consultar y enviar información desde sistemas externos.
          </li>
          <li>
            <strong>Webhooks:</strong> recibe notificaciones automáticas cuando ocurre un evento 
            (pedido creado, pago confirmado, usuario registrado).
          </li>
          <li>
            <strong>SDKs & Plugins:</strong> integraciones listas para entornos móviles o frameworks específicos.
          </li>
          <li>
            <strong>Single Sign-On (SSO):</strong> facilita el inicio de sesión seguro con proveedores externos.
          </li>
        </ul>
      </section>

      {/* Visual de arquitectura */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Flujo de integración
        </h2>
        <div className="mt-4 flex justify-center">
          <svg
            viewBox="0 0 500 120"
            className="w-full max-w-3xl text-gray-500 dark:text-gray-400"
          >
            <defs>
              <marker
                id="arrow"
                markerWidth="8"
                markerHeight="8"
                refX="8"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="currentColor" />
              </marker>
            </defs>
            <rect x="10" y="40" width="120" height="40" rx="8" fill="#6366F1" />
            <text x="70" y="65" fill="white" textAnchor="middle">
              App
            </text>

            <line
              x1="130"
              y1="60"
              x2="200"
              y2="60"
              stroke="currentColor"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />

            <rect x="200" y="40" width="120" height="40" rx="8" fill="#06B6D4" />
            <text x="260" y="65" fill="white" textAnchor="middle">
              API / Webhook
            </text>

            <line
              x1="320"
              y1="60"
              x2="390"
              y2="60"
              stroke="currentColor"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />

            <rect x="390" y="40" width="100" height="40" rx="8" fill="#22C55E" />
            <text x="440" y="65" fill="white" textAnchor="middle">
              Sistema externo
            </text>
          </svg>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          La app se comunica con tus sistemas externos a través de API y Webhooks, 
          permitiendo flujos bidireccionales en tiempo real.
        </p>
      </section>
    </div>
  );
}
