"use client";

export default function FAQPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Preguntas frecuentes
      </h1>
      <div className="space-y-3">
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium">¿Cómo hago un pedido?</summary>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Simplemente selecciona tus productos en la app, agrégalos al carrito y confirma la dirección de entrega.
          </p>
        </details>
        <details className="border rounded-lg p-3">
          <summary className="cursor-pointer font-medium">¿Qué métodos de pago aceptan?</summary>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Aceptamos tarjetas de crédito/débito, transferencias y pagos contra entrega en zonas seleccionadas.
          </p>
        </details>
      </div>
    </div>
  );
}
