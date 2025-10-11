"use client";

export default function CookiesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Política de Cookies
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Esta política explica cómo <strong className="text-gray-900 dark:text-white">[NOMBRE DE LA APP]</strong> 
          utiliza cookies y tecnologías similares cuando navegas en nuestra plataforma.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Última actualización: <strong>[DD/MM/AAAA]</strong>
        </p>
      </header>

      {/* Qué son */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          1. ¿Qué son las cookies?
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Son pequeños archivos de texto que se guardan en tu dispositivo cuando
          visitas un sitio web o usas una app. Sirven para recordar tus preferencias,
          mejorar la experiencia de usuario y ofrecerte contenido más relevante.
        </p>
      </section>

      {/* Tipos */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          2. Tipos de cookies que usamos
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <strong>Cookies necesarias:</strong> permiten el correcto funcionamiento
            de la app (ej. iniciar sesión, mantener tu carrito, seguridad).
          </li>
          <li>
            <strong>Cookies de preferencias:</strong> guardan tu idioma, ubicación
            o configuración para que no tengas que reingresarla cada vez.
          </li>
          <li>
            <strong>Cookies analíticas:</strong> nos ayudan a medir el uso de la app,
            detectar errores y mejorar el rendimiento.
          </li>
          <li>
            <strong>Cookies de marketing:</strong> usadas para mostrarte ofertas y
            promociones personalizadas en base a tu interacción.
          </li>
        </ul>
      </section>

      {/* Herramientas de terceros */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          3. Cookies de terceros
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Algunas cookies provienen de servicios externos que utilizamos, como
          <strong> Google Analytics</strong> para analítica, o <strong>Stripe/PayPal</strong> 
          para pagos seguros. Estos proveedores tienen sus propias políticas de privacidad
          y cookies.
        </p>
      </section>

      {/* Control del usuario */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          4. ¿Cómo puedes controlar las cookies?
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Puedes configurar tu navegador o la app para aceptar, rechazar o eliminar cookies.
          Ten en cuenta que deshabilitar algunas puede afectar el funcionamiento de la app.
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li>Google Chrome → Configuración &gt; Privacidad y seguridad &gt; Cookies.</li>
          <li>Safari → Preferencias &gt; Privacidad.</li>
          <li>Firefox → Opciones &gt; Privacidad &amp; Seguridad.</li>
          <li>Microsoft Edge → Configuración &gt; Cookies y permisos de sitio.</li>
        </ul>
      </section>

      {/* Cambios */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          5. Cambios en esta política
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Podremos actualizar esta política para adaptarla a cambios legales o técnicos.
          Siempre te mostraremos la versión vigente en la app y te notificaremos si hay
          cambios relevantes.
        </p>
      </section>

      {/* Contacto */}
      <footer className="rounded-xl border border-emerald-300/50 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100">
        <p className="font-medium">Contacto</p>
        <p className="mt-1">
          Si tienes dudas sobre nuestra política de cookies, escríbenos a:{" "}
          <strong>[EMAIL SOPORTE]</strong>
        </p>
      </footer>
    </div>
  );
}
