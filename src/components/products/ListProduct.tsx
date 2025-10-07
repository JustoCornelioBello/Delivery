"use client";

import { useEffect, useState } from "react";

// Tipos básicos (deben coincidir con los del admin)
type Tag = "nuevo" | "oferta" | "vegano" | "picante" | "sin-gluten";
type Category = "Hamburguesas" | "Pizzas" | "Bebidas" | "Postres" | "Combos" | "Extras";

type Variant = { id: string; name: string; priceDelta: number };
type Extra = { id: string; name: string; price: number };

type Product = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  category: Category;
  stock?: number;
  isAvailable?: boolean;
  tags?: Tag[];
  variants?: Variant[];
  extras?: Extra[];
};

const LS_KEY = "delivery_products_v1";
const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(
    isNaN(n) ? 0 : n
  );

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        setProducts(JSON.parse(raw));
      } catch {
        setProducts([]);
      }
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Menú de productos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Explora nuestro catálogo. (Datos desde LocalStorage)
        </p>
      </header>

      {/* Grid de productos */}
      {products.length === 0 ? (
        <p className="text-gray-500">No hay productos disponibles.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm"
            >
              {/* Imagen */}
              <div className="relative h-44 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
                {p.tags?.length ? (
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Info */}
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="line-clamp-1 text-base font-medium text-gray-800 dark:text-white">
                      {p.name}
                    </h4>
                    <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {p.description || "Sin descripción"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {money(p.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{p.category}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5",
                      p.isAvailable
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
                    ].join(" ")}
                  >
                    {p.isAvailable ? "Disponible" : "No disponible"}
                  </span>
                </div>

                {/* Botón simulado de compra */}
                <button
                  className="mt-2 w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                  disabled={!p.isAvailable}
                >
                  {p.isAvailable ? "Agregar al carrito" : "Agotado"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
