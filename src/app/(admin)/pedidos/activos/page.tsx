// app/pedidos/activos/page.tsx
export const metadata = {
  title: "Pedidos activos",
  description: "Listado de pedidos en estado activo",
};

export default function PedidosActivosPage() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pedidos activos</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">0 pedidos</span>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Aquí verás la lista de pedidos activos. (contenido placeholder)
      </div>
    </section>
  );
}
