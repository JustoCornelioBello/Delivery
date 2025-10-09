"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ───────────────────────────── Tipos ───────────────────────────── */
type Device = {
  id: string;
  name: string;
  location: string;
  lastActive: string;
  trusted: boolean;
};

type Activity = {
  id: string;
  type: "login" | "password_change" | "2fa";
  date: string;
  device: string;
  location: string;
};

type LinkedProvider = "google" | "apple" | "facebook";

type NotificationPrefs = {
  emailOrders: boolean;
  emailSecurity: boolean;
  pushPromos: boolean;
  pushOps: boolean;
};

type PrivacyPrefs = {
  analytics: boolean;
  personalization: boolean;
};

/* ────────────────────────── Helpers ────────────────────────── */
const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");
const emailOk = (e: string) => /^\S+@\S+\.\S+$/.test(e);

/* Barra fortaleza (0–4) + tips */
function scorePassword(pwd: string) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  return Math.min(score, 4);
}
const pwdTips = (pwd: string) => {
  const tips = [];
  if (pwd.length < 12) tips.push("Usa 12+ caracteres");
  if (!/[A-Z]/.test(pwd)) tips.push("Añade mayúsculas");
  if (!/[a-z]/.test(pwd)) tips.push("Añade minúsculas");
  if (!/\d/.test(pwd)) tips.push("Añade números");
  if (!/[^A-Za-z0-9]/.test(pwd)) tips.push("Añade símbolos");
  return tips;
};

/* ────────────────────────── UI Core ────────────────────────── */
function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button
      {...rest}
      className={cls(
        "transition",
        variant === "primary" && "rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600",
        variant === "secondary" &&
          "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
        variant === "ghost" &&
          "rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60",
        variant === "danger" &&
          "rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700",
        className
      )}
    >
      {children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cls(
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-gray-700 dark:bg-gray-800",
        props.className
      )}
    />
  );
}

/* Dropdown accesible, compacto y sin dependencias */
type Option<T extends string = string> = { label: string; value: T };

function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

function Dropdown<T extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const ref = useOutsideClose<HTMLDivElement>(() => setOpen(false));
  const current = options.find((o) => o.value === value);

  return (
    <div className={cls("relative", className)} ref={ref}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <span className={cls(!current && "text-gray-400")}>{current?.label ?? placeholder ?? "Seleccionar"}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="opacity-70">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {options.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
                btnRef.current?.focus();
              }}
              className={cls(
                "cursor-pointer rounded-md px-2 py-1.5 hover:bg-gray-50 focus:bg-gray-50 dark:hover:bg-gray-800",
                o.value === value && "bg-gray-50 dark:bg-gray-800"
              )}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FormSection({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  const ref = useOutsideClose<HTMLDivElement>(onClose);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────── Toasts (sin libs) ─────────── */
type Toast = { id: string; kind: "success" | "error" | "info"; msg: string };
function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
  };
  const remove = (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id));
  return { toasts, push, remove };
}

function ToastViewport({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
  const palette: Record<Toast["kind"], string> = {
    success: "bg-emerald-600",
    error: "bg-rose-600",
    info: "bg-slate-700",
  };
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cls(
            "pointer-events-auto flex items-start gap-3 rounded-xl p-3 text-white shadow-lg",
            palette[t.kind]
          )}
        >
          <span className="text-sm">{t.msg}</span>
          <button className="ml-auto opacity-80 hover:opacity-100" onClick={() => remove(t.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Tabs ─────────── */
function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cls(
              "min-w-[120px] flex-1 rounded-lg px-3 py-2 text-sm transition",
              active
                ? "bg-brand-500 font-medium text-white"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60"
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────── Row menu (acciones) ─────────── */
function RowMenu({
  open,
  onClose,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  actions: { label: string; danger?: boolean; onClick: () => void }[];
}) {
  const ref = useOutsideClose<HTMLDivElement>(onClose);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      <ul className="py-1 text-sm">
        {actions.map((a) => (
          <li key={a.label}>
            <button
              onClick={() => {
                a.onClick();
                onClose();
              }}
              className={cls(
                "flex w-full items-center px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-white/5",
                a.danger ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-200"
              )}
            >
              {a.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────── Página ───────────────────────── */
export default function SettingsPage() {
  const { toasts, push, remove } = useToasts();

  // Cuenta
  const [tab, setTab] = useState<"general" | "security" | "devices" | "privacy">("general");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [newEmail, setNewEmail] = useState("");
  const [openEmailModal, setOpenEmailModal] = useState(false);

  // Seguridad
  const [pwd, setPwd] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [is2FA, setIs2FA] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Dispositivos y actividad
  const [devices, setDevices] = useState<Device[]>([]);
  const [qDevice, setQDevice] = useState("");
  const [activity, setActivity] = useState<Activity[]>([]);
  const [filterEvent, setFilterEvent] = useState<"all" | Activity["type"]>("all");
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);

  // Notificaciones / Privacidad
  const [notif, setNotif] = useState<NotificationPrefs>({
    emailOrders: true,
    emailSecurity: true,
    pushPromos: false,
    pushOps: true,
  });
  const [privacy, setPrivacy] = useState<PrivacyPrefs>({
    analytics: true,
    personalization: true,
  });

  // Sesiones & Seguridad
  const [sessionTimeout, setSessionTimeout] = useState<"15m" | "30m" | "1h" | "4h" | "never">("1h");
  const [alertLevel, setAlertLevel] = useState<"low" | "medium" | "high">("medium");

  // Cuentas vinculadas
  const [linked, setLinked] = useState<Record<LinkedProvider, boolean>>({
    google: true,
    apple: false,
    facebook: false,
  });

  // Danger zone
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  /* ───── Persistencia localStorage ───── */
  useEffect(() => {
    try {
      setEmail(localStorage.getItem("settings_email") || "");
      setDisplayName(localStorage.getItem("settings_display") || "");
      setLanguage(((localStorage.getItem("settings_language") as "es" | "en") || "es"));
      setTheme(((localStorage.getItem("settings_theme") as "system" | "light" | "dark") || "system"));
      setIs2FA(localStorage.getItem("settings_2fa") === "true");
      setNotif(JSON.parse(localStorage.getItem("settings_notif") || '{"emailOrders":true,"emailSecurity":true,"pushPromos":false,"pushOps":true}'));
      setPrivacy(JSON.parse(localStorage.getItem("settings_privacy") || '{"analytics":true,"personalization":true}'));
      setSessionTimeout(((localStorage.getItem("settings_timeout") as any) || "1h"));
      setAlertLevel(((localStorage.getItem("settings_alert") as any) || "medium"));
      setLinked(JSON.parse(localStorage.getItem("settings_linked") || '{"google":true,"apple":false,"facebook":false}'));
      const devs = localStorage.getItem("settings_devices");
      if (devs) setDevices(JSON.parse(devs));
      const acts = localStorage.getItem("settings_activity");
      if (acts) setActivity(JSON.parse(acts));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("settings_email", email);
    localStorage.setItem("settings_display", displayName);
    localStorage.setItem("settings_language", language);
    localStorage.setItem("settings_theme", theme);
    localStorage.setItem("settings_2fa", is2FA.toString());
    localStorage.setItem("settings_devices", JSON.stringify(devices));
    localStorage.setItem("settings_activity", JSON.stringify(activity));
    localStorage.setItem("settings_notif", JSON.stringify(notif));
    localStorage.setItem("settings_privacy", JSON.stringify(privacy));
    localStorage.setItem("settings_timeout", sessionTimeout);
    localStorage.setItem("settings_alert", alertLevel);
    localStorage.setItem("settings_linked", JSON.stringify(linked));
  }, [email, displayName, language, theme, is2FA, devices, activity, notif, privacy, sessionTimeout, alertLevel, linked]);

  /* ───── Handlers ───── */
  const pushActivity = (type: Activity["type"], noteDevice = "Este dispositivo", noteLoc = "Desconocida") =>
    setActivity((prev) => [
      ...prev,
      { id: Date.now().toString(), type, date: new Date().toLocaleString(), device: noteDevice, location: noteLoc },
    ]);

  const saveGeneral = () => {
    if (!displayName.trim()) return push({ kind: "error", msg: "El nombre para mostrar es requerido." });
    push({ kind: "success", msg: "Cambios guardados." });
  };

  const resetPassword = () => {
    if (!pwdCurrent) return push({ kind: "error", msg: "Ingresa tu contraseña actual." });
    if (pwd.length < 8) return push({ kind: "error", msg: "La nueva contraseña debe tener al menos 8 caracteres." });
    if (pwd !== pwdConfirm) return push({ kind: "error", msg: "Las contraseñas no coinciden." });
    setPwd(""); setPwdConfirm(""); setPwdCurrent("");
    pushActivity("password_change");
    push({ kind: "success", msg: "Contraseña actualizada." });
  };

  const enable2FA = () => {
    setIs2FA(true);
    setShow2FASetup(false);
    const codes = Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
    setBackupCodes(codes);
    setShowBackupModal(true);
    pushActivity("2fa");
    push({ kind: "success", msg: "2FA activado." });
  };

  const disable2FA = () => {
    setIs2FA(false);
    setBackupCodes([]);
    push({ kind: "info", msg: "2FA desactivado." });
  };

  const logoutAll = () => {
    setDevices((devs) => devs.map((d) => ({ ...d, trusted: false })));
    push({ kind: "success", msg: "Cerraste sesión en todos los dispositivos." });
  };

  const changeEmail = () => {
    if (!emailOk(newEmail)) return push({ kind: "error", msg: "Correo inválido." });
    setEmail(newEmail);
    setOpenEmailModal(false);
    setNewEmail("");
    push({ kind: "success", msg: "Correo actualizado. Revisa tu bandeja para confirmar." });
  };

  const exportData = () => {
    const payload = {
      profile: { email, displayName, language, theme },
      notifications: notif,
      privacy,
      session: { sessionTimeout, alertLevel },
      linked,
      devices,
      activity,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mis-datos-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    push({ kind: "success", msg: "Exportación iniciada." });
  };

  const deleteAccount = () => {
    localStorage.clear();
    setOpenDeleteModal(false);
    push({ kind: "success", msg: "Cuenta eliminada (demo). Recarga para ver el estado inicial." });
  };

  /* ───── Filtrado de actividad ───── */
  const filteredActivity = useMemo(() => {
    return filterEvent === "all" ? activity : activity.filter((a) => a.type === filterEvent);
  }, [filterEvent, activity]);

  /* ────────────────────────── Render ────────────────────────── */
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Configuración</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Cuenta, seguridad, dispositivos y privacidad.</p>
        </div>
        <Button variant="secondary" onClick={() => push({ kind: "info", msg: "Ayuda y documentación (demo)." })}>
          Ayuda
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: "general", label: "General" },
          { key: "security", label: "Seguridad" },
          { key: "devices", label: "Dispositivos" },
          { key: "privacy", label: "Privacidad & Datos" },
        ]}
        value={tab}
        onChange={(k) => setTab(k as any)}
      />

      {/* GENERAL */}
      {tab === "general" && (
        <div className="space-y-6">
          <FormSection title="Cuenta">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Correo electrónico</span>
                <div className="flex items-center gap-2">
                  <Input type="email" value={email} readOnly className="bg-gray-50 dark:bg-gray-800/60" />
                  <Button variant="secondary" onClick={() => setOpenEmailModal(true)}>Cambiar</Button>
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Nombre a mostrar</span>
                <Input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Mi Tienda" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Idioma</span>
                <Dropdown
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { label: "Español", value: "es" },
                    { label: "English", value: "en" },
                  ]}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Tema</span>
                <Dropdown
                  value={theme}
                  onChange={setTheme}
                  options={[
                    { label: "Sistema", value: "system" },
                    { label: "Claro", value: "light" },
                    { label: "Oscuro", value: "dark" },
                  ]}
                />
              </label>
            </div>
            <div className="pt-2">
              <Button onClick={saveGeneral}>Guardar cambios</Button>
            </div>
          </FormSection>
        </div>
      )}

      {/* SEGURIDAD */}
      {tab === "security" && (
        <div className="space-y-6">
          <FormSection
            title="Contraseña"
            right={<span className="text-xs text-gray-500">Consejo: usa un gestor de contraseñas</span>}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Actual</span>
                <Input type="password" value={pwdCurrent} onChange={(e) => setPwdCurrent(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Nueva</span>
                <Input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="Mín. 8 caracteres"
                />
                {/* Fortaleza */}
                <div className="mt-2">
                  <div className="h-2 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
                    <div
                      className={cls(
                        "h-2 transition-all",
                        scorePassword(pwd) <= 1 && "bg-rose-500 w-1/4",
                        scorePassword(pwd) === 2 && "bg-amber-500 w-2/4",
                        scorePassword(pwd) >= 3 && "bg-emerald-500 w-4/4"
                      )}
                      style={{ width: `${(scorePassword(pwd) / 4) * 100}%` }}
                    />
                  </div>
                  {pwd && (
                    <ul className="mt-1 text-[11px] text-gray-500">
                      {pwdTips(pwd).map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Confirmar</span>
                <Input type="password" value={pwdConfirm} onChange={(e) => setPwdConfirm(e.target.value)} />
              </label>
            </div>
            <div className="flex items-center justify-between pt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>No reutilices contraseñas entre servicios.</span>
              <Button variant="secondary" onClick={resetPassword}>Cambiar contraseña</Button>
            </div>
          </FormSection>

          <FormSection title="Autenticación de dos factores (2FA)">
            <p className="text-sm text-gray-600 dark:text-gray-400">Añade una capa extra de seguridad.</p>
            {is2FA ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-emerald-600 text-sm font-medium">2FA activado</span>
                <Button variant="secondary" onClick={() => setShowBackupModal(true)}>Ver/guardar códigos</Button>
                <Button variant="secondary" onClick={disable2FA}>Desactivar 2FA</Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setShow2FASetup(true)}>Activar 2FA (App)</Button>
                <Button variant="secondary" onClick={() => { setShow2FASetup(true); push({ kind: "info", msg: "Flujo SMS demo." }); }}>
                  Activar 2FA (SMS)
                </Button>
              </div>
            )}
          </FormSection>

          <FormSection title="Sesiones & alertas">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Cierre por inactividad</span>
                <Dropdown
                  value={sessionTimeout}
                  onChange={setSessionTimeout}
                  options={[
                    { label: "15 minutos", value: "15m" },
                    { label: "30 minutos", value: "30m" },
                    { label: "1 hora", value: "1h" },
                    { label: "4 horas", value: "4h" },
                    { label: "Nunca", value: "never" },
                  ]}
                />
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Nivel de alertas</span>
                <Dropdown
                  value={alertLevel}
                  onChange={setAlertLevel}
                  options={[
                    { label: "Bajo (solo crítico)", value: "low" },
                    { label: "Medio (recomendado)", value: "medium" },
                    { label: "Alto (todo inusual)", value: "high" },
                  ]}
                />
              </div>
            </div>
            <div className="pt-2">
              <Button variant="secondary" onClick={logoutAll}>Cerrar sesión en todos</Button>
            </div>
          </FormSection>
        </div>
      )}

      {/* DISPOSITIVOS */}
      {tab === "devices" && (
        <div className="space-y-6">
          <FormSection
            title="Dispositivos activos"
            right={
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar dispositivo o ubicación…"
                  value={qDevice}
                  onChange={(e) => setQDevice(e.target.value)}
                  className="w-56"
                />
                <Button variant="secondary" onClick={() =>
                  setDevices((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      name: "Android Delivery",
                      location: "CDMX",
                      lastActive: new Date().toLocaleString(),
                      trusted: false,
                    },
                  ])
                }>
                  Añadir (demo)
                </Button>
              </div>
            }
          >
            {devices.length === 0 ? (
              <p className="text-sm text-gray-500">No hay dispositivos registrados.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {devices
                  .filter((d) => {
                    const q = qDevice.toLowerCase();
                    if (!q) return true;
                    return d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q);
                  })
                  .map((d) => {
                    const isOpen = openRowMenuId === d.id;
                    return (
                      <li key={d.id} className="flex items-center justify-between py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{d.name}</p>
                          <p className="text-[11px] text-gray-500">{d.location} · {d.lastActive}</p>
                        </div>
                        <div className="relative flex items-center gap-3">
                          <span className={cls("text-xs", d.trusted ? "text-emerald-600" : "text-rose-600")}>
                            {d.trusted ? "Confiado" : "No confiado"}
                          </span>
                          <Button
                            variant="secondary"
                            className="h-9 w-9 !p-0"
                            aria-haspopup="menu"
                            aria-expanded={isOpen}
                            onClick={() => setOpenRowMenuId(isOpen ? null : d.id)}
                            title="Acciones"
                          >
                            ⋯
                          </Button>
                          <RowMenu
                            open={isOpen}
                            onClose={() => setOpenRowMenuId(null)}
                            actions={[
                              {
                                label: d.trusted ? "Quitar confianza" : "Marcar de confianza",
                                onClick: () =>
                                  setDevices((prev) => prev.map((x) => (x.id === d.id ? { ...x, trusted: !x.trusted } : x))),
                              },
                              {
                                label: "Revocar sesión",
                                danger: true,
                                onClick: () => {
                                  setDevices((prev) => prev.filter((x) => x.id !== d.id));
                                  push({ kind: "success", msg: "Sesión revocada." });
                                },
                              },
                            ]}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </FormSection>

          <FormSection title="Actividad reciente" right={
            <div className="flex items-center gap-2">
              <Dropdown
                value={filterEvent}
                onChange={setFilterEvent}
                options={[
                  { label: "Todos", value: "all" },
                  { label: "Inicios de sesión", value: "login" },
                  { label: "Cambios de contraseña", value: "password_change" },
                  { label: "Eventos 2FA", value: "2fa" },
                ]}
              />
              <Button variant="secondary" onClick={() => pushActivity("login", "Este dispositivo", "IP dinámica")}>
                Simular login
              </Button>
            </div>
          }>
            {filteredActivity.length === 0 ? (
              <p className="text-sm text-gray-500">Sin actividad registrada.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {filteredActivity.map((a) => (
                  <li key={a.id}>
                    <strong className="capitalize">{a.type.replace("_", " ")}</strong> — {a.date} — {a.device} ({a.location})
                  </li>
                ))}
              </ul>
            )}
          </FormSection>
        </div>
      )}

      {/* PRIVACIDAD & DATOS */}
      {tab === "privacy" && (
        <div className="space-y-6">
          <FormSection title="Notificaciones">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
                <span>Emails de pedidos/entregas</span>
                <input type="checkbox" checked={notif.emailOrders} onChange={(e) => setNotif({ ...notif, emailOrders: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
                <span>Emails de seguridad</span>
                <input type="checkbox" checked={notif.emailSecurity} onChange={(e) => setNotif({ ...notif, emailSecurity: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
                <span>Push promociones</span>
                <input type="checkbox" checked={notif.pushPromos} onChange={(e) => setNotif({ ...notif, pushPromos: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
                <span>Push operativas (estado del pedido)</span>
                <input type="checkbox" checked={notif.pushOps} onChange={(e) => setNotif({ ...notif, pushOps: e.target.checked })} />
              </label>
            </div>
          </FormSection>

          <FormSection title="Privacidad & datos">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
                <span>Analítica de uso (anónima)</span>
                <input type="checkbox" checked={privacy.analytics} onChange={(e) => setPrivacy({ ...privacy, analytics: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
                <span>Personalización de ofertas</span>
                <input type="checkbox" checked={privacy.personalization} onChange={(e) => setPrivacy({ ...privacy, personalization: e.target.checked })} />
              </label>
            </div>
            <div className="pt-2 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={exportData}>Descargar mis datos (JSON)</Button>
            </div>
          </FormSection>

          <FormSection title="Cuentas vinculadas">
            <ul className="divide-y divide-gray-100 text-sm dark:divide-gray-800">
              {(["google", "apple", "facebook"] as LinkedProvider[]).map((p) => (
                <li key={p} className="flex items-center justify-between py-2">
                  <div className="capitalize">
                    {p} {linked[p] ? <span className="text-emerald-600">· vinculada</span> : <span className="text-gray-500">· no vinculada</span>}
                  </div>
                  {linked[p] ? (
                    <Button variant="secondary" onClick={() => setLinked((prev) => ({ ...prev, [p]: false }))}>
                      Desvincular
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setLinked((prev) => ({ ...prev, [p]: true }))}>
                      Vincular
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </FormSection>

          <FormSection title="Zona de peligro">
            <p className="text-xs text-gray-500">Eliminar tu cuenta es irreversible. Descarga tus datos antes.</p>
            <Button variant="danger" onClick={() => setOpenDeleteModal(true)}>Eliminar cuenta</Button>
          </FormSection>
        </div>
      )}

      {/* Modales */}
      {/* Cambiar email */}
      {openEmailModal && (
        <Modal title="Cambiar correo" onClose={() => setOpenEmailModal(false)}>
          <div className="space-y-3">
            <div>
              <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">Nuevo correo</span>
              <div className="flex items-center gap-2">
                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="nuevo@correo.com" />
                <span
                  className={cls(
                    "text-xs",
                    !newEmail ? "text-gray-400" : emailOk(newEmail) ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {newEmail ? (emailOk(newEmail) ? "Válido" : "Inválido") : "—"}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Te enviaremos un correo para confirmar el cambio. Hasta entonces, el email actual seguirá activo.
            </p>
            <div className="flex justify-end">
              <Button onClick={changeEmail} disabled={!emailOk(newEmail)}>Actualizar</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Configurar 2FA */}
      {show2FASetup && (
        <Modal title="Configurar 2FA" onClose={() => setShow2FASetup(false)}>
          <div className="space-y-3">
            <p className="text-sm">Escanea este código QR con tu app 2FA o ingresa la clave manual (demo).</p>
            <div className="mx-auto h-40 w-40 rounded-lg bg-gray-200" />
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              En producción generarías un secreto TOTP y validarías un código de 6 dígitos.
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShow2FASetup(false)}>Cancelar</Button>
              <Button onClick={enable2FA}>Confirmar activación</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Códigos de respaldo */}
      {showBackupModal && (
        <Modal title="Códigos de respaldo" onClose={() => setShowBackupModal(false)}>
          <p className="mb-3 text-sm">Guarda estos códigos en un lugar seguro. Solo podrás verlos una vez.</p>
          {backupCodes.length === 0 ? (
            <p className="text-xs text-gray-500">No hay códigos generados.</p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-2">
                {backupCodes.map((c) => (
                  <li key={c} className="rounded-md bg-gray-100 p-2 text-center text-sm dark:bg-gray-800">{c}</li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(backupCodes.join("\n"));
                    push({ kind: "success", msg: "Códigos copiados." });
                  }}
                >
                  Copiar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "codigos-respaldo.txt"; a.click();
                    URL.revokeObjectURL(url);
                    push({ kind: "success", msg: "Descarga iniciada." });
                  }}
                >
                  Descargar .txt
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Eliminar cuenta */}
      {openDeleteModal && (
        <Modal title="Eliminar cuenta" onClose={() => setOpenDeleteModal(false)}>
          <div className="space-y-3 text-sm">
            <p className="text-rose-600">Esta acción es permanente. ¿Deseas continuar?</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpenDeleteModal(false)}>Cancelar</Button>
              <Button variant="danger" onClick={deleteAccount}>Eliminar definitivamente</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toasts */}
      <ToastViewport toasts={toasts} remove={remove} />
    </div>
  );
}
