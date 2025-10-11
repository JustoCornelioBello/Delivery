"use client";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Impresoras & Recibos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configuración y lineamientos para impresión de recibos, facturas y comprobantes
          en puntos de venta o sucursales. Aquí encontrarás las opciones de compatibilidad,
          formatos y buenas prácticas.
        </p>
      </div>

      {/* Sección de compatibilidad */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Compatibilidad de impresoras
        </h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong>Impresoras térmicas POS (58mm / 80mm):</strong> recomendadas por velocidad
            y bajo costo de mantenimiento.
          </li>
          <li>
            <strong>Impresoras láser o inyección:</strong> para facturas fiscales o comprobantes
            más formales.
          </li>
          <li>
            <strong>Soporte de conexión:</strong> USB, Bluetooth, Wi-Fi o Ethernet según el
            modelo.
          </li>
        </ul>
      </section>

      {/* Formatos de recibos */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Formatos de recibo soportados
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Los recibos se adaptan según el tipo de negocio y requerimientos fiscales.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="font-medium text-gray-800 dark:text-white">Formato simplificado</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Ideal para restaurantes, cafés y retail pequeño.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>Nombre del negocio</li>
              <li>Detalle de productos y precios</li>
              <li>Total y método de pago</li>
              <li>Fecha, hora y número de orden</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="font-medium text-gray-800 dark:text-white">Formato fiscal</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Para negocios que requieren facturación oficial.
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
              <li>Datos fiscales del emisor y receptor</li>
              <li>Detalle con impuestos desglosados</li>
              <li>Código QR o folio fiscal</li>
              <li>Firma digital (cuando aplique)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Buenas prácticas */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Buenas prácticas
        </h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            Mantén plantillas de impresión consistentes para reflejar tu identidad de marca.
          </li>
          <li>
            Evita saturar el recibo con demasiada información. Enfócate en lo esencial.
          </li>
          <li>
            Prueba las impresoras con distintos navegadores y sistemas operativos.
          </li>
          <li>
            Ofrece al cliente la opción de <strong>recibo digital</strong> por email o WhatsApp
            como alternativa.
          </li>
        </ul>
      </section>

      {/* Gráfico simple */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Flujo de impresión
        </h2>
        <div className="mt-4 flex justify-center">
          <svg
            viewBox="0 0 500 120"
            className="w-full max-w-3xl text-gray-500 dark:text-gray-400"
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
                <polygon points="0 0, 8 4, 0 8" fill="currentColor" />
              </marker>
            </defs>
            <rect x="10" y="40" width="120" height="40" rx="8" fill="#6366F1" />
            <text x="70" y="65" fill="white" textAnchor="middle">
              Pedido
            </text>
            <line x1="130" y1="60" x2="200" y2="60" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" />
            <rect x="200" y="40" width="120" height="40" rx="8" fill="#06B6D4" />
            <text x="260" y="65" fill="white" textAnchor="middle">
              Generar recibo
            </text>
            <line x1="320" y1="60" x2="390" y2="60" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" />
            <rect x="390" y="40" width="100" height="40" rx="8" fill="#22C55E" />
            <text x="440" y="65" fill="white" textAnchor="middle">
              Impresión
            </text>
          </svg>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          El pedido pasa a la generación de recibo y se envía a la impresora configurada
          en la sucursal o punto de venta.
        </p>
      </section>
    </div>
  );
}
