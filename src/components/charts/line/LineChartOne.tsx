"use client";
import React, { useMemo, useState } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

// Carga dinámica (evita SSR de ApexCharts)
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ------------------------------------
// Tipos y mock data
// ------------------------------------
type ProductStat = {
  id: string;
  name: string;
  sold: number; // unidades vendidas
  refunds: number; // unidades devueltas
  demand: number; // demanda (p. ej. vistas / add-to-cart / búsquedas)
  revenue?: number; // opcional: ingresos
};

const PRODUCTS: ProductStat[] = [
  { id: "p1", name: "Hamburguesa Clásica", sold: 930, refunds: 28, demand: 1400, revenue: 930 * 6.5 },
  { id: "p2", name: "Pizza Pepperoni", sold: 1120, refunds: 34, demand: 1750, revenue: 1120 * 9.0 },
  { id: "p3", name: "Sushi Box 12", sold: 560, refunds: 18, demand: 920, revenue: 560 * 12.0 },
  { id: "p4", name: "Tacos al Pastor", sold: 780, refunds: 22, demand: 1200, revenue: 780 * 4.0 },
  { id: "p5", name: "Ensalada César", sold: 410, refunds: 15, demand: 860, revenue: 410 * 5.5 },
  { id: "p6", name: "Wrap Pollo", sold: 350, refunds: 9, demand: 640, revenue: 350 * 5.0 },
  { id: "p7", name: "Arepa Queso", sold: 220, refunds: 11, demand: 390, revenue: 220 * 3.5 },
  { id: "p8", name: "Ramen Clásico", sold: 300, refunds: 25, demand: 700, revenue: 300 * 10.0 },
  { id: "p9", name: "Empanada Carne", sold: 190, refunds: 7, demand: 350, revenue: 190 * 2.8 },
  { id: "p10", name: "Sándwich Veggie", sold: 260, refunds: 6, demand: 520, revenue: 260 * 5.2 },
  { id: "p11", name: "Postre Brownie", sold: 480, refunds: 20, demand: 900, revenue: 480 * 3.2 },
  { id: "p12", name: "Café Latte", sold: 1500, refunds: 12, demand: 2100, revenue: 1500 * 2.5 },
];

// ------------------------------------
// Utilidades
// ------------------------------------
const toTop = <T,>(arr: T[], n: number) => arr.slice(0, Math.max(0, n));

const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const clampN = (n: number, min = 1, max = 12) => Math.min(Math.max(n, min), max);

// ------------------------------------
// Componente principal
// ------------------------------------
export default function LineChartOne() {
  // Top N configurable
  const [topN, setTopN] = useState<number>(8);

  // Derivados
  const withRates = useMemo(
    () =>
      PRODUCTS.map((p) => ({
        ...p,
        refundRate: p.sold ? (p.refunds / p.sold) * 100 : 0,
        successRate: p.sold ? ((p.sold - p.refunds) / p.sold) * 100 : 0,
      })),
    []
  );

  const topSold = useMemo(
    () => toTop([...withRates].sort((a, b) => b.sold - a.sold), clampN(topN)),
    [withRates, topN]
  );
  const leastSold = useMemo(
    () => toTop([...withRates].sort((a, b) => a.sold - b.sold), clampN(topN)),
    [withRates, topN]
  );
  const mostRefunded = useMemo(
    () =>
      toTop(
        [...withRates]
          .filter((p) => p.sold > 0)
          .sort((a, b) => b.refundRate - a.refundRate || b.refunds - a.refunds),
        clampN(topN)
      ),
    [withRates, topN]
  );
  const mostDemanded = useMemo(
    () => toTop([...withRates].sort((a, b) => b.demand - a.demand), clampN(topN)),
    [withRates, topN]
  );

  // Helpers de opciones Apex (barras horizontales)
  const baseBarOptions = (title: string, color: string): ApexOptions => ({
    chart: {
      type: "bar",
      height: 360,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      animations: { enabled: true },
    },
    title: { text: title, align: "left", style: { fontSize: "14px", fontWeight: 600 } },
    colors: [color],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "60%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#e5e7eb" },
    xaxis: {
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    yaxis: {
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    legend: { show: false },
    tooltip: {
      shared: false,
      intersect: false,
    },
  });

  // Series y categorías para cada ranking
  const mkSeries = (arr: ProductStat[], field: keyof ProductStat | "refundRate") => [
    { name: String(field), data: arr.map((p) => Number((p as any)[field])) },
  ];
  const mkCats = (arr: ProductStat[]) => arr.map((p) => p.name);

  const optsTopSold: ApexOptions = {
    ...baseBarOptions("Más vendidos (Top)", "#465FFF"),
    xaxis: { ...baseBarOptions("", "").xaxis, categories: mkCats(topSold) },
  };
  const optsLeastSold: ApexOptions = {
    ...baseBarOptions("Menos vendidos (Bottom)", "#9CA3AF"),
    xaxis: { ...baseBarOptions("", "").xaxis, categories: mkCats(leastSold) },
  };
  const optsMostRefunded: ApexOptions = {
    ...baseBarOptions("Más reembolsados (tasa %)", "#EF4444"),
    xaxis: { ...baseBarOptions("", "").xaxis, categories: mkCats(mostRefunded) },
    tooltip: {
      shared: false,
      intersect: false,
      y: {
        formatter: (val: number, opts) => {
          const idx = (opts as any)?.dataPointIndex ?? 0;
          const p = mostRefunded[idx];
          return `${fmtPct(val)} · ${p.refunds}/${p.sold} uds.`;
        },
      },
    },
  };
  const optsMostDemanded: ApexOptions = {
    ...baseBarOptions("Más demandados", "#10B981"),
    xaxis: { ...baseBarOptions("", "").xaxis, categories: mkCats(mostDemanded) },
  };

  // Área de tendencia opcional (ventas vs ingresos)
  const trendOptions: ApexOptions = {
    chart: { type: "area", height: 310, toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    stroke: { curve: "straight", width: [2, 2] },
    fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    markers: { size: 0, strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    grid: { yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
    dataLabels: { enabled: false },
    colors: ["#465FFF", "#9CB9FF"],
    legend: { show: false },
    xaxis: {
      type: "category",
      categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: { labels: { style: { fontSize: "12px", colors: ["#6B7280"] } } },
    tooltip: { enabled: true, intersect: false },
  };
  const trendSeries = [
    { name: "Sales", data: [180,190,170,160,175,165,170,205,230,210,240,235] },
    { name: "Revenue", data: [40,30,50,40,55,40,70,100,110,120,150,140] },
  ];

  // Series concretas
  const seriesTopSold = mkSeries(topSold, "sold");
  const seriesLeastSold = mkSeries(leastSold, "sold");
  const seriesMostRefunded = [{ name: "refundRate", data: mostRefunded.map((p) => Number(p.refundRate.toFixed(2))) }];
  const seriesMostDemanded = mkSeries(mostDemanded, "demand");

  return (
    <section className="space-y-5">
      {/* Controles */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Productos: rendimiento</h2>
          <p className="text-sm text-gray-500">Top/bottom vendidos, reembolsos y demanda.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-500">Top N</label>
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
          >
            {[5, 8, 10, 12].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tendencia (opcional) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tendencia mensual (ventas vs ingresos)</h3>
        </div>
        <ReactApexChart options={trendOptions} series={trendSeries as any} type="area" height={310} />
      </div>

      {/* Cuadrícula de rankings */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <ReactApexChart options={optsTopSold} series={seriesTopSold as any} type="bar" height={360} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <ReactApexChart options={optsLeastSold} series={seriesLeastSold as any} type="bar" height={360} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <ReactApexChart options={optsMostRefunded} series={seriesMostRefunded as any} type="bar" height={360} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <ReactApexChart options={optsMostDemanded} series={seriesMostDemanded as any} type="bar" height={360} />
        </div>
      </div>

      {/* Notas */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <ul className="list-inside list-disc space-y-1">
          <li><b>Más vendidos</b>: ordenado por unidades vendidas (desc).</li>
          <li><b>Menos vendidos</b>: ordenado por unidades vendidas (asc).</li>
          <li><b>Más reembolsados</b>: por <i>tasa de reembolso</i> (% = reembolsos / vendidos). Empates por reembolsos absolutos.</li>
          <li><b>Más demandados</b>: proxy de demanda (vistas / búsquedas / add-to-cart).</li>
        </ul>
      </div>
    </section>
  );
}