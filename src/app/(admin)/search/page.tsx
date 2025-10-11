"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { SearchResponse, Facets, EntityType } from "@/components/search/types";
import Filters from "@/components/search/Filters";
import ResultCard from "@/components/search/ResultCard";
import ResultsSkeleton from "@/components/search/ResultsSkeleton";
import EmptyState from "@/components/search/EmptyState";
import ErrorState from "@/components/search/ErrorState";
import Pagination from "@/components/search/Pagination";

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();

  const q = params.get("q") ?? "";
  const page = parseInt(params.get("page") || "1", 10);
  const typeParams = params.getAll("type");        // múltiples tipos
  const estadoParams = params.getAll("estado");
  const zonaParams = params.getAll("zona");

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (page > 1) p.set("page", String(page));
    typeParams.forEach((t) => p.append("type", t));
    estadoParams.forEach((e) => p.append("estado", e));
    zonaParams.forEach((z) => p.append("zona", z));
    p.set("pageSize", "9");
    return p.toString();
  }, [q, page, typeParams, estadoParams, zonaParams]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/search?${queryString}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as SearchResponse;
        if (!alive) return;
        setData(json);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Error de red");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [queryString]);

  // Utilidades para actualizar filtros en la URL
  const toggleParam = (key: string, val: string) => {
    const p = new URLSearchParams(params.toString());
    const all = p.getAll(key);
    if (all.includes(val)) {
      const next = all.filter((x) => x !== val);
      p.delete(key);
      next.forEach((n) => p.append(key, n));
    } else {
      p.append(key, val);
    }
    p.set("page", "1");
    router.push(`/search?${p.toString()}`);
  };

  const removeParam = (key: string, val: string) => {
    const p = new URLSearchParams(params.toString());
    const next = p.getAll(key).filter((x) => x !== val);
    p.delete(key);
    next.forEach((n) => p.append(key, n));
    p.set("page", "1");
    router.push(`/search?${p.toString()}`);
  };

  const clearFilters = () => {
    const p = new URLSearchParams(params.toString());
    ["type", "estado", "zona"].forEach((k) => p.delete(k));
    p.set("page", "1");
    router.push(`/search?${p.toString()}`);
  };

  const addType = (t: EntityType) => {
    const p = new URLSearchParams(params.toString());
    p.append("type", t);
    p.set("page", "1");
    router.push(`/search?${p.toString()}`);
  };

  const onPickSuggestion = (s: string) => {
    const p = new URLSearchParams(params.toString());
    p.set("q", s);
    p.set("page", "1");
    router.push(`/search?${p.toString()}`);
  };

  // Construir chips de filtros activos para EmptyState
  const activeFilters =
    (data?.facets
      ? (["type", "estado", "zona"] as (keyof Facets)[])
          .flatMap((key) =>
            (data.facets?.[key] ?? [])
              .filter((b) => b.selected)
              .map((b) => ({ key, value: b.key, label: key }))
          )
      : []) || [];

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Resultados de búsqueda
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {q ? <>Mostrando resultados para <span className="font-medium text-gray-900 dark:text-white">“{q}”</span></> : "Escribe algo en el buscador para comenzar."}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Filtros */}
        <aside className="md:order-1">
          {data?.facets ? (
            <Filters
              facets={data.facets}
              onToggle={(facetKey, bucketKey) => toggleParam(facetKey as string, bucketKey)}
            />
          ) : (
            <div className="sticky top-[88px] h-48 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900" />
          )}
        </aside>

        {/* Resultados */}
        <section className="md:order-2">
          {err && <ErrorState message={err} onRetry={() => router.refresh()} />}

          {loading && <ResultsSkeleton />}

          {!loading && !err && data && data.items.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {data.items.map((it) => <ResultCard key={it.id} item={it} />)}
              </div>
              <Pagination total={data.total} pageSize={data.pageSize} />
            </>
          )}

          {!loading && !err && data && data.items.length === 0 && (
            <EmptyState
              query={q}
              suggestions={data.suggestions}
              onPick={onPickSuggestion}
              activeFilters={activeFilters}
              onClearFilters={clearFilters}
              onRemoveFilter={(k, v) => removeParam(k, v)}
              onAddType={addType}
            />
          )}
        </section>
      </div>
    </div>
  );
}
