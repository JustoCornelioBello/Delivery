"use client";

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-6">
      {/* Encabezado */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Esta política describe cómo <strong className="text-gray-900 dark:text-white">[RAZÓN SOCIAL / NOMBRE COMERCIAL]</strong> 
          (en adelante, “la App”, “nosotros”) trata tus datos personales cuando usas nuestros servicios de pedidos y delivery.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Última actualización: <strong>[DD/MM/AAAA]</strong> · Versión: <strong>v1.0</strong>
        </p>
      </header>

      {/* Aviso legal / Alcance */}
      <section className="rounded-xl border border-sky-300/40 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-700/50 dark:bg-sky-900/30 dark:text-sky-100">
        <p className="font-medium">Resumen</p>
        <p className="mt-1">
          Somos responsables del tratamiento de tus datos en la App. Esta política se
          aplica a clientes, repartidores y comercios que usen nuestro ecosistema.
          Debe leerse junto con nuestros <a href="/terminos" className="underline">Términos y Condiciones</a>.
        </p>
      </section>

      {/* 1. Responsable del tratamiento */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">1. Responsable del tratamiento</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          <strong>[RAZÓN SOCIAL]</strong>, RNC <strong>[RNC]</strong>, con domicilio en <strong>[DIRECCIÓN]</strong>.  
          Contacto privacidad: <strong>[EMAIL PRIVACIDAD]</strong> · <strong>[TELÉFONO]</strong>.
        </p>
      </section>

      {/* 2. Datos que tratamos */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">2. Datos que tratamos</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li><strong>Identificación:</strong> nombre, apellidos, documento (opcional), foto (opcional).</li>
          <li><strong>Contacto:</strong> email, teléfono, dirección de entrega.</li>
          <li><strong>Cuenta:</strong> credenciales cifradas, ajustes, preferencia de idioma, tokens de sesión.</li>
          <li><strong>Pedidos:</strong> historial, modalidades de pago, incidencias, reembolsos.</li>
          <li><strong>Ubicación:</strong> dirección y coordenadas aproximadas para entrega (si se permite).</li>
          <li><strong>Dispositivo/tecnología:</strong> IP, modelo, sistema operativo, identificadores del navegador, logs.</li>
          <li><strong>Marketing:</strong> preferencias de comunicación, interacción con campañas.</li>
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          No solicitamos categorías especiales de datos (salud, religión, etc.). Si nos las comunicas, se tratarán únicamente para gestionar tu solicitud y se eliminarán cuando no sean necesarias.
        </p>
      </section>

      {/* 3. Finalidades y bases legales */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          3. Finalidades y bases legales
        </h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 text-sm dark:border-gray-800">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Finalidad</th>
                <th className="px-4 py-3 text-left">Base legal</th>
                <th className="px-4 py-3 text-left">Ejemplos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="px-4 py-3">Prestación del servicio</td>
                <td className="px-4 py-3">Ejecución de contrato</td>
                <td className="px-4 py-3">Crear cuenta, gestionar pedidos, coordinar repartos.</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Atención al cliente</td>
                <td className="px-4 py-3">Interés legítimo / contrato</td>
                <td className="px-4 py-3">Resolver incidencias, reembolsos, quejas.</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Seguridad y fraude</td>
                <td className="px-4 py-3">Interés legítimo / obligación legal</td>
                <td className="px-4 py-3">Detección de abuso, verificación de identidad, logs.</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Facturación</td>
                <td className="px-4 py-3">Obligación legal</td>
                <td className="px-4 py-3">Comprobantes, impuestos, auditoría.</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Marketing y fidelización</td>
                <td className="px-4 py-3">Consentimiento / interés legítimo</td>
                <td className="px-4 py-3">Newsletters, cupones, notificaciones.</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Analítica y mejora</td>
                <td className="px-4 py-3">Interés legítimo</td>
                <td className="px-4 py-3">Métricas de uso, rendimiento, calidad.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Puedes retirar tu consentimiento en cualquier momento sin efectos retroactivos. El interés legítimo se pondera para equilibrar tus derechos y nuestras necesidades operativas.
        </p>
      </section>

      {/* 4. Cookies y tecnologías similares */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          4. Cookies y tecnologías similares
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Usamos cookies propias y de terceros para sesión, seguridad, analítica y marketing.
          Puedes gestionar tus preferencias desde la <strong>configuración de cookies</strong> de la App o navegador.
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
          <li><strong>Necesarias:</strong> login, seguridad, carrito.</li>
          <li><strong>Analíticas:</strong> rendimiento y uso (p. ej., páginas, tiempos).</li>
          <li><strong>Marketing:</strong> personalización de ofertas/notificaciones.</li>
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          Ver también nuestra <a href="/cookies" className="underline">Política de Cookies</a> (si aplica).
        </p>
      </section>

      {/* 5. Destinatarios y transferencias */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          5. Destinatarios y transferencias
        </h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li><strong>Comercios</strong> para preparar tu pedido y facturación.</li>
          <li><strong>Repartidores</strong> para recoger y entregar (acceso limitado).</li>
          <li><strong>Pasarelas de pago</strong> y bancos para procesar cobros (tokenización; no almacenamos datos completos de tarjeta).</li>
          <li><strong>Proveedores tecnológicos</strong> (hosting, mensajería, analítica) bajo contratos de encargo de tratamiento.</li>
          <li>Autoridades competentes cuando exista obligación legal.</li>
        </ul>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Si se realizan transferencias internacionales, aplicaremos garantías adecuadas (cláusulas contractuales tipo, evaluaciones de impacto, etc.).
        </p>
      </section>

      {/* 6. Plazos de conservación */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          6. Plazos de conservación
        </h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 text-sm dark:border-gray-800">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Dato</th>
                <th className="px-4 py-3 text-left">Plazo</th>
                <th className="px-4 py-3 text-left">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="px-4 py-3">Cuenta y perfil</td>
                <td className="px-4 py-3">Mientras esté activa + 12 meses</td>
                <td className="px-4 py-3">Historial básico y soporte</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Pedidos y facturación</td>
                <td className="px-4 py-3">5–10 años (según normativa)</td>
                <td className="px-4 py-3">Obligaciones fiscales y auditoría</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Logs de seguridad</td>
                <td className="px-4 py-3">90–180 días</td>
                <td className="px-4 py-3">Detección de fraude e incidentes</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Marketing</td>
                <td className="px-4 py-3">Hasta retirar consentimiento</td>
                <td className="px-4 py-3">Personalización/Promociones</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Al expirar los plazos, eliminamos o anonimizamos los datos de manera segura.
        </p>
      </section>

      {/* 7. Derechos del usuario */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          7. Tus derechos
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, 
          limitación y portabilidad. También puedes retirar el consentimiento y oponerte al 
          marketing directo.
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>Envía tu solicitud a <strong>[EMAIL PRIVACIDAD]</strong> desde el correo registrado.</li>
          <li>Adjunta datos necesarios para verificar tu identidad.</li>
          <li>Responderemos dentro de los plazos legales aplicables.</li>
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          Si consideras vulnerados tus derechos, puedes reclamar ante la autoridad de protección de datos de tu jurisdicción.
        </p>
      </section>

      {/* 8. Seguridad de la información */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          8. Seguridad de la información
        </h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>Cifrado en tránsito (TLS 1.2+) y en reposo (AES-256) cuando aplica.</li>
          <li>Control de accesos (RBAC), 2FA para cuentas sensibles y registro de eventos.</li>
          <li>Pruebas y auditorías periódicas de seguridad.</li>
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          Aunque aplicamos medidas razonables, ningún sistema es 100% infalible.
        </p>
      </section>

      {/* 9. Menores de edad */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          9. Menores de edad
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Nuestros servicios no están dirigidos a menores. Si detectamos registros de menores sin consentimiento válido, eliminaremos la cuenta y sus datos.
        </p>
      </section>

      {/* 10. Decisiones automatizadas / perfiles */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          10. Decisiones automatizadas y perfilado
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Podemos usar reglas automatizadas para prevenir fraude, priorizar rutas o personalizar promociones. 
          Puedes solicitar información sobre la lógica aplicada y oponerte en casos legalmente previstos.
        </p>
      </section>

      {/* 11. Cambios en la política */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          11. Cambios en esta política
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Podremos actualizar esta política por motivos legales u operativos. Publicaremos la versión vigente con fecha de actualización y, cuando corresponda, te notificaremos.
        </p>
      </section>

      {/* 12. Contacto */}
      <footer className="rounded-xl border border-emerald-300/50 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100">
        <p className="font-medium">Contacto de privacidad</p>
        <p className="mt-1">
          Email: <strong>[EMAIL PRIVACIDAD]</strong> · Tel: <strong>[TELÉFONO]</strong> · Dirección: <strong>[DIRECCIÓN]</strong>
        </p>
      </footer>
    </div>
  );
}
