"use client";

import React, { useEffect, useRef } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
};

/**
 * Modal accesible y sin dependencias.
 * - Bloquea el scroll del body al abrir.
 * - Cierra con Escape y click en el backdrop.
 * - Enfoca el panel al abrir.
 * - Exporta default y named para evitar errores de import.
 */
function Modal({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "unset";
      };
    }
  }, [isOpen]);

  // Enfocar el panel al abrir
  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  // Layout del contenido
  const contentClasses = isFullscreen
    ? // Fullscreen: ocupa todo, sin borde ni radios
      "w-full h-full"
    : // Caja modal centrada
      "relative w-full max-w-md rounded-3xl border border-gray-200 bg-white p-5 shadow-xl outline-none dark:border-gray-800 dark:bg-gray-900";

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // click en backdrop cierra
    >
      {/* Backdrop */}
      <div className="fixed inset-0 h-full w-full bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()} // evita que el click adentro cierre
        className={`${contentClasses} ${className ?? ""}`}
      >
        {showCloseButton && !isFullscreen && (
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04 16.54a.9.9 0 1 0 1.27 1.27L12 13.12l4.69 4.69a.9.9 0 1 0 1.27-1.27L13.27 11.85l4.69-4.69a.9.9 0 1 0-1.27-1.27L12 10.58 7.31 5.89a.9.9 0 1 0-1.27 1.27l4.69 4.69-4.69 4.69Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}

        {/* Contenido */}
        <div className={isFullscreen ? "w-full h-full overflow-auto p-4 md:p-6" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
export { Modal };
