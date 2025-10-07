"use client";

export default function ReportIssuePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Reportar un problema
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Si algo no funciona correctamente, cuéntanos para poder ayudarte.
      </p>

      <form className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Asunto"
          className="w-full rounded-lg border p-3 text-sm dark:bg-gray-800 dark:border-gray-700"
        />
        <textarea
          placeholder="Describe el problema..."
          className="w-full rounded-lg border p-3 text-sm dark:bg-gray-800 dark:border-gray-700 min-h-[120px]"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-500 text-white py-2 hover:bg-brand-600"
        >
          Enviar reporte
        </button>
      </form>
    </div>
  );
}
