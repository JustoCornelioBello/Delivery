"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";

type Role = "admin" | "operator" | "driver";

export default function SignUpForm() {
  const router = useRouter();

  // form state
  const [role, setRole] = useState<Role>("admin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");

  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [acceptTerms, setAcceptTerms]         = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  const [loading, setLoading] = useState(false);

  // errors
  const [errFirst, setErrFirst]     = useState<string | null>(null);
  const [errLast, setErrLast]       = useState<string | null>(null);
  const [errEmail, setErrEmail]     = useState<string | null>(null);
  const [errPhone, setErrPhone]     = useState<string | null>(null);
  const [errPassword, setErrPassword] = useState<string | null>(null);
  const [errConfirm, setErrConfirm]   = useState<string | null>(null);
  const [errTerms, setErrTerms]       = useState<string | null>(null);
  const [errGlobal, setErrGlobal]     = useState<string | null>(null);

  // password strength (0-4)
  const pwdScore = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const pwdLabel = useMemo(() => {
    return ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte"][pwdScore];
  }, [pwdScore]);

  // si hay sesión, redirige
  useEffect(() => {
    try {
      const raw = localStorage.getItem("delivery_session_v1");
      if (raw) {
        const sess = JSON.parse(raw);
        if (sess?.role) router.replace(getRedirect(sess.role as Role));
      }
    } catch {}
  }, [router]);

  const getRedirect = (r: Role) => {
    if (r === "driver")   return "/drivers";
    if (r === "operator") return "/orders/new";
    return "/"; // admin
  };

  const validate = () => {
    let ok = true;
    setErrFirst(null); setErrLast(null); setErrEmail(null); setErrPhone(null);
    setErrPassword(null); setErrConfirm(null); setErrTerms(null); setErrGlobal(null);

    if (!firstName.trim()) { setErrFirst("El nombre es obligatorio."); ok = false; }
    if (!lastName.trim())  { setErrLast("Los apellidos son obligatorios."); ok = false; }

    if (!email.trim()) {
      setErrEmail("El correo es obligatorio.");
      ok = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrEmail("Formato de correo inválido.");
      ok = false;
    }

    if (!phone.trim()) {
      setErrPhone("El teléfono es obligatorio.");
      ok = false;
    } else if (!/^[\d\s()+-]{7,}$/.test(phone.trim())) {
      setErrPhone("Teléfono inválido.");
      ok = false;
    }

    if (!password) {
      setErrPassword("La contraseña es obligatoria.");
      ok = false;
    } else if (password.length < 8) {
      setErrPassword("Mínimo 8 caracteres.");
      ok = false;
    }

    if (!confirm) {
      setErrConfirm("Confirma tu contraseña.");
      ok = false;
    } else if (confirm !== password) {
      setErrConfirm("Las contraseñas no coinciden.");
      ok = false;
    }

    if (!acceptTerms) {
      setErrTerms("Debes aceptar los Términos y la Política de Privacidad.");
      ok = false;
    }

    return ok;
  };

  // mock de registro
  const signUp = async () => {
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const res = await signUp();
    setLoading(false);

    if (!res.ok) {
      setErrGlobal("No pudimos crear tu cuenta. Inténtalo de nuevo.");
      return;
    }

    // guardar sesión mock
    const session = {
      email: email.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      phone: phone.trim(),
      role,
      ts: Date.now(),
    };

    try {
      const key = "delivery_session_v1";
      if (rememberSession) {
        localStorage.setItem(key, JSON.stringify(session));
      } else {
        sessionStorage.setItem(key, JSON.stringify(session));
      }
    } catch {}

    router.replace(getRedirect(role));
  };

  return (
    <div className="flex flex-col flex-1 w-full lg:w-1/2 overflow-y-auto no-scrollbar">
      <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Volver al panel
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90 sm:text-title-md">
              Crear cuenta
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Regístrate para gestionar pedidos, productos y repartidores.
            </p>
          </div>

          {/* Social (mock visual) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4"/>
                <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853"/>
                <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05"/>
                <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335"/>
              </svg>
              Registrarse con Google
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-gray-100 px-7 py-3 text-sm font-normal text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
            >
              <svg width="21" height="20" viewBox="0 0 21 20" className="fill-current" aria-hidden="true">
                <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z"/>
              </svg>
              Registrarse con X
            </button>
          </div>

          {/* Separador */}
          <div className="relative py-3 sm:py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white p-2 text-gray-400 dark:bg-gray-900 sm:px-5 sm:py-2">o</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} noValidate>
            <div className="space-y-5">
              {/* Rol */}
              <div>
                <Label>Registrarme como</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {([
                    { v: "admin", lbl: "Admin" },
                    { v: "operator", lbl: "Operador" },
                    { v: "driver", lbl: "Repartidor" },
                  ] as { v: Role; lbl: string }[]).map((r) => (
                    <button
                      key={r.v}
                      type="button"
                      onClick={() => setRole(r.v)}
                      className={[
                        "rounded-lg border px-3 py-2 text-sm",
                        role === r.v
                          ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5",
                      ].join(" ")}
                      aria-pressed={role === r.v}
                    >
                      {r.lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre y apellidos */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    Nombre <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="fname"
                    placeholder="Ingresa tu nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    aria-invalid={!!errFirst}
                  />
                  {errFirst && <p className="mt-1 text-xs text-error-500">{errFirst}</p>}
                </div>
                <div>
                  <Label>
                    Apellidos <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="lname"
                    placeholder="Ingresa tus apellidos"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    aria-invalid={!!errLast}
                  />
                  {errLast && <p className="mt-1 text-xs text-error-500">{errLast}</p>}
                </div>
              </div>

              {/* Correo */}
              <div>
                <Label>
                  Correo electrónico <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errEmail}
                />
                {errEmail && <p className="mt-1 text-xs text-error-500">{errEmail}</p>}
              </div>

              {/* Teléfono */}
              <div>
                <Label>
                  Teléfono <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="+1 809 555 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={!!errPhone}
                />
                {errPhone && <p className="mt-1 text-xs text-error-500">{errPhone}</p>}
              </div>

              {/* Password + Confirm */}
              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Mín. 8 caracteres"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!errPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
                {errPassword && <p className="mt-1 text-xs text-error-500">{errPassword}</p>}

                {/* strength */}
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-1.5 rounded transition-all"
                      style={{
                        width: `${(pwdScore / 4) * 100}%`,
                        background:
                          pwdScore <= 1
                            ? "#F04438" // rojo
                            : pwdScore === 2
                            ? "#F79009" // naranja
                            : pwdScore === 3
                            ? "#16A34A" // verde
                            : "#15803D", // verde oscuro
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{pwdLabel}</p>
                </div>
              </div>

              <div>
                <Label>
                  Confirmar contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Repite tu contraseña"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={!!errConfirm}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                  >
                    {showConfirm ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </button>
                </div>
                {errConfirm && <p className="mt-1 text-xs text-error-500">{errConfirm}</p>}
              </div>

              {/* Remember + Terms */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox checked={rememberSession} onChange={setRememberSession} />
                  <span className="text-theme-sm text-gray-700 dark:text-gray-400">
                    Mantener sesión iniciada
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox checked={acceptTerms} onChange={setAcceptTerms} />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Acepto los{" "}
                    <Link href="/terms" className="underline hover:no-underline">
                      Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link href="/privacy" className="underline hover:no-underline">
                      Política de Privacidad
                    </Link>
                    .
                  </p>
                </div>
                {errTerms && <p className="text-xs text-error-500">{errTerms}</p>}
              </div>

              {/* Error global */}
              {errGlobal && (
                <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/20 dark:text-error-300">
                  {errGlobal}
                </div>
              )}

              {/* Submit */}
              <div>
                <Button className="w-full" size="sm" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Registrarme"}
                </Button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-5">
            <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400 sm:text-start">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Inicia sesión
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-gray-400">
              Tip: este formulario es mock. Cualquier dato válido creará una sesión local y te redirigirá según el rol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
