"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";

/* ------------------------------------------------------------
   Tipos
------------------------------------------------------------ */
type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

type DaySchedule = {
  open: boolean;   // ¿abre este día?
  from: string;   // "09:00"
  to: string;     // "18:00"
};

type SpecialDay = {
  id: string;
  date: string;         // "2025-12-24"
  reason: string;       // "Nochebuena"
  closedAllDay: boolean;
  from?: string;
  to?: string;
};

type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  manager?: string;
  notes?: string;
  schedule: Record<DayKey, DaySchedule>;
  specialDays: SpecialDay[];
  active: boolean;
};

/* ------------------------------------------------------------
   Helpers
------------------------------------------------------------ */
const days: { key: DayKey; label: string }[] = [
  { key: "Mon", label: "Lunes" },
  { key: "Tue", label: "Martes" },
  { key: "Wed", label: "Miércoles" },
  { key: "Thu", label: "Jueves" },
  { key: "Fri", label: "Viernes" },
  { key: "Sat", label: "Sábado" },
  { key: "Sun", label: "Domingo" },
];

const defaultDay = (): DaySchedule => ({ open: true, from: "09:00", to: "18:00" });

const defaultSchedule = (): Record<DayKey, DaySchedule> => ({
  Mon: defaultDay(),
  Tue: defaultDay(),
  Wed: defaultDay(),
  Thu: defaultDay(),
  Fri: defaultDay(),
  Sat: { open: true, from: "10:00", to: "16:00" },
  Sun: { open: false, from: "00:00", to: "00:00" },
});

const uid = () => Math.random().toString(36).slice(2, 10);

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------
   Página
------------------------------------------------------------ */
export default function LocationsSettingsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carga inicial desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("biz_branches");
      if (raw) setBranches(JSON.parse(raw));
      else {
        // seed de ejemplo
        setBranches([
          {
            id: uid(),
            name: "Sucursal Centro",
            address: "Av. Independencia #101",
            city: "Santo Domingo",
            province: "Distrito Nacional",
            phone: "+1 809 555 1001",
            manager: "Ana Pérez",
            notes: "Punto con mayor volumen de pedidos.",
            schedule: defaultSchedule(),
            specialDays: [
              { id: uid(), date: "2025-12-25", reason: "Navidad", closedAllDay: true },
            ],
            active: true,
          },
        ]);
      }
    } catch {}
  }, []);

  // Persistencia
  useEffect(() => {
    localStorage.setItem("biz_branches", JSON.stringify(branches));
  }, [branches]);

  /* ------------- helpers de edición ------------- */
  const startCreate = () => {
    setErrors({});
    setEditing({
      id: uid(),
      name: "",
      address: "",
      city: "",
      province: "",
      phone: "",
      manager: "",
      notes: "",
      schedule: defaultSchedule(),
      specialDays: [],
      active: true,
    });
    setModalOpen(true);
  };

  const startEdit = (b: Branch) => {
    setErrors({});
    // clonar para evitar mutaciones
    setEditing(JSON.parse(JSON.stringify(b)));
    setModalOpen(true);
  };

  const remove = (id: string) => {
    if (!confirm("¿Eliminar esta sucursal?")) return;
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  const setField = <K extends keyof Branch>(key: K, value: Branch[K]) => {
    if (!editing) return;
    setEditing({ ...editing, [key]: value });
  };

  const setSchedule = (day: DayKey, patch: Partial<DaySchedule>) => {
    if (!editing) return;
    setEditing({
      ...editing,
      schedule: { ...editing.schedule, [day]: { ...editing.schedule[day], ...patch } },
    });
  };

  const addSpecial = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      specialDays: [
        ...editing.specialDays,
        { id: uid(), date: "", reason: "", closedAllDay: true },
      ],
    });
  };

  const updateSpecial = (id: string, patch: Partial<SpecialDay>) => {
    if (!editing) return;
    setEditing({
      ...editing,
      specialDays: editing.specialDays.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const removeSpecial = (id: string) => {
    if (!editing) return;
    setEditing({
      ...editing,
      specialDays: editing.specialDays.filter((s) => s.id !== id),
    });
  };

  /* ------------- validación ------------- */
  const validate = (): boolean => {
    if (!editing) return false;
    const e: Record<string, string> = {};
    if (!editing.name.trim()) e.name = "Nombre requerido.";
    if (!editing.address.trim()) e.address = "Dirección requerida.";
    if (!editing.city.trim()) e.city = "Ciudad requerida.";
    if (!editing.province.trim()) e.province = "Provincia requerida.";
    if (!/^\+?[0-9()\-\s]+$/.test(editing.phone.trim())) e.phone = "Teléfono inválido.";
    // Horarios: when open=true, from < to
    for (const d of days) {
      const ds = editing.schedule[d.key];
      if (ds.open) {
        if (!ds.from || !ds.to) e[`schedule_${d.key}`] = "Horario incompleto.";
        else if (ds.from >= ds.to) e[`schedule_${d.key}`] = "La hora de inicio debe ser menor que la de cierre.";
      }
    }
    // Special days: if !closedAllDay, require from<to
    for (const s of editing.specialDays) {
      if (!s.date) e[`special_${s.id}_date`] = "Fecha requerida.";
      if (!s.closedAllDay) {
        if (!s.from || !s.to) e[`special_${s.id}_range`] = "Rango horario requerido.";
        else if (s.from >= s.to) e[`special_${s.id}_range`] = "Inicio debe ser menor que cierre.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!editing) return;
    if (!validate()) return;
    setBranches((prev) => {
      const exists = prev.some((b) => b.id === editing.id);
      return exists ? prev.map((b) => (b.id === editing.id ? editing : b)) : [...prev, editing];
    });
    setModalOpen(false);
    setEditing(null);
    alert("Sucursal guardada ✅");
  };

  const resumen = useMemo(() => {
    const total = branches.length;
    const activas = branches.filter((b) => b.active).length;
    return { total, activas, inactivas: total - activas };
  }, [branches]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Sucursales & horarios
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Gestiona direcciones, horarios de atención y cierres especiales.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-2 font-medium text-gray-800 dark:text-white">Resumen</h3>
          <ul className="grid grid-cols-3 gap-4">
            <li className="text-center">
              <p className="text-xs text-gray-500">Sucursales</p>
              <p className="text-lg font-semibold">{resumen.total}</p>
            </li>
            <li className="text-center">
              <p className="text-xs text-gray-500">Activas</p>
              <p className="text-lg font-semibold text-emerald-600">{resumen.activas}</p>
            </li>
            <li className="text-center">
              <p className="text-xs text-gray-500">Inactivas</p>
              <p className="text-lg font-semibold text-amber-600">{resumen.inactivas}</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Lista de sucursales */}
      <Section
        title="Sucursales"
        description="Crea, edita o desactiva sucursales. Estas direcciones se usan para cálculo de horarios visibles y logística."
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {branches.length === 0
              ? "Aún no tienes sucursales registradas."
              : "Haz clic en una sucursal para editarla."}
          </p>
          <Button onClick={startCreate}>Nueva sucursal</Button>
        </div>

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {branches.map((b) => (
            <li key={b.id} className="flex items-start justify-between gap-3 py-3">
              <button
                onClick={() => startEdit(b)}
                className="text-left"
                title="Editar sucursal"
              >
                <h4 className="font-medium text-gray-800 dark:text-white">
                  {b.name} {b.active ? "" : <span className="text-amber-600">(inactiva)</span>}
                </h4>
                <p className="text-sm text-gray-500">
                  {b.address}, {b.city}, {b.province} · {b.phone}
                </p>
                {b.notes && (
                  <p className="mt-1 text-xs text-gray-500">Notas: {b.notes}</p>
                )}
              </button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => startEdit(b)}>Editar</Button>
                <Button variant="outline" onClick={() => setBranches(prev => prev.map(x => x.id === b.id ? { ...x, active: !x.active } : x))}>
                  {b.active ? "Desactivar" : "Activar"}
                </Button>
                <Button variant="outline" onClick={() => remove(b.id)}>Eliminar</Button>
              </div>
            </li>
          ))}
          {branches.length === 0 && (
            <li className="py-8 text-center text-sm text-gray-500">
              Sin sucursales. Crea la primera para empezar.
            </li>
          )}
        </ul>
      </Section>

      {/* Modal de sucursal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} className="max-w-4xl">
        {editing && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {editing.id && branches.some((b) => b.id === editing.id) ? "Editar sucursal" : "Nueva sucursal"}
                </h3>
                <p className="text-sm text-gray-500">
                  Define dirección, horarios y cierres especiales.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Activa</span>
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setField("active", e.target.checked)}
                />
              </div>
            </div>

            {/* Datos generales */}
            <Section title="Datos generales">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <Label>Nombre de la sucursal</Label>
                  <Input
                    value={editing.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={editing.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label>Dirección</Label>
                  <Input
                    value={editing.address}
                    onChange={(e) => setField("address", e.target.value)}
                  />
                  {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
                </div>
                <div>
                  <Label>Ciudad</Label>
                  <Input
                    value={editing.city}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                  {errors.city && <p className="mt-1 text-xs text-rose-600">{errors.city}</p>}
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input
                    value={editing.province}
                    onChange={(e) => setField("province", e.target.value)}
                  />
                  {errors.province && <p className="mt-1 text-xs text-rose-600">{errors.province}</p>}
                </div>
                <div>
                  <Label>Encargado (opcional)</Label>
                  <Input
                    value={editing.manager ?? ""}
                    onChange={(e) => setField("manager", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Notas (opcional)</Label>
                  <Input
                    value={editing.notes ?? ""}
                    onChange={(e) => setField("notes", e.target.value)}
                  />
                </div>
              </div>
            </Section>

            {/* Horario semanal */}
            <Section
              title="Horario semanal"
              description="Formato 24h. Si un día está cerrado, desmarca la casilla."
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {days.map((d) => {
                  const sch = editing.schedule[d.key];
                  return (
                    <div key={d.key} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {d.label}
                        </span>
                        <label className="flex items-center gap-2 text-xs text-gray-600">
                          Abre
                          <input
                            type="checkbox"
                            checked={sch.open}
                            onChange={(e) => setSchedule(d.key, { open: e.target.checked })}
                          />
                        </label>
                      </div>
                      {sch.open ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Desde</Label>
                            <Input
                              type="time"
                              value={sch.from}
                              onChange={(e) => setSchedule(d.key, { from: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Hasta</Label>
                            <Input
                              type="time"
                              value={sch.to}
                              onChange={(e) => setSchedule(d.key, { to: e.target.value })}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Cerrado</p>
                      )}
                      {errors[`schedule_${d.key}`] && (
                        <p className="mt-1 text-xs text-rose-600">{errors[`schedule_${d.key}`]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Cierres especiales */}
            <Section
              title="Cierres especiales"
              description="Días feriados o excepciones. Puedes cerrar todo el día o definir un horario especial."
            >
              <div className="mb-3">
                <Button variant="outline" onClick={addSpecial}>
                  Añadir fecha
                </Button>
              </div>
              <div className="space-y-3">
                {editing.specialDays.length === 0 && (
                  <p className="text-sm text-gray-500">No hay cierres especiales.</p>
                )}

                {editing.specialDays.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                      <div>
                        <Label>Fecha</Label>
                        <Input
                          type="date"
                          value={s.date}
                          onChange={(e) => updateSpecial(s.id, { date: e.target.value })}
                        />
                        {errors[`special_${s.id}_date`] && (
                          <p className="mt-1 text-xs text-rose-600">
                            {errors[`special_${s.id}_date`]}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Motivo</Label>
                        <Input
                          value={s.reason}
                          onChange={(e) => updateSpecial(s.id, { reason: e.target.value })}
                        />
                      </div>
                      <div className="flex items-end justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          Cerrar todo el día
                          <input
                            type="checkbox"
                            checked={s.closedAllDay}
                            onChange={(e) => updateSpecial(s.id, { closedAllDay: e.target.checked })}
                          />
                        </label>
                        <Button variant="outline" onClick={() => removeSpecial(s.id)}>
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    {!s.closedAllDay && (
                      <div className="mt-3 grid grid-cols-2 gap-3 md:max-w-md">
                        <div>
                          <Label>Desde</Label>
                          <Input
                            type="time"
                            value={s.from ?? ""}
                            onChange={(e) => updateSpecial(s.id, { from: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Hasta</Label>
                          <Input
                            type="time"
                            value={s.to ?? ""}
                            onChange={(e) => updateSpecial(s.id, { to: e.target.value })}
                          />
                        </div>
                        {errors[`special_${s.id}_range`] && (
                          <p className="col-span-2 mt-1 text-xs text-rose-600">
                            {errors[`special_${s.id}_range`]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            {/* Acciones modal */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={save}>Guardar sucursal</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
