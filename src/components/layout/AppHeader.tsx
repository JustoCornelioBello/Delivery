"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";

// ⬇️ Importa TU SearchBox con autocompletado
import SearchBox, {
  type SearchBoxHandle,
} from "@/components/search/SearchBox";

const AppHeader: React.FC = () => {
  const router = useRouter();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const appMenuRef = useRef<HTMLDivElement>(null);

  // ref del buscador para poder enfocarlo con ⌘/Ctrl+K
  const searchRef = useRef<SearchBoxHandle>(null);

  const handleToggle = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  }, [toggleSidebar, toggleMobileSidebar]);

  const toggleApplicationMenu = useCallback(() => {
    setApplicationMenuOpen((prev) => !prev);
  }, []);

  // ⌘/Ctrl + K -> Desktop: enfocar; Mobile: ir a /buscar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmdK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (isCmdK) {
        event.preventDefault();
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        if (isDesktop) {
          // Enfoca el SearchBox del header
          searchRef.current?.focus();
        } else {
          // En mobile, manda a la ruta de búsqueda (pantalla dedicada)
          router.push("/buscar");
        }
      }

      if (event.key === "Escape") {
        setApplicationMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // Cerrar menú de aplicaciones al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isApplicationMenuOpen) return;
      if (appMenuRef.current && !appMenuRef.current.contains(e.target as Node)) {
        setApplicationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isApplicationMenuOpen]);

  return (
    <header className="sticky top-0 z-[70] w-full bg-white lg:border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        {/* Left */}
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Toggle sidebar */}
          <button
            type="button"
            className="z-[71] flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
            onClick={handleToggle}
            aria-label="Alternar panel lateral"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.22 7.281a.75.75 0 0 1 1.06-1.06L12 10.94l4.718-4.718a.75.75 0 1 1 1.06 1.06L13.06 12l4.718 4.719a.75.75 0 1 1-1.06 1.06L12 13.06l-4.719 4.718a.75.75 0 1 1-1.06-1.06L10.94 12 6.22 7.281Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M.583 1A.75.75 0 0 1 1.333.25h13.333a.75.75 0 1 1 0 1.5H1.333A.75.75 0 0 1 .583 1Zm0 10a.75.75 0 0 1 .75-.75h13.333a.75.75 0 1 1 0 1.5H1.333a.75.75 0 0 1-.75-.75ZM1.333 5.25a.75.75 0 1 0 0 1.5H8a.75.75 0 1 0 0-1.5H1.333Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* App switcher (mobile) */}
          <button
            type="button"
            onClick={toggleApplicationMenu}
            className="z-[71] flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Abrir menú de aplicaciones"
            aria-expanded={isApplicationMenuOpen}
            aria-controls="app-switcher"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 10.495a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm12 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-4.5 1.5A1.5 1.5 0 1 0 12 9.995a1.5 1.5 0 0 0 1.5 1.5Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Search */}
          <div className="hidden lg:block">
            {/* Desktop: SearchBox con autocompletado */}
            <SearchBox
              ref={searchRef}
              placeholder="Buscar en Delivery…"
              onSelect={(q) => {
                // Navegación SPA a la página de resultados
                router.push(`/search?q=${encodeURIComponent(q)}`);
              }}
            />
          </div>

          {/* Mobile: botón que lleva a /buscar (pantalla dedicada a buscar) */}
          <div className="lg:hidden">
            <button
              onClick={() => router.push("/search")}
              className="flex h-11 w-[70vw] max-w-[360px] items-center gap-2 rounded-lg border border-gray-200 bg-white/60 px-3 text-sm text-gray-500 hover:bg-white dark:border-gray-800 dark:bg-white/5 dark:text-gray-400"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" className="fill-gray-500 dark:fill-gray-400">
                <path d="M3.042 9.374a6.333 6.333 0 1 1 12.666 0A6.333 6.333 0 0 1 3.042 9.374Zm6.333-7.833a7.833 7.833 0 1 0 4.982 13.9l2.82 2.82a.75.75 0 1 0 1.06-1.06l-2.82-2.821A7.833 7.833 0 0 0 9.375 1.541Z" />
              </svg>
              <span>Buscar en Delivery…</span>
            </button>
          </div>
        </div>

        {/* Right */}
        <div
          id="app-switcher"
          ref={appMenuRef}
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } w-full items-center justify-between gap-4 px-5 py-4 shadow-sm lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
