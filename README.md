# 📘 Guía de Uso – Delivery App (Web)

Esta guía explica, paso a paso, **cómo usar** la app web de delivery en su modo actual (UI/Front con datos en localStorage).  
Si buscas cómo **instalar y levantar** el proyecto, revisa el README técnico del repo (instalación, scripts y build).

---

## 🚪 1) Acceso y autenticación

1. Abre `http://localhost:3000`.
2. Usa el menú lateral para ir a:
   - **/signin** → Iniciar sesión (demo, sin backend).
   - **/signup** → Crear cuenta (demo, sin backend).
3. El formulario valida lo básico (campos obligatorios).  
   > En esta versión los formularios son de **diseño**. La autenticación real se integra cuando conectes el backend.

---

## 🧭 2) Navegación general

- La **barra lateral** contiene las secciones principales:
  - **Panel** (Dashboard)
  - **Pedidos** → Nuevos / Programados / Historial
  - **Productos** → Listado / Nuevo / Categorías / Combos
  - **Inventario**
  - **Clientes**
  - **Repartidores** → Listado / Asignaciones / Rendimiento
  - **Marketing** → Promociones / Cupones
  - **Reportes** → Ventas / Entregas
  - **Configuración** → Negocio / App / Roles / Pagos
- Si no ves el final del menú, asegúrate de que haga scroll:
  - La envoltura del menú usa `overflow-y-auto` (ya aplicado).

---

## 🛍️ 3) Productos (crear, listar, editar, eliminar)

### A) Crear producto
1. Ve a **Productos → Nuevo** (`/products/nuevo`).
2. Completa:
   - **Nombre** y **Precio** (obligatorio).
   - **Descripción**, **Stock**, **Categoría**.
   - **Etiquetas** (vegano, oferta, etc.) tocándolas para activarlas.
   - **Variantes** (ej.: Tamaño Doble, +$) → “+ Añadir”.
   - **Extras** (ej.: Queso, Tocineta, etc.) → “+ Añadir”.
   - **Imagen** → botón *Subir imagen* (DataURL guardada en localStorage).
   - **Disponibilidad** → “Disponible” ON/OFF.
3. Pulsa **“Crear producto”**.
4. El producto se guarda en tu navegador (localStorage) y aparece en la lista/inventario.

> 💾 Todo queda en **localStorage** (clave `delivery_products_v1`). Borrar caché o “Limpiar” puede vaciar tu catálogo.

### B) Listado de productos
1. Ve a **Productos → Listado** (`/products`).
2. Verás tarjetas con:
   - Imagen, nombre, precio, categoría.
   - Stock y disponibilidad.
   - Etiquetas visibles sobre la imagen.
3. Acciones por producto:
   - **Editar** → precarga el formulario de “Nuevo” con los datos.
   - **Eliminar** → quita el producto del localStorage.

### C) Edición de producto
1. En **Listado** pulsa **Editar** sobre la tarjeta.
2. Se abre **Productos → Nuevo** con el formulario lleno.
3. Cambia los campos y pulsa **Guardar cambios**.

---

## 📦 4) Paquetes vs Unidades (venta por tipo)

> Si tu formulario incluye selector **“Tipo de venta: Unidad / Paquete”**:
1. En **Productos → Nuevo**, elige:
   - **Unidad**: el precio es por unidad.
   - **Paquete**: define *contenido del paquete* y *precio total*.
2. Guarda. En Listado se refleja el tipo (ej. “x6 unidades”).

> Si aún no lo ves, revisa el componente de creación: algunos diseños incluyen `unitPackage` (unidad/paquete). Si no, mantenlo en “Unidad”.

---

## 🧾 5) Pedidos

> En modo UI, los pedidos están maquetados y listos para integrarse con tu backend.

- **Pedidos → Nuevos** (`/orders/new`):  
  Cola de pedidos recientes a confirmar/asignar.
- **Pedidos → Programados** (`/orders/scheduled`):  
  Entregas fijadas para más tarde (fecha/hora).
- **Pedidos → Historial** (`/orders/history`):  
  Historial de pedidos completados/cancelados.

> **Acciones típicas** (diseño):
> - Ver detalle del pedido (items, total, cliente).
> - Cambiar estado: “Confirmado”, “En preparación”, “En ruta”, “Entregado”.
> - Asignar repartidor.

---

## 👥 6) Clientes

- **/customers**: listado básico de clientes en modo UI.  
- Puntos de mejora para backend:
  - Historial de pedidos por cliente.
  - Datos de contacto, direcciones guardadas, preferencias.
  - Segmentación para marketing.

---

## 🛵 7) Repartidores

- **Repartidores → Listado** (`/drivers`): ver todos los repartidores (UI).
- **Asignaciones** (`/drivers/assignments`): asignar pedidos activos.
- **Rendimiento** (`/drivers/performance`): métricas por repartidor.

> Acciones de ejemplo:
> - Asignar pedido.
> - Ver tiempos promedio.
> - Cambiar estado (activo/no disponible).

---

## 🧩 8) Inventario, Categorías y Combos

- **Inventario** (`/inventory`): visión general del stock.
- **Categorías** (`/products/categorias`): organiza productos por tipo.
- **Combos** (`/products/combos`): arma combos con varios productos + precio promo.

> Cuando conectes backend:
> - Las categorías y combos deben persistirse en base de datos.
> - Relaciona productos con categorías y combos (IDs/refs).

---

## 🎛️ 9) Configuración

- **Negocio**: nombre comercial, horarios, cobertura, impuestos.
- **App**: tema (claro/oscuro), logo, colores base.
- **Roles**: permisos (admin, operador, cocina, repartidor).
- **Pagos**: configuración de métodos (Stripe, Mercado Pago, etc.).

> En UI ya existen secciones base. Conecta APIs reales para guardar cambios.

---

## 🎨 10) Tema (Claro / Oscuro)

- Usa el **toggler** (esquina) para cambiar tema.
- Se persiste la preferencia (context + localStorage).

---

## 🧰 11) Solución de problemas comunes

- **404 al entrar a una ruta**  
  Asegúrate de que la ruta exista como carpeta con `page.tsx` dentro.  
  Ej.: `/app/products/page.tsx`, `/app/products/nuevo/page.tsx`.

- **El sidebar no hace scroll**  
  Verifica que el contenedor tenga:
  ```html
  <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
