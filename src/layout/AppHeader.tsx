"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";

import React, { useState, useEffect, useRef, useCallback } from "react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const inputRef = useRef<HTMLInputElement>(null);
  const appMenuRef = useRef<HTMLDivElement>(null);

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

  // ⌘/Ctrl + K -> enfocar búsqueda
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCmdK) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setApplicationMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <header className="sticky top-0 z-[70] w-full bg-white dark:bg-gray-900 lg:border-b border-gray-200 dark:border-gray-800">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        {/* Left: burger + logo + app switcher (mobile) */}
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Sidebar toggle (único) */}
          <button
            type="button"
            className="z-[71] flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
            onClick={handleToggle}
            aria-label="Alternar panel lateral"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.22 7.281a.75.75 0 0 1 1.06-1.06L12 10.94l4.718-4.718a.75.75 0 1 1 1.06 1.06L13.06 12l4.718 4.719a.75.75 0 1 1-1.06 1.06L12 13.06l-4.719 4.718a.75.75 0 1 1-1.06-1.06L10.94 12 6.22 7.281Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M.583 1A.75.75 0 0 1 1.333.25h13.333a.75.75 0 1 1 0 1.5H1.333A.75.75 0 0 1 .583 1Zm0 10a.75.75 0 0 1 .75-.75h13.333a.75.75 0 1 1 0 1.5H1.333a.75.75 0 0 1-.75-.75ZM1.333 5.25a.75.75 0 1 0 0 1.5H8a.75.75 0 1 0 0-1.5H1.333Z" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* En lugar del logo, mostramos el icono del sidebar (ya incluido arriba). */}

          {/* App switcher (mobile) */}
          <button
            type="button"
            onClick={toggleApplicationMenu}
            className="z-[71] flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Abrir menú de aplicaciones"
            aria-expanded={isApplicationMenuOpen}
            aria-controls="app-switcher"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 10.495a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm12 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-4.5 1.5A1.5 1.5 0 1 0 12 9.995a1.5 1.5 0 0 0 1.5 1.5Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Search (desktop) */}
          <div className="hidden lg:block">
            <form role="search" className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.042 9.374a6.333 6.333 0 1 1 12.666 0A6.333 6.333 0 0 1 3.042 9.374Zm6.333-7.833a7.833 7.833 0 1 0 4.982 13.9l2.82 2.82a.75.75 0 1 0 1.06-1.06l-2.82-2.821A7.833 7.833 0 0 0 9.375 1.541Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search or type command..."
                aria-label="Buscar"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white/70 pl-12 pr-16 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/5 dark:text-white"
              />
              {/* Hint ⌘K */}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-xs text-gray-400 dark:text-gray-500">
                ⌘K
              </span>
            </form>
          </div>
        </div>

        {/* Right: theme, notifications, user */}
        <div
          id="app-switcher"
          ref={appMenuRef}
          className={`${isApplicationMenuOpen ? "flex" : "hidden"} w-full items-center justify-between gap-4 px-5 py-4 shadow-sm lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
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
