import { request } from './client';
import type { Warehouse } from '../types';

export const listWarehouses = () => request<Warehouse[]>('/warehouses');

export const getWarehouse = (id: number) => request<Warehouse>(`/warehouses/${id}`);

export const createWarehouse = (data: Partial<Warehouse>) =>
  request<Warehouse>('/warehouses', { method: 'POST', body: JSON.stringify(data) });

export const updateWarehouse = (id: number, data: Partial<Warehouse>) =>
  request<Warehouse>(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteWarehouse = (id: number) =>
  request<null>(`/warehouses/${id}`, { method: 'DELETE' });