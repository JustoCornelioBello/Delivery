import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export default function ComponentCard({ children,  className }: Props) {
  return (
    <section className={`rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 ${className ?? ""}`}>
      
      <div>{children}</div>
    </section>
  );
}
