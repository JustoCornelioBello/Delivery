import { NextResponse } from "next/server";
import type { SearchResponse, SearchItem, Facets } from "@/components/search/types";

const DB: SearchItem[] = [
  { id: "o1", type: "pedido", title: "Pedido #10293", subtitle: "Cliente: María López", updatedAt: new Date().toISOString(), tags: ["pendiente"], highlight: "Entrega CDMX", orderId: "10293", status: "pendiente", total: 350, customerName: "María López" },
  { id: "c1", type: "cliente", title: "María López", subtitle: "Frecuencia alta", updatedAt: new Date().toISOString(), tags: ["vip"], highlight: "15 pedidos últimos 3 meses", name: "María López", email: "maria@example.com", phone: "+52 555 000 1111", totalOrders: 27 },
  { id: "s1", type: "tienda", title: "Tienda Central CDMX", subtitle: "Sucursal Centro", updatedAt: new Date().toISOString(), tags: ["activa"], name: "Tienda Central CDMX", location: "Centro", active: true },
  { id: "r1", type: "repartidor", title: "Juan Pérez", subtitle: "En ruta · 4.8★", updatedAt: new Date().toISOString(), tags: ["online"], name: "Juan Pérez", online: true, rating: 4.8, zones: ["Norte", "Centro"] },
  { id: "f1", type: "factura", title: "Factura F-2025-091", subtitle: "Cliente: María López", updatedAt: new Date().toISOString(), tags: ["pagada"], highlight: "Periodo: septiembre 2025", invoiceNumber: "F-2025-091", amount: 1200, status: "pagada" },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").toLowerCase();
  const types = url.searchParams.getAll("type");    // multi
  const estados = url.searchParams.getAll("estado");
  const zonas = url.searchParams.getAll("zona");
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "9", 10);

  const items = DB.filter((it) => {
    const matchQ =
      !q ||
      it.title.toLowerCase().includes(q) ||
      (it.subtitle || "").toLowerCase().includes(q) ||
      (it.highlight || "").toLowerCase().includes(q);
    const matchType = types.length ? types.includes(it.type) : true;
    const matchEstado =
      estados.length
        ? (it.type === "pedido" && ("status" in it) && estados.includes((it as any).status)) ||
          (it.type === "factura" && ("status" in it) && estados.includes((it as any).status))
        : true;
    const matchZona =
      zonas.length
        ? (it.type === "repartidor" && ("zones" in it) && (it as any).zones?.some((z: string) => zonas.includes(z)))
        : true;
    return matchQ && matchType && matchEstado && matchZona;
  });

  // facets mock (conteos y selected)
  const makeCount = (key: string, label: string) => ({
    key, label, count: DB.filter((x) => (key === x.type)).length, selected: types.includes(key)
  });

  const facets: Facets = {
    type: [
      makeCount("pedido", "Pedidos"),
      makeCount("cliente", "Clientes"),
      makeCount("tienda", "Tiendas"),
      makeCount("repartidor", "Repartidores"),
      makeCount("factura", "Facturas"),
    ],
    estado: [
      { key: "pendiente", label: "Pendiente", count: 1, selected: estados.includes("pendiente") },
      { key: "en_ruta",   label: "En ruta",   count: 0, selected: estados.includes("en_ruta") },
      { key: "entregado", label: "Entregado", count: 0, selected: estados.includes("entregado") },
      { key: "cancelado", label: "Cancelado", count: 0, selected: estados.includes("cancelado") },
      { key: "pagada",    label: "Pagada (facturas)", count: 1, selected: estados.includes("pagada") },
    ],
    zona: [
      { key: "Norte", label: "Norte", count: 1, selected: zonas.includes("Norte") },
      { key: "Centro", label: "Centro", count: 2, selected: zonas.includes("Centro") },
      { key: "Sur", label: "Sur", count: 0, selected: zonas.includes("Sur") },
    ],
  };

  const total = items.length;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const suggestions =
    !q
      ? []
      : ["pedido", "cliente", "tienda", "repartidor", "factura"]
          .map((t) => `${q} ${t}`);

  const payload: SearchResponse = {
    total,
    page,
    pageSize,
    items: pageItems,
    facets,
    suggestions,
  };

  return NextResponse.json(payload);
}
