// components/common/PageBreadcrumb.tsx
import Link from "next/link";

export type Crumb = { label: string; href?: string };

export default function PageBreadcrumb({
  pageTitle,
  crumbs,
  className,
}: {
  pageTitle: string;
  crumbs?: Crumb[];
  className?: string;
}) {
  const items = crumbs ?? [{ label: "Inicio", href: "/" }, { label: pageTitle }];

  return (
    <div className={className ?? "mb-6"}>
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex items-center gap-2">
              {c.href ? (
                <Link href={c.href} className="hover:text-gray-700 underline-offset-2 hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium">{c.label}</span>
              )}
              {i < items.length - 1 && <span className="opacity-60">/</span>}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="mt-2 text-2xl font-bold">{pageTitle}</h1>
    </div>
  );
}
