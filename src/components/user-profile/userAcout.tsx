"use client";
import React, { useState } from "react";
import { useUserActions } from "@/hooks/useUserActions";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Trash2,
  RotateCcw,
  Loader2,
  ShieldAlert,
  Info,
} from "lucide-react";

type Props = {
  userId: string;
  className?: string;
};

// Nota: si tu archivo antes se llamaba UserAcount, cámbialo a UserAccount
export default function UserAccount({ userId, className }: Props) {
  const { deleteUser, resetUser, loading } = useUserActions();
  const [confirm, setConfirm] = useState<null | "delete" | "reset">(null);
  const [toast, setToast] = useState<string | null>(null);

  const isDelete = confirm === "delete";
  const isReset = confirm === "reset";

  const handleConfirm = async () => {
    let res;
    if (isDelete) res = await deleteUser(userId);
    if (isReset) res = await resetUser(userId);
    setConfirm(null);
    if (res) setToast(res.message);
    // TODO: router.refresh() si necesitas refrescar datos
  };

  return (
    <section
      className={[
        "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900",
        className || "",
      ].join(" ")}
      aria-labelledby="account-actions-title"
    >
      {/* Encabezado */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-gray-700 dark:text-gray-200" aria-hidden="true" />
          <h3
            id="account-actions-title"
            className="text-base font-semibold text-gray-800 dark:text-white/90"
          >
            Acciones de la cuenta
          </h3>
        </div>

        {/* pista */}
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Administra acciones críticas para este usuario</span>
        </div>
      </div>

      {/* Contenido */}
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Puedes <strong>restablecer</strong> la configuración del usuario a los valores predeterminados o <strong>eliminar</strong> permanentemente a este usuario.
      </p>

      {/* Botones */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Eliminar */}
        <button
          type="button"
          onClick={() => setConfirm("delete")}
          disabled={loading}
          className={[
            "inline-flex w-full items-center justify-center gap-2 rounded-full",
            "border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600",
            "bg-white hover:bg-red-50 hover:text-red-700",
            "focus:outline-none focus:ring-2 focus:ring-red-200",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "dark:border-red-700 dark:bg-gray-800 dark:text-red-400",
            "dark:hover:bg-red-900/20 dark:hover:text-red-300 dark:focus:ring-red-800",
            "sm:w-auto",
          ].join(" ")}
          aria-label="Eliminar usuario"
        >
          {loading && isDelete ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
          Eliminar
        </button>

        {/* Restablecer */}
        <button
          type="button"
          onClick={() => setConfirm("reset")}
          disabled={loading}
          className={[
            "inline-flex w-full items-center justify-center gap-2 rounded-full",
            "border border-blue-300 px-4 py-2.5 text-sm font-medium text-blue-600",
            "bg-white hover:bg-blue-50 hover:text-blue-700",
            "focus:outline-none focus:ring-2 focus:ring-blue-200",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "dark:border-blue-700 dark:bg-gray-800 dark:text-blue-400",
            "dark:hover:bg-blue-900/20 dark:hover:text-blue-300 dark:focus:ring-blue-800",
            "sm:w-auto",
          ].join(" ")}
          aria-label="Restablecer usuario"
        >
          {loading && isReset ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          )}
          Restablecer
        </button>
      </div>

      {/* Toast simple */}
      {toast ? (
        <div
          role="status"
          className="mt-4 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
        >
          {toast}
        </div>
      ) : null}

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        open={confirm !== null}
        title={isDelete ? "¿Eliminar usuario?" : "¿Restablecer datos del usuario?"}
        description={
          isDelete
            ? "Esta acción no se puede deshacer. El usuario y los datos relacionados podrían eliminarse."
            : "Esto restablecerá la configuración del usuario a los valores predeterminados. No podrás deshacerlo."
        }
        confirmText={isDelete ? "Eliminar" : "Restablecer"}
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
