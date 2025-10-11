import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Link from "next/link";

// Tipado de filas
interface Product {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  image: string;
  status: "Delivered" | "Pending" | "Canceled";
}

// Datos de ejemplo (en español donde aplica)
const tableData: Product[] = [
  {
    id: 1,
    name: "MacBook Pro 13”",
    variants: "2 variantes",
    category: "Laptop",
    price: "$2,399.00",
    status: "Delivered",
    image: "/images/product/product-01.jpg",
  },
  {
    id: 2,
    name: "Apple Watch Ultra",
    variants: "1 variante",
    category: "Reloj",
    price: "$879.00",
    status: "Pending",
    image: "/images/product/product-02.jpg",
  },
  {
    id: 3,
    name: "iPhone 15 Pro Max",
    variants: "2 variantes",
    category: "Smartphone",
    price: "$1,869.00",
    status: "Delivered",
    image: "/images/product/product-03.jpg",
  },
  {
    id: 4,
    name: "iPad Pro 3ra Gen",
    variants: "2 variantes",
    category: "Electrónica",
    price: "$1,699.00",
    status: "Canceled",
    image: "/images/product/product-04.jpg",
  },
  {
    id: 5,
    name: "AirPods Pro 2da Gen",
    variants: "1 variante",
    category: "Accesorios",
    price: "$240.00",
    status: "Delivered",
    image: "/images/product/product-05.jpg",
  },
];

const statusLabel = (s: Product["status"]) =>
  s === "Delivered" ? "Entregado" : s === "Pending" ? "Pendiente" : "Cancelado";

export default function RecentOrders() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Pedidos recientes
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M2.29004 5.90393H17.7067" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17.7075 14.0961H2.29085" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filtrar
          </button>
         <Link
  href="../pedidos/activos" // 👈 aquí pones la ruta real donde tienes la página de pedidos
  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
>
  Ver todo
</Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Encabezado */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Productos
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Categoría
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Precio
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Estado
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Cuerpo */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((product) => (
              <TableRow key={product.id}>
                {/* Producto + variantes */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image
                        width={50}
                        height={50}
                        src={product.image}
                        className="h-[50px] w-[50px]"
                        alt={product.name}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {product.name}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {product.variants}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Categoría */}
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.category}
                </TableCell>

                {/* Precio */}
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.price}
                </TableCell>

                {/* Estado */}
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      product.status === "Delivered"
                        ? "success"
                        : product.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {statusLabel(product.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
