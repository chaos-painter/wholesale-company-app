export interface User {
  id: number;
  email: string;
  real_name?: string | null | undefined;
  role_id: number;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  role_name: string;
}

export interface Category {
  id: number;
  category: string;
}

export interface InventoryItem {
  id: number;
  item_name: string;
  description?: string | null | undefined;
  sku?: string | null;
  cost_price?: string | null | undefined;
  unit_price: string;
  quantity: number;
  category_id?: number | null | undefined;
  warehouse_id?: number | null | undefined;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id?: number | null | undefined;
  status: string;
  total_amount?: string | null | undefined;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  inventory_id: number;
  quantity: number;
  price_at_purchase: string;
}

export interface Warehouse {
  id: number;
  location_name: string;
  address?: string | null | undefined;
  capacity?: number | null | undefined;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
}