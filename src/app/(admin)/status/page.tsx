"use client";

export default function StatusPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Estado del sistema
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Revisa en tiempo real si los servicios están funcionando correctamente.
      </p>

      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500"></span>
          API principal: Operativa
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500"></span>
          Pagos: Operativo
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
          Notificaciones: Con retrasos
        </li>
      </ul>
    </div>
  );
}
