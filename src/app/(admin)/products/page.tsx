// app/productos/page.tsx (ajusta la ruta si usas otra carpeta de segmento)
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ListProduct from "@/components/products/ListProduct";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos | Panel",
  description: "Listado de productos de la app de delivery",
};

export default function ProductosPage() {
  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumb pageTitle="Productos" />

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Lista de productos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona y visualiza los productos creados.
          </p>
        </header>

        {/* Tu listado real */}
        <ListProduct />
      </section>
    </div>
  );
}
