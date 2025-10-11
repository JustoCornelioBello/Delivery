"use client";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:to-gray-900 md:p-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Soporte & Ayuda — Delivery
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
            Bienvenido al centro de ayuda de <span className="font-medium text-gray-900 dark:text-white">Delivery</span>.
            Aquí encontrarás guías rápidas, solución de problemas frecuentes, recomendaciones de seguridad
            y nuestros canales oficiales de contacto.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#faq"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Ver preguntas frecuentes
            </a>
            <a
              href="#contacto"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              Contactar soporte
            </a>
            <a
              href="#estado"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100"
            >
              Estado de la plataforma
            </a>
          </div>
        </div>

        {/* fondo decorativo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-400/10"
        />
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Accesos rápidos
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="No puedo iniciar sesión"
            desc="Olvidé mi contraseña, correo no verificado o 2FA bloqueado."
            actionHref="#flujo-login"
            action="Ver solución"
          />
          <Card
            title="Pago rechazado"
            desc="Problemas con tarjeta, verificación 3D Secure o fondos insuficientes."
            actionHref="#pagos"
            action="Solucionar"
          />
          <Card
            title="Pedido no recibido"
            desc="Pedido marcado entregado, pero no llegó."
            actionHref="#entregas"
            action="Qué hacer"
          />
          <Card
            title="Notificaciones"
            desc="No recibo alertas en el teléfono ni por email."
            actionHref="#notificaciones"
            action="Revisar"
          />
          <Card
            title="Facturas y reembolsos"
            desc="Solicita tu comprobante o el seguimiento de un reembolso."
            actionHref="#facturacion"
            action="Ver guía"
          />
          <Card
            title="Cuenta & seguridad"
            desc="Sesiones activas, 2FA, cambio de correo y contraseñas."
            actionHref="#seguridad"
            action="Revisar"
          />
        </div>
      </section>

      {/* TIMELINE DE RESOLUCIÓN RÁPIDA */}
      <section id="flujo-login" className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Guía rápida: no puedo iniciar sesión
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sigue estos pasos en orden hasta resolver el acceso.
        </p>
        <ol className="mt-4 space-y-4">
          <Step
            title="1) Verifica tu correo y contraseña"
            body="Confirma que el email no tenga errores y que la contraseña sea la correcta. Si dudas, usa Recuperar contraseña."
          />
          <Step
            title="2) Revisa 2FA"
            body="Si tienes 2FA, utiliza tu app autenticadora. Si perdiste acceso, usa tus códigos de respaldo. En caso extremo, contáctanos para la verificación manual."
          />
          <Step
            title="3) Limpia caché o prueba otro dispositivo"
            body="A veces el navegador o la app cachean un estado inválido. Intenta en modo incógnito, otro navegador o el móvil."
          />
          <Step
            title="4) Restablece contraseña"
            body="Desde la pantalla de acceso, selecciona '¿Olvidaste tu contraseña?' y sigue las instrucciones que enviamos al correo."
          />
          <Step
            title="5) Contacta soporte"
            body="Si nada funcionó, escríbenos desde el correo registrado incluyendo tu número de teléfono para validar identidad."
          />
        </ol>
      </section>

      {/* PREGUNTAS FRECUENTES (ACORDEONES) */}
      <section id="faq" className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Preguntas frecuentes
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Faq
            title="No recibo notificaciones (push/email)"
            anchor="notificaciones"
          >
            <ul className="list-disc pl-5 text-sm leading-relaxed">
              <li>Verifica permisos de notificaciones en el sistema (iOS/Android).</li>
              <li>En la app: Ajustes &gt; Notificaciones &gt; habilita Push y Email.</li>
              <li>Desactiva el modo ahorro de energía que bloquea procesos en segundo plano.</li>
              <li>Revisa que el correo no esté en spam o filtrado por tu proveedor.</li>
            </ul>
          </Faq>

          <Faq title="Mi pago fue rechazado o quedó en pendiente" anchor="pagos">
            <ul className="list-disc pl-5 text-sm leading-relaxed">
              <li>Confirma saldo y habilitación de compras online/Internacionales.</li>
              <li>Si tu banco usa 3D Secure (OTP/SMS), completa la verificación.</li>
              <li>Prueba otra tarjeta o un wallet alternativo (ej. Apple/Google Pay).</li>
              <li>Un pago en “pendiente” suele liberarse en ≤72h si no se captura.</li>
            </ul>
          </Faq>

          <Faq title="Pedido marcado como entregado, pero no lo recibí" anchor="entregas">
            <ul className="list-disc pl-5 text-sm leading-relaxed">
              <li>Confirma la dirección y un teléfono operativo para el repartidor.</li>
              <li>Revisamos la prueba de entrega (POD): foto, PIN o firma.</li>
              <li>Si hubo error confirmado, gestionamos reenvío o reembolso según política.</li>
            </ul>
          </Faq>

          <Faq title="Cómo solicito factura o comprobante" anchor="facturacion">
            <ul className="list-disc pl-5 text-sm leading-relaxed">
              <li>Desde el historial de pedidos, pulsa “Solicitar factura”.</li>
              <li>Completa RNC/cédula, razón social y dirección fiscal.</li>
              <li>El comprobante se enviará por email y quedará disponible en tu perfil.</li>
            </ul>
          </Faq>

          <Faq title="Cambiar correo, contraseña o cerrar sesiones" anchor="seguridad">
            <ul className="list-disc pl-5 text-sm leading-relaxed">
              <li>Perfil &gt; Seguridad: cambia tu contraseña y activa 2FA.</li>
              <li>Perfil &gt; Dispositivos: cierra sesiones antiguas o no reconocidas.</li>
              <li>Para cambiar tu email, verifica el nuevo correo con el enlace que enviamos.</li>
            </ul>
          </Faq>

          <Faq title="Modificar o cancelar un pedido en curso" anchor="pedidos">
            <ul className="list-disc pl-5 text-sm leading-relaxed">
              <li>Si el pedido está “en preparación”, aún podemos modificar/cancelar.</li>
              <li>Si el repartidor ya salió, aplican cargos por cancelación.</li>
              <li>Para cambios de dirección, confirma si sigue dentro del radio de reparto.</li>
            </ul>
          </Faq>
        </div>
      </section>

      {/* BLOQUE DE SEGURIDAD */}
      <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
        <h2 className="text-lg font-semibold">Recomendaciones de seguridad</h2>
        <ul className="mt-2 list-disc pl-5 text-sm leading-relaxed">
          <li>Activa la <strong>verificación en dos pasos (2FA)</strong> en tu cuenta.</li>
          <li>Usa contraseñas largas (12+), únicas y con gestor de contraseñas.</li>
          <li>No compartas códigos de verificación ni enlaces de recuperación.</li>
          <li>Revisa dispositivos vinculados y cierra los que no reconozcas.</li>
        </ul>
      </section>

      {/* ESTADO DE LA PLATAFORMA */}
      <section id="estado" className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-900/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              Estado de la plataforma
            </h2>
            <p className="mt-1 text-sm text-emerald-800/90 dark:text-emerald-100/80">
              Consulta incidentes, mantenimientos y métricas de disponibilidad.
            </p>
          </div>
          <a
            href="https://status.delivery.com"
            target="_blank"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Ir a status.delivery.com
          </a>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          ¿Necesitas ayuda directa?
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <ContactCard
            title="Chat en la app"
            desc="Atención en tiempo real, todos los días de 8:00 a 22:00."
            pill="Tiempo medio: 3–5 min"
          />
          <ContactCard
            title="Correo"
            desc={
              <>
                Escribe a <a className="underline" href="mailto:soporte@delivery.com">soporte@delivery.com</a> desde tu correo registrado.
                Adjunta número de pedido si aplica.
              </>
            }
            pill="Respuesta: 6–24 h"
          />
          <ContactCard
            title="Teléfono"
            desc="Llámanos al +1 (809) 123-4567 con tu documento a mano para validar identidad."
            pill="Horario: 9:00–18:00"
          />
        </div>
      </section>

      {/* GLOSARIO RÁPIDO */}
      <section className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Glosario rápido</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <Glossary term="ETA" def="Tiempo estimado de llegada del pedido." />
          <Glossary term="POD" def="Prueba de entrega: foto, PIN, firma o geolocalización." />
          <Glossary term="2FA" def="Doble factor de autenticación para proteger tu cuenta." />
          <Glossary term="3D Secure" def="Verificación adicional de tu banco para pagos online." />
        </dl>
      </section>

      {/* NOTA LEGAL */}
      <footer className="mt-10 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <p>
          Para información sobre datos personales, consulta nuestra{" "}
          <a className="text-brand-600 underline" href="/privacidad">Política de Privacidad</a> y{" "}
          <a className="text-brand-600 underline" href="/cookies">Política de Cookies</a>. 
          El uso de la app se rige por los{" "}
          <a className="text-brand-600 underline" href="/terminos">Términos y Condiciones</a>.
        </p>
      </footer>
    </div>
  );
}

/* ---------------------------- UI helpers ---------------------------- */

function Card({
  title,
  desc,
  action,
  actionHref,
}: {
  title: string;
  desc: string;
  action: string;
  actionHref: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
      <a
        href={actionHref}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        {action}
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="opacity-70">
          <path d="M7.5 5l5 5-5 5" />
        </svg>
      </a>
    </div>
  );
}

function Step({ title, body }: { title: string; body: string }) {
  return (
    <li className="relative rounded-xl border border-gray-200 bg-white p-4 pl-10 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <span className="absolute left-3 top-4 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-semibold text-white">
        ✓
      </span>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{body}</p>
    </li>
  );
}

function Faq({
  title,
  children,
  anchor,
}: {
  title: string;
  children: React.ReactNode;
  anchor: string;
}) {
  return (
    <details id={anchor} className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm open:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        <svg
          className="h-4 w-4 text-gray-500 transition group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
        </svg>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function ContactCard({
  title,
  desc,
  pill,
}: {
  title: string;
  desc: React.ReactNode;
  pill: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{desc}</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {pill}
        </span>
      </div>
    </div>
  );
}

function Glossary({ term, def }: { term: string; def: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <dt className="text-sm font-semibold text-gray-900 dark:text-white">{term}</dt>
      <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">{def}</dd>
    </div>
  );
}
