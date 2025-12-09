export type OrderItemSnapshot = {
  id?: string;
  name?: string | null;
  brand?: string | null;
  image_url?: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string | null;
  product_brand?: string | null;
  quantity: number;
  unit_price: number | string;
  line_total?: number | string;
  product_snapshot?: OrderItemSnapshot | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type OrderUser = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};

export type Order = {
  id: string;
  user_id?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  subtotal: number | string;
  tax_total: number | string;
  shipping_total: number | string;
  grand_total: number | string;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items?: OrderItem[];
  user?: OrderUser | null;
};

export type PaginationMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
};

export type PaginatedResponse<T> = {
  data?: T[];
  meta?: PaginationMeta | null;
  links?: Record<string, unknown> | null;
};
