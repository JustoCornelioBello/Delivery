"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function Pagination({ total, pageSize }: { total: number; pageSize: number; }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = parseInt(params.get("page") || "1", 10);

  if (pages <= 1) return null;

  const go = (p: number) => {
    const q = new URLSearchParams(params.toString());
    q.set("page", String(p));
    router.push(`${pathname}?${q.toString()}`);
  };

  return (
    <nav className="mt-6 flex items-center justify-center gap-2 text-sm">
      <button onClick={() => go(Math.max(1, current - 1))} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900">
        Anterior
      </button>
      <span className="px-2 text-gray-600 dark:text-gray-400">Página {current} de {pages}</span>
      <button onClick={() => go(Math.min(pages, current + 1))} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900">
        Siguiente
      </button>
    </nav>
  );
}
