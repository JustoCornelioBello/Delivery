"use client";
import React from "react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  open,
  title = "Confirmar",
  message = "¿Estás seguro?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </div>

        <div className="flex items-center justify-end gap-2 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
