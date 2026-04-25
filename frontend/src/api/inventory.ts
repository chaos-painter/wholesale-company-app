import { request } from './client';
import type { InventoryItem } from '../types';

export interface InventoryFilters {
  category_id?: number;
  search?: string;
  min_quantity?: number;
  page?: number;
  limit?: number;
}

export const listInventory = (filters: InventoryFilters = {}) => {
  const p = new URLSearchParams();
  if (filters.category_id) p.set('category_id', String(filters.category_id));
  if (filters.search) p.set('search', filters.search);
  if (filters.min_quantity) p.set('min_quantity', String(filters.min_quantity));
  if (filters.page) p.set('page', String(filters.page));
  p.set('limit', String(filters.limit ?? 50));
  return request<InventoryItem[]>(`/inventory?${p}`);
};

export const getInventoryItem = (id: number) => request<InventoryItem>(`/inventory/${id}`);

export const createInventoryItem = (data: Partial<InventoryItem>) =>
  request<InventoryItem>('/inventory', { method: 'POST', body: JSON.stringify(data) });

export const updateInventoryItem = (id: number, data: Partial<InventoryItem>) =>
  request<InventoryItem>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteInventoryItem = (id: number) =>
  request<null>(`/inventory/${id}`, { method: 'DELETE' });
