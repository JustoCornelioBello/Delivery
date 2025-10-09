"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  Productos,
} from "../icons/index";

// -------------------- Tipos --------------------
type SubItem = { name: string; path: string; pro?: boolean; new?: boolean };

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
};

// -------------------- Datos --------------------
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Panel",
    subItems: [{ name: "Resumen", path: "/", pro: false },
      {name: "Mensajes", path: "/menssages", pro: false},
      { name: "prueva", path: "/prueva", pro: false }
    ],
  },
  {
    icon: <ListIcon />,
    name: "Pedidos",
    subItems: [
      { name: "Activos", path: "/pedidos/activos" },
      { name: "Nuevos", path: "/orders/new", pro: false },
      { name: "Programados", path: "/orders/scheduled", pro: false },
      { name: "Historial", path: "/orders/history", pro: false },
    ],
  },
  {
    icon: <Productos />,
    name: "Productos",
    subItems: [
      { name: "Listado", path: "/products", pro: false },
      { name: "Nuevo producto", path: "/products/nuevo", pro: false },
      { name: "Categorías", path: "/products/categorias", pro: false },
      { name: "Combos", path: "/products/combos", pro: false },
      { name: "Inventario", path: "/products/inventario", pro: false },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "Clientes",
    path: "/customers",
  },
  {
    icon: <TableIcon />,
    name: "Repartidores",
    subItems: [
      { name: "Listado", path: "/drivers", pro: false },
      { name: "Asignaciones", path: "/drivers/assignments", pro: false },
      { name: "Rendimiento", path: "/drivers/performance", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Zonas de entrega",
    path: "/zones",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendario",
    subItems: [
      { name: "Agenda", path: "/calendar", pro: false },
      { name: "Turnos", path: "/calendar/shifts", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Analíticas",
    subItems: [
      { name: "Ventas", path: "/analytics/sales", pro: false },
      { name: "Productos", path: "/analytics/products", pro: false },
      { name: "Entregas", path: "/analytics/deliveries", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PageIcon />,
    name: "Promociones",
    subItems: [
      { name: "Cupones", path: "/promos/coupons", pro: false },
      { name: "Campañas", path: "/promos/campaigns", pro: false },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Pagos",
    subItems: [
      { name: "Transacciones", path: "/payments", pro: false },
      { name: "Métodos", path: "/payments/methods", pro: false },
      { name: "Liquidaciones", path: "/payments/settlements", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Configuración",
    subItems: [
      { name: "General", path: "/settings", pro: false },
      { name: "Perfil del negocio", path: "/settings/business", pro: false },
      { name: "Sucursales & horarios", path: "/settings/locations", pro: false },
      { name: "Zonas de entrega", path: "/zones", pro: false },
      { name: "Tarifas & comisiones", path: "/settings/fees", pro: false },
      { name: "Impuestos", path: "/settings/taxes", pro: false },
      { name: "Pagos & pasarelas", path: "/settings/payments", pro: false },
      { name: "Entrega & logística", path: "/settings/logistics", pro: false },
      { name: "Notificaciones", path: "/settings/notifications", pro: false },
      { name: "Integraciones", path: "/settings/integrations", pro: false },
      { name: "Impresoras & recibos", path: "/settings/printers", pro: false },
      { name: "Usuarios & roles", path: "/settings/roles", pro: false },
      { name: "Seguridad", path: "/settings/security", pro: false },
      { name: "Términos y Condiciones", path: "/legal/terms", pro: false },
      { name: "Privacidad", path: "/legal/privacy", pro: false },
      { name: "Cookies", path: "/legal/cookies", pro: false },
      { name: "Soporte & ayuda", path: "/support", pro: false },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Ayuda",
    subItems: [
      { name: "Preguntas frecuentes", path: "/help/faq", pro: false },
      { name: "Guías rápidas", path: "/help/guides", pro: false },
      { name: "Reportar un problema", path: "/help/report", pro: false },
      { name: "Centro de ayuda", path: "/help", pro: false },
      { name: "Estado del sistema", path: "/status", pro: false },
      { name: "Contacto", path: "/help/contact", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Sobre nosotros",
    subItems: [
      { name: "Sobre nosotros", path: "/about", pro: false },
      { name: "Sobre la aplicación", path: "/about/app", pro: false },
      { name: "Información general", path: "/about/info", pro: false },
      { name: "Nuestro equipo", path: "/about/team", pro: false },
      { name: "Misión y visión", path: "/about/mission", pro: false },
    ],
  },
];

// -------------------- Sidebar --------------------
const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Activo si coincide exacto o si el path actual empieza con la ruta
  const isActive = useCallback((path: string) => pathname === path || (path !== "/" && pathname.startsWith(path)), [pathname]);

  // Prefetch en hover/focus para snappiness
  const prefetch = useCallback((href: string) => {
    // App Router (next/navigation): prefetch() devuelve void
    // Pages Router (next/router): prefetch() devuelve Promise<void>
    const ret: any = (router as any).prefetch?.(href);
    if (ret && typeof ret.then === "function") {
      ret.catch(() => {});
    }
  }, [router]);

  // Abre automáticamente el submenú que coincide con la ruta
  useEffect(() => {
    let matched = false;
    (['main', 'others'] as const).forEach((type) => {
      const items = type === 'main' ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems?.some((s) => isActive(s.path))) {
          setOpenSubmenu({ type, index });
          matched = true;
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  // Mide la altura de cada submenú al abrirse
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({ ...prev, [key]: subMenuRefs.current[key]?.scrollHeight || 0 }));
      }
    }
  }, [openSubmenu]);

  // Recalcular si cambia tamaño de ventana
  useEffect(() => {
    const onResize = () => {
      if (openSubmenu) {
        const key = `${openSubmenu.type}-${openSubmenu.index}`;
        if (subMenuRefs.current[key]) {
          setSubMenuHeight((prev) => ({ ...prev, [key]: subMenuRefs.current[key]?.scrollHeight || 0 }));
        }
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, type: "main" | "others") => {
    setOpenSubmenu((prev) => (prev && prev.type === type && prev.index === index ? null : { type, index }));
  };

  const closeMobileAfterNav = useCallback(() => {
    if (isMobileOpen) toggleMobileSidebar();
  }, [isMobileOpen, toggleMobileSidebar]);

  const sectionTitle = useCallback(
    (label: string) => (
      <h2 className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        {isExpanded || isHovered || isMobileOpen ? label : <HorizontaLDots />}
      </h2>
    ),
    [isExpanded, isHovered, isMobileOpen]
  );

  const menuWidth = useMemo(() => (isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"), [isExpanded, isHovered, isMobileOpen]);

  const renderMenuItems = (items: NavItem[], type: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={`${type}-${nav.name}`}>
          {nav.subItems ? (
            <button
              type="button"
              onClick={() => handleSubmenuToggle(index, type)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSubmenuToggle(index, type)}
              className={`menu-item group ${openSubmenu?.type === type && openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              aria-expanded={openSubmenu?.type === type && openSubmenu?.index === index}
              aria-controls={`${type}-submenu-${index}`}
            >
              <span className={`${openSubmenu?.type === type && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon className={`ml-auto h-5 w-5 transition-transform duration-200 ${openSubmenu?.type === type && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`} />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                onMouseEnter={() => prefetch(nav.path!)}
                onFocus={() => prefetch(nav.path!)}
                onClick={closeMobileAfterNav}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                aria-current={isActive(nav.path) ? "page" : undefined}
              >
                <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              id={`${type}-submenu-${index}`}
              ref={(el) => {
                subMenuRefs.current[`${type}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height: openSubmenu?.type === type && openSubmenu?.index === index ? `${subMenuHeight[`${type}-${index}`] ?? 0}px` : "0px",
              }}
            >
              <ul className="ml-9 mt-2 space-y-1">
                {nav.subItems.map((sub) => (
                  <li key={`${type}-${nav.name}-${sub.name}`}>
                    <Link
                      href={sub.path}
                      onMouseEnter={() => prefetch(sub.path)}
                      onFocus={() => prefetch(sub.path)}
                      onClick={closeMobileAfterNav}
                      className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                      aria-current={isActive(sub.path) ? "page" : undefined}
                    >
                      {sub.name}
                      <span className="ml-auto flex items-center gap-1">
                        {sub.new && (
                          <span className={`menu-dropdown-badge ml-auto ${isActive(sub.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"}`}>nuevo</span>
                        )}
                        {sub.pro && (
                          <span className={`menu-dropdown-badge ml-auto ${isActive(sub.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"}`}>pro</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Overlay móvil para cerrar al tocar fuera */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[49] bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[50] h-screen border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${menuWidth} ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Barra lateral de navegación"
      >
        {/* Marca (texto) */}
        <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
          <Link href="/" aria-label="Ir al inicio" onMouseEnter={() => prefetch("/")}> 
            <span className={`text-2xl font-extrabold tracking-wide transition-colors ${isExpanded || isHovered || isMobileOpen ? "text-brand-600 dark:text-brand-400" : "text-brand-600 dark:text-brand-400"}`}>
              Delivery
            </span>
          </Link>
        </div>

        {/* Contenido con scroll */}
        <div className="no-scrollbar flex-1 overflow-y-auto duration-300 ease-linear">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                {sectionTitle("Operación")}
                {renderMenuItems(navItems, "main")}
              </div>
              <div>
                {sectionTitle("Gestión")}
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
