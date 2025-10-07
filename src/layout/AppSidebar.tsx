"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Panel",
    subItems: [{ name: "Resumen", path: "/", pro: false }],
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
      { name: "Inventario", path: "products/inventario", pro: false },
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
      { name: "Negocio", path: "/settings/business", pro: false },
      { name: "Impuestos", path: "/settings/taxes", pro: false },
      { name: "Integraciones", path: "/settings/integrations", pro: false },
      { name: "Notificaciones", path: "/settings/notifications", pro: false },
      { name: "Usuarios & Roles", path: "/settings/roles", pro: false },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Ayuda",
    subItems: [
      { name: "Soporte", path: "/help/support", pro: false },
      { name: "Centro de ayuda", path: "/help", pro: false },
      { name: "Estado del sistema", path: "/status", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Autenticación",
    subItems: [
      { name: "Iniciar sesión", path: "/signin", pro: false },
      { name: "Registrarse", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // activo si coincide exacto o si el path actual empieza con la ruta (para subrutas)
  const isActive = useCallback(
    (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path)),
    [pathname]
  );

  useEffect(() => {
    // Abre automáticamente el submenú que coincida con la ruta actual
    let submenuMatched = false;
    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems?.some((s) => isActive(s.path))) {
          setOpenSubmenu({ type: menuType, index });
          submenuMatched = true;
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index ? null : { type: menuType, index }
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              aria-expanded={openSubmenu?.type === menuType && openSubmenu?.index === index}
              aria-controls={`${menuType}-submenu-${index}`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                aria-current={isActive(nav.path) ? "page" : undefined}
              >
                <span className={`${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              id={`${menuType}-submenu-${index}`}
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="ml-9 mt-2 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                      }`}
                      aria-current={isActive(subItem.path) ? "page" : undefined}
                    >
                      {subItem.name}
                      <span className="ml-auto flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`menu-dropdown-badge ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            }`}
                          >
                            nuevo
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`menu-dropdown-badge ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            }`}
                          >
                            pro
                          </span>
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
  <aside
    className={`fixed top-0 left-0 z-50 h-screen border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 
      ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:mt-0 lg:translate-x-0 flex flex-col`}
    onMouseEnter={() => !isExpanded && setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    aria-label="Barra lateral de navegación"
  >
 {/* Logo */}
<div
  className={`py-8 flex ${
    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
  }`}
>
  <Link href="/" aria-label="Ir al inicio">
    <span
      className={`font-extrabold tracking-wide text-2xl transition-colors ${
        isExpanded || isHovered || isMobileOpen
          ? "text-brand-600 dark:text-brand-400"
          : "text-brand-600 dark:text-brand-400"
      }`}
    >
      Delivery
    </span>
  </Link>
</div>


    {/* Contenido con scroll */}
    <div className="no-scrollbar flex-1 overflow-y-auto duration-300 ease-linear">
      <nav className="mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2
              className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? "Operación" : <HorizontaLDots />}
            </h2>
            {renderMenuItems(navItems, "main")}
          </div>

          <div>
            <h2
              className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? "Gestión" : <HorizontaLDots />}
            </h2>
            {renderMenuItems(othersItems, "others")}
          </div>
        </div>
      </nav>
    </div>
  </aside>
);

};

export default AppSidebar;
