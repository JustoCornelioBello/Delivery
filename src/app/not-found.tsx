"use client";

import GridShape from "@/components/common/GridShape";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      {/* Fondo de cuadrícula */}
      <GridShape />

      {/* Contenido */}
      <div className="relative z-10 mx-auto w-full max-w-[720px] text-center">
        {/* Camioncito animado */}
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <TruckIcon className="h-9 w-9 text-brand-600 motion-safe:animate-[float_3s_ease-in-out_infinite] dark:text-brand-400" />
        </div>

        <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          404
        </h1>
        <p className="mt-2 text-xl font-semibold text-gray-800 dark:text-white/90">
          Página no encontrada
        </p>
        <p className="mx-auto mt-3 max-w-[560px] text-base text-gray-600 dark:text-gray-400">
          Puede que el enlace haya cambiado, el recurso se movió o nunca existió. 
          Mientras tanto, aquí tienes algunas rutas útiles para continuar.
        </p>

        {/* Tarjeta con sugerencias rápidas */}
        <div className="mx-auto mt-8 grid w-full gap-4 sm:grid-cols-2">
          <CardLink
            title="Ir al Panel"
            desc="Resumen de ventas, pedidos y actividad reciente."
            href="/"
          />
          <CardLink
            title="Ver Productos"
            desc="Gestiona el catálogo: crea, edita o desactiva."
            href="/products"
          />
          <CardLink
            title="Pedidos Activos"
            desc="Monitorea el estado en tiempo real."
            href="/orders"
          />
          <CardLink
            title="Clientes"
            desc="Consulta historial y preferencias."
            href="/customers"
          />
        </div>

        {/* CTA principales */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Volver al inicio
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Volver atrás
          </button>

          <a
            href="mailto:soporte@delivery.app?subject=Reporte%20404&body=Hola%2C%20encontr%C3%A9%20un%20404%20en%20la%20ruta%3A%20"
            className="inline-flex items-center gap-2 rounded-lg border border-transparent px-5 py-3 text-sm font-medium text-brand-700 hover:underline dark:text-brand-400"
          >
            Reportar un problema
          </a>
        </div>

        {/* Tips informativos */}
        <div className="mx-auto mt-8 max-w-[640px] rounded-xl border border-gray-200 bg-white/70 p-4 text-left shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/60">
          <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white/90">
            Sugerencias
          </h3>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>• Verifica que la URL esté bien escrita.</li>
            <li>• Si llegaste desde un enlace, quizá el contenido fue movido.</li>
            <li>• Usa los accesos rápidos para continuar tu flujo.</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <p className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {year} · Delivery
      </p>

      {/* Animación keyframes (flotar) */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/* ----------------- Componentes auxiliares ----------------- */
function CardLink({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 dark:text-white/90 dark:group-hover:text-brand-400">
            {title}
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
        </div>
        <span className="ml-3 mt-1 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition group-hover:bg-brand-50 group-hover:text-brand-700 dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-600">
          ↗
        </span>
      </div>
    </Link>
  );
}

function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 7a2 2 0 012-2h8v10H5a2 2 0 01-2-2V7z"
        className="fill-current opacity-90"
      />
      <path
        d="M13 8h5l3 3v4a2 2 0 01-2 2h-6V8z"
        className="fill-current opacity-60"
      />
      <circle cx="7" cy="18" r="2" className="fill-gray-900 dark:fill-white" />
      <circle cx="17" cy="18" r="2" className="fill-gray-900 dark:fill-white" />
      <path d="M18 11h2l-2-2v2z" className="fill-white/80" />
    </svg>
  );
}
