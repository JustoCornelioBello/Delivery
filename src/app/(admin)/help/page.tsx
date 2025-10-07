"use client";

export default function HelpCenterPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Centro de ayuda
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Encuentra respuestas rápidas y aprende a usar la plataforma Delivery.
      </p>

      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
        <li>¿Cómo crear y gestionar productos?</li>
        <li>¿Cómo funcionan los pagos y liquidaciones?</li>
        <li>¿Cómo asignar pedidos a repartidores?</li>
      </ul>
    </div>
  );
}
