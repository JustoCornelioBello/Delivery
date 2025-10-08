"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/* ═════════════ Tipos ═════════════ */
type CategoryStatus = "visible" | "oculta";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string; // DataURL o URL
  iconColor?: string;
  productCount: number;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/* ═════════════ Utils ═════════════ */
const LS_KEY = "categories_mock_v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);

/* Mini placeholder si no hay imagen */
const svgThumb = (name: string, fill: string) => {
  const short = (name || "Cat").split(" ")[0].slice(0, 6);
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>
      <rect width='100%' height='100%' rx='12' fill='${fill}'/>
      <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle'
        fill='white' font-size='16' font-family='sans-serif'>${short}</text>
    </svg>`
  );
  return `data:image/svg+xml;utf8,${svg}`;
};

const randomColor = () => {
  const palette = ["#0ea5e9", "#22c55e", "#f97316", "#a855f7", "#ef4444", "#eab308", "#14b8a6"];
  return palette[Math.floor(Math.random() * palette.length)];
};

/* ═════════════ Mock inicial ═════════════ */
const initialMock = (): Category[] => {
  const base: Omit<Category, "id" | "createdAt" | "updatedAt" | "sortOrder">[] = [
    {
      name: "Hamburguesas",
      slug: "hamburguesas",
      description: "Clásicas, dobles y especiales",
      iconColor: "#f97316",
      status: "visible",
      productCount: 18,
      parentId: null,
      image: undefined,
    },
    {
      name: "Pizzas",
      slug: "pizzas",
      description: "Pepperoni, hawaiana, 4 quesos",
      iconColor: "#ef4444",
      status: "visible",
      productCount: 14,
      parentId: null,
      image: undefined,
    },
    {
      name: "Bebidas",
      slug: "bebidas",
      description: "Refrescos, jugos y agua",
      iconColor: "#0ea5e9",
      status: "visible",
      productCount: 22,
      parentId: null,
      image: undefined,
    },
    {
      name: "Postres",
      slug: "postres",
      description: "Helados, brownies y más",
      iconColor: "#a855f7",
      status: "visible",
      productCount: 7,
      parentId: null,
      image: undefined,
    },
    {
      name: "Combos",
      slug: "combos",
      description: "Arma tu combo y ahorra",
      iconColor: "#22c55e",
      status: "visible",
      productCount: 9,
      parentId: null,
      image: undefined,
    },
    {
      name: "Extras",
      slug: "extras",
      description: "Salsas, toppings y adicionales",
      iconColor: "#eab308",
      status: "visible",
      productCount: 16,
      parentId: null,
      image: undefined,
    },
  ];

  return base.map((c, i) => ({
    ...c,
    id: uid(),
    sortOrder: i + 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }));
};

/* ═════════════ Modal Genérico ═════════════ */
const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}> = ({ open, title, onClose, children, wide }) => {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${wide ? "max-w-4xl" : "max-w-2xl"} overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Cerrar
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

/* ═════════════ Componente Principal ═════════════ */
export default function CategoriesManager() {
  /* Estado principal */
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  /* UI: filtros / búsqueda / orden / paginación */
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CategoryStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "products" | "created" | "order">("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  /* UI: modales */
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* Formulario */
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string | "">("");
  const [image, setImage] = useState<string | undefined>();
  const [iconColor, setIconColor] = useState<string>(randomColor());
  const [formStatus, setFormStatus] = useState<CategoryStatus>("visible");
  const [productCount, setProductCount] = useState<string>("0");
  const [sortOrder, setSortOrder] = useState<string>("1");

  const fileRef = useRef<HTMLInputElement | null>(null);

  /* Cargar localStorage */
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw) as Category[];
        setCategories(data);
        setLoading(false);
        return;
      } catch {}
    }
    const mock = initialMock();
    setCategories(mock);
    setLoading(false);
  }, []);

  /* Persistir */
  useEffect(() => {
    if (!loading) localStorage.setItem(LS_KEY, JSON.stringify(categories));
  }, [categories, loading]);

  /* Helpers de imagen */
  const onPickFile = async (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ""));
    reader.readAsDataURL(f);
  };

  /* Abrir crear */
  const openCreate = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("");
    setImage(undefined);
    setIconColor(randomColor());
    setFormStatus("visible");
    setProductCount("0");
    setSortOrder(String((categories?.length || 0) + 1));
    setOpenForm(true);
  };

  /* Abrir editar */
  const openEdit = (id: string) => {
    const c = categories.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || "");
    setParentId(c.parentId || "");
    setImage(c.image);
    setIconColor(c.iconColor || randomColor());
    setFormStatus(c.status);
    setProductCount(String(c.productCount || 0));
    setSortOrder(String(c.sortOrder || 1));
    setOpenForm(true);
  };

  /* Guardar */
  const saveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const nameClean = name.trim();
    if (!nameClean) return alert("El nombre es obligatorio.");
    const slugClean = (slug || slugify(nameClean)).trim();
    if (!slugClean) return alert("El slug es obligatorio.");

    const base: Omit<Category, "id" | "createdAt" | "updatedAt"> = {
      name: nameClean,
      slug: slugClean,
      description: description.trim() || undefined,
      parentId: parentId || null,
      image: image || svgThumb(nameClean, iconColor),
      iconColor,
      productCount: Math.max(0, Number(productCount) || 0),
      status: formStatus,
      sortOrder: Math.max(1, Number(sortOrder) || 1),
    };

    if (editingId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, ...base, updatedAt: nowIso() }
            : c
        )
      );
      setOpenForm(false);
      return;
    }

    const newCat: Category = {
      id: uid(),
      ...base,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    setCategories((prev) => [...prev, newCat]);
    setOpenForm(false);
  };

  /* Eliminar */
  const askDelete = (id: string) => {
    setDeleteId(id);
    setOpenConfirm(true);
  };
  const doDelete = () => {
    if (!deleteId) return;
    setCategories((prev) => prev.filter((c) => c.id !== deleteId));
    setOpenConfirm(false);
    setDeleteId(null);
  };

  /* Duplicar */
  const duplicate = (id: string) => {
    const c = categories.find((x) => x.id === id);
    if (!c) return;
    const copy: Category = {
      ...c,
      id: uid(),
      name: `${c.name} (copia)`,
      slug: slugify(`${c.slug}-copy`),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      sortOrder: (categories.length || 0) + 1,
    };
    setCategories((prev) => [...prev, copy]);
  };

  /* Filtros + orden */
  const filtered = useMemo(() => {
    const words = q.trim().toLowerCase();
    const list = categories.filter((c) => {
      const matchesQ =
        !words ||
        c.name.toLowerCase().includes(words) ||
        c.slug.toLowerCase().includes(words) ||
        (c.description || "").toLowerCase().includes(words);
      const matchesStatus = status === "all" ? true : c.status === status;
      return matchesQ && matchesStatus;
    });

    list.sort((a, b) => {
      let comp = 0;
      if (sortBy === "order") comp = a.sortOrder - b.sortOrder;
      if (sortBy === "name") comp = a.name.localeCompare(b.name);
      if (sortBy === "products") comp = a.productCount - b.productCount;
      if (sortBy === "created") comp = +new Date(a.createdAt) - +new Date(b.createdAt);
      return sortDir === "asc" ? comp : -comp;
    });

    return list;
  }, [categories, q, status, sortBy, sortDir]);

  /* Paginación */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPage(1), [q, status, sortBy, sortDir]);
  const pageData = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  /* Datos derivables */
  const totalVisible = useMemo(
    () => categories.filter((c) => c.status === "visible").length,
    [categories]
  );

  /* Render */
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Categorías</h1>
          <p className="text-sm text-gray-500">
            Gestiona tus categorías (mock). Se guardan en tu navegador (localStorage).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            + Nueva categoría
          </button>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Total</p>
          <p className="mt-1 text-xl font-semibold">{categories.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Visibles</p>
          <p className="mt-1 text-xl font-semibold">{totalVisible}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Ocultas</p>
          <p className="mt-1 text-xl font-semibold">{categories.length - totalVisible}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Página</p>
          <p className="mt-1 text-xl font-semibold">
            {page} / {totalPages}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nombre, slug o descripción…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Todos</option>
              <option value="visible">Visible</option>
              <option value="oculta">Oculta</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="order">Orden</option>
              <option value="name">Nombre</option>
              <option value="products">Productos</option>
              <option value="created">Creación</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Dirección</label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800">
            <tr>
              <th className="p-3">Categoría</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Productos</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Orden</th>
              <th className="p-3">Creada</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {pageData.map((c) => (
              <tr key={c.id} className="align-middle">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image || svgThumb(c.name, c.iconColor || "#94a3b8")}
                        alt={c.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ background: c.iconColor || "#94a3b8" }}
                          aria-hidden
                        />
                        <p className="truncate font-medium">{c.name}</p>
                        {c.parentId && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            Subcategoría
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="line-clamp-1 text-xs text-gray-500">{c.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-gray-600 dark:text-gray-300">{c.slug}</td>
                <td className="p-3">{c.productCount}</td>
                <td className="p-3">
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs",
                      c.status === "visible"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-gray-800 dark:text-gray-300",
                    ].join(" ")}
                  >
                    {c.status === "visible" ? "Visible" : "Oculta"}
                  </span>
                </td>
                <td className="p-3">{c.sortOrder}</td>
                <td className="p-3 text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCategories((prev) =>
                          prev.map((x) =>
                            x.id === c.id
                              ? {
                                  ...x,
                                  status: x.status === "visible" ? "oculta" : "visible",
                                  updatedAt: nowIso(),
                                }
                              : x
                          )
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    >
                      {c.status === "visible" ? "Ocultar" : "Mostrar"}
                    </button>
                    <button
                      onClick={() => duplicate(c.id)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    >
                      Duplicar
                    </button>
                    <button
                      onClick={() => openEdit(c.id)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => askDelete(c.id)}
                      className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-sm text-gray-500">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {filtered.length} resultado(s) · Página {page} de {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Anterior
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        open={openForm}
        title={editingId ? "Editar categoría" : "Nueva categoría"}
        onClose={() => setOpenForm(false)}
        wide
      >
        <form onSubmit={saveCategory} className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {/* Col 1: info */}
          <div className="md:col-span-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Nombre *</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(slugify(e.target.value));
                }}
                placeholder="Ej: Hamburguesas"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Slug *</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="hamburguesas"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Estado</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as CategoryStatus)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="visible">Visible</option>
                  <option value="oculta">Oculta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe la categoría…"
                className="min-h-[90px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Superior</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="">Sin superior</option>
                  {categories
                    .filter((c) => c.id !== editingId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500"># Productos (simulado)</label>
                <input
                  value={productCount}
                  inputMode="numeric"
                  onChange={(e) =>
                    setProductCount(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Orden</label>
                <input
                  value={sortOrder}
                  inputMode="numeric"
                  onChange={(e) =>
                    setSortOrder(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Col 2: imagen / color */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Imagen</label>
              {image ? (
                <div className="relative h-40 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
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
                  className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
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
                Recomendado: 800×600px (JPG/PNG). Si no agregas, usaremos un placeholder con color.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Color del ícono</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                />
                <span className="text-sm">{iconColor}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                {editingId ? "Guardar cambios" : "Crear categoría"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirmación eliminar */}
      <Modal
        open={openConfirm}
        title="Eliminar categoría"
        onClose={() => setOpenConfirm(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ¿Seguro que deseas eliminar esta categoría? Esta acción no se puede deshacer.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setOpenConfirm(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={doDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
