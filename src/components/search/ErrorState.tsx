"use client";
export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void; }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
      <div className="font-medium">Ocurrió un error</div>
      <div className="mt-1 opacity-80">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700">
          Reintentar
        </button>
      )}
    </div>
  );
}
