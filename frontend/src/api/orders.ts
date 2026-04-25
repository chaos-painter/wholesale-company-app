import { request } from './client';
import type { Order, OrderItem } from '../types';

export const listOrders = () => request<Order[]>('/orders');
export const getOrder = (id: number) => request<[Order, OrderItem[]]>(`/orders/${id}`);
export const createOrder = (items: { inventory_id: number; quantity: number }[]) =>
  request<Order>('/orders', { method: 'POST', body: JSON.stringify({ items }) });
export const updateOrderStatus = (id: number, status: string) =>
  request<Order>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
export const deleteOrder = (id: number) =>
  request<null>(`/orders/${id}`, { method: 'DELETE' });
