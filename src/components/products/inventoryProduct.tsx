"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/* ═════════════════════ Tipos ═════════════════════ */
type Status = "activo" | "inactivo";
type UnitType = "unidad" | "paquete";

type Warehouse = {
  id: string;
  name: string;
  color: string;
};

type Variant = {
  id: string;
  name: string; // p.ej. "Mediana", "Grande"
  sku: string;
  barcode?: string;
  packSize?: number; // cuántas unidades trae un paquete
  unitType: UnitType; // cómo se maneja por defecto
  reorderPoint: number; // punto de reposición
  stocks: Record<string, number>; // {warehouseId: qty}
  price: number;
  cost: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  variants: Variant[];
};

type FlatRow = {
  productId: string;
  variantId: string;
  product: string;
  variant: string;
  category: string;
  sku: string;
  barcode?: string;
  status: Status;
  price: number;
  cost: number;
  reorderPoint: number;
  unitType: UnitType;
  packSize?: number;
  stocks: Record<string, number>;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

/* ═════════════════════ Utils ═════════════════════ */
const LS_KEY = "inventory_mock_v2";

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

const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(n);

const svgThumb = (name: string, fill: string) => {
  const short = name.split(" ")[0].slice(0, 6);
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

/* ═════════════════════ Mock Data ═════════════════════ */
// Mantenemos múltiples almacenes, pero ya NO se muestran como columnas.
const WAREHOUSES: Warehouse[] = [
  { id: "w1", name: "Central", color: "#0ea5e9" },
  { id: "w2", name: "Norte", color: "#22c55e" },
  { id: "w3", name: "Sur", color: "#f97316" },
];

const CATEGORIES = [
  "Hamburguesas",
  "Pizzas",
  "Bebidas",
  "Postres",
  "Combos",
  "Snacks",
  "Salsas",
];

const baseProducts = [
  { name: "Hamburguesa Clásica", category: "Hamburguesas" },
  { name: "Hamburguesa Doble", category: "Hamburguesas" },
  { name: "Pizza Pepperoni", category: "Pizzas" },
  { name: "Pizza 4 Quesos", category: "Pizzas" },
  { name: "Refresco 500ml", category: "Bebidas" },
  { name: "Agua Mineral 600ml", category: "Bebidas" },
  { name: "Brownie Chocolate", category: "Postres" },
  { name: "Helado Vainilla", category: "Postres" },
  { name: "Combo Familiar", category: "Combos" },
  { name: "Papas Fritas", category: "Snacks" },
  { name: "Aros de Cebolla", category: "Snacks" },
  { name: "Salsa BBQ", category: "Salsas" },
  { name: "Salsa Picante", category: "Salsas" },
];

const randomInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function makeVariant(name: string, baseSku: string): Variant {
  const pack = Math.random() < 0.5 ? randomInt(4, 12) : undefined;
  const unitType: UnitType = Math.random() < 0.7 ? "unidad" : "paquete";
  const stocks: Record<string, number> = {};
  for (const w of WAREHOUSES) {
    stocks[w.id] = randomInt(0, 40);
  }
  const price = randomInt(3, 20);
  const cost = Math.max(1, price - randomInt(1, 5));
  return {
    id: uid(),
    name,
    sku: `${baseSku}-${uid().slice(0, 4).toUpperCase()}`,
    barcode: String(7_000_000_000 + Math.floor(Math.random() * 1_000_000_000)),
    packSize: pack,
    unitType,
    reorderPoint: randomInt(5, 15),
    stocks,
    price,
    cost,
  };
}

function makeProduct(p: { name: string; category: string }, i: number): Product {
  const color = randomColor();
  const hasVariants = Math.random() < 0.6;
  const variants: Variant[] = hasVariants
    ? [
        makeVariant("Pequeña", `SKU-${i + 1}-S`),
        makeVariant("Mediana", `SKU-${i + 1}-M`),
        makeVariant("Grande", `SKU-${i + 1}-L`),
      ]
    : [makeVariant("Única", `SKU-${i + 1}-U`)];

  return {
    id: uid(),
    name: p.name,
    slug: slugify(p.name),
    category: p.category,
    image: svgThumb(p.name, color),
    status: Math.random() < 0.9 ? "activo" : "inactivo",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    variants,
  };
}

const initialMock = (): Product[] => baseProducts.map(makeProduct);

/* ═════════════════════ Componentes auxiliares ═════════════════════ */
const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  max?: "md" | "lg" | "xl";
}> = ({ open, title, onClose, children, max = "xl" }) => {
  if (!open) return null;
  const maxCls = max === "md" ? "max-w-2xl" : max === "lg" ? "max-w-3xl" : "max-w-5xl";
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxCls} overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900`}
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
        <div className="max-h-[80vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

/** Editor de stocks por almacén en un modal compacto */
const WarehouseEditor: React.FC<{
  open: boolean;
  onClose: () => void;
  row: FlatRow | null;
  onChange: (warehouseId: string, qty: number) => void;
}> = ({ open, onClose, row, onChange }) => {
  if (!open || !row) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Almacenes · ${row.product} / ${row.variant}`} max="md">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {WAREHOUSES.map((w) => (
          <div key={w.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: w.color }} />
                <p className="text-sm font-medium">{w.name}</p>
              </div>
              <input
                inputMode="numeric"
                className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                value={String(row.stocks[w.id] ?? 0)}
                onChange={(e) => onChange(w.id, Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0))}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">Estos cambios se guardan al cerrar el modal.</p>
    </Modal>
  );
};

/* ═════════════════════ Componente ═════════════════════ */
export default function InventoryManager() {
  /* Datos */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* UI: filtros etc. */
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState(""); // debounce para evitar lags
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [onlyLow, setOnlyLow] = useState(false);
  const [warehouse, setWarehouse] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"product" | "category" | "sku" | "price" | "stock" | "margin">("product");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [dense, setDense] = useState(false); // filas compactas

  /* selección & modales */
  const [selected, setSelected] = useState<string[]>([]);
  const [openAdjust, setOpenAdjust] = useState(false);
  const [adjustQty, setAdjustQty] = useState<string>("0");
  const [adjustMode, setAdjustMode] = useState<"sum" | "set">("sum");
  const [adjustWarehouse, setAdjustWarehouse] = useState<string>("all");
  const [adjustByPack, setAdjustByPack] = useState(false);

  const [openImport, setOpenImport] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [openWH, setOpenWH] = useState(false);
  const [rowWH, setRowWH] = useState<FlatRow | null>(null);

  /* Cargar/Persistir */
  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (raw) {
      try {
        setProducts(JSON.parse(raw) as Product[]);
        setLoading(false);
        return;
      } catch {}
    }
    const mock = initialMock();
    setProducts(mock);
    setLoading(false);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setQDebounced(q.trim()), 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    if (!loading) localStorage.setItem(LS_KEY, JSON.stringify(products));
  }, [products, loading]);

  /* Aplanar productos → filas */
  const rows: FlatRow[] = useMemo(() => {
    const out: FlatRow[] = [];
    for (const p of products) {
      for (const v of p.variants) {
        out.push({
          productId: p.id,
          variantId: v.id,
          product: p.name,
          variant: v.name,
          category: p.category,
          sku: v.sku,
          barcode: v.barcode,
          status: p.status,
          price: v.price,
          cost: v.cost,
          reorderPoint: v.reorderPoint,
          unitType: v.unitType,
          packSize: v.packSize,
          stocks: v.stocks,
          image: p.image,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        });
      }
    }
    return out;
  }, [products]);

  /* Helpers */
  const stockIn = (r: FlatRow, w: string) =>
    w === "all" ? Object.values(r.stocks).reduce((a, b) => a + b, 0) : r.stocks[w] ?? 0;
  const isLowStock = (r: FlatRow) => stockIn(r, warehouse) <= r.reorderPoint;
  const marginPct = (r: FlatRow) => (r.price > 0 ? ((r.price - r.cost) / r.price) * 100 : 0);

  /* Filtros + búsqueda (debounced) */
  const filtered = useMemo(() => {
    const words = qDebounced.toLowerCase();
    return rows.filter((r) => {
      const matchesQ =
        !words ||
        r.product.toLowerCase().includes(words) ||
        r.variant.toLowerCase().includes(words) ||
        r.category.toLowerCase().includes(words) ||
        r.sku.toLowerCase().includes(words) ||
        (r.barcode || "").toLowerCase().includes(words);

      const matchesCat = category === "all" ? true : r.category === category;
      const matchesStatus = status === "all" ? true : r.status === status;
      const matchesLow = onlyLow ? isLowStock(r) : true;
      return matchesQ && matchesCat && matchesStatus && matchesLow;
    });
  }, [rows, qDebounced, category, status, onlyLow, warehouse]);

  /* Ordenamiento */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let comp = 0;
      if (sortBy === "product") comp = a.product.localeCompare(b.product) || a.variant.localeCompare(b.variant);
      if (sortBy === "category") comp = a.category.localeCompare(b.category);
      if (sortBy === "sku") comp = a.sku.localeCompare(b.sku);
      if (sortBy === "price") comp = a.price - b.price;
      if (sortBy === "stock") comp = stockIn(a, warehouse) - stockIn(b, warehouse);
      if (sortBy === "margin") comp = marginPct(a) - marginPct(b);
      return sortDir === "asc" ? comp : -comp;
    });
    return arr;
  }, [filtered, sortBy, sortDir, warehouse]);

  /* Paginación */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => setPage(1), [qDebounced, category, status, onlyLow, warehouse, sortBy, sortDir, pageSize]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page, pageSize]);

  /* Mutaciones */
  const updateStock = (productId: string, variantId: string, warehouseId: string, qty: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id !== productId
          ? p
          : {
              ...p,
              variants: p.variants.map((v) =>
                v.id !== variantId
                  ? v
                  : {
                      ...v,
                      stocks: {
                        ...v.stocks,
                        [warehouseId]: Math.max(0, qty),
                      },
                    }
              ),
              updatedAt: nowIso(),
            }
      )
    );
  };

  const toggleStatus = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id !== productId ? p : { ...p, status: p.status === "activo" ? "inactivo" : "activo", updatedAt: nowIso() }))
    );
  };

  /* Ajustes masivos */
  const openAdjustModal = () => {
    if (!selected.length) return alert("Selecciona al menos un ítem de la tabla.");
    setOpenAdjust(true);
    setAdjustQty("0");
    setAdjustMode("sum");
    setAdjustWarehouse("all");
    setAdjustByPack(false);
  };

  const applyAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(adjustQty);
    if (isNaN(n)) return;

    setProducts((prev) => {
      const mapSel = new Set(selected);
      return prev.map((p) => ({
        ...p,
        variants: p.variants.map((v) => {
          const idKey = `${p.id}:${v.id}`;
          if (!mapSel.has(idKey)) return v;

          const mult = adjustByPack && v.packSize ? v.packSize : 1;
          const delta = n * mult;

          const newStocks: Record<string, number> = { ...v.stocks };
          const targets = adjustWarehouse === "all" ? WAREHOUSES.map((w) => w.id) : [adjustWarehouse];

          for (const wid of targets) {
            const current = newStocks[wid] ?? 0;
            newStocks[wid] = Math.max(0, adjustMode === "sum" ? current + delta : Math.max(0, n * mult));
          }
          return { ...v, stocks: newStocks };
        }),
        updatedAt: nowIso(),
      }));
    });

    setOpenAdjust(false);
    setSelected([]);
  };

  /* Exportar CSV (solo columnas compactas) */
  const exportCSV = () => {
    const headers = [
      "product",
      "variant",
      "category",
      "sku",
      "barcode",
      "total_stock",
      "reorder_point",
      "unit_type",
      "pack_size",
      "price",
      "cost",
      "margin_pct",
      "status",
    ];
    const rowsCsv = sorted.map((r) => [
      r.product,
      r.variant,
      r.category,
      r.sku,
      r.barcode || "",
      String(stockIn(r, "all")),
      String(r.reorderPoint),
      r.unitType,
      String(r.packSize ?? ""),
      String(r.price),
      String(r.cost),
      String(marginPct(r).toFixed(1)),
      r.status,
    ]);
    const csv = [headers, ...rowsCsv]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* Importar CSV (compat con anterior) */
  const onImportFile = async (file?: File | null) => {
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return;

    const header = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
    const idx = (k: string) => header.findIndex((h) => h === k);

    const required = ["product", "variant", "sku"];
    for (const r of required) {
      if (idx(r) === -1) {
        alert(`Columna requerida faltante: ${r}`);
        return;
      }
    }

    const updated: Product[] = JSON.parse(JSON.stringify(products));

    const findOrCreateProduct = (name: string, categoryName: string): Product => {
      const found = updated.find((p) => p.name === name);
      if (found) return found;
      const p: Product = {
        id: uid(),
        name,
        slug: slugify(name),
        category: categoryName || "Sin categoría",
        image: svgThumb(name, randomColor()),
        status: "activo",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        variants: [],
      };
      updated.push(p);
      return p;
    };

    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i];
      const cols = raw.match(/("([^"]|"")*"|[^,]+)/g)?.map((c) => c.replace(/^"|"$/g, "").replace(/""/g, `"`)) || [];

      const productName = cols[idx("product")] || "";
      if (!productName) continue;

      const variantName = cols[idx("variant")] || "Única";
      const sku = cols[idx("sku")] || `SKU-${uid().slice(0, 5).toUpperCase()}`;

      const categoryName = idx("category") !== -1 ? cols[idx("category")] : "Sin categoría";
      const price = Number(cols[idx("price")] || 0);
      const cost = Number(cols[idx("cost")] || 0);
      const barcode = idx("barcode") !== -1 ? cols[idx("barcode")] : undefined;
      const unitType = (idx("unit_type") !== -1 ? (cols[idx("unit_type")] as UnitType) : "unidad") as UnitType;
      const packSizeVal = idx("pack_size") !== -1 ? Number(cols[idx("pack_size")] || 0) : 0;
      const reorder = Number(cols[idx("reorder_point")] || 0);
      const statusVal = (idx("status") !== -1 ? (cols[idx("status")] as Status) : "activo") as Status;

      const p = findOrCreateProduct(productName, categoryName);
      p.category = categoryName || p.category;
      p.status = statusVal;
      p.updatedAt = nowIso();

      let v = p.variants.find((x) => x.sku === sku) || p.variants.find((x) => x.name === variantName);
      if (!v) {
        v = {
          id: uid(),
          name: variantName,
          sku,
          barcode,
          packSize: packSizeVal || undefined,
          unitType,
          reorderPoint: reorder || 0,
          stocks: {},
          price: price || 0,
          cost: cost || 0,
        };
        p.variants.push(v);
      } else {
        v.name = variantName;
        v.barcode = barcode;
        v.unitType = unitType;
        v.packSize = packSizeVal || undefined;
        v.reorderPoint = reorder || 0;
        v.price = price || 0;
        v.cost = cost || 0;
      }

      // stocks por almacén (si vienen del CSV antiguo)
      for (const w of WAREHOUSES) {
        const colName = `stock_${w.name}`;
        if (idx(colName) !== -1) {
          const qty = Number(cols[idx(colName)] || 0);
          v.stocks[w.id] = Math.max(0, qty);
        }
      }

      // total_stock (si viene en el CSV compacto, lo asignamos al primero por defecto)
      if (idx("total_stock") !== -1) {
        const total = Math.max(0, Number(cols[idx("total_stock")] || 0));
        const first = WAREHOUSES[0]?.id;
        if (first) v.stocks[first] = total; // simple fallback
      }
    }

    setProducts(updated);
    setOpenImport(false);
  };

  /* Controles de edición rápida por fila */
  const addBy = (row: FlatRow, delta: number) => {
    const targetW = warehouse === "all" ? WAREHOUSES[0].id : warehouse;
    const mult = delta * (row.unitType === "paquete" && row.packSize ? row.packSize : 1);
    const current = row.stocks[targetW] ?? 0;
    updateStock(row.productId, row.variantId, targetW, current + mult);
  };

  /* Render */
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inventario</h1>
          <p className="text-sm text-gray-500">Vista compacta sin columnas por almacén. Edición por modal.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportCSV} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800">Exportar CSV</button>
          <button onClick={() => setOpenImport(true)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800">Importar CSV</button>
          <button onClick={openAdjustModal} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Ajuste masivo</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Ítems (variantes)</p>
          <p className="mt-1 text-xl font-semibold">{rows.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Bajo stock</p>
          <p className="mt-1 text-xl font-semibold">{rows.filter((r) => isLowStock(r)).length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Activos</p>
          <p className="mt-1 text-xl font-semibold">{products.filter((p) => p.status === "activo").length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Almacenes</p>
          <p className="mt-1 text-xl font-semibold">{WAREHOUSES.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Margen medio</p>
          <p className="mt-1 text-xl font-semibold">
            {sorted.length ? `${(sorted.reduce((a, r) => a + marginPct(r), 0) / sorted.length).toFixed(1)}%` : "0%"}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Producto, variante, SKU o código de barras…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              <option value="all">Todas</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Estado</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              <option value="all">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Almacén (filtro)</label>
            <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              <option value="all">Todos</option>
              {WAREHOUSES.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
              Bajo stock
            </label>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Densidad</label>
            <select value={dense ? "compact" : "normal"} onChange={(e) => setDense(e.target.value === "compact")} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              <option value="normal">Normal</option>
              <option value="compact">Compacta</option>
            </select>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 md:max-w-2xl">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Ordenar por</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              <option value="product">Producto</option>
              <option value="category">Categoría</option>
              <option value="sku">SKU</option>
              <option value="price">Precio</option>
              <option value="stock">Stock</option>
              <option value="margin">Margen %</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Dirección</label>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value as any)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs text-gray-500">Filas por página</label>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla (compacta) */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className={`w-full text-left text-sm ${dense ? "[&_td]:py-2 [&_th]:py-2" : ""}`}>
          <thead className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 text-xs text-gray-500 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const ids = pageData.map((r) => `${r.productId}:${r.variantId}`);
                    const all = e.target.checked ? Array.from(new Set([...selected, ...ids])) : selected.filter((i) => !ids.includes(i));
                    setSelected(all);
                  }}
                  checked={pageData.length > 0 && pageData.every((r) => selected.includes(`${r.productId}:${r.variantId}`))}
                  aria-label="Seleccionar página"
                />
              </th>
              <th className="p-3">Producto</th>
              <th className="p-3">Variante</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Costo</th>
              <th className="p-3">Margen %</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {pageData.map((r) => {
              const idKey = `${r.productId}:${r.variantId}`;
              const totalStock = stockIn(r, "all");
              const low = isLowStock(r);
              return (
                <tr key={idKey} className={low ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                  <td className="p-3 align-top">
                    <input type="checkbox" checked={selected.includes(idKey)} onChange={() => setSelected((prev) => (prev.includes(idKey) ? prev.filter((x) => x !== idKey) : [...prev, idKey]))} />
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.image} alt={r.product} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{r.product}</p>
                          <span
                            className={[
                              "rounded-full px-2 py-0.5 text-[10px]",
                              r.status === "activo"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 dark:bg-gray-800 dark:text-gray-300",
                            ].join(" ")}
                          >
                            {r.status}
                          </span>
                        </div>
                        {low && <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">⚠ Bajo stock (≤ {r.reorderPoint})</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 align-top">{r.variant}</td>
                  <td className="p-3 align-top">{r.category}</td>
                  <td className="p-3 align-top">
                    <div className="text-xs text-gray-500">SKU</div>
                    <div className="font-mono text-sm">{r.sku}</div>
                    {r.barcode && (
                      <>
                        <div className="mt-1 text-xs text-gray-500">Código</div>
                        <div className="font-mono text-xs">{r.barcode}</div>
                      </>
                    )}
                  </td>
                  <td className="p-3 align-top">{money(r.price)}</td>
                  <td className="p-3 align-top">{money(r.cost)}</td>
                  <td className="p-3 align-top">{marginPct(r).toFixed(1)}%</td>

                  {/* Stock total + acciones rápidas + abrir editor de almacenes */}
                  <td className="p-3 align-top">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">{totalStock}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => addBy(r, -1)} className="h-8 w-8 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800" title="−1 (según unidad/pack)">−</button>
                        <button onClick={() => addBy(r, +1)} className="h-8 w-8 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800" title="+1 (según unidad/pack)">+</button>
                      </div>
                      <button
                        onClick={() => {
                          setRowWH(r);
                          setOpenWH(true);
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      >
                        Almacenes…
                      </button>
                    </div>
                  </td>

                  <td className="p-3 align-top text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => toggleStatus(r.productId)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                        {r.status === "activo" ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => {
                          setSelected([`${r.productId}:${r.variantId}`]);
                          openAdjustModal();
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      >
                        Ajustar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pageData.length === 0 && (
              <tr>
                <td className="p-10 text-center text-sm text-gray-500" colSpan={10}>Sin resultados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-gray-500">{sorted.length} ítem(s) · Página {page} de {totalPages}</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800">Anterior</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800">Siguiente</button>
        </div>
      </div>

      {/* Modal Ajuste Masivo */}
      <Modal open={openAdjust} title="Ajuste masivo de stock" onClose={() => setOpenAdjust(false)} max="md">
        <form onSubmit={applyAdjust} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="mb-1 block text-xs text-gray-500">Modo</label>
            <select value={adjustMode} onChange={(e) => setAdjustMode(e.target.value as "sum" | "set")} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              <option value="sum">Sumar/restar</option>
              <option value="set">Establecer valor</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="mb-1 block text-xs text-gray-500">Cantidad</label>
            <input value={adjustQty} onChange={(e) => setAdjustQty(e.target.value.replace(/[^0-9-]/g, ""))} placeholder="Ej: +5 o -3" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
          </div>
          <div className="space-y-2">
            <label className="mb-1 block text-xs text-gray-500">Almacén</label>
            <select value={adjustWarehouse} onChange={(e) => setAdjustWarehouse(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              <option value="all">Todos</option>
              {WAREHOUSES.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={adjustByPack} onChange={(e) => setAdjustByPack(e.target.checked)} />
              Aplicar por paquete (si la variante tiene pack)
            </label>
          </div>
          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpenAdjust(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800">Cancelar</button>
            <button type="submit" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Aplicar</button>
          </div>
        </form>
        <p className="mt-3 text-xs text-gray-500">Afectará a <b>{selected.length}</b> ítem(s) seleccionados. Si activas “por paquete” y la variante tiene <i>packSize</i>, la cantidad se multiplicará por ese tamaño.</p>
      </Modal>

      {/* Modal Importar CSV */}
      <Modal open={openImport} title="Importar inventario (CSV)" onClose={() => setOpenImport(false)} max="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            El CSV compacto puede incluir: <code className="font-mono">product, variant, sku</code> (requeridos), y opcionales
            <code className="font-mono"> category, barcode, total_stock, reorder_point, unit_type, pack_size, price, cost, status</code>.
            También soporta el formato anterior con <code className="font-mono">stock_Central, stock_Norte, stock_Sur</code>.
          </p>
          <div>
            <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800">Seleccionar archivo…</button>
            <input ref={fileRef} hidden type="file" accept=".csv,text/csv" onChange={(e) => onImportFile(e.target.files?.[0])} />
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            Ejemplo de encabezados:
            <div className="mt-1 font-mono break-all">product,variant,sku,category,barcode,total_stock,reorder_point,unit_type,pack_size,price,cost,status</div>
          </div>
        </div>
      </Modal>

      {/* Modal Editor de Almacenes */}
      <WarehouseEditor
        open={openWH}
        row={rowWH}
        onClose={() => setOpenWH(false)}
        onChange={(wid, qty) => {
          if (!rowWH) return;
          updateStock(rowWH.productId, rowWH.variantId, wid, qty);
          // refrescamos el row local para ver los cambios en el modal
          setRowWH((r) => (r ? { ...r, stocks: { ...r.stocks, [wid]: qty } } : r));
        }}
      />
    </section>
  );
}
