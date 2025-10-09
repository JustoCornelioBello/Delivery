"use client";

import React, { useState, useMemo } from "react";

/* ───────────── Tipos ───────────── */
type Combo = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discount: number; // porcentaje
  active: boolean;
  published: boolean;
  products: string[];
  image: string;
};

/* ───────────── Mock inicial ───────────── */
const MOCK_COMBOS: Combo[] = [
  {
    id: "c1",
    name: "Combo Detergente Hogar",
    description: "Incluye 2 detergentes líquidos + 1 suavizante + 1 limpiador multiusos.",
    category: "Limpieza",
    price: 20,
    discount: 10,
    active: true,
    published: true,
    products: ["Detergente Líquido (2L)", "Suavizante (1L)", "Limpiador multiusos (500ml)"],
    image: "https://via.placeholder.com/100x100.png?text=Detergente",
  },
  {
    id: "c2",
    name: "Pack Bebidas Fiesta",
    description: "Refrescos surtidos + aguas minerales + jugo natural.",
    category: "Bebidas",
    price: 15,
    discount: 0,
    active: true,
    published: false,
    products: ["Refresco Cola (1.5L)", "Agua Mineral (500ml x6)", "Jugo de Naranja (1L)"],
    image: "https://via.placeholder.com/100x100.png?text=Bebidas",
  },
  {
    id: "c3",
    name: "Combo Alimentos Básicos",
    description: "Arroz, aceite, azúcar y harina para la despensa familiar.",
    category: "Alimentos",
    price: 30,
    discount: 20,
    active: false,
    published: false,
    products: ["Arroz (5kg)", "Aceite (1L)", "Azúcar (2kg)", "Harina (1kg)"],
    image: "https://via.placeholder.com/100x100.png?text=Alimentos",
  },
];

/* ───────────── Modal ───────────── */
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ───────────── Página principal ───────────── */
export default function CombosPage() {
  const [combos, setCombos] = useState<Combo[]>(MOCK_COMBOS);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Combo | null>(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");

  /* Handlers */
  const handleSaveCombo = (combo: Combo) => {
    if (editing) {
      setCombos((prev) => prev.map((c) => (c.id === combo.id ? combo : c)));
    } else {
      setCombos((prev) => [...prev, { ...combo, id: `c${prev.length + 1}` }]);
    }
    setOpenModal(false);
    setEditing(null);
  };

  const filteredCombos = useMemo(() => {
    return combos.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === "Todos" || c.category === filterCategory;
      const matchesStatus =
        filterStatus === "Todos" ||
        (filterStatus === "Activo" && c.active) ||
        (filterStatus === "Inactivo" && !c.active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [combos, search, filterCategory, filterStatus]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Combos de productos</h1>
          <p className="text-sm text-gray-600">
            Administra paquetes especiales de productos, activa ofertas y publica tus combos.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpenModal(true);
          }}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Nuevo Combo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <input
          type="text"
          placeholder="Buscar combos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <option>Todos</option>
          <option>Alimentos</option>
          <option>Bebidas</option>
          <option>Limpieza</option>
          <option>Embutidos</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <option>Todos</option>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </div>

      {/* Grid Combos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCombos.map((combo) => {
          const finalPrice = combo.price * (1 - combo.discount / 100);
          return (
            <div
              key={combo.id}
              className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
            >
              {/* Badge publicado */}
              {combo.published && (
                <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Publicado
                </span>
              )}

              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={combo.image} alt={combo.name} className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <h3 className="text-lg font-semibold">{combo.name}</h3>
                  <p className="text-xs text-gray-500">{combo.category}</p>
                </div>
              </div>

              <p className="mt-2 text-sm text-gray-600">{combo.description}</p>

              <ul className="mt-2 list-disc pl-4 text-xs text-gray-500">
                {combo.products.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>

              {/* Precio y descuento */}
              <div className="mt-4 flex items-center justify-between">
                {combo.discount > 0 ? (
                  <div>
                    <span className="text-sm line-through text-gray-400">${combo.price}</span>
                    <span className="ml-2 text-lg font-bold text-brand-600">
                      ${finalPrice.toFixed(2)} (-{combo.discount}%)
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-brand-600">${combo.price}</span>
                )}
                <span
                  className={`text-xs font-medium ${
                    combo.active ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {combo.active ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="mt-3 flex justify-between">
                <button
                  onClick={() => {
                    setEditing(combo);
                    setOpenModal(true);
                  }}
                  className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Editar
                </button>
                <button
                  onClick={() =>
                    setCombos((prev) =>
                      prev.map((c) =>
                        c.id === combo.id ? { ...c, published: !c.published } : c
                      )
                    )
                  }
                  className="rounded-md bg-indigo-500 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-600"
                >
                  {combo.published ? "Ocultar" : "Publicar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Formulario */}
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        title={editing ? "Editar Combo" : "Nuevo Combo"}
      >
        <ComboForm
          initial={editing}
          onSave={handleSaveCombo}
          onCancel={() => {
            setOpenModal(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}

/* ───────────── Formulario de Combos ───────────── */
function ComboForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Combo | null;
  onSave: (c: Combo) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Alimentos");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [discount, setDiscount] = useState(initial?.discount ?? 0);
  const [products, setProducts] = useState(initial?.products ?? []);
  const [image, setImage] = useState(initial?.image ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [published, setPublished] = useState(initial?.published ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initial?.id ?? "",
      name,
      description: desc,
      category,
      price,
      discount,
      products,
      image: image || "https://via.placeholder.com/100x100.png?text=Combo",
      active,
      published,
    });
  };

  const toggleProduct = (p: string) => {
    setProducts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const ALL_PRODUCTS = [
    "Detergente Líquido (2L)",
    "Suavizante (1L)",
    "Aceite (1L)",
    "Arroz (5kg)",
    "Azúcar (2kg)",
    "Refresco Cola (1.5L)",
    "Agua Mineral (500ml)",
    "Jugo Naranja (1L)",
    "Jamón Serrano",
    "Chorizo Ibérico",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre *</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Categoría</label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Alimentos</option>
            <option>Bebidas</option>
            <option>Limpieza</option>
            <option>Embutidos</option>
            <option>Otros</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Precio</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Descuento (%)</label>
        <input
          type="number"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          value={discount}
          onChange={(e) => setDiscount(parseInt(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Productos incluidos</label>
        <div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
          {ALL_PRODUCTS.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={products.includes(p)}
                onChange={() => toggleProduct(p)}
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Imagen (URL)</label>
        <input
          type="text"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Activo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publicado
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
