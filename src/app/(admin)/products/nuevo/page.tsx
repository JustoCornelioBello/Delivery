import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CreateProduct from "@/components/products/nuevo/CreateProduct"; 
// 👆 Este será tu formulario de creación (debes tenerlo en components)

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear producto | Panel",
  description: "Formulario para crear un nuevo producto en la app de delivery",
};

export default function NuevoProductoPage() {
  return (
    <div className="p-6 space-y-6">
      <PageBreadcrumb pageTitle="Crear producto" />

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Nuevo producto
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Completa el formulario para registrar un nuevo producto en la tienda.
          </p>
        </header>

        {/* Aquí se renderiza el formulario */}
        <CreateProduct />
      </section>
    </div>
  );
}
