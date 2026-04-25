export interface User {
  id: number;
  email: string;
  real_name?: string | null;
  role_id: number;
}

export interface Category {
  id: number;
  category: string;
}

export interface InventoryItem {
  id: number;
  item_name: string;
  description?: string | null;
  sku?: string | null;
  cost_price?: string | null;
  unit_price: string;
  quantity: number;
  category_id?: number | null;
  warehouse_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id?: number | null;
  status: string;
  total_amount?: string | null;
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
  address?: string | null;
  capacity?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
}
