import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export default function ComponentCard({ title, children, description, actions, className }: Props) {
  return (
    <section className={`rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 ${className ?? ""}`}>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        {actions}
      </header>
      <div>{children}</div>
    </section>
  );
}
