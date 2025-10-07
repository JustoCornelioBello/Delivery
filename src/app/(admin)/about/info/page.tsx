"use client";

export default function InfoPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Información general
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        La plataforma funciona bajo un modelo SaaS (Software as a Service),
        lo que permite a los negocios acceder desde cualquier lugar con conexión
        a internet.
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        Se garantiza seguridad en el manejo de datos, pagos encriptados y soporte
        técnico constante para asegurar la continuidad del servicio.
      </p>
    </div>
  );
}
