"use client";

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-6">
      {/* Encabezado */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Términos y Condiciones de Uso
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Bienvenido/a a <strong className="text-gray-900 dark:text-white">[NOMBRE COMERCIAL / APP]</strong>.
          Estos Términos y Condiciones regulan el acceso y uso de nuestra aplicación y
          servicios de entrega. Al crear una cuenta o utilizar la app, aceptas íntegramente
          estos Términos.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Última actualización: <strong>[DD/MM/AAAA]</strong> · Versión: <strong>v1.0</strong>
        </p>
      </header>

      {/* Aclaración legal */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
        <p className="font-medium">Nota importante</p>
        <p className="mt-1">
          Este documento es informativo y debe ser revisado por tu asesoría legal.
          Adapta referencias normativas, políticas de consumo y protección de datos
          aplicables a tu jurisdicción (p. ej., <em>República Dominicana</em>).
        </p>
      </section>

      {/* 1. Identidad del proveedor */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">1. Identidad del proveedor</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          El servicio es operado por <strong>[RAZÓN SOCIAL]</strong>, con RNC <strong>[RNC]</strong>,
          domicilio en <strong>[DIRECCIÓN FISCAL]</strong>, correo de contacto{" "}
          <strong>[EMAIL SOPORTE]</strong> y teléfono <strong>[TEL SOPORTE]</strong>.
        </p>
      </section>

      {/* 2. Objeto del servicio */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">2. Objeto del servicio</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          La app permite a los usuarios realizar pedidos de productos o servicios a
          establecimientos afiliados (“Comercios”), así como coordinar la entrega
          mediante repartidores propios o de terceros (“Repartidores”).
        </p>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>Intermediación tecnológica entre clientes, comercios y repartidores.</li>
          <li>Gestión de pedidos, pagos, seguimiento y notificaciones.</li>
          <li>Opcionalmente: facturación, soporte y herramientas de fidelización.</li>
        </ul>
      </section>

      {/* 3. Cuenta de usuario */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">3. Cuenta de usuario</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>Debes ser mayor de edad y proporcionar datos veraces.</li>
          <li>Eres responsable de la confidencialidad de tus credenciales.</li>
          <li>Notifica acceso no autorizado, pérdida o robo de tu dispositivo.</li>
          <li>Podemos suspender cuentas por uso fraudulento, abuso o incumplimiento.</li>
        </ul>
      </section>

      {/* 4. Pedidos, disponibilidad y precios */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">4. Pedidos, disponibilidad y precios</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Los precios, stock y tiempos de preparación dependen del Comercio. Los
          pedidos están sujetos a confirmación.
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Mostramos precios con impuestos aplicables cuando corresponda.</li>
          <li>Las imágenes son referenciales; puede haber variaciones.</li>
          <li>Promociones y cupones están sujetos a términos específicos.</li>
        </ul>
      </section>

      {/* 5. Entrega y logística */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">5. Entrega y logística</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>El rango de entrega y ETA son estimaciones y pueden variar por tráfico, clima o disponibilidad.</li>
          <li>Podrán existir cargos adicionales por distancia, zonas restringidas o esperas.</li>
          <li>Si no estás en la dirección, el repartidor puede reintentar o devolver el pedido; pueden aplicar cargos.</li>
          <li>Prueba de entrega (POD): firma, PIN, foto u otro método equivalente.</li>
        </ul>
      </section>

      {/* 6. Cancelaciones, reembolsos y quejas */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">6. Cancelaciones, reembolsos y quejas</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Las cancelaciones están sujetas al estado del pedido (preparación/recogida/entrega).
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Reembolsos: totales o parciales según la evaluación del caso.</li>
          <li>Plazo de solicitud: dentro de <strong>[X días]</strong> desde la entrega.</li>
          <li>Vías de contacto: app, email <strong>[EMAIL SOPORTE]</strong> o teléfono <strong>[TEL]</strong>.</li>
        </ul>
      </section>

      {/* 7. Pagos y facturación */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">7. Pagos y facturación</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>Medios: tarjetas, wallets, pago contra entrega (según zona), u otros integrados.</li>
          <li>Procesamiento seguro a través de pasarelas certificadas.</li>
          <li>La facturación fiscal (si aplica) puede emitirse por el Comercio o por <strong>[RAZÓN SOCIAL]</strong>, según el caso.</li>
        </ul>
      </section>

      {/* 8. Propinas y reseñas */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">8. Propinas y reseñas</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Las propinas son voluntarias y se destinan al repartidor. Las reseñas deben
          ser honestas, respetuosas y no infringir derechos de terceros.
        </p>
      </section>

      {/* 9. Conducta del usuario (usos prohibidos) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">9. Conducta del usuario</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>Prohibido el fraude, la suplantación o el abuso de promociones.</li>
          <li>No interferir con el funcionamiento de la app o sus sistemas.</li>
          <li>No usar la app para actividades ilícitas o contrarias al orden público.</li>
        </ul>
      </section>

      {/* 10. Contenido y propiedad intelectual */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">10. Propiedad intelectual</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          La app, marcas, logotipos, código y contenidos son propiedad de{" "}
          <strong>[RAZÓN SOCIAL]</strong> o de sus licenciantes. No se concede licencia
          salvo autorización expresa.
        </p>
      </section>

      {/* 11. Privacidad y datos personales */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">11. Privacidad y datos personales</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          El tratamiento de datos se rige por nuestra{" "}
          <a href="/politica-de-privacidad" className="text-brand-600 underline">
            Política de Privacidad
          </a>
          . Incluye finalidad, base legal, conservación, derechos ARCO y medidas de seguridad.
        </p>
      </section>

      {/* 12. Terceros y enlaces */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">12. Servicios de terceros</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          La app puede integrarse con pasarelas de pago, mensajería y mapas. El uso de
          tales servicios se sujeta a sus propios términos y políticas.
        </p>
      </section>

      {/* 13. Responsabilidad y limitaciones */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">13. Responsabilidad</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>El servicio se ofrece “tal cual”, sin garantías implícitas de disponibilidad continua.</li>
          <li>No seremos responsables por causas de fuerza mayor o caso fortuito (clima extremo, cortes, etc.).</li>
          <li>Nuestra responsabilidad se limita, en su caso, al monto efectivamente pagado por el pedido afectado.</li>
        </ul>
      </section>

      {/* 14. Suspensión y terminación */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">14. Suspensión y terminación</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Podemos suspender o dar de baja cuentas que incumplan estos Términos, sin
          perjuicio de las acciones legales que correspondan.
        </p>
      </section>

      {/* 15. Modificaciones a los Términos */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">15. Modificaciones</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Podremos actualizar estos Términos para reflejar cambios operativos o legales.
          Publicaremos la nueva versión con fecha de vigencia y, cuando corresponda,
          te notificaremos por la app o correo.
        </p>
      </section>

      {/* 16. Legislación aplicable y jurisdicción */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          16. Legislación aplicable y jurisdicción
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Estos Términos se rigen por las leyes de <strong>[PAÍS / JURISDICCIÓN]</strong>. Cualquier
          controversia se someterá a los tribunales competentes de <strong>[CIUDAD / PAÍS]</strong>,
          sin perjuicio de derechos irrenunciables del consumidor.
        </p>
      </section>

      {/* 17. Contacto y soporte */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">17. Contacto</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>Correo: <strong>[EMAIL SOPORTE]</strong></li>
          <li>Teléfono/WhatsApp: <strong>[TEL SOPORTE]</strong></li>
          <li>Horario de atención: <strong>[HORARIO]</strong></li>
        </ul>
      </section>

      {/* Aceptación */}
      <footer className="rounded-xl border border-emerald-300/50 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100">
        <p className="font-medium">Aceptación</p>
        <p className="mt-1">
          Al registrarte y/o utilizar la app, reconoces haber leído y aceptado
          estos Términos y Condiciones.
        </p>
      </footer>
    </div>
  );
}
