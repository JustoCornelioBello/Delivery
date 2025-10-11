export type EntityType = "pedido" | "cliente" | "tienda" | "repartidor" | "factura";

export type BaseItem = {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  highlight?: string; // snippet
  updatedAt?: string;
  tags?: string[];
};

export type Suggestion = {
  id: string;
  text: string;
  type?: EntityType | "general";
  hint?: string;
};



export type PedidoItem = BaseItem & {
  type: "pedido";
  orderId: string;
  status: "pendiente" | "en_ruta" | "entregado" | "cancelado";
  total: number;
  customerName: string;
};

export type ClienteItem = BaseItem & {
  type: "cliente";
  name: string;
  email?: string;
  phone?: string;
  totalOrders?: number;
};

export type TiendaItem = BaseItem & {
  type: "tienda";
  name: string;
  location?: string;
  active?: boolean;
};

export type RepartidorItem = BaseItem & {
  type: "repartidor";
  name: string;
  online?: boolean;
  rating?: number;
  zones?: string[];
};

export type FacturaItem = BaseItem & {
  type: "factura";
  invoiceNumber: string;
  amount: number;
  status: "emitida" | "pagada" | "vencida" | "anulada";
};

export type SearchItem = PedidoItem | ClienteItem | TiendaItem | RepartidorItem | FacturaItem;

export type FacetBucket = { key: string; label: string; count: number; selected?: boolean };
export type Facets = {
  type: FacetBucket[];            // pedido, cliente, tienda, repartidor, factura
  estado?: FacetBucket[];         // ej: pendiente, en_ruta...
  fecha?: FacetBucket[];          // ej: hoy, esta_semana...
  zona?: FacetBucket[];           // ej: norte, centro...
};

export type SearchResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: SearchItem[];
  facets?: Facets;
  suggestions?: string[];
};
