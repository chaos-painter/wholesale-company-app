import { request } from './client';
import type { Warehouse } from '../types';

export const listWarehouses = () => request<Warehouse[]>('/warehouses');
export const createWarehouse = (data: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) =>
  request<Warehouse>('/warehouses', { method: 'POST', body: JSON.stringify(data) });
export const deleteWarehouse = (id: number) =>
  request<null>(`/warehouses/${id}`, { method: 'DELETE' });
