"use client";
import ResultCard from "./ResultCard";
import ResultsSkeleton from "./ResultsSkeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Pagination from "./Pagination";
import Filters from "./Filters";
import type { SearchResponse } from "./types";

export default function Results({
  q, data, loading, err, onRetry, onPickSuggestion,
}: {
  q: string; data: SearchResponse | null; loading: boolean; err: string | null;
  onRetry: () => void; onPickSuggestion: (s: string) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <div className="md:order-1">
        {data?.facets ? <Filters facets={data.facets} /> : (
          <div className="sticky top-[88px] h-48 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900" />
        )}
      </div>
      <section className="md:order-2">
        {err && <ErrorState message={err} onRetry={onRetry} />}
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
          <EmptyState query={q} suggestions={data.suggestions} onPick={onPickSuggestion} />
        )}
      </section>
    </div>
  );
}
