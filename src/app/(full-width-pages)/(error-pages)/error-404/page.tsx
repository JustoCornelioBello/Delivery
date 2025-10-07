import GridShape from "@/components/common/GridShape";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Página no encontrada | Delivery",
  description:
    "La página que buscas no existe o fue movida en la aplicación Delivery.",
};

export default function Error404() {
  const year = new Date().getFullYear();

  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <GridShape />

      <div className="mx-auto w-full max-w-[520px] text-center">
        <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Página no encontrada
        </h2>
        <p className="mx-auto mb-8 max-w-[420px] text-base text-gray-600 dark:text-gray-400">
          Parece que la ruta que intentas abrir no existe o fue movida. Verifica la
          URL o vuelve al panel.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Ir al inicio
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Ver productos
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {year} · Delivery
      </p>
    </div>
  );
}
