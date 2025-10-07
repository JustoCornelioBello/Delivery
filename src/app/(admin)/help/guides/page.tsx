"use client";

export default function GuidesPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Guías rápidas
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Aprende paso a paso cómo usar las principales funciones.
      </p>

      <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
        <li>Cómo crear tu primer producto.</li>
        <li>Cómo configurar tus zonas de entrega.</li>
        <li>Cómo asignar repartidores a un pedido.</li>
      </ol>
    </div>
  );
}
