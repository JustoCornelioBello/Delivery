"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

/* ───────────────────── Tipos ───────────────────── */
type Tag = "nuevo" | "oferta" | "vegano" | "picante" | "sin-gluten";
type Category = "Hamburguesas" | "Pizzas" | "Bebidas" | "Postres" | "Combos" | "Extras";

type Variant = { id: string; name: string; priceDelta: number };
type Extra = { id: string; name: string; price: number };

type Product = {
  id: string;
  name: string;
  description?: string;
  image?: string; // Data URL o URL pública
  price: number;
  category: Category;
  stock?: number;
  isAvailable?: boolean;
  tags?: Tag[];
  variants?: Variant[];
  extras?: Extra[];
  createdAt: string;
  updatedAt: string;
};

/* ───────────────────── Utils ───────────────────── */
const CATEGORIES: Category[] = [
  "Hamburguesas",
  "Pizzas",
  "Bebidas",
  "Postres",
  "Combos",
  "Extras",
];

const TAGS: Tag[] = ["nuevo", "oferta", "vegano", "picante", "sin-gluten"];

const uid = () => Math.random().toString(36).slice(2, 10);
const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(
    isNaN(n) ? 0 : n
  );

const LS_KEY = "delivery_products_v1";

/* ───────────────────── Página ───────────────────── */
export default function AdminProductosPage() {
  /* ---------- Estado del catálogo ---------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ---------- Estado del formulario ---------- */
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<Category>("Hamburguesas");
  const [stock, setStock] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [image, setImage] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [variants, setVariants] = useState<Variant[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);

  /* ---------- Cargar/guardar en localStorage ---------- */
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const parsed: Product[] = JSON.parse(raw);
        setProducts(parsed);
      } catch {
        // no-op
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(products));
  }, [products]);

  /* ---------- Imagen (file -> DataURL) ---------- */
  const onPickFile = async (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ""));
    reader.readAsDataURL(f);
  };

  /* ---------- Helpers de tags/variants/extras ---------- */
  const toggleTag = (t: Tag) => {
    setTags((curr) =>
      curr.includes(t) ? curr.filter((x) => x !== t) : [...curr, t]
    );
  };

  const addVariant = () =>
    setVariants((v) => [...v, { id: uid(), name: "", priceDelta: 0 }]);
  const updateVariant = (id: string, patch: Partial<Variant>) =>
    setVariants((v) => v.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeVariant = (id: string) =>
    setVariants((v) => v.filter((it) => it.id !== id));

  const addExtra = () =>
    setExtras((v) => [...v, { id: uid(), name: "", price: 0 }]);
  const updateExtra = (id: string, patch: Partial<Extra>) =>
    setExtras((v) => v.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeExtra = (id: string) =>
    setExtras((v) => v.filter((it) => it.id !== id));

  /* ---------- Reset form ---------- */
  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Hamburguesas");
    setStock("");
    setIsAvailable(true);
    setTags([]);
    setImage(undefined);
    setVariants([]);
    setExtras([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  /* ---------- Submit (Crear / Actualizar) ---------- */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const p = Number(price);
    if (!name.trim()) return alert("El nombre es obligatorio.");
    if (isNaN(p) || p <= 0) return alert("Precio inválido.");

    const base: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
      name: name.trim(),
      description: description.trim(),
      image,
      price: p,
      category,
      stock: stock ? Number(stock) : undefined,
      isAvailable,
      tags,
      variants: variants.filter((v) => v.name.trim()),
      extras: extras.filter((x) => x.name.trim()),
    };

    const now = new Date().toISOString();

    if (editingId) {
      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === editingId
            ? { ...prod, ...base, updatedAt: now }
            : prod
        )
      );
      resetForm();
      return;
    }

    const newProduct: Product = {
      id: uid(),
      ...base,
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);
    resetForm();
  };

  /* ---------- Editar / Eliminar ---------- */
  const onEdit = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    setEditingId(prod.id);
    setName(prod.name);
    setDescription(prod.description || "");
    setPrice(String(prod.price));
    setCategory(prod.category);
    setStock(
      typeof prod.stock === "number" && !isNaN(prod.stock)
        ? String(prod.stock)
        : ""
    );
    setIsAvailable(!!prod.isAvailable);
    setTags(prod.tags || []);
    setImage(prod.image);
    setVariants((prod.variants || []).map((v) => ({ ...v, id: uid() })));
    setExtras((prod.extras || []).map((x) => ({ ...x, id: uid() })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
  };

  /* ---------- Totales (ejemplo rápido de cálculo previo) ---------- */
  const avgPrice = useMemo(
    () =>
      products.length
        ? products.reduce((a, b) => a + b.price, 0) / products.length
        : 0,
    [products]
  );

  /* ───────────────────── Render ───────────────────── */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {editingId ? "Editar producto" : "Crear nuevo producto"}
          </h1>
          <p className="text-gray-500">
            Administra tu catálogo. (Diseño, sin backend)
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
            Total: <b>{products.length}</b>
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
            Precio prom.: <b>{money(avgPrice)}</b>
          </span>
        </div>
      </header>

      {/* Card Formulario */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna 1 */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Nombre *</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Hamburguesa Clásica"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Descripción</label>
              <textarea
                className="min-h-[92px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del producto"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Precio *</label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(",", "."))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Stock</label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  inputMode="numeric"
                  value={stock}
                  onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">Categoría</label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <label className="mt-6 inline-flex cursor-pointer items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                Disponible
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => {
                  const active = tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={[
                        "rounded-full px-3 py-1 text-xs",
                        active
                          ? "bg-brand-500 text-white"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                      ].join(" ")}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columna 2: Imagen */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-600">Imagen</label>
              {image ? (
                <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-end justify-between p-2">
                    <button
                      type="button"
                      className="rounded-lg bg-black/50 px-3 py-1 text-xs text-white"
                      onClick={() => setImage(undefined)}
                    >
                      Quitar
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-black/50 px-3 py-1 text-xs text-white"
                      onClick={() => fileRef.current?.click()}
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Subir imagen
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />
              <p className="mt-2 text-xs text-gray-400">
                Recomendado: 800×600px (JPG/PNG). Se guarda localmente (sin backend).
              </p>
            </div>

            {/* Variantes */}
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium">Variantes</h4>
                <button
                  type="button"
                  onClick={addVariant}
                  className="rounded-lg bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
                >
                  + Añadir
                </button>
              </div>
              <div className="space-y-2">
                {variants.length === 0 && (
                  <p className="text-xs text-gray-500">Sin variantes.</p>
                )}
                {variants.map((v) => (
                  <div key={v.id} className="grid grid-cols-12 items-center gap-2">
                    <input
                      className="col-span-7 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                      placeholder="Nombre (Ej: Doble)"
                      value={v.name}
                      onChange={(e) => updateVariant(v.id, { name: e.target.value })}
                    />
                    <input
                      className="col-span-4 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                      inputMode="decimal"
                      placeholder="+ Precio"
                      value={String(v.priceDelta)}
                      onChange={(e) =>
                        updateVariant(v.id, {
                          priceDelta: Number(e.target.value.replace(",", ".")) || 0,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(v.id)}
                      className="col-span-1 rounded-lg bg-red-50 px-2 py-2 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium">Extras</h4>
                <button
                  type="button"
                  onClick={addExtra}
                  className="rounded-lg bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800"
                >
                  + Añadir
                </button>
              </div>
              <div className="space-y-2">
                {extras.length === 0 && (
                  <p className="text-xs text-gray-500">Sin extras.</p>
                )}
                {extras.map((x) => (
                  <div key={x.id} className="grid grid-cols-12 items-center gap-2">
                    <input
                      className="col-span-7 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                      placeholder="Nombre (Ej: Tocineta)"
                      value={x.name}
                      onChange={(e) => updateExtra(x.id, { name: e.target.value })}
                    />
                    <input
                      className="col-span-4 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                      inputMode="decimal"
                      placeholder="+ Precio"
                      value={String(x.price)}
                      onChange={(e) =>
                        updateExtra(x.id, {
                          price: Number(e.target.value.replace(",", ".")) || 0,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeExtra(x.id)}
                      className="col-span-1 rounded-lg bg-red-50 px-2 py-2 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna 3: Acciones */}
          <div className="flex flex-col justify-between">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 text-sm font-medium">Resumen</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <li>
                  <b>Precio base:</b> {money(Number(price))}
                </li>
                <li>
                  <b>Variantes:</b> {variants.length}
                </li>
                <li>
                  <b>Extras:</b> {extras.length}
                </li>
                <li>
                  <b>Etiquetas:</b> {tags.length ? tags.join(", ") : "—"}
                </li>
                <li>
                  <b>Estado:</b> {isAvailable ? "Disponible" : "No disponible"}
                </li>
              </ul>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                className="w-1/3 rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
                onClick={resetForm}
              >
                Limpiar
              </button>
              <button
                type="submit"
                className="w-2/3 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                {editingId ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Listado */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Inventario</h3>
          <span className="text-sm text-gray-500">
            {products.length} producto(s)
          </span>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no has creado productos.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={p.name}
                      src={p.image}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
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

                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="line-clamp-1 font-medium">{p.name}</h4>
                      <p className="line-clamp-2 text-xs text-gray-500">
                        {p.description || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{money(p.price)}</p>
                      <p className="text-xs text-gray-500">{p.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Stock: {typeof p.stock === "number" ? p.stock : "—"}</span>
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

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      onClick={() => onEdit(p.id)}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                      onClick={() => onDelete(p.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
