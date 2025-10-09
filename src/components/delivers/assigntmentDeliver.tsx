"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  EllipsisVerticalIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

type Assignment = {
  id: string;
  driver: string;
  phone: string;
  orderId: string;
  status: "activo" | "completado" | "pendiente";
  assignedAt: string;
};

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    driver: "Carlos Pérez",
    phone: "+1 555-1234",
    orderId: "ORD-1021",
    status: "activo",
    assignedAt: "2025-10-07 14:30",
  },
  {
    id: "a2",
    driver: "María López",
    phone: "+1 555-5678",
    orderId: "ORD-1022",
    status: "pendiente",
    assignedAt: "2025-10-07 15:10",
  },
  {
    id: "a3",
    driver: "José Martínez",
    phone: "+1 555-9999",
    orderId: "ORD-1023",
    status: "completado",
    assignedAt: "2025-10-06 19:45",
  },
];

/* Menú contextual con cierre automático */
function ActionMenu({
  closeMenu,
  onAssign,
  onUnassign,
  onMessage,
  onReport,
  onView,
}: {
  closeMenu: () => void;
  onAssign: () => void;
  onUnassign: () => void;
  onMessage: () => void;
  onReport: () => void;
  onView: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeMenu]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-7 z-50 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="max-h-60 overflow-y-auto">
        <button
          onClick={() => {
            onView();
            closeMenu();
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <EyeIcon className="h-4 w-4 text-gray-500" />
          Ver detalle
        </button>
        <button
          onClick={() => {
            onAssign();
            closeMenu();
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <UserPlusIcon className="h-4 w-4 text-green-500" />
          Asignar orden
        </button>
        <button
          onClick={() => {
            onUnassign();
            closeMenu();
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <UserMinusIcon className="h-4 w-4 text-red-500" />
          Desasignar
        </button>
        <button
          onClick={() => {
            onMessage();
            closeMenu();
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-500" />
          Enviar mensaje
        </button>
        <button
          onClick={() => {
            onReport();
            closeMenu();
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
          Reportar
        </button>
      </div>
    </div>
  );
}

/* Modal genérico */
function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            Cerrar
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function DriverAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openAddDriver, setOpenAddDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: "", phone: "" });

  /* Acciones */
  const handleAssign = (id: string) => alert(`Asignar orden de ${id}`);
  const handleUnassign = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    alert(`Orden ${id} desasignada`);
  };
  const handleMessage = (id: string) => alert(`Enviar mensaje sobre ${id}`);
  const handleReport = (id: string) => alert(`Reportar incidencia en ${id}`);
  const handleView = (id: string) => alert(`Detalle de asignación ${id}`);

  /* Filtro */
  const filtered = assignments.filter(
    (a) =>
      a.driver.toLowerCase().includes(search.toLowerCase()) ||
      a.orderId.toLowerCase().includes(search.toLowerCase()) ||
      a.status.toLowerCase().includes(search.toLowerCase())
  );

  /* Guardar nuevo repartidor */
  const addDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name.trim()) return alert("Nombre requerido");
    setAssignments((prev) => [
      ...prev,
      {
        id: `a${prev.length + 1}`,
        driver: newDriver.name,
        phone: newDriver.phone,
        orderId: "-",
        status: "pendiente",
        assignedAt: new Date().toLocaleString(),
      },
    ]);
    setNewDriver({ name: "", phone: "" });
    setOpenAddDriver(false);
  };

  return (
    <section className="space-y-6 p-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Asignaciones de Repartidores
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona órdenes asignadas, añade repartidores, envía mensajes y
            controla su estado en tiempo real.
          </p>
        </div>
        <button
          onClick={() => setOpenAddDriver(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-600"
        >
          <PlusIcon className="h-5 w-5" />
          Agregar repartidor
        </button>
      </header>

      {/* Buscador */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por repartidor, orden o estado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-10 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Repartidor</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Asignado en</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((a) => (
              <tr key={a.id} className="relative hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3 font-medium">{a.driver}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.phone}</td>
                <td className="px-4 py-3">{a.orderId}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.status === "activo"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : a.status === "completado"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    <ClockIcon className="h-3 w-3" />
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {a.assignedAt}
                </td>
                <td className="relative px-4 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === a.id ? null : a.id)}
                    className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                  </button>
                  {openMenuId === a.id && (
                    <ActionMenu
                      onAssign={() => handleAssign(a.id)}
                      onUnassign={() => handleUnassign(a.id)}
                      onMessage={() => handleMessage(a.id)}
                      onReport={() => handleReport(a.id)}
                      onView={() => handleView(a.id)}
                      closeMenu={() => setOpenMenuId(null)}
                    />
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No se encontraron asignaciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal agregar repartidor */}
      <Modal open={openAddDriver} title="Agregar nuevo repartidor" onClose={() => setOpenAddDriver(false)}>
        <form onSubmit={addDriver} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500">Nombre *</label>
            <input
              type="text"
              value={newDriver.name}
              onChange={(e) => setNewDriver((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Teléfono</label>
            <input
              type="text"
              value={newDriver.phone}
              onChange={(e) => setNewDriver((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="+1 555-9999"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenAddDriver(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
