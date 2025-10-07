// app/pedidos/activos/error.tsx
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
      <p>Ocurrió un error al cargar los pedidos activos.</p>
      <pre className="mt-2 whitespace-pre-wrap text-xs opacity-80">{error.message}</pre>
      <button
        onClick={reset}
        className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
      >
        Reintentar
      </button>
    </div>
  );
}
