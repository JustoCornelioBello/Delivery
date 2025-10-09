"use client";

import React, { useMemo, useState } from "react";
import {
  EllipsisVerticalIcon,
  EnvelopeIcon,
  GiftIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";

/* ───────────── Tipos ───────────── */
type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  status: "nuevo" | "frecuente" | "inactivo";
  joinedAt: string;
  points: number;
};

/* ───────────── Datos simulados ───────────── */
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "u1",
    name: "Ana López",
    email: "ana@example.com",
    phone: "+1 555 123-4567",
    address: "Av. Central 123",
    totalOrders: 15,
    status: "frecuente",
    joinedAt: "2022-03-15",
    points: 340,
  },
  {
    id: "u2",
    name: "Luis Gómez",
    email: "luis@example.com",
    phone: "+1 555 555-9999",
    address: "Calle 8 #45",
    totalOrders: 2,
    status: "nuevo",
    joinedAt: "2023-11-02",
    points: 20,
  },
  {
    id: "u3",
    name: "Carla Méndez",
    email: "carla@example.com",
    phone: "+1 555 222-7788",
    address: "Av. Norte 900",
    totalOrders: 7,
    status: "frecuente",
    joinedAt: "2022-10-10",
    points: 120,
  },
  {
    id: "u4",
    name: "Pedro Ruiz",
    email: "pedro@example.com",
    phone: "+1 555 777-4444",
    address: "Diag. 12 #99",
    totalOrders: 0,
    status: "inactivo",
    joinedAt: "2021-07-20",
    points: 0,
  },
];

/* ───────────── Modal Genérico ───────────── */
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

/* ───────────── Menú Acciones ───────────── */
const ActionMenu: React.FC<{ onSelect: (action: string) => void }> = ({
  onSelect,
}) => {
  const actions = [
    { id: "ver", label: "Ver detalle", icon: EyeIcon },
    { id: "premiar", label: "Premiar cliente", icon: GiftIcon },
    { id: "comunicar", label: "Enviar comunicado", icon: EnvelopeIcon },
    { id: "reportar", label: "Reportar cliente", icon: ExclamationTriangleIcon },
    { id: "bloquear", label: "Bloquear cliente", icon: UserMinusIcon },
  ];

  return (
    <div className="absolute right-0 top-6 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <ul className="text-sm">
        {actions.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              onClick={() => onSelect(id)}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon className="h-4 w-4 text-gray-500" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ───────────── Página Clientes ───────────── */
export default function CustomersPage() {
  const [customers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search);
      const matchesStatus =
        filterStatus === "Todos" || c.status === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, filterStatus]);

  const handleAction = (action: string, customer: Customer) => {
    setMenuOpen(null);
    switch (action) {
      case "ver":
        setSelected(customer);
        break;
      case "premiar":
        alert(`🎁 Premiado ${customer.name}`);
        break;
      case "comunicar":
        alert(`✉️ Comunicado enviado a ${customer.email}`);
        break;
      case "reportar":
        alert(`⚠️ Cliente reportado: ${customer.name}`);
        break;
      case "bloquear":
        alert(`⛔ Cliente bloqueado: ${customer.name}`);
        break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Administra la información de tus clientes, filtra por estado y
            aplica acciones personalizadas.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <option>Todos</option>
          <option>Nuevo</option>
          <option>Frecuente</option>
          <option>Inactivo</option>
        </select>
      </div>

      {/* Tabla Clientes */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="border-b text-xs text-gray-500 dark:border-gray-700">
            <tr>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Pedidos</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="relative">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.totalOrders}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.status === "frecuente"
                        ? "bg-green-100 text-green-700"
                        : c.status === "nuevo"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() =>
                      setMenuOpen(menuOpen === c.id ? null : c.id)
                    }
                    className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  {menuOpen === c.id && (
                    <ActionMenu
                      onSelect={(a) => handleAction(a, c)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal detalle cliente */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalle del Cliente"
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">{selected.name}</h4>
              <p className="text-gray-500">{selected.email}</p>
              <p className="text-gray-500">{selected.phone}</p>
              <p className="text-gray-500">{selected.address}</p>
              <p className="text-gray-500">
                Cliente desde:{" "}
                {new Date(selected.joinedAt).toLocaleDateString()}
              </p>
              <p className="mt-1 font-semibold">
                ⭐ Puntos acumulados: {selected.points}
              </p>
            </div>
            <div className="rounded-md border p-3 dark:border-gray-700">
              <h5 className="font-semibold mb-2">Historial de pedidos</h5>
              <ul className="list-disc pl-4 text-gray-600 dark:text-gray-300">
                <li>Pedido #1001 · $25 · Entregado</li>
                <li>Pedido #1002 · $18 · Cancelado</li>
                <li>Pedido #1003 · $42 · En ruta</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
