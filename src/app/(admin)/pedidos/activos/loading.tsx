// app/pedidos/activos/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-32 rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900" />
    </div>
  );
}
