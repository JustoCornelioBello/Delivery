"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

/**
 * DeliveredSuccess – Entregas exitosas, tasas y confianza
 * Definiciones:
 * - Entregados = Ventas - Reembolsos (ventas que no terminaron en devolución)
 * - Éxito (%) = Entregados / (Entregados + Cancelados + Reembolsos + Incidencias)
 * - Cancelación (%) = Cancelados / (Entregados + Cancelados)
 * - Confianza (%) = 1 - (Incidencias / (Entregados + Incidencias))
 */
export default function DeliveredSuccess() {
  const categories = useMemo(
    () => ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    []
  );

  // Datos simulados (12 meses)
  const sales: number[] =     [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112];
  const canceled: number[] =  [  6,  10,   8,   9,   7,   6,  12,   5,   8,  11,  10,   4];
  const refunds: number[] =   [  2,   6,   4,   5,   3,   3,   7,   1,   3,   6,   5,   2];
  const incidents: number[] = [  3,   7,   4,   6,   4,   5,   6,   2,   4,   7,   6,   2];

  // Entregados = ventas que no se reembolsaron
  const delivered = useMemo(() => sales.map((v, i) => Math.max(0, v - (refunds[i] ?? 0))), [sales, refunds]);

  // Totales/porcentajes (periodo completo)
  const totals = useMemo(() => {
    const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
    const T = {
      delivered: sum(delivered),
      canceled: sum(canceled),
      refunds: sum(refunds),
      incidents: sum(incidents),
    };
    const denomSuccess = T.delivered + T.canceled + T.refunds + T.incidents;
    const denomCancel = T.delivered + T.canceled;
    const denomTrust = T.delivered + T.incidents;

    const successRate = denomSuccess ? (T.delivered / denomSuccess) * 100 : 0;
    const cancelRate = denomCancel ? (T.canceled / denomCancel) * 100 : 0;
    const trustRate = denomTrust ? (1 - T.incidents / denomTrust) * 100 : 100;

    return { ...T, successRate, cancelRate, trustRate };
  }, [delivered, canceled, refunds, incidents]);

  // Índice del último mes disponible (seguro ante longitudes distintas)
  const lastIdx = useMemo(() => Math.min(categories.length, delivered.length) - 1, [categories.length, delivered.length]);

  // KPIs del último mes
  const lastTotals = useMemo(() => {
    const d = delivered[lastIdx] ?? 0;
    const c = canceled[lastIdx] ?? 0;
    const r = refunds[lastIdx] ?? 0;
    const i = incidents[lastIdx] ?? 0;

    const denomSuccess = d + c + r + i;
    const denomCancel = d + c;
    const denomTrust = d + i;

    return {
      delivered: d,
      canceled: c,
      refunds: r,
      incidents: i,
      successRate: denomSuccess ? (d / denomSuccess) * 100 : 0,
      cancelRate: denomCancel ? (c / denomCancel) * 100 : 0,
      trustRate: denomTrust ? (1 - i / denomTrust) * 100 : 100,
    };
  }, [delivered, canceled, refunds, incidents, lastIdx]);

  // --- Barras apiladas ---
  const stackedOptions: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      height: 280,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#10b981", "#ef4444", "#f59e0b", "#8b5cf6"], // Entregados, Cancelados, Reembolsos, Incidencias
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    yaxis: {
      tickAmount: 4,
      labels: { style: { colors: "#6b7280", fontSize: "12px" } },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      markers: { radius: 12 },
      itemMargin: { horizontal: 8 },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 6,
        // Nota: borderRadiusApplication puede no existir en tipos antiguos
        // borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 3,
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number, opts?: { dataPointIndex: number }) => {
          const idx = (opts as any)?.dataPointIndex ?? 0;
          const total =
            (delivered[idx] ?? 0) +
            (canceled[idx] ?? 0) +
            (refunds[idx] ?? 0) +
            (incidents[idx] ?? 0);
          const pct = total ? (val / total) * 100 : 0;
          return `${val} (${pct.toFixed(1)}%)`;
        },
      },
    },
  };

  const stackedSeries = [
    { name: "Entregados", data: delivered },
    { name: "Cancelados", data: canceled },
    { name: "Reembolsos", data: refunds },
    { name: "Incidencias", data: incidents },
  ];

  // --- Radial – Éxito / Confianza (global y último mes) ---
  const radialOptions: ApexOptions = {
    chart: { type: "radialBar", height: 260, toolbar: { show: false } },
    plotOptions: {
      radialBar: {
        hollow: { size: "52%" },
        dataLabels: {
          name: { fontSize: "12px", color: "#6b7280" },
          value: {
            fontSize: "20px",
            fontWeight: 700,
            formatter: (v: number) => `${Number(v).toFixed(1)}%`,
          },
          total: { show: false },
        },
        track: { strokeWidth: "100%", opacity: 0.15 },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      itemMargin: { horizontal: 8, vertical: 4 },
      markers: { radius: 12 },
    },
    colors: ["#10b981", "#06b6d4", "#16a34a", "#3b82f6"], // éxito global, confianza global, éxito último, confianza último
    labels: [
      "Éxito (global)",
      "Confianza (global)",
      "Éxito (últ. mes)",
      "Confianza (últ. mes)",
    ],
  };

  const radialSeries = [
    Number(totals.successRate.toFixed(2)),
    Number(totals.trustRate.toFixed(2)),
    Number(lastTotals.successRate.toFixed(2)),
    Number(lastTotals.trustRate.toFixed(2)),
  ];

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Entregas & Calidad</h2>
          <p className="text-sm text-gray-500">Éxito de entregas, cancelaciones e incidencias.</p>
        </div>
        <div className="text-xs text-gray-500">
          Último mes — Éxito: <b>{lastTotals.successRate.toFixed(1)}%</b> · Confianza: <b>{lastTotals.trustRate.toFixed(1)}%</b>
        </div>
      </div>

      {/* Barras apiladas */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Estado mensual de pedidos</h3>
            <p className="text-xs text-gray-500">Distribución por mes (entregados, cancelados, reembolsos, incidencias).</p>
          </div>
        </div>
        <ReactApexChart options={stackedOptions} series={stackedSeries as any} type="bar" height={280} />
      </div>

      {/* Radiales + KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Éxito & Confianza</h3>
          <ReactApexChart options={radialOptions} series={radialSeries as any} type="radialBar" height={260} />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Entregados (periodo)</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totals.delivered}</p>
            <p className="text-[11px] text-gray-500">Ventas netas sin reembolso</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Cancelados (periodo)</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totals.canceled}</p>
            <p className="text-[11px] text-gray-500">Tasa de cancelación: {totals.cancelRate.toFixed(1)}%</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Confianza operativa</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totals.trustRate.toFixed(1)}%</p>
            <p className="text-[11px] text-gray-500">{totals.incidents} incidencias en el periodo</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs text-gray-500">Reembolsos</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{totals.refunds}</p>
            <p className="text-[11px] text-gray-500">Afectan entregados netos</p>
          </div>
        </div>
      </div>

      {/* Glosario */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <ul className="list-inside list-disc space-y-1">
          <li>
            <b>Entregados</b>: ventas netas sin devolución.
          </li>
          <li>
            <b>Éxito</b>: proporción de pedidos exitosos frente al total de outcomes (incluye cancelados, reembolsos e incidencias).
          </li>
          <li>
            <b>Cancelación</b>: cancelados respecto a entregados+cancelados.
          </li>
          <li>
            <b>Confianza</b>: 1 − incidencias / (entregados + incidencias).
          </li>
        </ul>
      </div>
    </section>
  );
}
