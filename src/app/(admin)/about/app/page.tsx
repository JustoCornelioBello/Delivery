"use client";

export default function AboutAppPage() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Sobre la aplicación
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Nuestra app de delivery está diseñada para que los administradores puedan:
      </p>
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
        <li>Crear y organizar productos con variantes, combos y categorías.</li>
        <li>Gestionar pedidos en tiempo real (nuevos, activos, programados e historial).</li>
        <li>Controlar pagos, promociones y liquidaciones.</li>
        <li>Asignar repartidores y monitorear su rendimiento.</li>
        <li>Configurar zonas de entrega y disponibilidad.</li>
      </ul>
      <p className="text-gray-600 dark:text-gray-400">
        Todo con una interfaz moderna, clara y optimizada para cualquier dispositivo.
      </p>
    </div>
  );
}
