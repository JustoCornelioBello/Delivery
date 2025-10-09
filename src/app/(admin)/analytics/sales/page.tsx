"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────── Tipos ─────────────────── */
type SaleItem = {
  productId: string;
  product: string;
  category: string;
  qty: number;
  unitPrice: number;
};
type Sale = {
  id: string;
  createdAt: string; // ISO
  items: SaleItem[];
  channel: "web" | "app" | "telefono";
  customerId: string;
};

type GroupBy = "day" | "week" | "month";

/* ─────────────────── Utils ─────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);
const money = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(n);
const fmtDate = (d: Date) =>
  d.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "2-digit" });
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
    2,
    "0"
  )}`;

/* ─────────────────── Mock data ─────────────────── */
const CATS = ["Bebidas", "Abarrotes", "Limpieza", "Lácteos", "Snacks", "Higiene"] as const;
const PRODS = [
  ["Cola 500ml", "Bebidas"],
  ["Agua 600ml", "Bebidas"],
  ["Cerveza 355ml", "Bebidas"],
  ["Arroz 1kg", "Abarrotes"],
  ["Azúcar 1kg", "Abarrotes"],
  ["Aceite 900ml", "Abarrotes"],
  ["Detergente 1kg", "Limpieza"],
  ["Suavizante 800ml", "Limpieza"],
  ["Leche 1L", "Lácteos"],
  ["Yogurt 1L", "Lácteos"],
  ["Papas fritas 90g", "Snacks"],
  ["Galletas 6u", "Snacks"],
  ["Shampoo 400ml", "Higiene"],
  ["Papel higiénico 4u", "Higiene"],
] as const;

const priceFor = (product: string) => {
  // precios básicos simulados
  if (/Cola|Cerveza/.test(product)) return 1.8 + Math.random() * 1.2;
  if (/Agua/.test(product)) return 1 + Math.random() * 0.6;
  if (/Arroz|Azúcar/.test(product)) return 2.5 + Math.random() * 1.5;
  if (/Aceite/.test(product)) return 3.8 + Math.random() * 1.2;
  if (/Detergente/.test(product)) return 3 + Math.random() * 2;
  if (/Suavizante/.test(product)) return 2.5 + Math.random() * 1.2;
  if (/Leche|Yogurt/.test(product)) return 1.2 + Math.random() * 1.2;
  if (/Papas|Galletas/.test(product)) return 0.8 + Math.random() * 0.8;
  if (/Shampoo/.test(product)) return 3 + Math.random() * 1.5;
  if (/Papel/.test(product)) return 2.2 + Math.random() * 1;
  return 2 + Math.random() * 2;
};

const LS_SALES = "analytics_sales_mock_v1";
function createMockSales(daysBack = 120, maxPerDay = 18): Sale[] {
  const list: Sale[] = [];
  const today = new Date();
  for (let i = daysBack; i >= 0; i--) {
    const count = Math.floor(Math.random() * maxPerDay); // 0..max
    for (let j = 0; j < count; j++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(Math.floor(Math.random() * 12) + 9, Math.floor(Math.random() * 60), 0, 0);
      const items: SaleItem[] = [];
      const itemsLen = 1 + Math.floor(Math.random() * 4); // 1..4 items
      for (let k = 0; k < itemsLen; k++) {
        const [name, cat] = PRODS[Math.floor(Math.random() * PRODS.length)];
        const qty = 1 + Math.floor(Math.random() * 4);
        items.push({
          productId: uid(),
          product: name,
          category: cat as (typeof CATS)[number],
          qty,
          unitPrice: Number(priceFor(name).toFixed(2)),
        });
      }
      list.push({
        id: `S-${uid().toUpperCase()}`,
        createdAt: d.toISOString(),
        items,
        channel: (["web", "app", "telefono"] as const)[Math.floor(Math.random() * 3)],
        customerId: ["C1", "C2", "C3", "C4", "C5", "C6"][Math.floor(Math.random() * 6)],
      });
    }
  }
  return list;
}

/* ─────────────────── SVG Mini Charts ─────────────────── */
function LineChart({
  data,
  w = 700,
  h = 220,
  color = "#2563eb",
  label,
}: {
  data: { x: string; y: number }[];
  w?: number;
  h?: number;
  color?: string;
  label?: string;
}) {
  const padding = { t: 20, r: 20, b: 28, l: 40 };
  const minY = 0;
  const maxY = Math.max(...data.map((d) => d.y), 1);
  const dx = (w - padding.l - padding.r) / Math.max(1, data.length - 1);
  const scaleY = (v: number) => h - padding.b - ((v - minY) / (maxY - minY)) * (h - padding.t - padding.b);

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${padding.l + i * dx} ${scaleY(d.y)}`)
    .join(" ");

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (i * maxY) / ticks);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* Ejes */}
      {yTicks.map((t, i) => {
        const y = scaleY(t);
        return (
          <g key={i}>
            <line x1={padding.l} y1={y} x2={w - padding.r} y2={y} stroke="#e5e7eb" />
            <text x={padding.l - 6} y={y + 4} fontSize="10" textAnchor="end" fill="#6b7280">
              {money(t)}
            </text>
          </g>
        );
      })}
      {/* Línea */}
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
      {/* Puntos */}
      {data.map((d, i) => (
        <circle key={i} cx={padding.l + i * dx} cy={scaleY(d.y)} r={2.8} fill={color} />
      ))}
      {/* Eje X */}
      {data.map((d, i) =>
        i % Math.ceil(data.length / 8 || 1) === 0 ? (
          <text
            key={i}
            x={padding.l + i * dx}
            y={h - 8}
            fontSize="10"
            textAnchor="middle"
            fill="#6b7280"
          >
            {d.x}
          </text>
        ) : null
      )}
      {label ? (
        <text x={padding.l} y={14} fontSize="12" fill="#111827" fontWeight={600}>
          {label}
        </text>
      ) : null}
    </svg>
  );
}

function BarChart({
  data,
  w = 700,
  h = 220,
  color = "#10b981",
  label,
}: {
  data: { x: string; y: number }[];
  w?: number;
  h?: number;
  color?: string;
  label?: string;
}) {
  const padding = { t: 20, r: 20, b: 28, l: 40 };
  const minY = 0;
  const maxY = Math.max(...data.map((d) => d.y), 1);
  const bw = (w - padding.l - padding.r) / data.length;
  const scaleY = (v: number) => h - padding.b - ((v - minY) / (maxY - minY)) * (h - padding.t - padding.b);
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => (i * maxY) / ticks);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {yTicks.map((t, i) => {
        const y = scaleY(t);
        return (
          <g key={i}>
            <line x1={padding.l} y1={y} x2={w - padding.r} y2={y} stroke="#e5e7eb" />
            <text x={padding.l - 6} y={y + 4} fontSize="10" textAnchor="end" fill="#6b7280">
              {t.toFixed(0)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = padding.l + i * bw + 3;
        const y = scaleY(d.y);
        const height = h - padding.b - y;
        return <rect key={i} x={x} y={y} width={bw - 6} height={height} fill={color} rx={4} />;
      })}
      {data.map((d, i) =>
        i % Math.ceil(data.length / 8 || 1) === 0 ? (
          <text
            key={i}
            x={padding.l + i * bw + bw / 2}
            y={h - 8}
            fontSize="10"
            textAnchor="middle"
            fill="#6b7280"
          >
            {d.x}
          </text>
        ) : null
      )}
      {label ? (
        <text x={padding.l} y={14} fontSize="12" fill="#111827" fontWeight={600}>
          {label}
        </text>
      ) : null}
    </svg>
  );
}

/* ─────────────────── Página ─────────────────── */
export default function SalesAnalyticsPage() {
  // Carga/Persistencia de ventas mock
  const [sales, setSales] = useState<Sale[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(LS_SALES);
    if (raw) {
      try {
        setSales(JSON.parse(raw));
        return;
      } catch {}
    }
    const mock = createMockSales(180, 22);
    setSales(mock);
    localStorage.setItem(LS_SALES, JSON.stringify(mock));
  }, []);

  // Filtros
  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toYMD(d);
  }, []);
  const [from, setFrom] = useState<string>(defaultFrom);
  const [to, setTo] = useState<string>(toYMD(today));
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [q, setQ] = useState("");

  // Filtrar por fechas y texto
  const filtered = useMemo(() => {
    const f = from ? new Date(from) : null;
    const t = to ? new Date(to) : null;
    const words = q.trim().toLowerCase();
    return sales.filter((s) => {
      const d = new Date(s.createdAt);
      const inFrom = !f || d >= new Date(f.getFullYear(), f.getMonth(), f.getDate());
      const inTo = !t || d <= new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59);
      const search =
        !words ||
        s.id.toLowerCase().includes(words) ||
        s.items.some((it) => it.product.toLowerCase().includes(words) || it.category.toLowerCase().includes(words)) ||
        s.channel.includes(words);
      return inFrom && inTo && search;
    });
  }, [sales, from, to, q]);

  // KPIs
  const metrics = useMemo(() => {
    const orders = filtered.length;
    const revenue = filtered.reduce(
      (acc, s) => acc + s.items.reduce((a, it) => a + it.qty * it.unitPrice, 0),
      0
    );
    const aov = orders ? revenue / orders : 0;
    const customers = new Set(filtered.map((s) => s.customerId));
    const frequency = filtered.reduce<Record<string, number>>((m, s) => {
      m[s.customerId] = (m[s.customerId] || 0) + 1;
      return m;
    }, {});
    const repeaters = Object.values(frequency).filter((n) => n > 1).length;
    const repeatRate = customers.size ? (repeaters / customers.size) * 100 : 0;
    return { orders, revenue, aov, repeatRate };
  }, [filtered]);

  // Agrupar para gráficos
  const groupKey = (d: Date) => {
    if (groupBy === "day") return toYMD(d);
    if (groupBy === "week") {
      const dt = new Date(d);
      const day = (dt.getDay() + 6) % 7;
      dt.setDate(dt.getDate() - day);
      return "W " + toYMD(dt); // inicio de semana
    }
    // month
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const series = useMemo(() => {
    const map = new Map<
      string,
      { revenue: number; orders: number; label: string }
    >();
    for (const s of filtered) {
      const d = new Date(s.createdAt);
      const k = groupKey(d);
      const label =
        groupBy === "day"
          ? d.toLocaleDateString("es-ES", { month: "short", day: "2-digit" })
          : groupBy === "week"
          ? (() => {
              const dt = new Date(d);
              const day = (dt.getDay() + 6) % 7;
              dt.setDate(dt.getDate() - day);
              const end = new Date(dt);
              end.setDate(dt.getDate() + 6);
              return `${dt.getDate()}–${end.getDate()} ${dt.toLocaleString("es-ES", {
                month: "short",
              })}`;
            })()
          : d.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
      if (!map.has(k)) map.set(k, { revenue: 0, orders: 0, label });
      const entry = map.get(k)!;
      entry.orders += 1;
      entry.revenue += s.items.reduce((a, it) => a + it.qty * it.unitPrice, 0);
    }
    const arr = Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([, v]) => v);
    return {
      line: arr.map((v) => ({ x: v.label, y: Number(v.revenue.toFixed(2)) })),
      bars: arr.map((v) => ({ x: v.label, y: v.orders })),
    };
  }, [filtered, groupBy]);

  // Top productos y categorías
  const topProducts = useMemo(() => {
    const map = new Map<string, { product: string; qty: number; revenue: number }>();
    filtered.forEach((s) =>
      s.items.forEach((it) => {
        const k = it.product;
        const cur = map.get(k) || { product: it.product, qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.qty * it.unitPrice;
        map.set(k, cur);
      })
    );
    const total = Array.from(map.values()).reduce((a, b) => a + b.revenue, 0) || 1;
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map((v) => ({ ...v, pct: (v.revenue / total) * 100 }));
  }, [filtered]);

  const topCategories = useMemo(() => {
    const map = new Map<string, { category: string; qty: number; revenue: number }>();
    filtered.forEach((s) =>
      s.items.forEach((it) => {
        const k = it.category;
        const cur = map.get(k) || { category: it.category, qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.qty * it.unitPrice;
        map.set(k, cur);
      })
    );
    const total = Array.from(map.values()).reduce((a, b) => a + b.revenue, 0) || 1;
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
      .map((v) => ({ ...v, pct: (v.revenue / total) * 100 }));
  }, [filtered]);

  // Tabla detallada paginada
  const [page, setPage] = useState(1);
  const pageSize = 12;
  useEffect(() => setPage(1), [from, to, q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(
    () =>
      filtered
        .slice()
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ["id", "fecha", "canal", "cliente", "producto", "categoria", "qty", "precio_unit", "importe"],
      ...filtered.flatMap((s) =>
        s.items.map((it) => [
          s.id,
          new Date(s.createdAt).toLocaleString(),
          s.channel,
          s.customerId,
          it.product,
          it.category,
          it.qty,
          it.unitPrice.toFixed(2),
          (it.qty * it.unitPrice).toFixed(2),
        ])
      ),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventas_${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyKPIs = async () => {
    const text =
      `📈 Resumen ventas (${from} → ${to})\n` +
      `Ingresos: ${money(metrics.revenue)}\n` +
      `Órdenes: ${metrics.orders}\n` +
      `Ticket promedio: ${money(metrics.aov)}\n` +
      `Clientes repetidores: ${metrics.repeatRate.toFixed(1)}%\n`;
    try {
      await navigator.clipboard.writeText(text);
      alert("KPIs copiados al portapapeles");
    } catch {
      alert("No se pudo copiar");
    }
  };

  return (
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analíticas de Ventas</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitorea ingresos, órdenes, ticket promedio y productos estrella.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyKPIs}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Copiar KPIs
          </button>
          <button
            onClick={exportCSV}
            className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-gray-500">Buscar</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ID, producto, categoría o canal…"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Agrupar por</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Ingresos</p>
          <p className="mt-1 text-xl font-semibold">{money(metrics.revenue)}</p>
          <p className="text-xs text-gray-500">Periodo seleccionado</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Órdenes</p>
          <p className="mt-1 text-xl font-semibold">{metrics.orders}</p>
          <p className="text-xs text-gray-500">Completadas</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Ticket promedio</p>
          <p className="mt-1 text-xl font-semibold">{money(metrics.aov)}</p>
          <p className="text-xs text-gray-500">por orden</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Repetición de clientes</p>
          <p className="mt-1 text-xl font-semibold">{metrics.repeatRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">clientes que repiten</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <LineChart data={series.line} label="Ingresos" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <BarChart data={series.bars} label="Órdenes" />
        </div>
      </div>

      {/* Top listas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Top productos</h3>
            <span className="text-xs text-gray-500">{topProducts.length} ítems</span>
          </div>
          <ul className="space-y-2">
            {topProducts.map((p) => (
              <li
                key={p.product}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.product}</p>
                  <p className="text-xs text-gray-500">
                    {p.qty} uds · {money(p.revenue)}
                  </p>
                </div>
                <div className="w-40">
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, p.pct).toFixed(1)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] text-gray-500">
                    {p.pct.toFixed(1)}%
                  </p>
                </div>
              </li>
            ))}
            {topProducts.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700">
                Sin datos en el rango seleccionado.
              </div>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Top categorías</h3>
            <span className="text-xs text-gray-500">{topCategories.length} categorías</span>
          </div>
          <ul className="space-y-2">
            {topCategories.map((c) => (
              <li
                key={c.category}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.category}</p>
                  <p className="text-xs text-gray-500">
                    {c.qty} uds · {money(c.revenue)}
                  </p>
                </div>
                <div className="w-40">
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(100, c.pct).toFixed(1)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] text-gray-500">
                    {c.pct.toFixed(1)}%
                  </p>
                </div>
              </li>
            ))}
            {topCategories.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700">
                Sin datos en el rango seleccionado.
              </div>
            )}
          </ul>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Ventas detalladas</h3>
          <span className="text-xs text-gray-500">
            {filtered.length} resultado(s) · Página {page} / {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500 dark:border-gray-800">
              <tr>
                <th className="p-3">Venta</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Canal</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Items</th>
                <th className="p-3">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {pageRows.map((s) => {
                const amount = s.items.reduce((a, it) => a + it.qty * it.unitPrice, 0);
                const resume =
                  s.items
                    .slice(0, 2)
                    .map((it) => `${it.product} x${it.qty}`)
                    .join(", ") + (s.items.length > 2 ? ` +${s.items.length - 2} más` : "");
                return (
                  <tr key={s.id}>
                    <td className="p-3 font-medium">{s.id}</td>
                    <td className="p-3 text-xs text-gray-500">{fmtDate(new Date(s.createdAt))}</td>
                    <td className="p-3 capitalize">{s.channel}</td>
                    <td className="p-3">{s.customerId}</td>
                    <td className="p-3 text-xs text-gray-600">{resume}</td>
                    <td className="p-3 font-semibold">{money(amount)}</td>
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-gray-500">
                    No hay ventas en este rango.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-3 flex items-center justify-end gap-2">
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

      {/* Nota de ayuda */}
      <p className="text-xs text-gray-500">
        Consejo: ajusta el rango de fechas y “Agrupar por” para ver tendencias diarias, semanales o mensuales.
      </p>
    </section>
  );
}
