// app/pedidos/layout.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function PedidosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const Tab = ({ href, label }: { href: string; label: string }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={[
          "rounded-lg px-3 py-1.5 text-sm",
          active
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
        ].join(" ")}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="p-6 space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pedidos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión de pedidos por estado.
          </p>
        </div>
        <nav className="flex gap-2">
          <Tab href="/pedidos/activos" label="Activos" />
          {/* Pon aquí después: /pedidos/en-camino, /pedidos/completados, /pedidos/cancelados */}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
