"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  EllipsisVerticalIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

/* Tipo repartidor */
type Driver = {
  id: string;
  name: string;
  phone: string;
  status: "activo" | "inactivo";
  deliveries: number;
  rating: number;
};

/* Datos simulados */
const MOCK_DRIVERS: Driver[] = [
  {
    id: "d1",
    name: "Carlos Pérez",
    phone: "+1 555-1234",
    status: "activo",
    deliveries: 152,
    rating: 4.8,
  },
  {
    id: "d2",
    name: "María López",
    phone: "+1 555-5678",
    status: "activo",
    deliveries: 98,
    rating: 4.5,
  },
  {
    id: "d3",
    name: "José Martínez",
    phone: "+1 555-9999",
    status: "inactivo",
    deliveries: 210,
    rating: 4.9,
  },
];

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
        className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
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

/* Menú contextual */
function ActionMenu({
  closeMenu,
  onView,
  onActivate,
  onDeactivate,
  onMessage,
  onReport,
}: {
  closeMenu: () => void;
  onView: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onMessage: () => void;
  onReport: () => void;
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
          Ver perfil
        </button>
        <button
          onClick={() => {
            onActivate();
            closeMenu();
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
          Activar
        </button>
        <button
          onClick={() => {
            onDeactivate();
            closeMenu();
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XCircleIcon className="h-4 w-4 text-red-500" />
          Desactivar
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

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openAddDriver, setOpenAddDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: "", phone: "" });

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.toLowerCase().includes(search.toLowerCase()) ||
      d.status.toLowerCase().includes(search.toLowerCase())
  );

  /* Acciones */
  const handleActivate = (id: string) =>
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, status: "activo" } : d)));
  const handleDeactivate = (id: string) =>
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, status: "inactivo" } : d)));
  const handleMessage = (id: string) => alert(`Enviar mensaje a ${id}`);
  const handleReport = (id: string) => alert(`Reportar repartidor ${id}`);
  const handleView = (id: string) => alert(`Ver perfil de ${id}`);

  /* Guardar nuevo */
  const addDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name.trim()) return alert("Nombre requerido");
    setDrivers((prev) => [
      ...prev,
      {
        id: `d${prev.length + 1}`,
        name: newDriver.name,
        phone: newDriver.phone,
        status: "activo",
        deliveries: 0,
        rating: 0,
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
            Repartidores
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona la lista de repartidores, su estado, rendimiento y más.
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
          placeholder="Buscar por nombre, teléfono o estado..."
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
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Entregas</th>
              <th className="px-4 py-3">Calificación</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((d) => (
              <tr key={d.id} className="relative hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.phone}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.status === "activo"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3">{d.deliveries}</td>
                <td className="px-4 py-3 flex items-center gap-1">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  {d.rating.toFixed(1)}
                </td>
                <td className="relative px-4 py-3 text-right">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === d.id ? null : d.id)}
                    className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                  </button>
                  {openMenuId === d.id && (
                    <ActionMenu
                      onView={() => handleView(d.id)}
                      onActivate={() => handleActivate(d.id)}
                      onDeactivate={() => handleDeactivate(d.id)}
                      onMessage={() => handleMessage(d.id)}
                      onReport={() => handleReport(d.id)}
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
                  No se encontraron repartidores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal agregar repartidor */}
      <Modal
        open={openAddDriver}
        title="Agregar nuevo repartidor"
        onClose={() => setOpenAddDriver(false)}
      >
        <form onSubmit={addDriver} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500">Nombre *</label>
            <input
              type="text"
              value={newDriver.name}
              onChange={(e) =>
                setNewDriver((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Teléfono</label>
            <input
              type="text"
              value={newDriver.phone}
              onChange={(e) =>
                setNewDriver((prev) => ({ ...prev, phone: e.target.value }))
              }
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
