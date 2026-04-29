import { request } from './client';
import type { Category } from '../types';

export const listCategories = () => request<Category[]>('/categories');
export const getCategory = (id: number) => request<Category>(`/categories/${id}`);
export const createCategory = (category: string) =>
  request<Category>('/categories', { method: 'POST', body: JSON.stringify({ category }) });
export const updateCategory = (id: number, category: string) =>
  request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ category }) });
export const deleteCategory = (id: number) =>
  request<null>(`/categories/${id}`, { method: 'DELETE' });