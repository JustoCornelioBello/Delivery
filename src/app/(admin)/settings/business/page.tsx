"use client";

import { useMemo, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

/* ----------------------------------------------------------------
   Helpers
---------------------------------------------------------------- */
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
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
      <span className="text-gray-700 dark:text-gray-200">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

/* ----------------------------------------------------------------
   Página
---------------------------------------------------------------- */
export default function BusinessSettingsPage() {
  const [form, setForm] = useState({
    // Identidad
    brandName: "Mi Tienda S.A.",
    commercialName: "Mi Tienda",
    businessDescription:
      "Comercio minorista y entregas a domicilio con red de repartidores.",
    logoUrl: "",
    // Fiscal RD
    rnc: "1-01-12345-6",
    taxpayerType: "Contribuyente Ordinario",
    ncfSeries: "B010",
    ncfAutorizado: true,
    currency: "DOP",
    itbisRate: 18,
    // Contacto
    phone: "+1 809 555 1234",
    email: "contacto@mitienda.com",
    whatsapp: "+1 809 555 5678",
    website: "https://mitienda.com",
    supportEmail: "soporte@mitienda.com",
    // Dirección fiscal
    addressStreet: "Av. Independencia #101",
    addressCity: "Santo Domingo",
    addressProvince: "Distrito Nacional",
    addressPostal: "10110",
    // Horarios
    scheduleWeekdayFrom: "09:00",
    scheduleWeekdayTo: "20:00",
    scheduleWeekendFrom: "10:00",
    scheduleWeekendTo: "18:00",
    // Logística / entregas
    deliveryRadiusKm: 10,
    baseDeliveryFee: 120,
    freeShippingFrom: 2500,
    slaMins: 60,
    // Zonas extra (texto simple, puedes conectar a tu UI de zonas)
    extraZones: "Zona Colonial: 150; Arroyo Hondo: 180",
    // Redes
    facebook: "https://www.facebook.com/MiTienda",
    x: "https://x.com/MiTienda",
    instagram: "https://instagram.com/MiTienda",
    linkedin: "",
    // Representante
    legalRepName: "Justo Bello",
    legalRepId: "001-1234567-8",
    legalRepEmail: "justo@mitienda.com",
    // Políticas
    refundsDays: 7,
    termsUrl: "",
    privacyUrl: "",
    // Notificaciones
    notifyOrdersEmail: true,
    notifyOrdersPush: true,
    notifySecurityEmail: true,
    // Facturación
    requireInvoiceData: true,
    defaultInvoicePrint: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const preview = useMemo(
    () => ({
      nombreComercial: form.commercialName,
      RNC: form.rnc,
      NCF: form.ncfSeries,
      Moneda: form.currency,
      ITBIS: `${form.itbisRate}%`,
      Tel: form.phone,
      Email: form.email,
      Web: form.website,
      Horario: `L-V ${form.scheduleWeekdayFrom}-${form.scheduleWeekdayTo} · S-D ${form.scheduleWeekendFrom}-${form.scheduleWeekendTo}`,
      Entregas: `Radio ${form.deliveryRadiusKm}km · Base ${form.baseDeliveryFee} ${form.currency} · Envío gratis desde ${form.freeShippingFrom} ${form.currency} · SLA ${form.slaMins}min`,
    }),
    [form]
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.brandName.trim()) e.brandName = "Requerido.";
    if (!form.rnc.trim()) e.rnc = "RNC requerido.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email inválido.";
    if (!/^\S+@\S+\.\S+$/.test(form.supportEmail))
      e.supportEmail = "Email inválido.";
    if (form.itbisRate < 0 || form.itbisRate > 30)
      e.itbisRate = "ITBIS fuera de rango.";
    if (form.deliveryRadiusKm < 1) e.deliveryRadiusKm = "Mínimo 1 km.";
    if (form.baseDeliveryFee < 0) e.baseDeliveryFee = "No puede ser negativo.";
    if (form.slaMins < 10) e.slaMins = "Mínimo 10 minutos.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    // Aquí integrarías con tu API
    console.log("Perfil de negocio (payload):", form);
    alert("Perfil del negocio actualizado ✅");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Encabezado + resumen */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Perfil del negocio
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Datos legales, canales de contacto, logística e información fiscal
            para facturación y pedidos.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-2 font-medium text-gray-800 dark:text-white">
            Resumen
          </h3>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
            {Object.entries(preview).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-4">
                <span className="text-gray-500">{k}</span>
                <span className="text-gray-800 dark:text-gray-200">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Identidad Comercial */}
      <Section
        title="Identidad comercial"
        description="Información visible para clientes y repartidores."
      >
        <Row>
          <div>
            <Label>Razón social</Label>
            <Input
              type="text"
              value={form.brandName}
              onChange={(e) => set("brandName", e.target.value)}
            />
            {errors.brandName && (
              <p className="mt-1 text-xs text-rose-600">{errors.brandName}</p>
            )}
          </div>
          <div>
            <Label>Nombre comercial</Label>
            <Input
              type="text"
              value={form.commercialName}
              onChange={(e) => set("commercialName", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Descripción</Label>
            <Input
              type="text"
              value={form.businessDescription}
              onChange={(e) => set("businessDescription", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Logo (URL)</Label>
            <Input
              type="url"
              placeholder="https://.../logo.png"
              value={form.logoUrl}
              onChange={(e) => set("logoUrl", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Próximamente: subida de archivo y recorte automático.
            </p>
          </div>
        </Row>
      </Section>

      {/* Información Fiscal (RD) */}
      <Section
        title="Información fiscal"
        description="Datos para facturación y NCF (República Dominicana)."
      >
        <Row>
          <div>
            <Label>RNC / ID fiscal</Label>
            <Input
              type="text"
              value={form.rnc}
              onChange={(e) => set("rnc", e.target.value)}
            />
            {errors.rnc && (
              <p className="mt-1 text-xs text-rose-600">{errors.rnc}</p>
            )}
          </div>
          <div>
            <Label>Tipo de contribuyente</Label>
            <Input
              type="text"
              value={form.taxpayerType}
              onChange={(e) => set("taxpayerType", e.target.value)}
            />
          </div>
          <div>
            <Label>Serie NCF</Label>
            <Input
              type="text"
              value={form.ncfSeries}
              onChange={(e) => set("ncfSeries", e.target.value)}
            />
          </div>
          <div>
            <Label>Moneda</Label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              <option value="DOP">DOP — Peso dominicano</option>
              <option value="USD">USD — Dólar</option>
            </select>
          </div>
          <div>
            <Label>ITBIS (%)</Label>
            <Input
              type="number"
              value={form.itbisRate}
              onChange={(e) => set("itbisRate", Number(e.target.value))}
            />
            {errors.itbisRate && (
              <p className="mt-1 text-xs text-rose-600">{errors.itbisRate}</p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Checkbox
              label="Usar NCF autorizado por DGII"
              checked={form.ncfAutorizado}
              onChange={(v) => set("ncfAutorizado", v)}
            />
            <Checkbox
              label="Solicitar datos de factura a clientes por defecto"
              checked={form.requireInvoiceData}
              onChange={(v) => set("requireInvoiceData", v)}
            />
            <Checkbox
              label="Imprimir factura automáticamente"
              checked={form.defaultInvoicePrint}
              onChange={(v) => set("defaultInvoicePrint", v)}
            />
          </div>
        </Row>
      </Section>

      {/* Contacto y Canales */}
      <Section
        title="Contacto y canales"
        description="Cómo se comunican los clientes y repartidores contigo."
      >
        <Row>
          <div>
            <Label>Teléfono</Label>
            <Input
              type="text"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              type="text"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
            />
          </div>
          <div>
            <Label>Email principal</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
            )}
          </div>
          <div>
            <Label>Email de soporte</Label>
            <Input
              type="email"
              value={form.supportEmail}
              onChange={(e) => set("supportEmail", e.target.value)}
            />
            {errors.supportEmail && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.supportEmail}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label>Sitio web</Label>
            <Input
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </div>
        </Row>
      </Section>

      {/* Dirección Fiscal */}
      <Section
        title="Dirección fiscal"
        description="Dirección utilizada para documentos y facturación."
      >
        <Row>
          <div className="md:col-span-2">
            <Label>Calle y número</Label>
            <Input
              type="text"
              value={form.addressStreet}
              onChange={(e) => set("addressStreet", e.target.value)}
            />
          </div>
          <div>
            <Label>Ciudad</Label>
            <Input
              type="text"
              value={form.addressCity}
              onChange={(e) => set("addressCity", e.target.value)}
            />
          </div>
          <div>
            <Label>Provincia</Label>
            <Input
              type="text"
              value={form.addressProvince}
              onChange={(e) => set("addressProvince", e.target.value)}
            />
          </div>
          <div>
            <Label>Código postal</Label>
            <Input
              type="text"
              value={form.addressPostal}
              onChange={(e) => set("addressPostal", e.target.value)}
            />
          </div>
        </Row>
      </Section>

      {/* Logística y Entregas */}
      <Section
        title="Logística y entregas"
        description="Parámetros que afectan tiempos, costos y zonas."
      >
        <Row>
          <div>
            <Label>Radio de entrega (km)</Label>
            <Input
              type="number"
              value={form.deliveryRadiusKm}
              onChange={(e) => set("deliveryRadiusKm", Number(e.target.value))}
            />
            {errors.deliveryRadiusKm && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.deliveryRadiusKm}
              </p>
            )}
          </div>
          <div>
            <Label>Costo base de envío ({form.currency})</Label>
            <Input
              type="number"
              value={form.baseDeliveryFee}
              onChange={(e) => set("baseDeliveryFee", Number(e.target.value))}
            />
            {errors.baseDeliveryFee && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.baseDeliveryFee}
              </p>
            )}
          </div>
          <div>
            <Label>Envío gratis desde ({form.currency})</Label>
            <Input
              type="number"
              value={form.freeShippingFrom}
              onChange={(e) => set("freeShippingFrom", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>SLA objetivo (min)</Label>
            <Input
              type="number"
              value={form.slaMins}
              onChange={(e) => set("slaMins", Number(e.target.value))}
            />
            {errors.slaMins && (
              <p className="mt-1 text-xs text-rose-600">{errors.slaMins}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label>Zonas extra (texto)</Label>
            <Input
              type="text"
              placeholder="Zona Colonial: 150; Arroyo Hondo: 180"
              value={form.extraZones}
              onChange={(e) => set("extraZones", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Formato sugerido: <em>Nombre de zona: tarifa</em> separadas por
              “;”. Luego podrás mapearlo a tu UI de zonas.
            </p>
          </div>
        </Row>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <Label>Horario laboral (L-V)</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="time"
                value={form.scheduleWeekdayFrom}
                onChange={(e) => set("scheduleWeekdayFrom", e.target.value)}
              />
              <Input
                type="time"
                value={form.scheduleWeekdayTo}
                onChange={(e) => set("scheduleWeekdayTo", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Horario fin de semana (S-D)</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="time"
                value={form.scheduleWeekendFrom}
                onChange={(e) => set("scheduleWeekendFrom", e.target.value)}
              />
              <Input
                type="time"
                value={form.scheduleWeekendTo}
                onChange={(e) => set("scheduleWeekendTo", e.target.value)}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Redes sociales */}
      <Section title="Redes sociales">
        <Row>
          <div>
            <Label>Facebook</Label>
            <Input
              type="url"
              value={form.facebook}
              onChange={(e) => set("facebook", e.target.value)}
            />
          </div>
          <div>
            <Label>X (Twitter)</Label>
            <Input
              type="url"
              value={form.x}
              onChange={(e) => set("x", e.target.value)}
            />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input
              type="url"
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
            />
          </div>
          <div>
            <Label>LinkedIn</Label>
            <Input
              type="url"
              value={form.linkedin}
              onChange={(e) => set("linkedin", e.target.value)}
            />
          </div>
        </Row>
      </Section>

      {/* Representante legal */}
      <Section title="Representante legal">
        <Row>
          <div>
            <Label>Nombre completo</Label>
            <Input
              type="text"
              value={form.legalRepName}
              onChange={(e) => set("legalRepName", e.target.value)}
            />
          </div>
          <div>
            <Label>Cédula / ID</Label>
            <Input
              type="text"
              value={form.legalRepId}
              onChange={(e) => set("legalRepId", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.legalRepEmail}
              onChange={(e) => set("legalRepEmail", e.target.value)}
            />
          </div>
        </Row>
      </Section>

      {/* Políticas */}
      <Section title="Políticas">
        <Row>
          <div>
            <Label>Días para devoluciones</Label>
            <Input
              type="number"
              value={form.refundsDays}
              onChange={(e) => set("refundsDays", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Términos y condiciones (URL)</Label>
            <Input
              type="url"
              value={form.termsUrl}
              onChange={(e) => set("termsUrl", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Política de privacidad (URL)</Label>
            <Input
              type="url"
              value={form.privacyUrl}
              onChange={(e) => set("privacyUrl", e.target.value)}
            />
          </div>
        </Row>
      </Section>

      {/* Notificaciones */}
      <Section title="Notificaciones">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Checkbox
            label="Notificar pedidos por email"
            checked={form.notifyOrdersEmail}
            onChange={(v) => set("notifyOrdersEmail", v)}
          />
          <Checkbox
            label="Notificar pedidos por push"
            checked={form.notifyOrdersPush}
            onChange={(v) => set("notifyOrdersPush", v)}
          />
          <Checkbox
            label="Alertas de seguridad por email"
            checked={form.notifySecurityEmail}
            onChange={(v) => set("notifySecurityEmail", v)}
          />
        </div>
      </Section>

      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Guardar cambios</Button>
      </div>
    </div>
  );
}
